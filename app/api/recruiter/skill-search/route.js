import { NextResponse } from 'next/server';
import { matchTalentBySkillsQuery } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['company', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }
        const body = await request.json();
        const { queryText, minCgpa, collegeId } = body;
        if (!queryText) {
            return NextResponse.json({ success: false, error: 'queryText is required' }, { status: 400 });
        }
        const candidates = matchTalentBySkillsQuery(queryText, {
            minCgpa: minCgpa ? Number(minCgpa) : undefined,
            collegeId: collegeId || undefined
        });
        return NextResponse.json({
            success: true,
            queryText,
            candidates
        });
    }
    catch (error) {
        console.error('Error searching talent by skills:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
