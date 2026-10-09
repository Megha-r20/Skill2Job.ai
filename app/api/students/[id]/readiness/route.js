import { NextResponse } from 'next/server';
import { calculateComprehensiveJobReadiness } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { idParamSchema, studentReadinessQuerySchema, validateWithSchema, validateQueryParams } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramVal = validateWithSchema(idParamSchema, params);
        if (!paramVal.success) return paramVal.errorResponse;
        const studentId = paramVal.data.id;

        const queryVal = validateQueryParams(studentReadinessQuerySchema, request);
        if (!queryVal.success) return queryVal.errorResponse;
        const jobId = queryVal.data.jobId || undefined;

        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student', 'college', 'company', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }
        if (session.role === 'student' || session.role === 'college') {
            const ownerAuth = await authorizeOwnership(session, studentId, 'student');
            if (!ownerAuth.authorized) {
                return ownerAuth.errorResponse;
            }
        }
        const readiness = await calculateComprehensiveJobReadiness(studentId, jobId);
        return NextResponse.json({
            success: true,
            readiness
        });
    }
    catch (error) {
        console.error('Error fetching student readiness:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
