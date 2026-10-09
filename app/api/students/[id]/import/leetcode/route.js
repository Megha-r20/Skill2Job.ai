import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { profileImportService } from '@/lib/services/profileImportService';

export async function POST(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const ownerAuth = await authorizeOwnership(session, params.id, 'student');
        if (!ownerAuth.authorized) {
            return ownerAuth.errorResponse;
        }

        const body = await request.json().catch(() => ({}));
        const username = body.username;
        if (!username) {
            return NextResponse.json({ error: 'LeetCode username is required' }, { status: 400 });
        }

        const importData = await profileImportService.importLeetCodeProfile(username);
        const appliedSkills = await profileImportService.applyImportedSkillsToStudent(params.id, [importData.verifiedSkill]);

        return NextResponse.json({
            success: true,
            message: `Successfully verified Data Structures & Algorithms (${importData.verifiedSkill.level}) from LeetCode @${importData.username}`,
            stats: {
                username: importData.username,
                totalSolved: importData.totalSolved,
                easySolved: importData.easySolved,
                mediumSolved: importData.mediumSolved,
                hardSolved: importData.hardSolved,
                ranking: importData.ranking
            },
            verifiedSkill: appliedSkills[0] || importData.verifiedSkill
        });
    } catch (error) {
        console.error('[leetcode-import] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
