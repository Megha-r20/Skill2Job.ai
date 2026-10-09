import { NextResponse } from 'next/server';
import { generatePersonalizedRoadmap } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { applyRateLimit } from '@/lib/rateLimit';
import { idParamSchema, roadmapQuerySchema, validateWithSchema, validateQueryParams } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramVal = validateWithSchema(idParamSchema, params);
        if (!paramVal.success) return paramVal.errorResponse;
        const studentId = paramVal.data.id;

        const queryVal = validateQueryParams(roadmapQuerySchema, request);
        if (!queryVal.success) return queryVal.errorResponse;
        const jobId = queryVal.data.jobId || undefined;
        const targetRole = queryVal.data.targetRole || undefined;

        const rateLimit = await applyRateLimit(request, 'ai');
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student', 'college', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }
        const ownerAuth = await authorizeOwnership(session, studentId, 'student');
        if (!ownerAuth.authorized) {
            return ownerAuth.errorResponse;
        }

        const roadmap = await generatePersonalizedRoadmap(studentId, jobId, targetRole);
        return NextResponse.json({
            success: true,
            roadmap
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
