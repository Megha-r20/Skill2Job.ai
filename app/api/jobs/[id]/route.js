import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateJobMatch } from '@/lib/ai';
export async function GET(request, { params }) {
    try {
        const job = await prisma.job.findUnique({ where: { id: params.id } });
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
        }
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId') || 'std_1';
        const matchAnalysis = await calculateJobMatch(studentId, job);
        const existingApplication = null;
        return NextResponse.json({
            success: true,
            job,
            matchAnalysis,
            existingApplication
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
