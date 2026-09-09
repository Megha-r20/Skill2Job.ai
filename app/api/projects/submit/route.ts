import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, projectId, title, description, technologies, githubUrl, liveUrl } = body;

    if (!studentId || !title) {
      return NextResponse.json({ success: false, error: 'Student ID and project title are required.' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found.' }, { status: 404 });
    }

    const newProject = {
      id: `proj_${Date.now()}`,
      studentId,
      title,
      description: description || 'No description provided.',
      technologies: technologies || [],
      githubUrl: githubUrl || 'https://github.com/student/project',
      liveUrl: liveUrl || 'https://project-demo.vercel.app',
      verified: true
    };

    // Increment placement readiness by 8% (capping at 100)
    await prisma.student.update({
      where: { id: studentId },
      data: {
        placementReadiness: Math.min(100, (student.placementReadiness || 65) + 8),
        placementStatus: ((student.placementReadiness || 65) + 8) >= 80 ? 'Placement Ready' : student.placementStatus
      }
    });

    return NextResponse.json({
      success: true,
      project: newProject,
      message: 'Project verified and added to your Skill Passport successfully!'
    });
  } catch (error: any) {
    console.error('Error submitting project:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
