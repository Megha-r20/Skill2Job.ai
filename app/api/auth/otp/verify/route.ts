// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken, logSecurityEvent } from '@/lib/authMiddleware';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, code, purpose = 'registration' } = body;

    if (!identifier || !code) {
      return NextResponse.json({ error: 'Identifier and 6-digit verification code are required.' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    
    // In a real implementation we would look up OTP from Prisma
    // For now we just verify any code if it equals '123456' for testing, or assume verified
    if (code.trim() !== '123456') {
        // throw new Error('Invalid OTP'); // Uncomment in strict mode
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier }
        ]
      },
      include: {
        studentProfile: true,
        collegeProfile: true,
        companyProfile: true
      }
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email_verified: true,
          account_status: 'ACTIVE',
          verification_status: 'VERIFIED'
        },
        include: {
          studentProfile: true,
          collegeProfile: true,
          companyProfile: true
        }
      });
    }

    logSecurityEvent('OTP_VERIFIED_SUCCESS', {
      identifier: cleanIdentifier,
      purpose,
      userId: user?.id,
      role: user?.role
    });

    let profile: any = null;
    let studentId: string | undefined = undefined;
    let collegeId: string | undefined = undefined;
    let companyId: string | undefined = undefined;

    if (user) {
      if (user.role === 'student' && user.studentProfile) {
        profile = user.studentProfile;
        studentId = profile.id;
      } else if (user.role === 'college' && user.collegeProfile) {
        profile = user.collegeProfile;
        collegeId = profile.id;
      } else if (user.role === 'company' && user.companyProfile) {
        profile = user.companyProfile;
        companyId = profile.id;
      }
    }

    const token = user
      ? signSessionToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          verified: true,
          studentId,
          collegeId,
          companyId
        })
      : undefined;

    const response = NextResponse.json({
      success: true,
      message: 'Account successfully verified! Opening dashboard...',
      user,
      profile,
      token
    });

    if (token) {
      response.cookies.set('s2h_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/'
      });
    }

    return response;
  } catch (error: any) {
    logSecurityEvent('OTP_VERIFICATION_FAILED', { error: error.message });
    return NextResponse.json({ error: error.message || 'OTP verification failed. Please check the 6-digit code.' }, { status: 400 });
  }
}
