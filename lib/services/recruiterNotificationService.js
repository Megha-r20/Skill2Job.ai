import nodemailer from 'nodemailer';
import { logger } from '../logger.js';

// In-memory audit log of sent recruiter emails for verification & tracking
const sentEmailAuditLog = [];
// In-memory store for in-app candidate notifications
const inAppNotifications = [];

export const recruiterNotificationService = {
    /**
     * Dispatches candidate notification email and in-app alert when application status changes.
     */
    async notifyCandidateStatusChange({ application, oldStatus, newStatus, notes = '', interviewSchedule = null }) {
        if (!application || !application.studentEmail) {
            throw new Error('Application and candidate email are required for notifications.');
        }

        const candidateName = application.studentName || 'Candidate';
        const jobTitle = application.jobTitle || 'Role';
        const companyName = application.companyName || 'Hiring Company';
        const to = application.studentEmail;

        const emailContent = this.generateStatusEmailContent({
            candidateName,
            jobTitle,
            companyName,
            oldStatus,
            newStatus,
            notes,
            interviewSchedule
        });

        let providerUsed = 'Skill2Job.ai Recruiter Gateway';
        let messageId = `recruiter_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        let deliveredExternally = false;

        // 1. Resend API Integration
        if (process.env.RESEND_API_KEY) {
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: process.env.EMAIL_FROM || 'Skill2Job.ai Talent <talent@skill2job.ai>',
                        to: [to],
                        subject: emailContent.subject,
                        html: emailContent.html
                    })
                });
                const resData = await response.json();
                if (response.ok) {
                    providerUsed = 'Resend';
                    messageId = resData.id || messageId;
                    deliveredExternally = true;
                }
            } catch (err) {
                logger.warn('[recruiterNotificationService] Resend dispatch failed', { error: err.message });
            }
        }

        // 2. SMTP / Nodemailer Integration
        if (!deliveredExternally && ((process.env.SMTP_HOST || process.env.SMTP_USER) && process.env.SMTP_PASS)) {
            try {
                const isGmail = process.env.SMTP_HOST?.includes('gmail') || process.env.SMTP_USER?.includes('@gmail.com');
                const transporter = nodemailer.createTransport(
                    isGmail
                        ? {
                            service: 'gmail',
                            auth: {
                                user: process.env.SMTP_USER,
                                pass: process.env.SMTP_PASS?.replace(/\s+/g, '')
                            }
                        }
                        : {
                            host: process.env.SMTP_HOST,
                            port: parseInt(process.env.SMTP_PORT || '587', 10),
                            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
                            auth: {
                                user: process.env.SMTP_USER,
                                pass: process.env.SMTP_PASS
                            }
                        }
                );

                const info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM || `"Skill2Job.ai Talent" <${process.env.SMTP_USER}>`,
                    to,
                    subject: emailContent.subject,
                    text: emailContent.text,
                    html: emailContent.html
                });

                providerUsed = 'SMTP';
                messageId = info.messageId || messageId;
                deliveredExternally = true;
            } catch (err) {
                logger.warn('[recruiterNotificationService] SMTP dispatch failed', { error: err.message });
            }
        }

        // 3. Record Audit Log Entry
        const auditEntry = {
            id: messageId,
            applicationId: application.id,
            studentId: application.studentId,
            studentEmail: to,
            studentName: candidateName,
            companyName,
            jobTitle,
            oldStatus,
            newStatus,
            subject: emailContent.subject,
            provider: providerUsed,
            deliveredExternally,
            interviewSchedule: interviewSchedule || null,
            notes,
            sentAt: new Date().toISOString()
        };
        sentEmailAuditLog.push(auditEntry);

        // 4. Generate in-app student notification
        const inAppEntry = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            studentId: application.studentId,
            title: emailContent.inAppTitle,
            message: emailContent.inAppMessage,
            type: 'APPLICATION_STATUS',
            status: newStatus,
            applicationId: application.id,
            read: false,
            createdAt: new Date().toISOString()
        };
        inAppNotifications.push(inAppEntry);

        return {
            success: true,
            messageId,
            provider: providerUsed,
            deliveredExternally,
            recipient: to,
            subject: emailContent.subject,
            status: newStatus,
            auditEntry
        };
    },

    /**
     * Bulk status change dispatcher for recruiter actions.
     */
    async notifyBulkStatusChange({ applications, newStatus, notes = '', interviewSchedule = null }) {
        if (!Array.isArray(applications) || applications.length === 0) {
            return { success: true, count: 0, results: [] };
        }

        const results = [];
        for (const app of applications) {
            try {
                const res = await this.notifyCandidateStatusChange({
                    application: app,
                    oldStatus: app.status,
                    newStatus,
                    notes,
                    interviewSchedule
                });
                results.push(res);
            } catch (err) {
                results.push({
                    success: false,
                    applicationId: app.id,
                    error: err.message
                });
            }
        }

        return {
            success: true,
            count: results.filter(r => r.success).length,
            total: applications.length,
            results
        };
    },

    /**
     * Generates rich HTML, plain text, and subject based on the updated hiring stage.
     */
    generateStatusEmailContent({ candidateName, jobTitle, companyName, oldStatus, newStatus, notes, interviewSchedule }) {
        let subject = '';
        let badgeColor = '#4f46e5';
        let badgeText = newStatus;
        let mainHeadline = '';
        let bodyParagraph = '';
        let actionButtonText = 'View Application Status';
        let actionButtonUrl = 'https://skill2job.ai/student/applications';
        let inAppTitle = '';
        let inAppMessage = '';

        switch (newStatus) {
            case 'Shortlisted':
                subject = `🎉 Congratulations ${candidateName}! You have been Shortlisted by ${companyName} for ${jobTitle}`;
                badgeColor = '#059669';
                badgeText = 'SHORTLISTED';
                mainHeadline = `You've been Shortlisted!`;
                bodyParagraph = `Great news! The recruiting team at <strong>${companyName}</strong> has reviewed your verified skills passport and shortlisted you for the <strong>${jobTitle}</strong> opening. Your verified assessments and technical match distinguished your profile.`;
                inAppTitle = `Shortlisted by ${companyName}`;
                inAppMessage = `Your application for ${jobTitle} has been moved to Shortlisted!`;
                break;

            case 'Interview':
            case 'Interview Scheduled':
                subject = `📅 Interview Scheduled: ${interviewSchedule?.roundType || 'Technical Interview'} with ${companyName}`;
                badgeColor = '#2563eb';
                badgeText = 'INTERVIEW SCHEDULED';
                mainHeadline = `Your Interview has been Scheduled`;
                bodyParagraph = `The talent team at <strong>${companyName}</strong> is excited to meet you! An interview round has been scheduled for your application to <strong>${jobTitle}</strong>.`;
                actionButtonText = interviewSchedule?.meetingLink ? 'Join Interview Meeting' : 'View Interview Details';
                actionButtonUrl = interviewSchedule?.meetingLink || 'https://skill2job.ai/student/applications';
                inAppTitle = `Interview Scheduled with ${companyName}`;
                inAppMessage = `Interview for ${jobTitle} on ${interviewSchedule?.date || 'upcoming date'} at ${interviewSchedule?.time || ''}.`;
                break;

            case 'Selected':
                subject = `🌟 Offer / Final Selection: Congratulations on your selection at ${companyName}!`;
                badgeColor = '#047857';
                badgeText = 'SELECTED FOR HIRE 🎉';
                mainHeadline = `Congratulations on Your Selection!`;
                bodyParagraph = `We are thrilled to announce that <strong>${companyName}</strong> has selected you for the <strong>${jobTitle}</strong> position following your stellar performance across all evaluation phases!`;
                inAppTitle = `Offer / Selected by ${companyName}! 🎉`;
                inAppMessage = `You have been selected for hire as ${jobTitle} at ${companyName}!`;
                break;

            case 'Assessment':
                subject = `📝 Assessment Stage: Next Steps for ${jobTitle} at ${companyName}`;
                badgeColor = '#7c3aed';
                badgeText = 'ASSESSMENT STAGE';
                mainHeadline = `Technical Assessment Assigned`;
                bodyParagraph = `Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has progressed to the proctored assessment stage. Complete your assessment to submit your score.`;
                inAppTitle = `Assessment Assigned: ${jobTitle}`;
                inAppMessage = `Please complete your assessment for ${companyName}.`;
                break;

            case 'Rejected':
                subject = `Application Status Update: ${jobTitle} at ${companyName}`;
                badgeColor = '#64748b';
                badgeText = 'APPLICATION UPDATE';
                mainHeadline = `Update Regarding Your Application`;
                bodyParagraph = `Thank you for taking the time to apply for the <strong>${jobTitle}</strong> opening at <strong>${companyName}</strong>. While our team was impressed with your credentials, we have decided not to advance your application at this time.`;
                inAppTitle = `Application Update: ${jobTitle}`;
                inAppMessage = `${companyName} has updated your application status.`;
                break;

            default:
                subject = `Update: Your application for ${jobTitle} at ${companyName} is now ${newStatus}`;
                badgeColor = '#0ea5e9';
                badgeText = newStatus.toUpperCase();
                mainHeadline = `Application Status Updated`;
                bodyParagraph = `Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has transitioned to <strong>${newStatus}</strong>.`;
                inAppTitle = `Application ${newStatus}: ${jobTitle}`;
                inAppMessage = `Status updated to ${newStatus} by ${companyName}.`;
                break;
        }

        // Interview details block if scheduled
        let interviewDetailsHtml = '';
        let interviewDetailsText = '';
        if (interviewSchedule) {
            interviewDetailsHtml = `
                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <div style="font-weight: 700; color: #1e40af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
                        🗓️ Interview Details
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #1e293b;">
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600; width: 35%;">Round:</td>
                            <td style="padding: 6px 0;">${interviewSchedule.roundType || 'Technical Interview'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600;">Date & Time:</td>
                            <td style="padding: 6px 0;"><strong>${interviewSchedule.date || 'TBD'}</strong> at <strong>${interviewSchedule.time || 'TBD'}</strong> ${interviewSchedule.timezone ? `(${interviewSchedule.timezone})` : ''}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600;">Format:</td>
                            <td style="padding: 6px 0;">${interviewSchedule.format || 'Video Call (Google Meet)'}</td>
                        </tr>
                        ${interviewSchedule.interviewers ? `
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600;">Interviewer(s):</td>
                            <td style="padding: 6px 0;">${interviewSchedule.interviewers}</td>
                        </tr>` : ''}
                        ${interviewSchedule.meetingLink ? `
                        <tr>
                            <td style="padding: 6px 0; font-weight: 600;">Meeting Link:</td>
                            <td style="padding: 6px 0;"><a href="${interviewSchedule.meetingLink}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${interviewSchedule.meetingLink}</a></td>
                        </tr>` : ''}
                    </table>
                </div>
            `;
            interviewDetailsText = `
Interview Details:
- Round: ${interviewSchedule.roundType || 'Technical Interview'}
- Date & Time: ${interviewSchedule.date || 'TBD'} at ${interviewSchedule.time || 'TBD'}
- Format: ${interviewSchedule.format || 'Video Call'}
- Meeting Link: ${interviewSchedule.meetingLink || 'N/A'}
`;
        }

        // Recruiter notes block
        let notesHtml = '';
        let notesText = '';
        if (notes && notes.trim()) {
            notesHtml = `
                <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; border-radius: 4px; padding: 14px 18px; margin: 20px 0;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Recruiter Note</div>
                    <div style="font-size: 13px; color: #334155; font-style: italic;">"${notes.trim()}"</div>
                </div>
            `;
            notesText = `\nRecruiter Note: "${notes.trim()}"\n`;
        }

        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 32px 16px; color: #0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          <!-- Top Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; text-align: left;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.03em;">Skill2<span style="color: #6366f1;">Job</span>.ai</span>
                    <span style="display: block; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px;">Verified Collegiate Hiring</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: ${badgeColor}; color: #ffffff; font-size: 10px; font-weight: 800; padding: 6px 12px; border-radius: 9999px; letter-spacing: 0.05em;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; letter-spacing: -0.02em;">
                ${mainHeadline}
              </h1>

              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                Dear ${candidateName},
              </p>

              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
                ${bodyParagraph}
              </p>

              <!-- Application Summary Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 4px 0; width: 35%;">Role / Position:</td>
                    <td style="color: #0f172a; font-weight: 700; padding: 4px 0;">${jobTitle}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Hiring Company:</td>
                    <td style="color: #0f172a; font-weight: 700; padding: 4px 0;">${companyName}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-weight: 600; padding: 4px 0;">Current Stage:</td>
                    <td style="color: ${badgeColor}; font-weight: 800; padding: 4px 0;">${newStatus}</td>
                  </tr>
                </table>
              </div>

              ${interviewDetailsHtml}
              ${notesHtml}

              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 36px 0 20px 0;">
                <a href="${actionButtonUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                  ${actionButtonText} →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0;">
                This notification was automatically dispatched on behalf of <strong>${companyName}</strong> via Skill2Job.ai.
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                Empowering collegiate students with tamper-proof verified skills and merit-based placement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `.trim();

        const text = `
Skill2Job.ai - Application Status Update
-----------------------------------------
Dear ${candidateName},

${bodyParagraph.replace(/<[^>]+>/g, '')}

Role: ${jobTitle}
Company: ${companyName}
Current Status: ${newStatus}
${interviewDetailsText}${notesText}

View details on your dashboard: ${actionButtonUrl}
        `.trim();

        return {
            subject,
            html,
            text,
            inAppTitle,
            inAppMessage
        };
    },

    /**
     * Retrieves audit log entries for testing or verification.
     */
    getAuditLog({ studentEmail, companyName, applicationId } = {}) {
        return sentEmailAuditLog.filter(entry => {
            if (studentEmail && entry.studentEmail.toLowerCase() !== studentEmail.toLowerCase()) return false;
            if (companyName && entry.companyName.toLowerCase() !== companyName.toLowerCase()) return false;
            if (applicationId && entry.applicationId !== applicationId) return false;
            return true;
        });
    },

    /**
     * Clears audit log (useful before test suites).
     */
    clearAuditLog() {
        sentEmailAuditLog.length = 0;
        inAppNotifications.length = 0;
    },

    /**
     * Retrieves in-app notifications for a candidate.
     */
    getInAppNotifications(studentId) {
        if (!studentId) return [...inAppNotifications];
        return inAppNotifications.filter(n => n.studentId === studentId);
    }
};
