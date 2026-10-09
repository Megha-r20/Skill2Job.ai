import { NextResponse } from 'next/server';
import { matchTalentBySkillsQuery } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { validateWithSchema } from '@/lib/validations';
import { z } from 'zod';

const talentSkillSearchSchema = z.object({
    queryText: z.string().min(1, 'queryText is required'),
    minCgpa: z.union([z.number(), z.string()]).optional(),
    collegeId: z.string().optional()
});

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['company', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const rawBody = await request.json().catch(() => ({}));
        const validation = validateWithSchema(talentSkillSearchSchema, rawBody);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const { queryText, minCgpa, collegeId } = validation.data;
        const candidates = await matchTalentBySkillsQuery(queryText, {
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
