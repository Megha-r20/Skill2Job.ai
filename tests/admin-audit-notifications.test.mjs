import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditService } from '../lib/services/auditService.js';
import { auditRepository } from '../lib/repositories/auditRepository.js';
import { notificationService } from '../lib/services/notificationService.js';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-at-least-32-chars-long-security';

const { logSecurityEvent } = await import('../lib/authMiddleware.js');

describe('Admin Security Audit Trail & Notification Architecture Suite', () => {
    describe('1. Centralized Forensic Audit Trail', () => {
        it('retrieves pre-seeded authentic security and administrative events', async () => {
            const events = await auditService.getAuditTrail();
            assert(Array.isArray(events), 'Expected array of audit events');
            assert(events.length >= 5, 'Expected at least 5 default audit events');

            const event = events[0];
            assert(event.id, 'Event must have id');
            assert(event.timestamp, 'Event must have timestamp');
            assert(event.action, 'Event must have action');
            assert(event.category, 'Event must have category');
            assert(event.actor, 'Event must have actor');
            assert(event.targetResource, 'Event must have targetResource');
            assert(event.status, 'Event must have status');
        });

        it('filters audit events by category, status, and severity', async () => {
            const blockedEvents = await auditService.getAuditTrail({ status: 'BLOCKED' });
            assert(blockedEvents.length > 0);
            assert(blockedEvents.every(e => e.status === 'BLOCKED'));

            const hiringEvents = await auditService.getAuditTrail({ category: 'HIRING' });
            assert(hiringEvents.length > 0);
            assert(hiringEvents.every(e => e.category === 'HIRING'));
        });

        it('records and sanitizes new audit events without exposing credentials', async () => {
            const recorded = await auditService.logEvent({
                action: 'ADMIN_SETTING_MODIFIED',
                category: 'ADMIN',
                actor: {
                    userId: 'u_admin_99',
                    name: 'SuperAdmin User',
                    role: 'admin',
                    email: 'admin@apex.edu'
                },
                targetResource: {
                    type: 'Configuration',
                    id: 'mfa_policy',
                    name: 'Mandatory Two-Factor Auth'
                },
                status: 'SUCCESS',
                severity: 'MEDIUM',
                details: {
                    setting: 'require_mfa',
                    oldValue: false,
                    newValue: true,
                    // Intentionally passing sensitive fields to verify sanitization
                    password: 'secret_admin_pass',
                    token: 'raw_bearer_jwt_123',
                    otp: '492810'
                }
            });

            assert(recorded.id);
            assert.equal(recorded.action, 'ADMIN_SETTING_MODIFIED');
            assert.equal(recorded.status, 'SUCCESS');

            // Verify sanitization
            assert.equal(recorded.details.password, undefined, 'Password must be stripped');
            assert.equal(recorded.details.token, undefined, 'Token must be stripped');
            assert.equal(recorded.details.otp, undefined, 'OTP must be stripped');
            assert.equal(recorded.details.setting, 'require_mfa');

            // Verify search finds newly recorded event
            const searchResults = await auditService.getAuditTrail({ search: 'SuperAdmin User' });
            assert(searchResults.some(e => e.id === recorded.id));
        });

        it('calculates audit KPI statistics accurately', async () => {
            const stats = await auditService.getAuditStatistics();
            assert(stats.totalEvents > 0);
            assert(typeof stats.blockedCount === 'number');
            assert(typeof stats.criticalCount === 'number');
            assert(stats.categoryCounts.ACCESS_CONTROL >= 1);
        });

        it('generates compliance CSV export matrix', async () => {
            const exportData = await auditService.getExportData();
            assert(exportData.headers.includes('Event ID'));
            assert(exportData.headers.includes('Action'));
            assert(exportData.headers.includes('Actor Email'));
            assert(exportData.rows.length >= 5);
        });
    });

    describe('2. Security Guard & Access Violation Logging', () => {
        it('logs access violations from authMiddleware to audit trail', async () => {
            logSecurityEvent('RESOURCE_OWNERSHIP_FAIL_CLOSED', {
                userId: 'u_student_malicious',
                userRole: 'student',
                targetResourceId: 'col_apex',
                resourceType: 'college',
                reason: 'Student attempted unauthorized access to college administration records'
            });

            // Allow event queue tick
            await new Promise(r => setTimeout(r, 50));

            const events = await auditService.getAuditTrail({ search: 'RESOURCE_OWNERSHIP_FAIL_CLOSED' });
            assert(events.length > 0, 'Security event should be persisted in audit repository');
            const violation = events[0];
            assert.equal(violation.status, 'BLOCKED');
            assert.equal(violation.severity, 'HIGH');
        });
    });

    describe('3. In-App Notifications & Administrative Broadcasts', () => {
        it('retrieves user-specific and broadcast notifications with unread counts', async () => {
            const result = await notificationService.getNotifications({
                userId: 'u_student_1',
                studentId: 'std_1',
                role: 'student'
            });

            assert(Array.isArray(result.notifications));
            assert(result.notifications.length >= 3);
            assert(typeof result.unreadCount === 'number');
            assert(result.unreadCount > 0);
        });

        it('creates targeted notification and delivers to in-app stream', async () => {
            const created = await notificationService.sendNotification({
                recipientId: 'std_1',
                targetRoles: ['student'],
                title: 'New Assessment Assigned: Next.js Architecture',
                message: 'You have been assigned a verified skill assessment for Next.js.',
                category: 'ASSESSMENT',
                type: 'ASSIGNMENT',
                link: '/assessments/asm_nextjs'
            });

            assert(created.success);
            assert.equal(created.notification.title, 'New Assessment Assigned: Next.js Architecture');
            assert.equal(created.notification.read, false);

            const fetched = await notificationService.getNotifications({ studentId: 'std_1' });
            assert(fetched.notifications.some(n => n.id === created.notification.id));
        });

        it('dispatches admin broadcast announcement and logs administrative audit event', async () => {
            const broadcastResult = await notificationService.broadcastAnnouncement({
                title: 'Spring Campus Hiring Drive Master Schedule Announced',
                message: 'All students are requested to complete verified assessments before Oct 20.',
                targetRoles: ['student', 'college'],
                priority: 'HIGH',
                link: '/college/placement-drives',
                actor: {
                    userId: 'u_admin_1',
                    name: 'System Admin',
                    role: 'admin'
                }
            });

            assert(broadcastResult.success);
            assert(broadcastResult.targetRoles.includes('student'));

            // Verify student receives the broadcast
            const studentStream = await notificationService.getNotifications({ role: 'student' });
            assert(studentStream.notifications.some(n => n.id === broadcastResult.notification.id));

            // Verify administrative audit event logged
            const auditEvents = await auditService.getAuditTrail({ search: 'Spring Campus Hiring Drive' });
            assert(auditEvents.length > 0, 'Broadcast must trigger an audit trail entry');
            assert.equal(auditEvents[0].action, 'SYSTEM_BROADCAST_SENT');
        });

        it('marks notifications as read and updates unread counters', async () => {
            const initial = await notificationService.getNotifications({ studentId: 'std_1' });
            const unreadItem = initial.notifications.find(n => !n.read);

            if (unreadItem) {
                const marked = await notificationService.markAsRead(unreadItem.id);
                assert(marked);

                const after = await notificationService.getNotifications({ studentId: 'std_1' });
                const updated = after.notifications.find(n => n.id === unreadItem.id);
                assert.equal(updated.read, true);
            }

            // Test mark all as read
            const countMarked = await notificationService.markAllAsRead({ studentId: 'std_1', role: 'student' });
            assert(typeof countMarked === 'number');

            const finalCheck = await notificationService.getNotifications({ studentId: 'std_1', unreadOnly: true });
            assert.equal(finalCheck.notifications.length, 0);
            assert.equal(finalCheck.unreadCount, 0);
        });
    });
});
