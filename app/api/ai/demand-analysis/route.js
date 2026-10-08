import { NextResponse } from 'next/server';
import { calculateIndustrySkillDemand } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
export async function GET(request) {
    try {
        const demand = await calculateIndustrySkillDemand();
        const jobs = await prisma.job.findMany({ where: { status: 'published' } });
        const totalJobs = jobs.length;
        const totalCompanies = await prisma.company.count();
        // Aggregate by category
        const categoryDemand = {};
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
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
