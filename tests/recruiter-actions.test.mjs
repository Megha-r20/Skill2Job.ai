import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { applicationRepository } from '../lib/repositories/applicationRepository.js';
import { recruiterNotificationService } from '../lib/services/recruiterNotificationService.js';

describe('Recruiter Operations & Status Notification Architecture', () => {
    beforeEach(() => {
        recruiterNotificationService.clearAuditLog();
    });

    describe('1. Candidate Shortlisting & Status Lifecycle', () => {
        it('retrieves applications for a company with student profile and verified skills', async () => {
            const apps = await applicationRepository.findAll({ companyId: 'comp_1' });
            assert(Array.isArray(apps), 'Expected array of applications');
            assert(apps.length > 0, 'Should find mock applications for comp_1');

            const app = apps[0];
            assert(app.studentName, 'Application should contain studentName');
            assert(app.jobTitle, 'Application should contain jobTitle');
            assert(typeof app.matchPercentage === 'number', 'Application should contain matchPercentage');
            assert(Array.isArray(app.verifiedSkills), 'Should contain verifiedSkills array');
        });

        it('shortlists a candidate and records status transition', async () => {
            const updated = await applicationRepository.updateStatus(
                'app_1',
                'Shortlisted',
                'Candidate has 91% match score and verified Python/React credentials.'
            );

            assert.equal(updated.id, 'app_1');
            assert.equal(updated.status, 'Shortlisted');
            assert(updated.notes.includes('91% match'));

            // Verify retrieval reflect status change
            const fetched = await applicationRepository.findById('app_1');
            assert.equal(fetched.status, 'Shortlisted');
        });

        it('supports status transitions to Selected for Hire and Rejected', async () => {
            const selected = await applicationRepository.updateStatus('app_2', 'Selected', 'Final offer approved.');
            assert.equal(selected.status, 'Selected');

            const rejected = await applicationRepository.updateStatus('app_3', 'Rejected', 'Candidate lacks required backend years.');
            assert.equal(rejected.status, 'Rejected');
        });
    });

    describe('2. Interview Scheduling Engine', () => {
        it('schedules an interview with date, round, format, and meeting link', async () => {
            const interviewDetails = {
                roundType: 'Round 1: Technical Coding & DSA',
                date: '2026-10-18',
                time: '15:00',
                timezone: 'IST (UTC+5:30)',
                format: 'Google Meet',
                meetingLink: 'https://meet.google.com/test-meet-code',
                interviewers: 'Staff Software Architect',
                notes: 'Focus on distributed algorithms and Redis caching.'
            };

            const scheduled = await applicationRepository.scheduleInterview('app_4', interviewDetails);

            assert.equal(scheduled.status, 'Interview');
            assert(scheduled.interviewSchedule, 'Interview schedule should be attached');
            assert.equal(scheduled.interviewSchedule.date, '2026-10-18');
            assert.equal(scheduled.interviewSchedule.format, 'Google Meet');
            assert.equal(scheduled.interviewSchedule.meetingLink, 'https://meet.google.com/test-meet-code');
            assert.equal(scheduled.interviewSchedule.roundType, 'Round 1: Technical Coding & DSA');
        });
    });

    describe('3. Bulk Candidate Actions', () => {
        it('executes bulk status updates across multiple applicants', async () => {
            const targetIds = ['app_1', 'app_2', 'app_4'];
            const updatedList = await applicationRepository.bulkUpdateStatus(
                targetIds,
                'Shortlisted',
                'Bulk shortlisted after campus drive screening.'
            );

            assert.equal(updatedList.length, 3);
            for (const app of updatedList) {
                assert.equal(app.status, 'Shortlisted');
                assert(app.notes.includes('campus drive'));
            }
        });

        it('executes bulk interview scheduling across multiple candidates', async () => {
            const targetIds = ['app_1', 'app_2'];
            const bulkInterview = {
                roundType: 'Campus Placement Round 2: Architecture',
                date: '2026-10-20',
                time: '11:00',
                timezone: 'IST',
                format: 'Zoom Meeting',
                meetingLink: 'https://zoom.us/j/1234567890',
                interviewers: 'Hiring Committee',
                notes: 'Joint technical evaluation.'
            };

            const updatedList = await applicationRepository.bulkUpdateStatus(
                targetIds,
                'Interview',
                'Bulk scheduled for Round 2',
                bulkInterview
            );

            assert.equal(updatedList.length, 2);
            for (const app of updatedList) {
                assert.equal(app.status, 'Interview');
                assert.equal(app.interviewSchedule.format, 'Zoom Meeting');
            }
        });
    });

    describe('4. Automated Candidate Email & In-App Notifications on Status Change', () => {
        it('dispatches personalized congratulatory email when candidate is shortlisted', async () => {
            const application = await applicationRepository.findById('app_1');
            const result = await recruiterNotificationService.notifyCandidateStatusChange({
                application,
                oldStatus: 'Applied',
                newStatus: 'Shortlisted',
                notes: 'Outstanding performance on algorithmic assessment.'
            });

            assert.equal(result.success, true);
            assert.equal(result.recipient, application.studentEmail);
            assert(result.subject.includes('Shortlisted'), 'Subject should indicate shortlisting');
            assert(result.subject.includes(application.studentName), 'Subject should contain student name');

            // Check audit log
            const auditLogs = recruiterNotificationService.getAuditLog({ studentEmail: application.studentEmail });
            assert.equal(auditLogs.length, 1);
            assert.equal(auditLogs[0].newStatus, 'Shortlisted');
            assert(auditLogs[0].notes.includes('algorithmic assessment'));

            // Check in-app notification generated for candidate
            const inApp = recruiterNotificationService.getInAppNotifications(application.studentId);
            assert.equal(inApp.length, 1);
            assert.equal(inApp[0].type, 'APPLICATION_STATUS');
            assert(inApp[0].title.includes('Shortlisted'));
        });

        it('dispatches rich calendar and meeting invitation email when interview is scheduled', async () => {
            const application = await applicationRepository.findById('app_2');
            const interviewSchedule = {
                roundType: 'Round 1: Technical Coding',
                date: '2026-10-15',
                time: '14:00',
                timezone: 'IST',
                format: 'Google Meet',
                meetingLink: 'https://meet.google.com/xyz-live-interview',
                interviewers: 'Jane Doe (VP Engineering)'
            };

            const result = await recruiterNotificationService.notifyCandidateStatusChange({
                application,
                oldStatus: 'Shortlisted',
                newStatus: 'Interview',
                notes: 'Please review Next.js API route architecture beforehand.',
                interviewSchedule
            });

            assert.equal(result.success, true);
            assert(result.subject.includes('Interview Scheduled'));

            const content = recruiterNotificationService.generateStatusEmailContent({
                candidateName: application.studentName,
                jobTitle: application.jobTitle,
                companyName: application.companyName,
                oldStatus: 'Shortlisted',
                newStatus: 'Interview',
                notes: 'Please review Next.js API routes.',
                interviewSchedule
            });

            assert(content.html.includes('meet.google.com/xyz-live-interview'), 'HTML email must include meeting link');
            assert(content.html.includes('2026-10-15'), 'HTML email must include interview date');
            assert(content.html.includes('Jane Doe'), 'HTML email must include interviewer name');
        });

        it('dispatches bulk email notifications across multiple applicants', async () => {
            const apps = await applicationRepository.findAll({ companyId: 'comp_1' });
            const selected = apps.slice(0, 3);

            const bulkResult = await recruiterNotificationService.notifyBulkStatusChange({
                applications: selected,
                newStatus: 'Shortlisted',
                notes: 'Passed initial resume and coding benchmark.'
            });

            assert.equal(bulkResult.success, true);
            assert.equal(bulkResult.count, 3);

            const allAudit = recruiterNotificationService.getAuditLog();
            assert.equal(allAudit.length, 3);
            for (const log of allAudit) {
                assert.equal(log.newStatus, 'Shortlisted');
            }
        });

        it('customizes email content appropriately for Selection and Rejection', () => {
            // Selected email
            const selectEmail = recruiterNotificationService.generateStatusEmailContent({
                candidateName: 'Alex Rivera',
                jobTitle: 'Full Stack Software Engineer',
                companyName: 'TechNova',
                oldStatus: 'Interview',
                newStatus: 'Selected',
                notes: 'Official offer letter will follow.'
            });
            assert(selectEmail.subject.includes('Offer / Final Selection'));
            assert(selectEmail.html.includes('SELECTED FOR HIRE'));

            // Rejected email
            const rejectEmail = recruiterNotificationService.generateStatusEmailContent({
                candidateName: 'Marcus Vance',
                jobTitle: 'Full Stack Software Engineer',
                companyName: 'TechNova',
                oldStatus: 'Under Review',
                newStatus: 'Rejected'
            });
            assert(rejectEmail.subject.includes('Application Status Update'));
            assert(rejectEmail.html.includes('APPLICATION UPDATE'));
        });
    });
});
