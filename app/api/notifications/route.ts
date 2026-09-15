import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'u_student_1';

    const notifications = [
      {
        id: 'notif_1',
        title: 'Application Shortlisted',
        message: 'Your application for Full-Stack Developer at TechNova has been shortlisted!',
        type: 'APPLICATION',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif_2',
        title: 'New Assessment Assigned',
        message: 'Complete the Next.js Architecture assessment to earn your verified badge.',
        type: 'ASSESSMENT',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    return NextResponse.json({ success: true, markedRead: notificationId || true }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
