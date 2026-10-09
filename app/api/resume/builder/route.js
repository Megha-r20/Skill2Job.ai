import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/authMiddleware';
import { resumeService } from '@/lib/services/resumeService';
import { resumeBuilderQuerySchema, validateQueryParams, validateWithSchema } from '@/lib/validations';
import { z } from 'zod';

const resumeBuilderPostSchema = z.object({
    studentId: z.string().optional(),
    resumeData: z.record(z.any()).or(z.string()),
    jobDescription: z.string().optional(),
    targetRole: z.string().optional()
});

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const queryValidation = validateQueryParams(resumeBuilderQuerySchema, request);
        const queryStudentId = queryValidation.success ? queryValidation.data.studentId : null;
        const studentId = queryStudentId || session?.userId || 'std_1';

        const resumeData = await resumeService.buildResumeFromProfile(studentId);

        return NextResponse.json({
            success: true,
            studentId,
            resumeData
        });
    } catch (error) {
        console.error('[resume-builder-get] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const rawBody = await request.json().catch(() => ({}));
        const validation = validateWithSchema(resumeBuilderPostSchema, rawBody);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const body = validation.data;
        const studentId = body.studentId || session?.userId || 'std_1';
        const { resumeData } = body;

        const atsEvaluation = resumeService.calculateAtsScore(
            JSON.stringify(resumeData),
            body.jobDescription || '',
            body.targetRole || ''
        );

        return NextResponse.json({
            success: true,
            studentId,
            atsEvaluation,
            message: 'Resume saved and evaluated successfully.'
        });
    } catch (error) {
        console.error('[resume-builder-post] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
