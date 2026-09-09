// @ts-nocheck
import { NextResponse } from 'next/server';
import { userRepository } from '@/lib/repositories/userRepository';
import { signSessionToken, logSecurityEvent } from '@/lib/authMiddleware';
import { registerSchema } from '@/lib/validations';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await checkRateLimit(`register_${ip}`);
    if (!rateLimit.success) {
      return rateLimitExceededResponse();
    }

    const rawBody = await request.json();
    const result = registerSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const body = result.data;
    const { role, password, email, phone, name, isGoogleAuth } = body;

    if (!isGoogleAuth && (!password || password.length < 6)) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check duplicate account
    const existing = await userRepository.findByEmail(email.trim().toLowerCase());
    if (existing && existing.email_verified && existing.verification_status === 'VERIFIED') {
      return NextResponse.json({ error: 'An account with this email is already registered. Please login.' }, { status: 409 });
    }

    let user: any;
    let profile: any;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone?.trim() || '+91 98765 00000';
    const pwd = password || 'google_oauth_verified';

    if (role === 'student') {
      profile = await userRepository.createStudentAccount({
        fullName: name || body.fullName || 'Student Candidate',
        email: cleanEmail,
        phone: cleanPhone,
        password: pwd,
        collegeName: body.collegeName || body.college || 'Apex University of Engineering',
        department: body.department || body.course || 'Computer Science & Engineering',
        graduationYear: parseInt(String(body.graduationYear), 10) || 2026
      });
      user = await userRepository.findById(profile.userId);
    } else {
      // Create a generic user for company/college for now until specific repos are created
      user = await userRepository.createUser({
        name: name || body.companyName || body.collegeName || 'Partner',
        email: cleanEmail,
        phone: cleanPhone,
        password: pwd,
        role: role
      });
      profile = null;
    }

    // Issue cryptographic JWT session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      verified: false,
      studentId: role === 'student' ? profile.id : undefined,
    });

    logSecurityEvent('USER_REGISTERED_PENDING_OTP', { userId: user.id, role, email: cleanEmail });

    const response = NextResponse.json({
      success: true,
      requireOtp: true,
      message: `Account created for ${user.name}. Please enter the 6-digit verification code sent to ${cleanEmail}.`,
      user: user,
      profile: profile,
      token
    });

    // Set temporary session cookie
    response.cookies.set('s2h_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/'
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed.' }, { status: 400 });
  }
}
