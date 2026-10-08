import { NextResponse } from 'next/server';
import { userRepository } from '@/lib/repositories/userRepository';
import { otpRepository } from '@/lib/repositories/otpRepository';
import { verifyGoogleIdToken } from '@/lib/googleAuth';
import { signSessionToken, logSecurityEvent, getAuthenticatedSession } from '@/lib/authMiddleware';
import { loginSchema } from '@/lib/validations';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

export async function POST(request) {
    try {
        // Rate limit check based on IP
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
        const rateLimit = await checkRateLimit(`login_${ip}`);
        if (!rateLimit.success) {
            return rateLimitExceededResponse();
        }

        const rawBody = await request.json();
        const result = loginSchema.safeParse(rawBody);
        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
        }

        const body = result.data;
        const { email, phone, identifier, password, otp, googleCredential, isGoogleAuth } = body;
        let user = null;

        // 1. Google OAuth / OpenID Connect Identity Resolution
        if (isGoogleAuth || googleCredential) {
            if (!googleCredential) {
                return NextResponse.json({ error: 'Google ID token (googleCredential) is required for Google authentication.' }, { status: 400 });
            }

            const verification = await verifyGoogleIdToken(googleCredential);
            if (!verification.success) {
                logSecurityEvent('GOOGLE_TOKEN_VERIFICATION_FAILED', { error: verification.error });
                return NextResponse.json({ error: verification.error || 'Invalid or unverified Google ID token.' }, { status: 401 });
            }

            const googleEmail = verification.email;
            const googleName = verification.name;

            // Check if user already has an account
            user = await userRepository.findByEmail(googleEmail);
            if (!user) {
                logSecurityEvent('GOOGLE_NEW_USER_DETECTED', { email: googleEmail, name: googleName });
                return NextResponse.json({
                    success: false,
                    isNewUser: true,
                    requireProfileCompletion: true,
                    googleEmail,
                    googleName,
                    message: 'Google identity verified. Please select your role and complete your profile.'
                });
            }

            logSecurityEvent('GOOGLE_LOGIN_SUCCESS', { userId: user.id, role: user.role });
        }
        // 2. Email / Phone / Password / OTP Login
        else {
            const searchKey = identifier || email || phone;
            if (!searchKey) {
                return NextResponse.json({ error: 'Email or Phone number is required' }, { status: 400 });
            }

            user = await userRepository.findByEmailOrPhone(searchKey);
            if (!user) {
                logSecurityEvent('LOGIN_FAILED_USER_NOT_FOUND', { identifier: searchKey });
                return NextResponse.json({ error: 'No account found matching this email or phone number' }, { status: 401 });
            }

            // Verify OTP or Password
            if (otp) {
                const otpResult = await otpRepository.verifyOtp({
                    identifier: searchKey,
                    code: otp.trim(),
                    purpose: 'login'
                });
                if (!otpResult.success) {
                    logSecurityEvent('LOGIN_OTP_FAILED', { identifier: searchKey, error: otpResult.error });
                    return NextResponse.json({ error: otpResult.error || 'Invalid or expired OTP code.' }, { status: 401 });
                }
            }
            else if (password) {
                const isPasswordValid = await userRepository.verifyPassword(password, user.passwordHash);
                if (!isPasswordValid) {
                    logSecurityEvent('LOGIN_PASSWORD_FAILED', { userId: user.id });
                    return NextResponse.json({ error: 'Invalid password. Please try again.' }, { status: 401 });
                }
            }
            else {
                return NextResponse.json({ error: 'Password or OTP verification code is required.' }, { status: 400 });
            }
        }

        if (!user) {
            return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
        }

        // Ensure we have user relations if not already fetched
        if (!user.studentProfile && !user.collegeProfile && !user.companyProfile) {
            user = await userRepository.findById(user.id);
        }

        let profile = null;
        let studentId = undefined;
        let collegeId = undefined;
        let companyId = undefined;

        if (user.role === 'student' && user.studentProfile) {
            profile = user.studentProfile;
            studentId = profile.id;
        }
        else if (user.role === 'college' && user.collegeProfile) {
            profile = user.collegeProfile;
            collegeId = profile.id;
        }
        else if (user.role === 'company' && user.companyProfile) {
            profile = user.companyProfile;
            companyId = profile.id;
        }

        // Sign cryptographic JWT session token (24h validity)
        const sessionToken = signSessionToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            verified: user.email_verified !== false,
            studentId,
            collegeId,
            companyId
        }, 86400);

        logSecurityEvent('LOGIN_SUCCESS', { userId: user.id, role: user.role });

        const response = NextResponse.json({
            success: true,
            user,
            profile,
            token: sessionToken,
            message: `Successfully authenticated as ${user.name} (${user.role.toUpperCase()})`
        });

        // Set secure HttpOnly cookie
        response.cookies.set('s2h_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400,
            path: '/'
        });

        return response;
    }
    catch (error) {
        return NextResponse.json({ error: 'Unable to complete the request. Please try again.' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const user = await userRepository.findById(session.userId);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        let profile = null;
        if (user.role === 'student') profile = user.studentProfile;
        else if (user.role === 'college') profile = user.collegeProfile;
        else if (user.role === 'company') profile = user.companyProfile;

        return NextResponse.json({
            success: true,
            user,
            profile
        });
    } catch (error) {
        return NextResponse.json({ error: 'Unable to restore session.' }, { status: 500 });
    }
}

