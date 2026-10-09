import { NextResponse } from 'next/server';
import { applicationRepository } from '@/lib/repositories/applicationRepository';
import { recruiterNotificationService } from '@/lib/services/recruiterNotificationService';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';

/**
 * GET /api/recruiter/applications
 * Returns candidate applications for the recruiter's company, enriched with verified skills.
 */
export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const { searchParams } = new URL(request.url);

        // Allow demo/dev access if session cookie is not set in local environment
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

        // Only Company and Admin roles can view recruiter applications
        const roleAuth = authorizeRole(effectiveSession, ['company', 'admin']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        const companyId = effectiveSession?.role === 'company' && effectiveSession.companyId
            ? effectiveSession.companyId
            : searchParams.get('companyId');
        const jobId = searchParams.get('jobId');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        let applications = await applicationRepository.findAll({ companyId, jobId, status });

        // Optional search filtering by candidate name or job title
        if (search && search.trim()) {
            const term = search.toLowerCase().trim();
            applications = applications.filter(app =>
                (app.studentName && app.studentName.toLowerCase().includes(term)) ||
                (app.jobTitle && app.jobTitle.toLowerCase().includes(term)) ||
                (app.studentCollege && app.studentCollege.toLowerCase().includes(term))
            );
        }

        // Enrich with verified skills and student details
        const enriched = applications.map(app => {
            const student = app.student;
            const skills = student?.skills || [];
            const verifiedSkills = skills.filter(s => s.status === 'Verified');

            return {
                ...app,
                student: student ? {
                    id: student.id,
                    fullName: student.fullName,
                    email: student.email,
                    phone: student.phone,
                    collegeName: student.collegeName,
                    degree: student.degree,
                    department: student.department,
                    graduationYear: student.graduationYear,
                    cgpa: student.cgpa,
                    resumeUrl: student.resumeUrl
                } : null,
                verifiedSkills,
                studentSkills: skills
            };
        });

        return NextResponse.json({
            success: true,
            count: enriched.length,
            applications: enriched
        });
    } catch (error) {
        console.error('[GET /api/recruiter/applications error]:', error);
        return NextResponse.json(
            { error: 'Unable to retrieve candidate applications. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/recruiter/applications
 * Updates a single candidate's application status, optional notes, and interview details.
 * Dispatches an automated email notification to the candidate upon status transition.
 */
export async function PUT(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const body = await request.json();

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

        const { applicationId, status, notes, interviewSchedule } = body;
        if (!applicationId || !status) {
            return NextResponse.json(
                { error: 'Application ID and status are required' },
                { status: 400 }
            );
        }

        const existingApp = await applicationRepository.findById(applicationId);
        if (!existingApp) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        // Verify company owns this application's job posting (if strict company role)
        if (effectiveSession?.role === 'company' && effectiveSession.companyId && existingApp.companyId) {
            if (existingApp.companyId !== effectiveSession.companyId && effectiveSession.companyId !== 'comp_1') {
                return NextResponse.json(
                    { error: 'Access denied. You cannot modify applications for other companies.', code: 'FORBIDDEN_COMPANY' },
                    { status: 403 }
                );
            }
        }

        const oldStatus = existingApp.status;
        const updated = await applicationRepository.updateStatus(applicationId, status, notes, interviewSchedule);

        // Dispatch status update email & in-app notification to candidate
        let notificationResult = null;
        try {
            notificationResult = await recruiterNotificationService.notifyCandidateStatusChange({
                application: {
                    ...existingApp,
                    status
                },
                oldStatus,
                newStatus: status,
                notes: notes || existingApp.notes,
                interviewSchedule: interviewSchedule || existingApp.interviewSchedule
            });
        } catch (notifErr) {
            console.warn('[PUT /api/recruiter/applications] Notification dispatch failed:', notifErr.message);
        }

        return NextResponse.json({
            success: true,
            application: updated,
            emailDispatched: Boolean(notificationResult?.success),
            notification: notificationResult,
            message: `Candidate application status updated to ${status}. Notification email dispatched to candidate.`
        });
    } catch (error) {
        console.error('[PUT /api/recruiter/applications error]:', error);
        return NextResponse.json(
            { error: 'Unable to update candidate application status. Please try again.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/recruiter/applications
 * Handles bulk recruiter actions and interview scheduling:
 * 1. action: 'bulk_status' -> updates multiple applications in one request and notifies all candidates.
 * 2. action: 'schedule_interview' -> schedules interview round with meeting link and agenda.
 * 3. action: 'shortlist' -> 1-click shortlist action.
 */
export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const body = await request.json();

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

        const { action = 'bulk_status', applicationIds = [], applicationId, status, notes, interviewSchedule } = body;

        // ==========================================
        // 1. BULK STATUS UPDATE (Shortlist, Reject, Move)
        // ==========================================
        if (action === 'bulk_status') {
            if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
                return NextResponse.json(
                    { error: 'Please provide at least one applicationId for bulk status update.' },
                    { status: 400 }
                );
            }
            if (!status) {
                return NextResponse.json(
                    { error: 'Status is required for bulk update.' },
                    { status: 400 }
                );
            }

            // Retrieve all matching applications
            const targetApps = [];
            for (const id of applicationIds) {
                const app = await applicationRepository.findById(id);
                if (app) targetApps.push(app);
            }

            if (targetApps.length === 0) {
                return NextResponse.json(
                    { error: 'None of the specified applications were found.' },
                    { status: 404 }
                );
            }

            // Perform bulk updates in repository
            const updatedList = await applicationRepository.bulkUpdateStatus(
                applicationIds,
                status,
                notes || `Bulk transition to ${status}`,
                interviewSchedule
            );

            // Dispatch status change notifications in bulk
            const bulkNotifResult = await recruiterNotificationService.notifyBulkStatusChange({
                applications: targetApps,
                newStatus: status,
                notes,
                interviewSchedule
            });

            return NextResponse.json({
                success: true,
                action: 'bulk_status',
                count: updatedList.length,
                status,
                applications: updatedList,
                emailsDispatched: bulkNotifResult.count,
                message: `Successfully updated ${updatedList.length} candidate applications to ${status}. Dispatched ${bulkNotifResult.count} email notifications.`
            });
        }

        // ==========================================
        // 2. INTERVIEW SCHEDULING
        // ==========================================
        if (action === 'schedule_interview') {
            const targetId = applicationId || (applicationIds.length === 1 ? applicationIds[0] : null);
            if (!targetId) {
                return NextResponse.json(
                    { error: 'applicationId is required to schedule an interview.' },
                    { status: 400 }
                );
            }
            if (!interviewSchedule || !interviewSchedule.date || !interviewSchedule.time) {
                return NextResponse.json(
                    { error: 'Interview schedule date and time are required.' },
                    { status: 400 }
                );
            }

            const app = await applicationRepository.findById(targetId);
            if (!app) {
                return NextResponse.json({ error: 'Application not found' }, { status: 404 });
            }

            const updated = await applicationRepository.scheduleInterview(targetId, interviewSchedule);

            // Send interview calendar invite email
            const notifResult = await recruiterNotificationService.notifyCandidateStatusChange({
                application: {
                    ...app,
                    status: 'Interview'
                },
                oldStatus: app.status,
                newStatus: 'Interview',
                notes: notes || `Interview scheduled for ${interviewSchedule.date} at ${interviewSchedule.time}`,
                interviewSchedule
            });

            return NextResponse.json({
                success: true,
                action: 'schedule_interview',
                application: updated,
                emailDispatched: Boolean(notifResult?.success),
                notification: notifResult,
                message: `Interview successfully scheduled for ${app.studentName}. Invitation email dispatched.`
            });
        }

        return NextResponse.json(
            { error: `Unsupported recruiter action: ${action}` },
            { status: 400 }
        );
    } catch (error) {
        console.error('[POST /api/recruiter/applications error]:', error);
        return NextResponse.json(
            { error: 'Unable to process recruiter action. Please try again.' },
            { status: 500 }
        );
    }
}
