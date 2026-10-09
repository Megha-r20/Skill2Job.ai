import { NextResponse } from 'next/server';
import { userRepository } from '@/lib/repositories/userRepository';
import { sendEmailOtp, sendSmsOtp, otpRepository } from '@/lib/otpService';
import { applyRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
    try {
        const rateLimit = await applyRateLimit(request, 'otp');
        if (!rateLimit.allowed) {
            return rateLimit.response;
        }
        const body = await request.json();
        const { identifier, type, purpose = 'registration', name = 'Skill2Job User' } = body;
        if (!identifier || typeof identifier !== 'string') {
            return NextResponse.json({ error: 'Valid email address or phone number is required.' }, { status: 400 });
        }
        const cleanIdentifier = identifier.trim().toLowerCase();
        const channelType = type || (cleanIdentifier.includes('@') ? 'email' : 'phone');
        // 1. Duplicate Account Prevention for Registration
        if (purpose === 'registration') {
            if (channelType === 'email') {
                const existing = await userRepository.findByEmail(cleanIdentifier);
                if (existing && existing.email_verified && existing.verification_status === 'VERIFIED') {
                    return NextResponse.json({ error: 'This email is already registered and verified. Please login instead.' }, { status: 409 });
                }
            }
            else {
                const existing = await userRepository.findByPhone(cleanIdentifier);
                if (existing && existing.phone_verified && existing.verification_status === 'VERIFIED') {
                    return NextResponse.json({ error: 'This phone number is already registered and verified. Please login instead.' }, { status: 409 });
                }
            }
        }
        // 2. Generate Brand New Secure 6-Digit OTP & Store in OtpRecord
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await otpRepository.createOtpRecord({
            identifier: cleanIdentifier,
            type: channelType,
            purpose,
            plainOtp: otpCode,
            expiresInMinutes: 5
        });

        const maskedIdentifier = channelType === 'email'
            ? `${cleanIdentifier.substring(0, 2)}***${cleanIdentifier.substring(cleanIdentifier.indexOf('@'))}`
            : `${cleanIdentifier.substring(0, 3)}****${cleanIdentifier.substring(cleanIdentifier.length - 2)}`;
        // 3. Dispatch via Email or SMS Provider
        let dispatchResult;
        try {
            if (channelType === 'email') {
                dispatchResult = await sendEmailOtp({
                    to: identifier.trim().toLowerCase(),
                    otp: otpCode,
                    recipientName: name,
                    purpose
                });
            }
            else {
                dispatchResult = await sendSmsOtp({
                    phone: identifier.trim(),
                    otp: otpCode,
                    purpose
                });
            }
        }
        catch (dispatchErr) {
            return NextResponse.json({
                error: dispatchErr.message || 'Failed to dispatch verification code to provider. Please check provider configuration in .env.'
            }, { status: 502 });
        }
        return NextResponse.json({
            success: true,
            message: `A 6-digit verification code has been sent to ${maskedIdentifier}`,
            maskedIdentifier,
            resendAvailableAt: new Date(Date.now() + 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            provider: dispatchResult?.provider || 'SIMULATED'
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message || 'Failed to generate verification request.' }, { status: 400 });
    }
}
