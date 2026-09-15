import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const assessment = await prisma.assessment.findUnique({ where: { id: params.id } });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }

    const questions = await prisma.assessmentQuestion.findMany({ where: { assessmentId: params.id } });

    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      assessmentId: q.assessmentId,
      questionText: q.question,
      options: q.options,
      points: q.points
    }));

    return NextResponse.json({
      success: true,
      assessment,
      questions: sanitizedQuestions,
      totalQuestions: questions.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
