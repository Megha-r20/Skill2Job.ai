import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateJobMatch } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { recruiterCandidatesQuerySchema, validateQueryParams } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['company', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const queryValidation = validateQueryParams(recruiterCandidatesQuerySchema, request);
        const { searchParams } = new URL(request.url);
        const skill = searchParams.get('skill')?.toLowerCase();
        const collegeId = searchParams.get('collegeId');
        const minCgpa = searchParams.get('minCgpa') ? Number(searchParams.get('minCgpa')) : 0;
        const onlyVerified = searchParams.get('verified') === 'true';
        const jobId = searchParams.get('jobId');
        let students = await studentRepository.findAll();
        if (collegeId && collegeId !== 'All') {
            students = students.filter(s => s.collegeId === collegeId);
        }
        if (minCgpa > 0) {
            students = students.filter(s => s.cgpa >= minCgpa);
        }
        const candidateCards = await Promise.all(students.map(async student => {
            const studentSkills = student.skills || [];
            const verifiedSkills = studentSkills.filter(s => s.status === 'Verified');
            const projects = [];
            const assessments = [];
            let jobMatch = 0;
            if (jobId) {
                const matchData = await calculateJobMatch(student, jobId);
                jobMatch = matchData.matchPercentage;
            }
            else {
                // General match based on readiness
                jobMatch = student.placementReadiness || 75;
            }
            return {
                ...student,
                skills: studentSkills,
                verifiedSkills,
                projects,
                assessments,
                jobMatch,
                hasVerifiedSkills: verifiedSkills.length > 0
            };
        }));
        let filtered = candidateCards;
        if (onlyVerified) {
            filtered = filtered.filter(c => c.verifiedSkills.length > 0);
        }
        if (skill) {
            filtered = filtered.filter(c => c.skills.some(s => s.skillName.toLowerCase().includes(skill)) ||
                c.verifiedSkills.some(v => v.skillName.toLowerCase().includes(skill)));
        }
        // Sort by match / readiness descending
        filtered.sort((a, b) => b.jobMatch - a.jobMatch);
        return NextResponse.json({
            success: true,
            count: filtered.length,
            candidates: filtered
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
