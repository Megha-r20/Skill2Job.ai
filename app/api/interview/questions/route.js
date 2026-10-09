import { NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/rateLimit';
import { interviewQuestionsQuerySchema, validateQueryParams } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request) {
    try {
        const rateLimit = await applyRateLimit(request, 'ai');
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        const validation = validateQueryParams(interviewQuestionsQuerySchema, request);
        const { role, category } = validation.success ? validation.data : { role: 'Software Developer', category: null };
        let questions = [];
        if (questions.length === 0) {
            questions = [];
        }
        if (category && category !== 'All') {
            questions = questions.filter(q => q.category.toLowerCase() === category.toLowerCase());
        }
        return NextResponse.json({
            success: true,
            questions
        });
    }
    catch (error) {
        console.error('Error fetching interview questions:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
