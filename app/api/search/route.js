import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = (searchParams.get('q') || searchParams.get('query') || '').trim();
        const category = searchParams.get('category') || 'ALL';
        const jobs = query
            ? await prisma.job.findMany({ where: { OR: [{ title: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }] } })
            : await prisma.job.findMany({ take: 5 });
        const courses = query
            ? await prisma.course.findMany({ where: { OR: [{ title: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }] } })
            : await prisma.course.findMany({ take: 5 });
        return NextResponse.json({
            success: true,
            query,
            category,
            jobs,
            courses,
            totalResults: jobs.length + courses.length
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
