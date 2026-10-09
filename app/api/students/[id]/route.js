import { NextResponse } from 'next/server';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { idParamSchema, studentUpdateSchema, validateWithSchema } from '@/lib/validations';

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
        // 1. Authenticate & Authorize Role (Students, Colleges, Companies, Admins)
        const roleAuth = authorizeRole(session, ['student', 'college', 'company']);
        if (!roleAuth.authorized)
            return roleAuth.errorResponse;
        // 2. Resource Ownership Check
        if (session?.role === 'student') {
            const ownerAuth = await authorizeOwnership(session, studentId, 'student');
            if (!ownerAuth.authorized)
                return ownerAuth.errorResponse;
        }
        else if (session?.role === 'college') {
            const student = await studentRepository.findById(studentId) || await studentRepository.findByUserId(studentId);
            if (student && student.collegeId !== session.collegeId) {
                return NextResponse.json({ error: 'Access denied. You can only view students enrolled in your university.', code: 'FORBIDDEN_COLLEGE' }, { status: 403 });
            }
        }
        const student = await studentRepository.findById(studentId) || await studentRepository.findByUserId(studentId);
        if (!student) {
            return NextResponse.json({ error: 'Student profile not found.' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
        }
        const studentSkills = student.skills || [];
        const verifiedSkills = studentSkills.filter(s => s.status === 'Verified');
        const applications = student.applications || [];
        // Fallback empty arrays for related entities until fully migrated
        const certificates = [];
        const projects = [];
        const assessmentResults = [];
        // Least Privilege Output Filtering for Company view
        const sanitizedStudent = session?.role === 'company'
            ? {
                id: student.id,
                fullName: student.fullName,
                degree: student.degree,
                department: student.department,
                graduationYear: student.graduationYear,
                collegeName: student.collegeName,
                cgpa: student.cgpa,
                placementReadiness: student.placementReadiness,
                verifiedSkillsCount: verifiedSkills.length
            }
            : student;
        return NextResponse.json({
            student: sanitizedStudent,
            skills: studentSkills,
            verifiedSkills,
            applications: session?.role === 'company' ? [] : applications,
            certificates,
            projects,
            assessmentResults
        });
    }
    catch (error) {
        return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function PUT(request, { params }) {
    try {
        const paramVal = validateWithSchema(idParamSchema, params);
        if (!paramVal.success) return paramVal.errorResponse;
        const studentId = paramVal.data.id;

        const session = await getAuthenticatedSession(request);
        // 1. Authorize Student Role
        const roleAuth = authorizeRole(session, ['student']);
        if (!roleAuth.authorized)
            return roleAuth.errorResponse;
        // 2. Authorize Resource Ownership
        const ownerAuth = await authorizeOwnership(session, studentId, 'student');
        if (!ownerAuth.authorized)
            return ownerAuth.errorResponse;

        const rawBody = await request.json();
        const bodyVal = validateWithSchema(studentUpdateSchema, rawBody);
        if (!bodyVal.success) return bodyVal.errorResponse;
        const body = { ...bodyVal.data };

        // Prevent privilege escalation fields from being overwritten
        delete body.id;
        delete body.userId;
        delete body.placementReadiness;
        const studentToUpdate = await studentRepository.findById(studentId) || await studentRepository.findByUserId(studentId);
        if (!studentToUpdate) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
        }
        const updated = await studentRepository.update(studentToUpdate.id, body);
        return NextResponse.json({ success: true, student: updated }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
    catch (error) {
        return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
