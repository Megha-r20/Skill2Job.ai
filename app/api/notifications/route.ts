// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    let notifications = userId
      ? []
      : [].slice(0, 10);

    const unreadCount = notifications.filter(n => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, {  status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    if (notificationId) {
      db.markNotificationRead(notificationId);
    }

    return NextResponse.json({ success: true }, {  headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
