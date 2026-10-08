import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { codingProblemRepository } from '@/lib/repositories/codingProblemRepository';
import { codeExecutionService } from '@/lib/services/codeExecutionService';

export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const body = await request.json();
        const { problemId = 'cp_1', language = 'python', code = '', studentId: reqStudentId } = body;
        const studentId = reqStudentId || session.studentId || session.userId;

        if (session.role === 'student') {
            const ownerAuth = await authorizeOwnership(session, studentId, 'student');
            if (!ownerAuth.authorized) {
                return ownerAuth.errorResponse;
            }
        }

        if (!code || typeof code !== 'string' || !code.trim()) {
            return NextResponse.json({
                success: false,
                error: 'Source code is required for evaluation.'
            }, { status: 400 });
        }

        const problem = codingProblemRepository.findById(problemId);
        if (!problem) {
            return NextResponse.json({
                success: false,
                error: `Problem with ID '${problemId}' not found.`
            }, { status: 404 });
        }

        // Real code execution and testcase validation via Sandbox / Piston / Judge0
        const judgment = await codeExecutionService.judgeSubmission({
            problem,
            language,
            code
        });

        const attempt = {
            id: `catt_${Date.now()}`,
            studentId,
            problemId: problem.id,
            problemTitle: problem.title,
            topic: problem.topic,
            language,
            code,
            status: judgment.passed ? 'Solved ✓' : 'Failed',
            accuracy: judgment.accuracy,
            executionTimeMs: judgment.executionTimeMs,
            submittedAt: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            passed: judgment.passed,
            attempt,
            testCaseResults: judgment.testCaseResults
        });
    }
    catch (error) {
        console.error('Error submitting code:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
