import { NextResponse } from 'next/server';
import { auditService } from '@/lib/services/auditService';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { auditLogsAdminQuerySchema, auditLogCreateSchema, validateQueryParams, validateWithSchema } from '@/lib/validations';

/**
 * GET /api/admin/audit-logs
 * Retrieves forensic security and system audit logs. Admin only.
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request) {
    try {
        const queryVal = validateQueryParams(auditLogsAdminQuerySchema, request);
        if (!queryVal.success) return queryVal.errorResponse;
        const { category, status, severity, search } = queryVal.data;

        const session = await getAuthenticatedSession(request);

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
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    try {
        const rawBody = await request.json().catch(() => ({}));
        const bodyVal = validateWithSchema(auditLogCreateSchema, rawBody);
        if (!bodyVal.success) return bodyVal.errorResponse;
        const body = bodyVal.data;

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
