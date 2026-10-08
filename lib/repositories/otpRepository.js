import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// In-memory store fallback for development/testing when PostgreSQL is offline
const inMemoryOtpStore = [];

export const otpRepository = {
    /**
     * Create and store a new hashed OtpRecord
     */
    async createOtpRecord({ identifier, type = 'email', purpose = 'login', plainOtp, expiresInMinutes = 5 }) {
        const cleanIdentifier = identifier.trim().toLowerCase();
        const otpHash = await bcrypt.hash(plainOtp, 10);
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
        const resendAvailableAt = new Date(Date.now() + 60 * 1000);
        const createdAt = new Date();
        const recordId = typeof crypto.randomUUID === 'function' 
            ? crypto.randomUUID() 
            : `otp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // 1. Try Prisma DB
        try {
            // Invalidate previous unverified OTPs for this identifier
            await prisma.otpRecord.updateMany({
                where: {
                    identifier: cleanIdentifier,
                    verified: false
                },
                data: {
                    verified: true
                }
            });

            const created = await prisma.otpRecord.create({
                data: {
                    id: recordId,
                    identifier: cleanIdentifier,
                    type,
                    purpose,
                    otpHash,
                    expiresAt,
                    attempts: 0,
                    maxAttempts: 3,
                    resendAvailableAt,
                    verified: false,
                    createdAt
                }
            });
            return created;
        } catch (dbErr) {
            console.warn('[otpRepository] Database offline, using in-memory store:', dbErr.message);

            // Invalidate previous unverified in memory
            for (const r of inMemoryOtpStore) {
                if (r.identifier === cleanIdentifier && !r.verified) {
                    r.verified = true;
                }
            }

            const record = {
                id: recordId,
                identifier: cleanIdentifier,
                type,
                purpose,
                otpHash,
                expiresAt,
                attempts: 0,
                maxAttempts: 3,
                resendAvailableAt,
                verified: false,
                createdAt
            };
            inMemoryOtpStore.unshift(record);
            return record;
        }
    },

    /**
     * Verify an entered OTP against the stored OtpRecord
     */
    async verifyOtp({ identifier, code, purpose }) {
        if (!identifier || !code) {
            return { success: false, error: 'Identifier and verification code are required.' };
        }

        const cleanIdentifier = identifier.trim().toLowerCase();
        const cleanCode = code.trim();

        // 1. Try Prisma DB
        try {
            const whereClause = {
                identifier: cleanIdentifier,
                verified: false
            };
            if (purpose) {
                whereClause.purpose = purpose;
            }

            let record = await prisma.otpRecord.findFirst({
                where: whereClause,
                orderBy: { createdAt: 'desc' }
            });

            // If purpose was specified but no record found, check any active unverified OTP for this identifier
            if (!record && purpose) {
                record = await prisma.otpRecord.findFirst({
                    where: {
                        identifier: cleanIdentifier,
                        verified: false
                    },
                    orderBy: { createdAt: 'desc' }
                });
            }

            if (!record) {
                return { success: false, error: 'No active OTP verification request found. Please request a new OTP.' };
            }

            // Check expiration
            if (new Date() > new Date(record.expiresAt)) {
                return { success: false, error: 'Verification code has expired. Please request a new OTP.' };
            }

            // Check maximum attempts
            if (record.attempts >= (record.maxAttempts || 3)) {
                return { success: false, error: 'Maximum verification attempts exceeded. Please request a new OTP.' };
            }

            // Verify hash with bcrypt
            const isValid = await bcrypt.compare(cleanCode, record.otpHash);

            if (!isValid) {
                // Increment attempt count
                await prisma.otpRecord.update({
                    where: { id: record.id },
                    data: { attempts: { increment: 1 } }
                });
                const remaining = (record.maxAttempts || 3) - (record.attempts + 1);
                return {
                    success: false,
                    error: remaining > 0
                        ? `Invalid verification code. ${remaining} attempt(s) remaining.`
                        : 'Invalid verification code. Maximum attempts exceeded. Please request a new OTP.'
                };
            }

            // Mark OTP as verified (single-use)
            await prisma.otpRecord.update({
                where: { id: record.id },
                data: { verified: true }
            });

            return { success: true, record };
        } catch (dbErr) {
            console.warn('[otpRepository] Database offline, checking in-memory store:', dbErr.message);

            // Find in-memory
            let record = inMemoryOtpStore.find(r => r.identifier === cleanIdentifier && !r.verified && (!purpose || r.purpose === purpose));
            if (!record && purpose) {
                record = inMemoryOtpStore.find(r => r.identifier === cleanIdentifier && !r.verified);
            }

            if (!record) {
                return { success: false, error: 'No active OTP verification request found. Please request a new OTP.' };
            }

            if (new Date() > new Date(record.expiresAt)) {
                return { success: false, error: 'Verification code has expired. Please request a new OTP.' };
            }

            if (record.attempts >= (record.maxAttempts || 3)) {
                return { success: false, error: 'Maximum verification attempts exceeded. Please request a new OTP.' };
            }

            const isValid = await bcrypt.compare(cleanCode, record.otpHash);

            if (!isValid) {
                record.attempts += 1;
                const remaining = (record.maxAttempts || 3) - record.attempts;
                return {
                    success: false,
                    error: remaining > 0
                        ? `Invalid verification code. ${remaining} attempt(s) remaining.`
                        : 'Invalid verification code. Maximum attempts exceeded. Please request a new OTP.'
                };
            }

            record.verified = true;
            return { success: true, record };
        }
    }
};
