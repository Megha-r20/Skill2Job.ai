import crypto from 'node:crypto';
import { Redis } from '@upstash/redis';
import { logger } from '../logger.js';

/**
 * Default cost estimation constants for Gemini LLM calls ($ / call)
 */
const DEFAULT_ESTIMATED_COST_PER_CALL_USD = 0.0025; // Approx average for Gemini 2.0 Flash / Pro prompts

/**
 * Deterministic canonical JSON stringifier that sorts object keys recursively.
 * Ensures identical objects with different key order yield identical SHA-256 hashes.
 */
export function canonicalize(obj) {
    if (obj === null || obj === undefined) return 'null';
    if (typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj)) {
        return '[' + obj.map(canonicalize).join(',') + ']';
    }
    const sortedKeys = Object.keys(obj).sort();
    const parts = sortedKeys.map(key => `${JSON.stringify(key)}:${canonicalize(obj[key])}`);
    return '{' + parts.join(',') + '}';
}

/**
 * Generates a SHA-256 deterministic cache key.
 */
export function generateCacheKey(namespace, payload, model = 'default') {
    const canonicalPayload = canonicalize(payload);
    const hash = crypto
        .createHash('sha256')
        .update(`${namespace}:${model}:${canonicalPayload}`)
        .digest('hex');
    return `aicache:${namespace}:${hash.substring(0, 32)}`;
}

/**
 * Production-ready In-Memory LRU Cache with TTL support.
 */
class InMemoryLruCache {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // LRU update: refresh position in Map
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.value;
    }

    set(key, value, ttlSeconds = 86400) {
        if (this.cache.size >= this.maxSize) {
            // Evict oldest item (first key in map)
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.cache.set(key, { value, expiresAt, createdAt: Date.now() });
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }

    has(key) {
        return this.get(key) !== null;
    }

    keys() {
        return Array.from(this.cache.keys());
    }
}

/**
 * Enterprise AI Caching Layer.
 * Combines L1 Fast Memory LRU with L2 Distributed Redis (Upstash) and comprehensive telemetry.
 */
class AiCacheService {
    constructor() {
        this.l1 = new InMemoryLruCache(1000);
        this.redisClient = null;
        this.redisAvailable = false;
        this.initRedis();

        this.metrics = {
            hits: 0,
            misses: 0,
            sets: 0,
            invalidations: 0,
            totalComputeTimeSavedMs: 0,
            totalTokensSavedEstimate: 0
        };
    }

    initRedis() {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;
        if (url && token) {
            try {
                this.redisClient = new Redis({ url, token });
                this.redisAvailable = true;
            } catch (err) {
                this.redisAvailable = false;
                this.redisClient = null;
            }
        }
    }

    /**
     * Retrieves cached value from L1 or L2.
     */
    async get(key) {
        // 1. Check L1 Memory Cache
        const l1Value = this.l1.get(key);
        if (l1Value !== null) {
            this.metrics.hits++;
            return l1Value;
        }

        // 2. Check L2 Redis if available
        if (this.redisAvailable && this.redisClient) {
            try {
                const redisValue = await this.redisClient.get(key);
                if (redisValue !== null && redisValue !== undefined) {
                    const parsed = typeof redisValue === 'string' ? JSON.parse(redisValue) : redisValue;
                    // Backfill L1
                    this.l1.set(key, parsed, 3600);
                    this.metrics.hits++;
                    return parsed;
                }
            } catch (err) {
                // Non-blocking degradation
                logger.warn('[AiCache] L2 Redis fetch failed, falling back to L1', { error: err.message, key });
            }
        }

        this.metrics.misses++;
        return null;
    }

    /**
     * Caches value in L1 Memory and optionally L2 Redis.
     */
    async set(key, value, ttlSeconds = 86400) {
        this.l1.set(key, value, ttlSeconds);
        this.metrics.sets++;

        if (this.redisAvailable && this.redisClient) {
            try {
                const serialized = JSON.stringify(value);
                await this.redisClient.set(key, serialized, { ex: ttlSeconds });
            } catch (err) {
                logger.warn('[AiCache] L2 Redis write failed', { error: err.message, key });
            }
        }
    }

    /**
     * Wraps an expensive AI computation function with automatic keying, caching, and timing telemetry.
     *
     * @template T
     * @param {string} namespace - Logical domain (e.g. 'resume_analysis', 'job_analysis', 'bullet_rewrite')
     * @param {any} inputPayload - Parameters passed to the AI function (normalized and hashed)
     * @param {() => Promise<T>} computeFn - Async function performing the expensive AI call
     * @param {Object} [options]
     * @param {number} [options.ttl=86400] - Time-to-live in seconds (defaults to 24 hours)
     * @param {string} [options.model='gemini-2.0-flash'] - Target AI model name
     * @param {boolean} [options.forceRefresh=false] - Bypass cache and recalculate
     * @param {boolean} [options.skipCache=false] - Do not read or write cache
     * @returns {Promise<{ data: T, cached: boolean, cacheKey: string, executionTimeMs: number }>}
     */
    async wrap(namespace, inputPayload, computeFn, options = {}) {
        const {
            ttl = 86400,
            model = 'gemini-2.0-flash',
            forceRefresh = false,
            skipCache = false
        } = options;

        const cacheKey = generateCacheKey(namespace, inputPayload, model);

        if (!skipCache && !forceRefresh) {
            const cachedValue = await this.get(cacheKey);
            if (cachedValue !== null) {
                logger.debug(`[AiCache] Cache HIT for ${namespace}`, { cacheKey, model });
                // Estimate compute time saved based on average AI call (800ms)
                this.metrics.totalComputeTimeSavedMs += 800;
                this.metrics.totalTokensSavedEstimate += 750;

                return {
                    data: cachedValue,
                    cached: true,
                    cacheKey,
                    executionTimeMs: 0
                };
            }
        }

        logger.debug(`[AiCache] Cache MISS for ${namespace}. Executing computation...`, { cacheKey, model });
        const startTime = Date.now();
        const result = await computeFn();
        const executionTimeMs = Date.now() - startTime;

        if (!skipCache && result !== null && result !== undefined) {
            await this.set(cacheKey, result, ttl);
        }

        return {
            data: result,
            cached: false,
            cacheKey,
            executionTimeMs
        };
    }

    /**
     * Invalidate by exact key or namespace prefix
     */
    async invalidate(patternOrKey) {
        let count = 0;
        const allKeys = this.l1.keys();
        for (const k of allKeys) {
            if (k.includes(patternOrKey)) {
                this.l1.delete(k);
                count++;
            }
        }
        this.metrics.invalidations += count;

        if (this.redisAvailable && this.redisClient) {
            try {
                if (patternOrKey.startsWith('aicache:')) {
                    await this.redisClient.del(patternOrKey);
                }
            } catch (err) {
                logger.warn('[AiCache] Redis invalidation error', { error: err.message });
            }
        }

        return count;
    }

    /**
     * Clears all cached items
     */
    clear() {
        this.l1.clear();
        this.metrics.invalidations++;
    }

    /**
     * Returns comprehensive telemetry, hit rates, and estimated cost savings.
     */
    getStats() {
        const totalRequests = this.metrics.hits + this.metrics.misses;
        const hitRatePct = totalRequests > 0 ? ((this.metrics.hits / totalRequests) * 100).toFixed(1) : '0.0';
        const estimatedSavingsUsd = (this.metrics.hits * DEFAULT_ESTIMATED_COST_PER_CALL_USD).toFixed(4);

        return {
            enabled: true,
            l1Entries: this.l1.size(),
            l2Available: this.redisAvailable,
            hits: this.metrics.hits,
            misses: this.metrics.misses,
            totalRequests,
            hitRate: `${hitRatePct}%`,
            sets: this.metrics.sets,
            invalidations: this.metrics.invalidations,
            totalComputeTimeSavedMs: this.metrics.totalComputeTimeSavedMs,
            totalTokensSavedEstimate: this.metrics.totalTokensSavedEstimate,
            estimatedCostSavingsUsd: `$${estimatedSavingsUsd}`,
            estimatedCostPerCallUsd: `$${DEFAULT_ESTIMATED_COST_PER_CALL_USD}`
        };
    }
}

export const aiCache = new AiCacheService();
