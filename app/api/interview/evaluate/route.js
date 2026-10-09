import { NextResponse } from 'next/server';
import { evaluateInterviewResponse } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { applyRateLimit } from '@/lib/rateLimit';
import { promptGuard } from '@/lib/security/promptGuard';
import { interviewEvaluateSchema, validateWithSchema } from '@/lib/validations';

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

        const evaluation = evaluateInterviewResponse(questionText, guardResult.sanitizedText, category || 'Technical');
        evaluation.studentId = studentId;
        evaluation.questionId = questionId || 'iq_custom';
        return NextResponse.json({
            success: true,
            evaluation
        });
    }
    catch (error) {
        console.error('Error evaluating interview answer:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
