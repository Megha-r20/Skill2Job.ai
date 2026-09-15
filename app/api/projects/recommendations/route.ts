import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'Software Developer';
    const studentId = searchParams.get('studentId') || 'std_1';

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const verifiedSkills = await prisma.studentSkill.findMany({ where: { studentId, status: 'VERIFIED' } });
    const verifiedSkillsNames = verifiedSkills.map(v => v.skillName.toLowerCase());

    const sampleProjects = [
      {
        id: 'proj_1',
        title: 'Skill2Job AI Matching Engine',
        description: 'AI-driven candidate skill gap analyzer and job matcher.',
        targetRole: 'Full-Stack Developer',
        difficulty: 'Advanced',
        technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
        matchScore: 92,
        matchReasons: ['Matches target career role: Full-Stack Developer', 'Leverages verified skills']
      },
      {
        id: 'proj_2',
        title: 'Microservices E-Commerce API',
        description: 'Scalable backend service with Docker, Redis rate limiting, and JWT auth.',
        targetRole: 'Backend Engineer',
        difficulty: 'Intermediate',
        technologies: ['Node.js', 'Express', 'Docker', 'Redis'],
        matchScore: 85,
        matchReasons: ['Foundational project for backend mastery']
      }
    ];

    return NextResponse.json({
      success: true,
      role,
      recommendations: sampleProjects
    });
  } catch (error) {
    console.error('Error fetching project recommendations:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
