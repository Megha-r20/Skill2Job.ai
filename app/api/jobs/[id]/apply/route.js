import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateJobMatch } from '@/lib/ai';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
export async function POST(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }
        const body = await request.json();
        const { studentId: reqStudentId, notes } = body;
        const studentId = reqStudentId || session.studentId || session.userId;
        const ownerAuth = await authorizeOwnership(session, studentId, 'student');
        if (!ownerAuth.authorized) {
            return ownerAuth.errorResponse;
        }
        const job = await prisma.job.findUnique({ where: { id: params.id } });
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }
        // Check if already applied
        const existingApps = [];
        const alreadyApplied = existingApps.find(a => a.jobId === job.id);
        if (alreadyApplied) {
            return NextResponse.json({
                error: 'You have already submitted an application for this position.',
                application: alreadyApplied
            }, { status: 400 });
        }
        // Calculate match percentage at application time
        const matchData = calculateJobMatch(studentId, job.id);
        const newApp = {
            id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            jobId: job.id,
            studentId: student.id,
            companyId: job.companyId,
            studentName: student.fullName,
            studentEmail: student.email,
            studentCollege: student.collegeName,
            jobTitle: job.title,
            companyName: job.companyName,
            matchPercentage: matchData.matchPercentage,
            status: 'Applied',
            notes: notes || 'Submitted via Skill2Hire verified talent pipeline',
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        /* mocked */
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
