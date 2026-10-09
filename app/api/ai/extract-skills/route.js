import { NextResponse } from 'next/server';
import { extractSkillsFromJobDescription } from '@/lib/ai';
import { applyRateLimit } from '@/lib/rateLimit';
import { promptGuard, PROMPT_GUARD_CONFIG } from '@/lib/security/promptGuard';
import { extractSkillsSchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    try {
        const rateLimit = await applyRateLimit(request, 'ai');
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        const rawBody = await request.json().catch(() => ({}));
        const validation = validateWithSchema(extractSkillsSchema, rawBody);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const { description } = validation.data;

        // Validate and sanitize input against prompt injections and size limits
        const guardResult = await promptGuard.validateShortInput(description, 'Job description', {
            maxLength: PROMPT_GUARD_CONFIG.MAX_JOB_DESC_LENGTH
        });
        if (!guardResult.valid) {
            return NextResponse.json({
                error: guardResult.error,
                violations: guardResult.violations || []
            }, { status: 400 });
        }

        const result = await extractSkillsFromJobDescription(guardResult.sanitizedText);
        return NextResponse.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
