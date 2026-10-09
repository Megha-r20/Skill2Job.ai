import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { idParamSchema, validateWithSchema } from '@/lib/validations';

/**
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

        const collegeId = paramValidation.data.id;
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['college', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }
        if (session.role === 'college') {
            const ownerAuth = await authorizeOwnership(session, collegeId, 'college');
            if (!ownerAuth.authorized) {
                return ownerAuth.errorResponse;
            }
        }
        const signals = [];
        return NextResponse.json({
            success: true,
            signals
        });
    }
    catch (error) {
        console.error('Error fetching demand signals:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
