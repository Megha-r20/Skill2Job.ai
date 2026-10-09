import { NextResponse } from 'next/server';
import { applicationRepository } from '@/lib/repositories/applicationRepository';
import { recruiterNotificationService } from '@/lib/services/recruiterNotificationService';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { validateWithSchema } from '@/lib/validations';
import { z } from 'zod';

const scheduleInterviewSchema = z.object({
    applicationId: z.string().min(1, 'Application ID is required'),
    date: z.string().min(1, 'Interview date is required'),
    time: z.string().min(1, 'Interview time is required'),
    timezone: z.string().optional(),
    roundType: z.string().optional(),
    format: z.string().optional(),
    meetingLink: z.string().optional(),
    interviewers: z.string().optional(),
    notes: z.string().optional(),
    companyId: z.string().optional()
});

/**
 * GET /api/recruiter/interviews
 * Retrieves all scheduled interviews across all candidates for the recruiter's company.
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const { searchParams } = new URL(request.url);

        let effectiveSession = session;
        if (!effectiveSession && process.env.NODE_ENV !== 'production') {
            const demoCompany = searchParams.get('companyId') || 'comp_1';
            effectiveSession = {
                userId: 'u_comp_demo',
                role: 'company',
                companyId: demoCompany,
                email: 'recruiter@technova.com'
            };
        }

        const roleAuth = authorizeRole(effectiveSession, ['company', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const companyId = effectiveSession?.role === 'company' && effectiveSession.companyId
            ? effectiveSession.companyId
            : searchParams.get('companyId');

        // Fetch applications with status = 'Interview' or that have interviewSchedule populated
        const applications = await applicationRepository.findAll({ companyId });
        const interviewApps = applications.filter(a => a.status === 'Interview' || a.interviewSchedule);

        return NextResponse.json({
            success: true,
            count: interviewApps.length,
            interviews: interviewApps.map(app => ({
                applicationId: app.id,
                studentId: app.studentId,
                studentName: app.studentName,
                studentEmail: app.studentEmail,
                studentCollege: app.studentCollege,
                jobTitle: app.jobTitle,
                companyName: app.companyName,
                matchPercentage: app.matchPercentage,
                interviewSchedule: app.interviewSchedule,
                status: app.status
            }))
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Unable to retrieve scheduled interviews.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/recruiter/interviews
 * Schedules an interview round for a candidate and triggers an email notification.
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    try {
        const rawBody = await request.json().catch(() => ({}));
        const validation = validateWithSchema(scheduleInterviewSchema, rawBody);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const body = validation.data;
        const session = await getAuthenticatedSession(request);
        let effectiveSession = session;
        if (!effectiveSession && process.env.NODE_ENV !== 'production') {
            effectiveSession = {
                userId: 'u_comp_demo',
                role: 'company',
                companyId: body.companyId || 'comp_1',
                email: 'recruiter@technova.com'
            };
        }

        const roleAuth = authorizeRole(effectiveSession, ['company', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const { applicationId, date, time, timezone = 'IST', roundType = 'Technical Interview', format = 'Google Meet', meetingLink, interviewers, notes } = body;

        const app = await applicationRepository.findById(applicationId);
        if (!app) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        const generatedLink = meetingLink || `https://meet.google.com/s2h-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;

        const interviewSchedule = {
            roundType,
            date,
            time,
            timezone,
            format,
            meetingLink: generatedLink,
            interviewers: interviewers || 'Technical Hiring Panel',
            notes: notes || 'Live assessment and engineering architecture review.'
        };

        const updated = await applicationRepository.scheduleInterview(applicationId, interviewSchedule);

        // Dispatch email notification
        const notifResult = await recruiterNotificationService.notifyCandidateStatusChange({
            application: { ...app, status: 'Interview' },
            oldStatus: app.status,
            newStatus: 'Interview',
            notes,
            interviewSchedule
        });

        return NextResponse.json({
            success: true,
            application: updated,
            interviewSchedule,
            emailDispatched: Boolean(notifResult?.success),
            notification: notifResult,
            message: `Interview successfully scheduled for ${app.studentName}. Invitation email dispatched.`
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Unable to schedule interview.' },
            { status: 500 }
        );
    }
}
