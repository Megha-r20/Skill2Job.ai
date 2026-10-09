import { NextResponse } from 'next/server';
import { placementDriveRepository } from '@/lib/repositories/placementDriveRepository';
import { generateCsv, generatePrintableReportHtml } from '@/lib/utils/exportUtils';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { idParamSchema, validateWithSchema } from '@/lib/validations';
import { z } from 'zod';

const exportQuerySchema = z.object({
    type: z.enum(['drives', 'departments', 'students']).optional().default('departments'),
    format: z.enum(['csv', 'html', 'json', 'pdf']).optional().default('csv'),
    batchYear: z.string().optional().default('2026')
});

/**
 * GET /api/colleges/[id]/reports/export
 * Generates official institutional export files in CSV, PDF/HTML, or JSON.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramValidation = validateWithSchema(idParamSchema, params);
        if (!paramValidation.success) {
            return paramValidation.errorResponse;
        }

        const session = await getAuthenticatedSession(request);
        const collegeId = paramValidation.data.id || 'col_1';

        if (session) {
            const roleAuth = authorizeRole(session, ['college', 'admin']);
            if (!roleAuth.authorized) return roleAuth.errorResponse;
        }

        const { searchParams } = new URL(request.url);
        const queryRaw = {
            type: searchParams.get('type') || 'departments',
            format: searchParams.get('format') || 'csv',
            batchYear: searchParams.get('batchYear') || '2026'
        };
        const queryValidation = validateWithSchema(exportQuerySchema, queryRaw);
        const { type, format, batchYear } = queryValidation.success ? queryValidation.data : queryRaw;

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
