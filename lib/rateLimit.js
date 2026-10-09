import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server.js';
import { auditService } from './services/auditService.js';

// Tier Definitions
export const RATE_LIMIT_TIERS = {
    // Expensive LLM calls that incur token/financial costs
    ai: {
        maxRequests: 10,
        windowMs: 60 * 1000,
        name: 'AI & LLM Services'
    },
    // Authentication endpoints (login, register, forgot-password)
    auth: {
        maxRequests: 5,
        windowMs: 60 * 1000,
        name: 'Authentication'
    },
    // Sensitive OTP code dispatch and verification (prevent SMS/Email spamming & brute force)
    otp: {
        maxRequests: 3,
        windowMs: 60 * 1000,
        name: 'OTP Verification'
    },
    // Standard platform API requests
    standard: {
        maxRequests: 60,
        windowMs: 60 * 1000,
        name: 'Standard API'
    }
};

let redis = null;
let upstashLimiters = {};

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        upstashLimiters = {
            ai: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMIT_TIERS.ai.maxRequests, '1 m'), analytics: true }),
            auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMIT_TIERS.auth.maxRequests, '1 m'), analytics: true }),
            otp: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMIT_TIERS.otp.maxRequests, '1 m'), analytics: true }),
            standard: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(RATE_LIMIT_TIERS.standard.maxRequests, '1 m'), analytics: true })
        };
    } catch (e) {
        console.warn('[RateLimit] Upstash Redis initialization skipped, using in-memory store:', e.message);
    }
}

// In-Memory Sliding Window Store
const localRateLimitStore = new Map();

// Periodically clean up expired entries from in-memory store to prevent memory leaks
if (typeof setInterval !== 'undefined') {
    const cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of localRateLimitStore.entries()) {
            if (now - entry.windowStart > 120000) {
                localRateLimitStore.delete(key);
            }
        }
    }, 60000);
    if (cleanupTimer && typeof cleanupTimer.unref === 'function') {
        cleanupTimer.unref();
    }
}

/**
 * Extracts client IP address from incoming NextRequest
 */
export function getClientIp(request) {
    if (!request || !request.headers) return '127.0.0.1';
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    return '127.0.0.1';
}

/**
 * Evaluates in-memory sliding window rate limit
 */
function checkInMemoryRateLimit(identifier, tier = 'standard') {
    const config = RATE_LIMIT_TIERS[tier] || RATE_LIMIT_TIERS.standard;
    const now = Date.now();
    const storeKey = `${tier}:${identifier}`;
    const entry = localRateLimitStore.get(storeKey);

    if (!entry || (now - entry.windowStart) > config.windowMs) {
        localRateLimitStore.set(storeKey, { count: 1, windowStart: now });
        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            reset: now + config.windowMs,
            retryAfter: Math.ceil(config.windowMs / 1000)
        };
    }

    if (entry.count >= config.maxRequests) {
        const remainingMs = Math.max(0, config.windowMs - (now - entry.windowStart));
        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            reset: entry.windowStart + config.windowMs,
            retryAfter: Math.ceil(remainingMs / 1000)
        };
    }

    entry.count += 1;
    return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - entry.count,
        reset: entry.windowStart + config.windowMs,
        retryAfter: Math.ceil((config.windowMs - (now - entry.windowStart)) / 1000)
    };
}

/**
 * Checks rate limit for given identifier and tier
 * Backward compatible with checkRateLimit(identifier)
 */
export async function checkRateLimit(identifier, tier = 'standard') {
    const activeLimiter = upstashLimiters[tier];

    if (!activeLimiter) {
        return checkInMemoryRateLimit(identifier, tier);
    }

    try {
        const result = await activeLimiter.limit(identifier);
        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
        };
    } catch (error) {
        console.error('[RateLimit] Upstash error, failing over to local limiter:', error.message);
        return checkInMemoryRateLimit(identifier, tier);
    }
}

/**
 * Generates RFC-compliant HTTP 429 response with rate limit headers
 */
export function rateLimitExceededResponse(result = null, customMessage = null) {
    const retrySeconds = result?.retryAfter || 60;
    const limit = result?.limit || 10;
    const message = customMessage || `Too many requests. Limit exceeded (${limit} req/min). Please try again in ${retrySeconds} seconds.`;

    const headers = {
        'Retry-After': String(retrySeconds),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(result?.reset || (Date.now() + retrySeconds * 1000))
    };

    return NextResponse.json({
        success: false,
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: retrySeconds
    }, {
        status: 429,
        headers
    });
}

/**
 * Convenience middleware helper to apply rate limiting to a Next.js route handler
 * Usage:
 *   const rateLimit = await applyRateLimit(request, 'ai');
 *   if (!rateLimit.allowed) return rateLimit.response;
 */
export async function applyRateLimit(request, tier = 'ai', identifierOverride = null) {
    const ip = getClientIp(request);
    const identifier = identifierOverride || ip;

    const result = await checkRateLimit(identifier, tier);

    if (!result.success) {
        // Log rate limit violation to centralized security audit trail
        try {
            auditService.logEvent({
                action: 'RATE_LIMIT_EXCEEDED',
                category: 'ACCESS_CONTROL',
                actor: {
                    userId: identifier,
                    role: 'guest',
                    ipAddress: ip
                },
                targetResource: {
                    type: 'API_ENDPOINT',
                    id: request?.nextUrl?.pathname || request?.url || tier
                },
                status: 'BLOCKED',
                severity: 'MEDIUM',
                details: {
                    tier,
                    limit: result.limit,
                    retryAfter: result.retryAfter
                }
            }).catch(() => {});
        } catch (e) {}

        return {
            allowed: false,
            response: rateLimitExceededResponse(result)
        };
    }

    return {
        allowed: true,
        remaining: result.remaining,
        limit: result.limit,
        reset: result.reset,
        headers: {
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.reset)
        }
    };
}
