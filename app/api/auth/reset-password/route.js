import { NextResponse } from 'next/server';
import { userRepository } from '@/lib/repositories/userRepository';
import { otpRepository } from '@/lib/repositories/otpRepository';
export async function POST(request) {
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
