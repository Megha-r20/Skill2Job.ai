import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const studentSkills = await prisma.studentSkill.findMany({ where: { studentId: params.id } });
    const verifiedSkills = studentSkills.filter(s => s.status === 'VERIFIED');
    const certificates = [] as any[];

    return NextResponse.json({
      studentSkills,
      verifiedSkills,
      certificates
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
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
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }

    const createdSkill = await prisma.studentSkill.create({
      data: {
        studentId: params.id,
        skillId: `sk_${skillName.toLowerCase().replace(/\s+/g, '_')}`,
        skillName,
        category: category || 'Programming',
        status: 'Self-Declared',
        level: level || 'Beginner'
      }
    });

    return NextResponse.json({
      success: true,
      skill: createdSkill,
      message: `${createdSkill.skillName} added as Self-Declared. Complete course & assessment to verify!`
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
