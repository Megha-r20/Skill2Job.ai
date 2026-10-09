import { NextResponse } from 'next/server';
import { userRepository } from '@/lib/repositories/userRepository';
import { sendEmailOtp, sendSmsOtp, otpRepository } from '@/lib/otpService';
import { applyRateLimit } from '@/lib/rateLimit';
import { forgotPasswordSchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    try {
        const rateLimit = await applyRateLimit(request, 'auth');
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }

        const rawBody = await request.json().catch(() => ({}));
        const validation = validateWithSchema(forgotPasswordSchema, rawBody);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const { identifier } = validation.data;
        const user = await userRepository.findByEmailOrPhone(identifier.trim());
        if (!user) {
            return NextResponse.json({ error: 'No account registered with this email or phone number.' }, { status: 404 });
        }
        const isEmail = identifier.includes('@');
        const channelType = isEmail ? 'email' : 'phone';
        // Generate 6-digit OTP code & Store in OtpRecord
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await otpRepository.createOtpRecord({
            identifier: (user.email || identifier).trim().toLowerCase(),
            type: channelType,
            purpose: 'forgot_password',
            plainOtp: otpCode,
            expiresInMinutes: 5
        });
        const maskedIdentifier = isEmail
            ? `${identifier.substring(0, 2)}***${identifier.substring(identifier.indexOf('@'))}`
            : `${identifier.substring(0, 3)}****${identifier.substring(identifier.length - 2)}`;
        if (channelType === 'email') {
            await sendEmailOtp({
                to: user.email,
                otp: otpCode,
                recipientName: user.name,
                purpose: 'forgot_password'
            });
        }
        else {
            await sendSmsOtp({
                phone: user.phone || identifier.trim(),
                otp: otpCode,
                purpose: 'forgot_password'
            });
        }
        return NextResponse.json({
            success: true,
            message: `Password reset verification code sent to ${maskedIdentifier}`,
            maskedIdentifier,
            resendAvailableAt: new Date(Date.now() + 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message || 'Failed to send reset code.' }, { status: 400 });
    }
}
