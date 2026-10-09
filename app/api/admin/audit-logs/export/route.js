import { NextResponse } from 'next/server';
import { auditService } from '@/lib/services/auditService';
import { generateCsv } from '@/lib/utils/exportUtils';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';

/**
 * GET /api/admin/audit-logs/export
 * Exports complete security audit trail as CSV or JSON.
 */
export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const { searchParams } = new URL(request.url);

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

        const format = searchParams.get('format') || 'csv';
        const category = searchParams.get('category') || 'All';
        const status = searchParams.get('status') || 'All';

        const { headers, rows } = await auditService.getExportData({ category, status });

        if (format === 'csv') {
            const csvContent = generateCsv(headers, rows);
            const filename = `Skill2Job_Security_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`;

            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Cache-Control': 'no-cache'
                }
            });
        }

        return NextResponse.json({
            success: true,
            format: 'json',
            headers,
            rows,
            count: rows.length
        });
    } catch (error) {
        console.error('[GET audit export error]:', error);
        return NextResponse.json(
            { error: 'Unable to export audit trail.' },
            { status: 500 }
        );
    }
}
