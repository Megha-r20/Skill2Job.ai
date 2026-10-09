import { NextResponse } from 'next/server';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { idParamSchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramValidation = validateWithSchema(idParamSchema, params);
        if (!paramValidation.success) {
            return paramValidation.errorResponse;
        }

        const assessmentId = paramValidation.data.id;
        const assessment = await assessmentRepository.findById(assessmentId);
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }
        const questions = await assessmentRepository.getQuestions(assessmentId);
        const sanitizedQuestions = (questions || []).map(q => ({
            id: q.id,
            assessmentId: q.assessmentId,
            questionText: q.questionText || q.question,
            options: q.options || [],
            points: q.points || 10
        }));

        return NextResponse.json({
            success: true,
            assessment,
            questions: sanitizedQuestions,
            totalQuestions: sanitizedQuestions.length
        });
    }
    catch (error) {
        console.error('[assessments-api] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
