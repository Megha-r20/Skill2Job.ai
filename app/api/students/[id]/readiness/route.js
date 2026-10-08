import { NextResponse } from 'next/server';
import { calculateComprehensiveJobReadiness } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
export async function GET(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student', 'college', 'company', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }
        if (session.role === 'student' || session.role === 'college') {
            const ownerAuth = await authorizeOwnership(session, params.id, 'student');
            if (!ownerAuth.authorized) {
                return ownerAuth.errorResponse;
            }
        }
        const studentId = params.id;
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId') || undefined;
        const readiness = calculateComprehensiveJobReadiness(studentId, jobId);
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
