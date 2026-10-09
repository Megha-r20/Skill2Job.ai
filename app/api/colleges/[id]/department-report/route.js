import { NextResponse } from 'next/server';
import { placementDriveRepository } from '@/lib/repositories/placementDriveRepository';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { idParamSchema, departmentReportQuerySchema, validateWithSchema, validateQueryParams } from '@/lib/validations';

/**
 * GET /api/colleges/[id]/department-report
 * Returns institutional department-wise placement statistics, readiness %, and CTC metrics.
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

        const queryValidation = validateQueryParams(departmentReportQuerySchema, request);
        const { searchParams } = new URL(request.url);
        const batchYear = searchParams.get('batchYear') || '2026';

        const report = await placementDriveRepository.getDepartmentStats(collegeId, batchYear);

        return NextResponse.json({
            success: true,
            collegeId,
            batchYear,
            report
        });
    } catch (error) {
        console.error('[GET department-report error]:', error);
        return NextResponse.json(
            { error: 'Unable to retrieve department placement report.' },
            { status: 500 }
        );
    }
}
