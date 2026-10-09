import { NextResponse } from 'next/server';
import { userRepository } from '@/lib/repositories/userRepository';
import { otpRepository } from '@/lib/repositories/otpRepository';
import { applyRateLimit } from '@/lib/rateLimit';
import { resetPasswordSchema, validateWithSchema } from '@/lib/validations';

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
        const validation = validateWithSchema(resetPasswordSchema, rawBody);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const { identifier, code, newPassword } = validation.data;
        // Verify OTP code
        const otpResult = await otpRepository.verifyOtp({
            identifier: identifier.trim().toLowerCase(),
            code: code.trim(),
            purpose: 'forgot_password'
        });
        if (!otpResult.success) {
            return NextResponse.json({ error: otpResult.error || 'Invalid or expired verification code.' }, { status: 400 });
        }
        // Reset password using userRepository
        const updatedUser = await userRepository.resetPassword(identifier, newPassword);
        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new credentials.',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role
            }
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message || 'Password reset failed.' }, { status: 400 });
    }
}
