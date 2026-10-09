import { NextResponse } from 'next/server';
import { resumeService } from '@/lib/services/resumeService';
import { applyRateLimit } from '@/lib/rateLimit';
import { promptGuard } from '@/lib/security/promptGuard';
import { rewriteBulletSchema, validateWithSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    try {
        // 1. Rate Limiting on Costly AI Operations
        const rateLimit = await applyRateLimit(request, 'ai');
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        const rawBody = await request.json().catch(() => ({}));
        const validation = validateWithSchema(rewriteBulletSchema, rawBody);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const { bulletText } = validation.data;
        const { role, technologies, model } = rawBody;

        // 2. Input Size Limit & Prompt Injection Check on bullet text
        const guardResult = await promptGuard.validateShortInput(bulletText, 'Bullet point', {
            maxLength: 3000
        });

        if (!guardResult.valid) {
            return NextResponse.json({
                success: false,
                error: guardResult.error,
                code: guardResult.violations?.[0] || 'INVALID_INPUT'
            }, { status: 400 });
        }

        const rewriteResult = await resumeService.rewriteBulletPoint(guardResult.sanitizedText, {
            role: promptGuard.sanitizeText(role || 'Software Engineer'),
            technologies: promptGuard.sanitizeText(technologies || ''),
            model: model || process.env.GEMINI_MODEL
        });

        return NextResponse.json({
            success: true,
            ...rewriteResult
        }, {
            headers: rateLimit.headers
        });
    } catch (error) {
        logger.error('[rewrite-bullet-api] Error rewriting bullet point', error, { route: '/api/resume/rewrite-bullet' });
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
