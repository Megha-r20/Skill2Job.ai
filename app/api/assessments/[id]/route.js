import { NextResponse } from 'next/server';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';

export async function GET(request, { params }) {
    try {
        const assessmentId = params.id;
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
