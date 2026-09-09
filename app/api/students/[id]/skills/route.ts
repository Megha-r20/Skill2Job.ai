// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';
import { StudentSkill } from '@/lib/types';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthenticatedSession(request);
    
    // 1. Authorize Role
    const roleAuth = authorizeRole(session, ['student', 'college', 'company']);
    if (!roleAuth.authorized) return roleAuth.errorResponse!;

    // 2. Authorize Ownership
    if (session?.role === 'student') {
      const ownerAuth = await authorizeOwnership(session, params.id, 'student');
      if (!ownerAuth.authorized) return ownerAuth.errorResponse!;
    }

    const studentSkills = [] as any[];
    const verifiedSkills = [] as any[];
    const certificates = [] as any[];

    return NextResponse.json({
      studentSkills,
      verifiedSkills,
      certificates
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthenticatedSession(request);
    
    // 1. Only students can add their own skills
    const roleAuth = authorizeRole(session, ['student']);
    if (!roleAuth.authorized) return roleAuth.errorResponse!;

    const ownerAuth = await authorizeOwnership(session, params.id, 'student');
    if (!ownerAuth.authorized) return ownerAuth.errorResponse!;

    const body = await request.json();
    const { skillName, category, level } = body;

    if (!skillName) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    const allSkills = [] as any[];
    const foundSkill = allSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());

    // Never mark a self-declared skill as verified on entry
    const newSkill: StudentSkill = {
      id: `ss_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: params.id,
      skillId: foundSkill ? foundSkill.id : `sk_${skillName.toLowerCase().replace(/\s+/g, '_')}`,
      skillName: foundSkill ? foundSkill.name : skillName,
      category: category || foundSkill?.category || 'Programming',
      status: 'Self-Declared',
      level: level || 'Beginner'
    };

    db.addOrUpdateStudentSkill(newSkill);

    return NextResponse.json({
      success: true,
      skill: newSkill,
      message: `${newSkill.skillName} added as Self-Declared. Complete course & assessment to verify!`
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500 });
  }
}
