import { NextResponse } from 'next/server';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = (searchParams.get('q') || searchParams.get('query') || '').trim();
        const category = searchParams.get('category') || 'ALL';

        let jobs = await jobRepository.search({ query });
        let courses = await courseRepository.findAll();

        if (query) {
            courses = courses.filter(c => 
                c.title?.toLowerCase().includes(query.toLowerCase()) || 
                c.description?.toLowerCase().includes(query.toLowerCase()) ||
                c.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
            );
        }

        return NextResponse.json({
            success: true,
            query,
            category,
            jobs: jobs.slice(0, 10),
            courses: courses.slice(0, 10),
            totalResults: jobs.length + courses.length
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
