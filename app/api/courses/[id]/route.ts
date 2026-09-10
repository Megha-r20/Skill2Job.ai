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
    const course = await prisma.course.findUnique({ where: { id: params.id }, include: { lessons: true } });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, {  status: 404 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const modules = [] as any[];
    const lessons = [] as any[];
    const associatedAssessment = await (await prisma.assessment.findMany()).find(a => a.courseId === course.id || course.targetSkills.includes(a.skillName));

    let progress: any[] = [] as any[];
    let completedCount = 0;

    if (studentId) {
      progress = [] as any[];
      completedCount = progress.filter(p => p.status === 'completed').length;
    }

    const modulesWithLessons = modules.map(m => {
      const modLessons = lessons.filter(l => l.moduleId === m.id);
      return {
        ...m,
        lessons: modLessons.map(l => {
          const prog = progress.find(p => p.lessonId === l.id);
          return {
            ...l,
            isCompleted: prog?.status === 'completed',
            progressStatus: prog?.status || 'not_started'
          };
        })
      };
    });

    const completionPercentage = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

    return NextResponse.json({
      success: true,
      course,
      modules: modulesWithLessons,
      lessons,
      associatedAssessment,
      userProgress: {
        completedCount,
        totalLessons: lessons.length,
        completionPercentage,
        isCompleted: completionPercentage === 100
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, {  status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
