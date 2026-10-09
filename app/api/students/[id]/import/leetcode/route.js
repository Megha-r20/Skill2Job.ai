import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { profileImportService } from '@/lib/services/profileImportService';
import { idParamSchema, leetcodeImportSchema, validateWithSchema } from '@/lib/validations';

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
        const bodyVal = validateWithSchema(leetcodeImportSchema, rawBody);
        if (!bodyVal.success) {
            return bodyVal.errorResponse;
        }
        const username = bodyVal.data.username;

        const importData = await profileImportService.importLeetCodeProfile(username);
        const appliedSkills = await profileImportService.applyImportedSkillsToStudent(studentId, [importData.verifiedSkill]);

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
