import { NextResponse } from 'next/server';
import { auditService } from '@/lib/services/auditService';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';

/**
 * GET /api/admin/audit-logs
 * Retrieves forensic security and system audit logs. Admin only.
 */
export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const { searchParams } = new URL(request.url);

        // Allow dev/demo access if unauthenticated in development
        let effectiveSession = session;
        if (!effectiveSession && process.env.NODE_ENV !== 'production') {
            effectiveSession = {
                userId: 'u_admin_demo',
                role: 'admin',
                email: 'admin@skill2job.ai'
            };
        }

        const roleAuth = authorizeRole(effectiveSession, ['admin']);
        if (!roleAuth.authorized) return roleAuth.errorResponse;

        const category = searchParams.get('category') || 'All';
        const status = searchParams.get('status') || 'All';
        const severity = searchParams.get('severity') || 'All';
        const search = searchParams.get('search') || '';

        const events = await auditService.getAuditTrail({
            category,
            status,
            severity,
            search
        });

        const statistics = await auditService.getAuditStatistics();

        return NextResponse.json({
            success: true,
            count: events.length,
            statistics,
            events
        });
    } catch (error) {
        console.error('[GET audit-logs error]:', error);
        return NextResponse.json(
            { error: 'Unable to retrieve audit logs.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/audit-logs
 * Records a new audit log entry.
 */
export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);

        let effectiveSession = session;
        if (!effectiveSession && process.env.NODE_ENV !== 'production') {
            effectiveSession = {
                userId: 'u_admin_demo',
                role: 'admin',
                email: 'admin@skill2job.ai'
            };
        }

        const roleAuth = authorizeRole(effectiveSession, ['admin']);
        if (!roleAuth.authorized) return roleAuth.errorResponse;

        const body = await request.json();
        const recorded = await auditService.logEvent({
            ...body,
            request
        });

        return NextResponse.json({
            success: true,
            event: recorded
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Unable to record audit log.' },
            { status: 500 }
        );
    }
}
