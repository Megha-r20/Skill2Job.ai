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
        if (!paramValidation.success) return paramValidation.errorResponse;

        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['college', 'admin']);
        if (!roleAuth.authorized) return roleAuth.errorResponse;
        if (session.role === 'college') {
            const ownerAuth = await authorizeOwnership(session, paramValidation.data.id, 'college');
            if (!ownerAuth.authorized) return ownerAuth.errorResponse;
        }
        return NextResponse.json({ success: true, programs: [] });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request, { params }) {
    try {
        const paramValidation = validateWithSchema(idParamSchema, params);
        if (!paramValidation.success) return paramValidation.errorResponse;

        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['college', 'admin']);
        if (!roleAuth.authorized) return roleAuth.errorResponse;
        if (session.role === 'college') {
            const ownerAuth = await authorizeOwnership(session, paramValidation.data.id, 'college');
            if (!ownerAuth.authorized) return ownerAuth.errorResponse;
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
