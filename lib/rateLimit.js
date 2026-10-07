import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
let redis = null;
let ratelimit = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
    });
}
// In-Memory Fallback Rate Limiter Store (Sliding Window 60s)
const localRateLimitStore = new Map();
const MAX_LOCAL_REQUESTS = 10;
const WINDOW_SIZE_MS = 60 * 1000;
function checkInMemoryRateLimit(identifier) {
    const now = Date.now();
    const entry = localRateLimitStore.get(identifier);
    if (!entry || (now - entry.windowStart) > WINDOW_SIZE_MS) {
        localRateLimitStore.set(identifier, { count: 1, windowStart: now });
        return { success: true, remaining: MAX_LOCAL_REQUESTS - 1 };
    }
    if (entry.count >= MAX_LOCAL_REQUESTS) {
        return { success: false, remaining: 0 };
    }
    entry.count += 1;
    return { success: true, remaining: MAX_LOCAL_REQUESTS - entry.count };
}
export async function checkRateLimit(identifier) {
    if (!ratelimit) {
        // Use robust in-memory sliding window fallback
        return checkInMemoryRateLimit(identifier);
    }
    try {
        const result = await ratelimit.limit(identifier);
        return result;
    }
    catch (error) {
        console.error('Upstash Rate Limit error, failing over to local rate limiter:', error);
        return checkInMemoryRateLimit(identifier);
    }
}
export function rateLimitExceededResponse() {
    return NextResponse.json({ error: 'Too many requests. Please slow down and try again in 60 seconds.' }, { status: 429 });
}
