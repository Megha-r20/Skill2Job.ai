import { NextResponse } from 'next/server';
import { aiCache } from '@/lib/cache/aiCache';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { logger } from '@/lib/logger';

/**
 * GET /api/cache/stats
 * Retrieves real-time cache performance metrics, hit ratios, and estimated cost savings.
 */
export async function GET(request) {
    try {
        const stats = aiCache.getStats();
        return NextResponse.json({
            success: true,
            stats
        });
    } catch (error) {
        logger.error('Error fetching cache stats', error, { route: '/api/cache/stats' });
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/cache/stats
 * Invalidate specific cache namespace or clear all entries (Admin-only).
 */
export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const body = await request.json().catch(() => ({}));
        if (body.clearAll) {
            aiCache.clear();
            logger.info('Admin cleared entire AI cache', { userId: session.userId });
            return NextResponse.json({
                success: true,
                message: 'AI cache cleared successfully',
                stats: aiCache.getStats()
            });
        }

        if (body.namespace) {
            const invalidatedCount = await aiCache.invalidate(body.namespace);
            logger.info('Admin invalidated AI cache namespace', { namespace: body.namespace, invalidatedCount, userId: session.userId });
            return NextResponse.json({
                success: true,
                invalidatedCount,
                stats: aiCache.getStats()
            });
        }

        return NextResponse.json({
            success: false,
            error: 'Specify "namespace" or "clearAll: true"'
        }, { status: 400 });
    } catch (error) {
        logger.error('Error invalidating cache', error, { route: '/api/cache/stats' });
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
