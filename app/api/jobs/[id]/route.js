import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateJobMatch } from '@/lib/ai';
import { idParamSchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramValidation = validateWithSchema(idParamSchema, params);
        if (!paramValidation.success) {
            return paramValidation.errorResponse;
        }

        const jobId = paramValidation.data.id;
        const job = await prisma.job.findUnique({ where: { id: jobId } });
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
