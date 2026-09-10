import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/services/aiService';

export const revalidate = 60; // Cache these heavy aggregations for 60 seconds (Phase 15)

export async function GET() {
  try {
    const [
      totalStudents,
      totalColleges,
      totalCompanies,
      totalJobs,
      totalApplications,
      totalSkills,
      placementsCount
    ] = await Promise.all([
      prisma.student.count(),
      prisma.college.count(),
      prisma.company.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.studentSkill.count({ where: { status: 'Verified' } }),
      prisma.application.count({ where: { status: 'Selected' } })
    ]);

    const recentApplications = await prisma.application.findMany({
      take: 10,
      orderBy: { appliedAt: 'desc' },
      include: { student: true, job: true }
    });

    const recentJobs = await prisma.job.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { company: true }
    });

    const recentStudents = await prisma.student.findMany({
      take: 10,
      orderBy: { placementReadiness: 'desc' }
    });

    const colleges = await prisma.college.findMany();
    const companies = await prisma.company.findMany();

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        totalColleges,
        totalCompanies,
        totalJobs,
        totalApplications,
        verifiedSkillsCount: totalSkills,
        placementsCount
      },
      students: recentStudents,
      colleges,
      companies,
      jobs: recentJobs,
      recentApplications,
      // Dynamic AI skill gap analysis can be injected here
      topDemandedSkills: [] 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, {  status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
