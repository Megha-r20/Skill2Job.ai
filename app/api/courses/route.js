import { NextResponse } from 'next/server';
import { courseRepository } from '@/lib/repositories/courseRepository';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const skill = searchParams.get('skill');
        let courses = await courseRepository.findAll();
        if (category && category !== 'All') {
            courses = courses.filter(c => c.tags?.some(t => t.toLowerCase() === category.toLowerCase()) || c.category?.toLowerCase() === category.toLowerCase());
        }
        if (skill) {
            courses = courses.filter(c => c.tags?.some(t => t.toLowerCase().includes(skill.toLowerCase())) || c.title?.toLowerCase().includes(skill.toLowerCase()));
        }
        return NextResponse.json({
            success: true,
            count: courses.length,
            courses
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
