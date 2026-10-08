import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
export async function GET(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['college', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }
        if (session.role === 'college') {
            const ownerAuth = await authorizeOwnership(session, params.id, 'college');
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
