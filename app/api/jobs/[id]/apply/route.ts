import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';
import { calculateJobMatch } from '@/lib/ai';
import { Application } from '@/lib/types';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { studentId, notes } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if already applied
    const existingApps = [] as any[];
    const alreadyApplied = existingApps.find(a => a.jobId === job.id);
    if (alreadyApplied) {
      return NextResponse.json({
        error: 'You have already submitted an application for this position.',
        application: alreadyApplied
      }, { status: 400 });
    }

    // Calculate match percentage at application time
    const matchData = calculateJobMatch(studentId, job.id);

    const newApp: Application = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      jobId: job.id,
      studentId: student.id,
      companyId: job.companyId,
      studentName: student.fullName,
      studentEmail: student.email,
      studentCollege: student.collegeName,
      jobTitle: job.title,
      companyName: job.companyName,
      matchPercentage: matchData.matchPercentage,
      status: 'Applied',
      notes: notes || 'Submitted via Skill2Hire verified talent pipeline',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    /* mocked */
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
