import { NextResponse } from 'next/server';
import { getNextBestAction } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { idParamSchema, validateWithSchema } from '@/lib/validations';

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

        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student', 'college', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }
        const ownerAuth = await authorizeOwnership(session, studentId, 'student');
        if (!ownerAuth.authorized) {
            return ownerAuth.errorResponse;
        }
        const nextAction = await getNextBestAction(studentId);
        return NextResponse.json({
            success: true,
            nextAction
        });
    }
    catch (error) {
        console.error('Error fetching next best action:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
