import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['company', 'admin']);
        if (!roleAuth.authorized) return roleAuth.errorResponse;
        return NextResponse.json({ success: true, signals: [] });
    } catch (err) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
