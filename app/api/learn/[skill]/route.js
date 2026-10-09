import { NextResponse } from 'next/server';
import { learnSkillParamSchema, validateWithSchema } from '@/lib/validations';

/**
 * GET /api/learn/[skill]
 * Retrieves skill learning pathways, tutorials, and curriculum.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { skill: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramVal = validateWithSchema(learnSkillParamSchema, params);
        if (!paramVal.success) return paramVal.errorResponse;

        const skillName = decodeURIComponent(paramVal.data.skill);
        const ecosystem = [];
        return NextResponse.json({
            success: true,
            ecosystem
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
