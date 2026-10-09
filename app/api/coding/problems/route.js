import { NextResponse } from 'next/server';
import { codingProblemRepository } from '@/lib/repositories/codingProblemRepository';
import { codingProblemsQuerySchema, validateQueryParams } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request) {
    try {
        const validation = validateQueryParams(codingProblemsQuerySchema, request);
        const { difficulty, category: topic } = validation.success ? validation.data : {};
        const problems = codingProblemRepository.findAll({ topic, difficulty });
        return NextResponse.json({
            success: true,
            problems
        });
    }
    catch (error) {
        console.error('Error fetching coding problems:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
