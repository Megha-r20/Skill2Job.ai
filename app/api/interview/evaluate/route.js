import { NextResponse } from 'next/server';
import { evaluateInterviewResponse } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { applyRateLimit } from '@/lib/rateLimit';
import { promptGuard } from '@/lib/security/promptGuard';
import { interviewEvaluateSchema, validateWithSchema } from '@/lib/validations';
import { aiCache } from '@/lib/cache/aiCache';
import { logger } from '@/lib/logger';

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

        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const rawBody = await request.json().catch(() => ({}));
        const validation = validateWithSchema(interviewEvaluateSchema, rawBody);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const { questionId, questionText, answerText, category, studentId: reqStudentId } = validation.data;
        const studentId = reqStudentId || session.studentId || session.userId;
        if (session.role === 'student') {
            const ownerAuth = await authorizeOwnership(session, studentId, 'student');
            if (!ownerAuth.authorized) {
                return ownerAuth.errorResponse;
            }
        }

        // Validate and sanitize interview response against injection patterns and length limits
        const guardResult = await promptGuard.validateShortInput(answerText, 'Interview answer', {
            userId: session.userId,
            userRole: session.role
        });
        if (!guardResult.valid) {
            return NextResponse.json({
                success: false,
                error: guardResult.error,
                violations: guardResult.violations || []
            }, { status: 400 });
        }

        const { data: evaluation } = await aiCache.wrap(
            'interview_evaluation',
            { questionText, answer: guardResult.sanitizedText, category: category || 'Technical' },
            async () => evaluateInterviewResponse(questionText, guardResult.sanitizedText, category || 'Technical'),
            { ttl: 86400 }
        );

        const responsePayload = {
            ...evaluation,
            studentId,
            questionId: questionId || 'iq_custom'
        };

        return NextResponse.json({
            success: true,
            evaluation: responsePayload
        });
    }
    catch (error) {
        logger.error('Error evaluating interview answer', error, { route: '/api/interview/evaluate' });
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
