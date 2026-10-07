import { NextResponse } from 'next/server';
import { userRepository } from '@/lib/repositories/userRepository';
import { sendEmailOtp, sendSmsOtp } from '@/lib/otpService';
export async function POST(request) {
    try {
        const body = await request.json();
        const { identifier, type, purpose = 'registration', name = 'Skill2Job User' } = body;
        if (!identifier || typeof identifier !== 'string') {
            return NextResponse.json({ error: 'Valid email address or phone number is required.' }, { status: 400 });
        }
        const channelType = type || (identifier.includes('@') ? 'email' : 'phone');
        // 1. Duplicate Account Prevention for Registration
        if (purpose === 'registration') {
            if (channelType === 'email') {
                const existing = await userRepository.findByEmail(identifier.trim());
                if (existing && existing.email_verified && existing.verification_status === 'VERIFIED') {
                    return NextResponse.json({ error: 'This email is already registered and verified. Please login instead.' }, { status: 409 });
                }
            }
            else {
                const existing = await userRepository.findByPhone(identifier.trim());
                if (existing && existing.phone_verified && existing.verification_status === 'VERIFIED') {
                    return NextResponse.json({ error: 'This phone number is already registered and verified. Please login instead.' }, { status: 409 });
                }
            }
        }
        // 2. Generate Brand New Secure 6-Digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const maskedIdentifier = channelType === 'email'
            ? `${identifier.substring(0, 2)}***${identifier.substring(identifier.indexOf('@'))}`
            : `${identifier.substring(0, 3)}****${identifier.substring(identifier.length - 2)}`;
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
