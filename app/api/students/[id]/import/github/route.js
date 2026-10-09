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
            return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
        }

        const importData = await profileImportService.importGitHubProfile(username);
        const appliedSkills = await profileImportService.applyImportedSkillsToStudent(params.id, importData.verifiedSkills);

        return NextResponse.json({
            success: true,
            message: `Successfully imported ${importData.verifiedSkills.length} verified competencies from GitHub @${importData.username}`,
            profile: {
                username: importData.username,
                profileUrl: importData.profileUrl,
                publicRepos: importData.publicRepos,
                totalStars: importData.totalStars,
                languages: importData.languagesDetected
            },
            importedSkills: appliedSkills
        });
    } catch (error) {
        console.error('[github-import] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
