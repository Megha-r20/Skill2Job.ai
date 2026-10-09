import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/authMiddleware';
import { recruiterNotificationService } from '@/lib/services/recruiterNotificationService';

export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const studentId = session?.studentId || 'std_1';

        const liveNotifications = recruiterNotificationService.getInAppNotifications(studentId);

        const defaultNotifications = [
            {
                id: 'notif_default_1',
                title: 'New Assessment Available',
                message: 'Complete the Python Algorithms assessment to boost your match score.',
                type: 'ASSESSMENT',
                read: false,
                createdAt: new Date(Date.now() - 3600000).toISOString()
            }
        ];

        const allNotifications = [...liveNotifications, ...defaultNotifications];
        const unreadCount = allNotifications.filter(n => !n.read).length;

        return NextResponse.json({
            success: true,
            notifications: allNotifications,
            unreadCount
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function PUT(request) {
    try {
        const session = await getAuthenticatedSession(request);
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const body = await request.json();
        const { notificationId } = body;
        return NextResponse.json({ success: true, markedRead: notificationId || true }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
