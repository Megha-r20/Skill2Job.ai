import { NextResponse } from 'next/server';
import { resumeService } from '@/lib/services/resumeService';
import { applyRateLimit } from '@/lib/rateLimit';
import { promptGuard } from '@/lib/security/promptGuard';

export async function POST(request) {
    try {
        // 1. Rate Limiting on Costly AI Operations
        const rateLimit = await applyRateLimit(request, 'ai');
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        const body = await request.json().catch(() => ({}));
        const { resumeText, jobDescription, targetRole } = body;

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

        const atsResults = resumeService.calculateAtsScore(
            guardResult.sanitizedText,
            promptGuard.sanitizeText(jobDescription || ''),
            promptGuard.sanitizeText(targetRole || '')
        );

        return NextResponse.json({
            success: true,
            ...atsResults
        }, {
            headers: rateLimit.headers
        });
    } catch (error) {
        console.error('[ats-score-api] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
