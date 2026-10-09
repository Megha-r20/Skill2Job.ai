import { NextResponse } from 'next/server';
import { placementDriveRepository } from '@/lib/repositories/placementDriveRepository';
import { generateCsv, generatePrintableReportHtml } from '@/lib/utils/exportUtils';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';

/**
 * GET /api/colleges/[id]/reports/export
 * Generates official institutional export files in CSV, PDF/HTML, or JSON.
 * Query Parameters:
 * - type: 'drives' | 'departments' | 'students' (default: 'departments')
 * - format: 'csv' | 'html' | 'json' (default: 'csv')
 * - batchYear: string (default: '2026')
 */
export async function GET(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        const collegeId = params.id || 'col_1';

        if (session) {
            const roleAuth = authorizeRole(session, ['college', 'admin']);
            if (!roleAuth.authorized) return roleAuth.errorResponse;
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'departments';
        const format = searchParams.get('format') || 'csv';
        const batchYear = searchParams.get('batchYear') || '2026';

        const { headers, rows } = await placementDriveRepository.getExportData(type, collegeId, batchYear);

        // 1. CSV Format Export
        if (format === 'csv') {
            const csvContent = generateCsv(headers, rows);
            const filename = `Apex_University_${type}_Report_${batchYear}.csv`;

            return new NextResponse(csvContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Cache-Control': 'no-cache'
                }
            });
        }

        // 2. HTML / Print / PDF Export
        if (format === 'html') {
            const { summary } = await placementDriveRepository.getDepartmentStats(collegeId, batchYear);
            const summaryMetrics = [
                { label: 'Total Students', value: summary.totalStudents },
                { label: 'Total Placed', value: summary.totalPlaced },
                { label: 'Placement Rate', value: `${summary.overallPlacementRate}%`, sub: 'Verified Merit' },
                { label: 'Average CTC', value: summary.avgInstitutionalCtcLpa },
                { label: 'Highest CTC', value: summary.highestOverallCtcLpa }
            ];

            const htmlContent = generatePrintableReportHtml({
                collegeName: 'Apex University of Engineering',
                reportTitle: type === 'drives' ? 'Campus Placement Drives Master Schedule' :
                             type === 'students' ? 'Graduating Batch Student Placement Roster' :
                             'Department-Wise Placement & Readiness Intelligence Report',
                batchYear,
                summaryMetrics: type === 'departments' ? summaryMetrics : [],
                headers,
                rows,
                notes: 'Generated via Skill2Job.ai Institutional Career Center. All assessment badges and student qualifications verified.'
            });

            return new NextResponse(htmlContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                }
            });
        }

        // 3. JSON Format
        return NextResponse.json({
            success: true,
            type,
            collegeId,
            batchYear,
            headers,
            rows,
            count: rows.length
        });
    } catch (error) {
        console.error('[GET reports/export error]:', error);
        return NextResponse.json(
            { error: 'Unable to generate institutional report export.' },
            { status: 500 }
        );
    }
}
