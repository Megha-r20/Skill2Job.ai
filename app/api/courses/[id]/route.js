import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(request, { params }) {
    try {
        const course = await prisma.course.findUnique({ where: { id: params.id }, include: { lessons: true } });
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
        }
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const lessons = course.lessons || [];
        const assessments = await prisma.assessment.findMany({ take: 1 });
        const associatedAssessment = assessments.length > 0 ? assessments[0] : null;
        let completedCount = studentId ? Math.min(1, lessons.length) : 0;
        const completionPercentage = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
        return NextResponse.json({
            success: true,
            course,
            lessons,
            associatedAssessment,
            userProgress: {
                completedCount,
                totalLessons: lessons.length,
                completionPercentage,
                isCompleted: completionPercentage === 100
            }
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
