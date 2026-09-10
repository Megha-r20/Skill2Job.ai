// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const skill = searchParams.get('skill');

    let courses = await prisma.course.findMany({ include: { lessons: true } });

    if (category && category !== 'All') {
      courses = courses.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }

    if (skill) {
      courses = courses.filter(c => c.targetSkills.some(s => s.toLowerCase() === skill.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, {  status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
