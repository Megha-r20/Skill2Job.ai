import { NextResponse } from 'next/server';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthenticatedSession(request);
    
    // 1. Authenticate & Authorize Role (Students, Colleges, Companies, Admins)
    const roleAuth = authorizeRole(session, ['student', 'college', 'company']);
    if (!roleAuth.authorized) return roleAuth.errorResponse!;

    // 2. Resource Ownership Check
    if (session?.role === 'student') {
      const ownerAuth = await authorizeOwnership(session, params.id, 'student');
      if (!ownerAuth.authorized) return ownerAuth.errorResponse!;
    } else if (session?.role === 'college') {
      const student = await studentRepository.findById(params.id) || await studentRepository.findByUserId(params.id);
      if (student && student.collegeId !== session.collegeId) {
        return NextResponse.json(
          { error: 'Access denied. You can only view students enrolled in your university.', code: 'FORBIDDEN_COLLEGE' },
          { status: 403 }
        );
      }
    }

    const student = await studentRepository.findById(params.id) || await studentRepository.findByUserId(params.id);
    if (!student) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    const studentSkills = student.skills || [];
    const verifiedSkills = studentSkills.filter(s => s.status === 'Verified');
    const applications = student.applications || [];
    
    // Fallback empty arrays for related entities until fully migrated
    const certificates: any[] = [] as any[];
    const projects: any[] = [] as any[];
    const assessmentResults: any[] = [] as any[];

    // Least Privilege Output Filtering for Company view
    const sanitizedStudent = session?.role === 'company'
      ? {
          id: student.id,
          fullName: student.fullName,
          degree: student.degree,
          department: student.department,
          graduationYear: student.graduationYear,
          collegeName: student.collegeName,
          cgpa: student.cgpa,
          placementReadiness: student.placementReadiness,
          verifiedSkillsCount: verifiedSkills.length
        }
      : student;

    return NextResponse.json({
      student: sanitizedStudent,
      skills: studentSkills,
      verifiedSkills,
      applications: session?.role === 'company' ? [] : applications,
      certificates,
      projects,
      assessmentResults
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthenticatedSession(request);
    
    // 1. Authorize Student Role
    const roleAuth = authorizeRole(session, ['student']);
    if (!roleAuth.authorized) return roleAuth.errorResponse!;

    // 2. Authorize Resource Ownership
    const ownerAuth = await authorizeOwnership(session, params.id, 'student');
    if (!ownerAuth.authorized) return ownerAuth.errorResponse!;

    const body = await request.json();

    // Prevent privilege escalation fields from being overwritten
    delete body.id;
    delete body.userId;
    delete body.placementReadiness;

    const studentToUpdate = await studentRepository.findById(params.id) || await studentRepository.findByUserId(params.id);
    
    if (!studentToUpdate) {
       return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const updated = await studentRepository.update(studentToUpdate.id, body);
    
    return NextResponse.json({ success: true, student: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500 });
  }
}
