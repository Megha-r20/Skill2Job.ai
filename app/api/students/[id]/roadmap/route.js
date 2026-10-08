import { NextResponse } from 'next/server';
import { generatePersonalizedRoadmap } from '@/lib/ai';
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
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId') || undefined;
        const targetRole = searchParams.get('targetRole') || undefined;
        const roadmap = await generatePersonalizedRoadmap(params.id, jobId, targetRole);
        return NextResponse.json({
            success: true,
            roadmap
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
