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
        const { platform, username } = body;

        if (!platform || !username) {
            return NextResponse.json({ error: 'Both platform ("github" | "leetcode") and username are required' }, { status: 400 });
        }

        const cleanPlatform = String(platform).trim().toLowerCase();

        if (cleanPlatform === 'github') {
            const importData = await profileImportService.importGitHubProfile(username);
            const appliedSkills = await profileImportService.applyImportedSkillsToStudent(params.id, importData.verifiedSkills);
            return NextResponse.json({
                success: true,
                platform: 'github',
                profile: importData,
                importedSkills: appliedSkills
            });
        } else if (cleanPlatform === 'leetcode') {
            const importData = await profileImportService.importLeetCodeProfile(username);
            const appliedSkills = await profileImportService.applyImportedSkillsToStudent(params.id, [importData.verifiedSkill]);
            return NextResponse.json({
                success: true,
                platform: 'leetcode',
                stats: importData,
                importedSkills: appliedSkills
            });
        } else {
            return NextResponse.json({ error: 'Unsupported platform. Supported: "github", "leetcode"' }, { status: 400 });
        }
    } catch (error) {
        console.error('[coding-profiles-import] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
