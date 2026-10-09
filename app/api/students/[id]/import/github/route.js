import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { profileImportService } from '@/lib/services/profileImportService';
import { idParamSchema, githubImportSchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request, { params }) {
    try {
        const paramVal = validateWithSchema(idParamSchema, params);
        if (!paramVal.success) return paramVal.errorResponse;
        const studentId = paramVal.data.id;

        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const ownerAuth = await authorizeOwnership(session, studentId, 'student');
        if (!ownerAuth.authorized) {
            return ownerAuth.errorResponse;
        }

        const rawBody = await request.json().catch(() => ({}));
        const bodyVal = validateWithSchema(githubImportSchema, rawBody);
        if (!bodyVal.success) {
            return bodyVal.errorResponse;
        }
        const username = bodyVal.data.username;

        const importData = await profileImportService.importGitHubProfile(username);
        const appliedSkills = await profileImportService.applyImportedSkillsToStudent(studentId, importData.verifiedSkills);

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
