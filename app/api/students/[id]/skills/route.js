import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { certificateRepository } from '@/lib/repositories/certificateRepository';

export async function GET(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        // 1. Authorize Role
        const roleAuth = authorizeRole(session, ['student', 'college', 'company']);
        if (!roleAuth.authorized)
            return roleAuth.errorResponse;
        // 2. Authorize Ownership
        if (session?.role === 'student') {
            const ownerAuth = await authorizeOwnership(session, params.id, 'student');
            if (!ownerAuth.authorized)
                return ownerAuth.errorResponse;
        }

        const studentSkills = await studentRepository.getSkills(params.id);
        const verifiedSkills = studentSkills.filter(s => s.status === 'Verified' || s.status === 'VERIFIED');
        const certificates = await certificateRepository.findByStudentId(params.id);

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

export async function POST(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        // 1. Only students can add their own skills
        const roleAuth = authorizeRole(session, ['student']);
        if (!roleAuth.authorized)
            return roleAuth.errorResponse;
        const ownerAuth = await authorizeOwnership(session, params.id, 'student');
        if (!ownerAuth.authorized)
            return ownerAuth.errorResponse;

        const body = await request.json();
        const { skillName, category, level } = body;
        if (!skillName) {
            return NextResponse.json({ error: 'Skill name is required' }, { status: 400, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
        }

        const createdSkill = await studentRepository.addOrUpdateSkill(params.id, {
            skillName,
            category: category || 'Programming',
            status: 'Self-declared',
            level: level || 'Beginner',
            score: 70,
            credibilityScore: 72
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
