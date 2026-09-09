import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthenticatedSession(request);
    
    // 1. Only College and Admin can view student roster for that college
    const roleAuth = authorizeRole(session, ['college', 'admin']);
    if (!roleAuth.authorized) return roleAuth.errorResponse!;

    // 2. Enforce institution boundary check
    if (session?.role === 'college') {
      const ownerAuth = await authorizeOwnership(session, params.id, 'college');
      if (!ownerAuth.authorized) return ownerAuth.errorResponse!;
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'placement_ready' | 'needs_training' | 'all'
    const department = searchParams.get('department');

    let students = await (await prisma.student.findMany()).filter(s => s.collegeId === params.id);

    if (filter === 'placement_ready') {
      students = students.filter(s => s.placementReadiness >= 80 || s.placementStatus === 'Placement Ready');
    } else if (filter === 'needs_training') {
      students = students.filter(s => s.placementReadiness < 80 && s.placementStatus !== 'Placed');
    } else if (filter === 'placed') {
      students = students.filter(s => s.placementStatus === 'Placed');
    }

    if (department && department !== 'All') {
      students = students.filter(s => s.department.toLowerCase() === department.toLowerCase());
    }

    const studentsWithSkills = students.map(student => {
      const studentSkills = [] as any[];
      const verifiedSkills = [] as any[];
      const studentApps = [] as any[];
      return {
        ...student,
        skillsCount: studentSkills.length,
        verifiedSkillsCount: verifiedSkills.length,
        verifiedSkillsList: verifiedSkills.map(v => `${v.skillName} (${v.level})`),
        allSkills: studentSkills,
        applicationsCount: studentApps.length,
        applications: studentApps
      };
    });

    return NextResponse.json({
      success: true,
      count: studentsWithSkills.length,
      students: studentsWithSkills
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500 });
  }
}
