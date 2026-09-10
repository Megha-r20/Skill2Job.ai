import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';

export async function GET(request: Request, { params }: { params: { skill: string } }) {
  try {
    const skillName = decodeURIComponent(params.skill);
    const ecosystem = [] as any[];

    return NextResponse.json({
      success: true,
      ecosystem
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, {  status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
