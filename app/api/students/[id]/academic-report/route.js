import { NextResponse } from 'next/server';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
export async function GET(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        // 1. Authorize Role (Students, Colleges, Admins)
        const roleAuth = authorizeRole(session, ['student', 'college']);
        if (!roleAuth.authorized)
            return roleAuth.errorResponse;
        // 2. Authorize Ownership
        // If student: must own this report
        // If college: must belong to the college institution
        if (session?.role === 'student') {
            const ownerAuth = await authorizeOwnership(session, params.id, 'student');
            if (!ownerAuth.authorized)
                return ownerAuth.errorResponse;
        }
        else if (session?.role === 'college') {
            const student = await studentRepository.findById(params.id) || await studentRepository.findByUserId(params.id);
            if (student && student.collegeId !== session.collegeId) {
                return NextResponse.json({ error: 'Access denied. You can only view academic reports for students of your college.', code: 'FORBIDDEN_COLLEGE' }, { status: 403 });
            }
        }
        const studentId = params.id;
        const report = [];
        if (!report) {
            return NextResponse.json({ error: 'Academic report not found' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
        }
        return NextResponse.json({
            success: true,
            report
        });
    }
    catch (error) {
        return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
