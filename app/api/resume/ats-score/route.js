import { NextResponse } from 'next/server';
import { resumeService } from '@/lib/services/resumeService';
import { applyRateLimit } from '@/lib/rateLimit';
import { promptGuard } from '@/lib/security/promptGuard';
import { atsScoreSchema, validateWithSchema } from '@/lib/validations';
import { aiCache } from '@/lib/cache/aiCache';
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
        const validation = validateWithSchema(atsScoreSchema, rawBody);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const { resumeText, jobDescription } = validation.data;
        const targetRole = rawBody?.targetRole;

        // 2. Input Size and Prompt-Injection Security Checks
        const guardResult = await promptGuard.validateAndSanitizeResume(resumeText, {
            targetResourceId: 'resume_ats_score'
        });

        if (!guardResult.valid) {
            return NextResponse.json({
                success: false,
                error: guardResult.error,
                code: guardResult.violations[0] || 'SECURITY_VIOLATION'
            }, { status: 400 });
        }

        const sanitizedJob = promptGuard.sanitizeText(jobDescription || '');
        const sanitizedRole = promptGuard.sanitizeText(targetRole || '');

        const { data: atsResults } = await aiCache.wrap(
            'ats_score',
            { resume: guardResult.sanitizedText, job: sanitizedJob, role: sanitizedRole },
            async () => resumeService.calculateAtsScore(guardResult.sanitizedText, sanitizedJob, sanitizedRole),
            { ttl: 86400 }
        );

        return NextResponse.json({
            success: true,
            ...atsResults
        }, {
            headers: rateLimit.headers
        });
    } catch (error) {
        logger.error('[ats-score-api] Error calculating ATS score', error, { route: '/api/resume/ats-score' });
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
