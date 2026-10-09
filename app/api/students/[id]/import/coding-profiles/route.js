import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { profileImportService } from '@/lib/services/profileImportService';
import { idParamSchema, codingProfilePlatformImportSchema, validateWithSchema } from '@/lib/validations';

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
        const bodyVal = validateWithSchema(codingProfilePlatformImportSchema, rawBody);
        if (!bodyVal.success) {
            return bodyVal.errorResponse;
        }
        const { platform, username } = bodyVal.data;

        const cleanPlatform = String(platform).trim().toLowerCase();

        if (cleanPlatform === 'github') {
            const importData = await profileImportService.importGitHubProfile(username);
            const appliedSkills = await profileImportService.applyImportedSkillsToStudent(studentId, importData.verifiedSkills);
            return NextResponse.json({
                success: true,
                platform: 'github',
                profile: importData,
                importedSkills: appliedSkills
            });
        } else if (cleanPlatform === 'leetcode') {
            const importData = await profileImportService.importLeetCodeProfile(username);
            const appliedSkills = await profileImportService.applyImportedSkillsToStudent(studentId, [importData.verifiedSkill]);
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
