// @ts-nocheck
import { NextResponse } from 'next/server';
import { calculateIndustrySkillDemand } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';

export async function GET(request: Request) {
  try {
    const demand = calculateIndustrySkillDemand();
    const totalJobs = await (await prisma.job.findMany()).filter(j => j.status === 'published').length;
    const totalCompanies = await prisma.company.findMany().length;

    // Aggregate by category
    const categoryDemand: Record<string, { totalPercent: number; count: number }> = {};
    demand.forEach(item => {
      if (!categoryDemand[item.category]) {
        categoryDemand[item.category] = { totalPercent: 0, count: 0 };
      }
      categoryDemand[item.category].totalPercent += item.demandPercent;
      categoryDemand[item.category].count += 1;
    });

    const categoryStats = Object.entries(categoryDemand).map(([cat, data]) => ({
      category: cat,
      averageDemand: Math.round(data.totalPercent / data.count),
      skillCount: data.count
    })).sort((a, b) => b.averageDemand - a.averageDemand);

    return NextResponse.json({
      success: true,
      totalJobs,
      totalCompanies,
      topSkills: demand.slice(0, 10),
      allSkillsDemand: demand,
      categoryStats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, {  status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
