import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { certificateRepository } from '@/lib/repositories/certificateRepository';
import { idParamSchema, studentSkillAddSchema, validateWithSchema } from '@/lib/validations';

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

        const session = await getAuthenticatedSession(request);
        // 1. Authorize Role
        const roleAuth = authorizeRole(session, ['student', 'college', 'company']);
        if (!roleAuth.authorized)
            return roleAuth.errorResponse;
        // 2. Authorize Ownership
        if (session?.role === 'student') {
            const ownerAuth = await authorizeOwnership(session, studentId, 'student');
            if (!ownerAuth.authorized)
                return ownerAuth.errorResponse;
        }

        const studentSkills = await studentRepository.getSkills(studentId);
        const verifiedSkills = studentSkills.filter(s => s.status === 'Verified' || s.status === 'VERIFIED');
        const certificates = await certificateRepository.findByStudentId(studentId);

        return NextResponse.json({
            studentSkills,
            verifiedSkills,
            certificates
        });
    }
    catch (error) {
        console.error('[students-skills-get] Error:', error);
        return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request, { params }) {
    try {
        const paramVal = validateWithSchema(idParamSchema, params);
        if (!paramVal.success) return paramVal.errorResponse;
        const studentId = paramVal.data.id;

        const session = await getAuthenticatedSession(request);
        // 1. Only students can add their own skills
        const roleAuth = authorizeRole(session, ['student']);
        if (!roleAuth.authorized)
            return roleAuth.errorResponse;
        const ownerAuth = await authorizeOwnership(session, studentId, 'student');
        if (!ownerAuth.authorized)
            return ownerAuth.errorResponse;

        const rawBody = await request.json().catch(() => ({}));
        const bodyVal = validateWithSchema(studentSkillAddSchema, rawBody);
        if (!bodyVal.success) {
            return bodyVal.errorResponse;
        }
        const { skillName, category, level, credibilityScore, status } = bodyVal.data;

        const createdSkill = await studentRepository.addOrUpdateSkill(studentId, {
            skillName,
            category: category || 'Programming',
            status: status || 'Self-declared',
            level: level || 'Beginner',
            score: 70,
            credibilityScore: Number(credibilityScore) || 72
        });

        return NextResponse.json({
            success: true,
            skill: createdSkill,
            message: `${createdSkill.skillName} added as Self-declared. Complete proctored assessment or import GitHub/LeetCode profile to verify!`
        });
    }
    catch (error) {
        console.error('[students-skills-post] Error:', error);
        return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
