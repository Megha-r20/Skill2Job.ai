import { NextResponse } from 'next/server';
import { explainWhyNotEligible } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
export async function GET(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student', 'college', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }
        const ownerAuth = await authorizeOwnership(session, params.id, 'student');
        if (!ownerAuth.authorized) {
            return ownerAuth.errorResponse;
        }
        const studentId = params.id;
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');
        if (!jobId) {
            return NextResponse.json({ success: false, error: 'jobId query parameter required' }, { status: 400, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
        }
        const diagnostic = await explainWhyNotEligible(studentId, jobId);
        return NextResponse.json({
            success: true,
            diagnostic
        });
    }
    catch (error) {
        console.error('Error fetching eligibility diagnostic:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
