import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const skill = searchParams.get('skill');
        let courses = await prisma.course.findMany({ include: { lessons: true } });
        if (category && category !== 'All') {
            courses = courses.filter(c => c.tags.some(t => t.toLowerCase() === category.toLowerCase()));
        }
        if (skill) {
            courses = courses.filter(c => c.tags.some(t => t.toLowerCase().includes(skill.toLowerCase())));
        }
        return NextResponse.json({
            success: true,
            count: courses.length,
            courses
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
