import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { notificationService } from '@/lib/services/notificationService';

/**
 * GET /api/notifications
 * Retrieves user notifications and system announcements with category filtering.
 */
export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const { searchParams } = new URL(request.url);

        const userId = session?.userId || 'u_student_1';
        const studentId = session?.studentId || 'std_1';
        const role = session?.role || 'student';
        const category = searchParams.get('category') || 'All';
        const unreadOnly = searchParams.get('unread') === 'true';

        const { notifications, unreadCount, total } = await notificationService.getNotifications({
            userId,
            studentId,
            role,
            category,
            unreadOnly
        });

        return NextResponse.json({
            success: true,
            notifications,
            unreadCount,
            total
        });
    } catch (error) {
        console.error('[GET notifications error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/notifications
 * Sends a targeted notification or broadcasts a system-wide announcement.
 */
export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const body = await request.json();

        // 1. Broadcast announcement (Admin only)
        if (body.broadcast) {
            let effectiveSession = session;
            if (!effectiveSession && process.env.NODE_ENV !== 'production') {
                effectiveSession = { userId: 'u_admin_demo', role: 'admin', name: 'Global Administrator' };
            }

            const roleAuth = authorizeRole(effectiveSession, ['admin']);
            if (!roleAuth.authorized) return roleAuth.errorResponse;

            const { title, message, targetRoles, priority, link } = body;
            if (!title || !message) {
                return NextResponse.json({ error: 'Title and message are required for broadcast.' }, { status: 400 });
            }

            const result = await notificationService.broadcastAnnouncement({
                title,
                message,
                targetRoles: targetRoles || ['student', 'company', 'college'],
                priority: priority || 'HIGH',
                link: link || '',
                actor: {
                    userId: effectiveSession.userId,
                    name: effectiveSession.name || 'System Admin',
                    role: effectiveSession.role
                }
            });

            return NextResponse.json({
                success: true,
                broadcast: true,
                notification: result.notification,
                message: `Broadcast announcement dispatched to [${result.targetRoles.join(', ')}].`
            });
        }

        // 2. Targeted Notification
        const { recipientId, targetRoles, title, message, category, type, link, sendEmail, recipientEmail } = body;
        if (!title || !message) {
            return NextResponse.json({ error: 'Title and message are required.' }, { status: 400 });
        }

        const result = await notificationService.sendNotification({
            recipientId,
            targetRoles,
            title,
            message,
            category,
            type,
            link,
            sendEmail,
            recipientEmail
        });

        return NextResponse.json({
            success: true,
            notification: result.notification,
            emailDelivered: result.emailDelivered
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * PUT /api/notifications
 * Marks individual notification as read or marks all as read.
 */
export async function PUT(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const body = await request.json();
        const { notificationId, markAll } = body;

        const userId = session?.userId || 'u_student_1';
        const studentId = session?.studentId || 'std_1';
        const role = session?.role || 'student';

        if (markAll) {
            const count = await notificationService.markAllAsRead({ userId, studentId, role });
            return NextResponse.json({ success: true, markedAll: true, count });
        }

        if (notificationId) {
            const marked = await notificationService.markAsRead(notificationId);
            return NextResponse.json({ success: true, markedRead: notificationId, found: marked });
        }

        return NextResponse.json({ error: 'Provide notificationId or markAll: true' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
