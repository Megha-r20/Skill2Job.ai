import nodemailer from 'nodemailer';
import { auditService } from './auditService.js';

// Central in-memory notification registry
const inAppNotifications = [
    {
        id: 'notif_101',
        recipientId: 'std_1',
        targetRoles: ['student'],
        title: 'Application Shortlisted by TechNova Solutions 🎉',
        message: 'Your application for Full Stack Software Engineer was shortlisted based on your verified Python & React credentials.',
        category: 'HIRING',
        type: 'APPLICATION_STATUS',
        link: '/student/applications',
        read: false,
        priority: 'HIGH',
        createdAt: new Date(Date.now() - 40 * 60000).toISOString()
    },
    {
        id: 'notif_102',
        recipientId: 'std_1',
        targetRoles: ['student'],
        title: 'Cryptographic Certificate Issued 📜',
        message: 'Certificate CERT-S2H-PY-2026-9921 issued with 92% verification score on Python 3 Mastery.',
        category: 'ASSESSMENT',
        type: 'CERTIFICATE_ISSUED',
        link: '/student/certificates',
        read: false,
        priority: 'MEDIUM',
        createdAt: new Date(Date.now() - 75 * 60000).toISOString()
    },
    {
        id: 'notif_103',
        recipientId: 'all',
        targetRoles: ['student', 'college'],
        title: 'Google Cloud Campus Placement Drive Announced 🚀',
        message: 'Google Cloud Platform on-campus recruitment drive is scheduled for Oct 25, 2026. Registrations are open for CSE, IT, and AI&DS.',
        category: 'CAMPUS_DRIVE',
        type: 'SYSTEM_BROADCAST',
        link: '/college/placement-drives',
        read: true,
        priority: 'HIGH',
        createdAt: new Date(Date.now() - 110 * 60000).toISOString()
    },
    {
        id: 'notif_104',
        recipientId: 'u_comp_1',
        targetRoles: ['company'],
        title: 'New High-Compatibility Candidate Applied',
        message: 'Samantha Chen (94% Compatibility, CGPA 9.30) applied for Full Stack Software Engineer.',
        category: 'HIRING',
        type: 'NEW_APPLICATION',
        link: '/recruiter/applications',
        read: false,
        priority: 'MEDIUM',
        createdAt: new Date(Date.now() - 180 * 60000).toISOString()
    },
    {
        id: 'notif_105',
        recipientId: 'all',
        targetRoles: ['student', 'company', 'college'],
        title: 'Security Alert: Two-Factor Authentication Recommended 🛡️',
        message: 'Verify your primary email address and enable email OTP to secure your Skill2Job credential passport.',
        category: 'SECURITY',
        type: 'SECURITY_ALERT',
        link: '/security-audit',
        read: true,
        priority: 'LOW',
        createdAt: new Date(Date.now() - 360 * 60000).toISOString()
    }
];

export const notificationService = {
    /**
     * Retrieves notifications targeted to a specific user or role, including broadcast messages.
     */
    async getNotifications({ userId, studentId, role = 'student', category = 'All', unreadOnly = false }) {
        let results = inAppNotifications.filter(n => {
            // Check direct recipient or broadcast
            const isDirect = (userId && n.recipientId === userId) || (studentId && n.recipientId === studentId);
            const isBroadcast = n.recipientId === 'all' || (n.targetRoles && n.targetRoles.includes(role));
            return isDirect || isBroadcast;
        });

        if (category && category !== 'All') {
            results = results.filter(n => n.category.toLowerCase() === category.toLowerCase());
        }

        if (unreadOnly) {
            results = results.filter(n => !n.read);
        }

        // Sort by timestamp descending
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const unreadCount = results.filter(n => !n.read).length;

        return {
            notifications: results,
            unreadCount,
            total: results.length
        };
    },

    /**
     * Dispatches an in-app notification (and optional email).
     */
    async sendNotification({
        recipientId,
        targetRoles = ['student'],
        title,
        message,
        category = 'SYSTEM',
        type = 'INFO',
        link = '',
        priority = 'MEDIUM',
        sendEmail = false,
        recipientEmail = '',
        metadata = {}
    }) {
        const notif = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            recipientId: recipientId || 'all',
            targetRoles,
            title,
            message,
            category,
            type,
            link,
            priority,
            read: false,
            metadata,
            createdAt: new Date().toISOString()
        };

        inAppNotifications.unshift(notif);

        // Optional email delivery
        let emailDelivered = false;
        if (sendEmail && recipientEmail) {
            emailDelivered = await this.dispatchEmailNotification({
                to: recipientEmail,
                title,
                message,
                category,
                link
            });
        }

        return {
            success: true,
            notification: notif,
            emailDelivered
        };
    },

    /**
     * Admin broadcast announcement across user roles.
     */
    async broadcastAnnouncement({ title, message, targetRoles = ['student', 'company', 'college'], priority = 'HIGH', link = '', actor = null }) {
        const broadcastNotif = {
            id: `notif_broadcast_${Date.now()}`,
            recipientId: 'all',
            targetRoles,
            title,
            message,
            category: 'SYSTEM_BROADCAST',
            type: 'ANNOUNCEMENT',
            link,
            priority,
            read: false,
            createdAt: new Date().toISOString()
        };

        inAppNotifications.unshift(broadcastNotif);

        // Log to centralized audit trail
        await auditService.logEvent({
            action: 'SYSTEM_BROADCAST_SENT',
            category: 'ADMIN',
            actor: actor || { userId: 'u_admin', name: 'Global Administrator', role: 'admin' },
            targetResource: { type: 'Notification', id: broadcastNotif.id, name: title },
            status: 'SUCCESS',
            severity: 'LOW',
            details: { targetRoles, priority, message }
        });

        return {
            success: true,
            notification: broadcastNotif,
            targetRoles
        };
    },

    /**
     * Marks an individual notification as read.
     */
    async markAsRead(notificationId) {
        const target = inAppNotifications.find(n => n.id === notificationId);
        if (target) {
            target.read = true;
            return true;
        }
        return false;
    },

    /**
     * Marks all notifications for a recipient or role as read.
     */
    async markAllAsRead({ userId, studentId, role }) {
        let count = 0;
        inAppNotifications.forEach(n => {
            const isDirect = (userId && n.recipientId === userId) || (studentId && n.recipientId === studentId);
            const isBroadcast = n.recipientId === 'all' || (role && n.targetRoles && n.targetRoles.includes(role));
            if (isDirect || isBroadcast) {
                if (!n.read) {
                    n.read = true;
                    count++;
                }
            }
        });
        return count;
    },

    /**
     * Email delivery helper utilizing Resend API and Nodemailer/SMTP.
     */
    async dispatchEmailNotification({ to, title, message, category, link }) {
        if (!to) return false;

        // 1. Resend API
        if (process.env.RESEND_API_KEY) {
            try {
                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        from: process.env.EMAIL_FROM || 'Skill2Job.ai Notifications <notifications@skill2hire.com>',
                        to: [to],
                        subject: title,
                        html: `
                            <div style="font-family: sans-serif; padding: 24px; color: #0f172a; background-color: #f8fafc;">
                                <div style="background-color: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; max-width: 550px; margin: 0 auto;">
                                    <h2 style="color: #4f46e5; margin-top: 0;">${title}</h2>
                                    <p style="font-size: 14px; line-height: 1.6; color: #334155;">${message}</p>
                                    ${link ? `<div style="margin-top: 24px;"><a href="${link}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">View Details →</a></div>` : ''}
                                </div>
                            </div>
                        `
                    })
                });
                if (response.ok) return true;
            } catch (err) {
                console.warn('[notificationService] Resend dispatch:', err.message);
            }
        }

        // 2. SMTP / Nodemailer
        if ((process.env.SMTP_HOST || process.env.SMTP_USER) && process.env.SMTP_PASS) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env.SMTP_PORT || '587', 10),
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });

                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || `"Skill2Job.ai" <${process.env.SMTP_USER}>`,
                    to,
                    subject: title,
                    text: message
                });
                return true;
            } catch (err) {
                console.warn('[notificationService] SMTP dispatch:', err.message);
            }
        }

        return false;
    }
};
