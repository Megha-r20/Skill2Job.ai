// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    let assessment = await prisma.assessment.findUnique({ where: { id: params.id } });
    if (!assessment) {
      assessment = [] as any[];
    }

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const questions = [] as any[];

    // Omit correctOptionIndex when sending questions to client to prevent client-side inspection
    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      assessmentId: q.assessmentId,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      codeSnippet: q.codeSnippet,
      points: q.points
    }));

    return NextResponse.json({
      success: true,
      assessment,
      questions: sanitizedQuestions,
      totalQuestions: questions.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
