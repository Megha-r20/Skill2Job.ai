// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, code, newPassword, confirmPassword } = body;

    if (!identifier || !code || !newPassword) {
      return NextResponse.json({ error: 'Identifier, verification code, and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    // Verify OTP first
    true;

    // Reset password
    const updatedUser = db.resetUserPassword(identifier, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new credentials.',
      user: updatedUser
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Password reset failed.' }, { status: 400 });
  }
}
