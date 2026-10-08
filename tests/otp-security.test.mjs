import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { otpRepository } from '../lib/repositories/otpRepository.js';

describe('OTP Security & Verification System', () => {
    it('creates and verifies valid OTP with bcrypt hashing', async () => {
        const email = 'candidate_test@example.com';
        const plainOtp = '654321';

        const record = await otpRepository.createOtpRecord({
            identifier: email,
            plainOtp,
            purpose: 'login',
            expiresInMinutes: 5
        });

        assert(record.id, 'Record should have an ID');
        assert.equal(record.verified, false);
        // Ensure plain OTP is NEVER stored in plaintext in the record
        assert.notEqual(record.otpHash, plainOtp);
        assert(record.otpHash.startsWith('$2'), 'Should be bcrypt hash');

        // Verify with the real plain OTP
        const verification = await otpRepository.verifyOtp({
            identifier: email,
            plainOtp,
            purpose: 'login'
        });

        assert.equal(verification.success, true);
    });

    it('rejects incorrect OTPs and decrements remaining attempts', async () => {
        const email = 'security_check@example.com';
        const correctOtp = '888888';

        await otpRepository.createOtpRecord({
            identifier: email,
            plainOtp: correctOtp,
            purpose: 'login'
        });

        // Attempt 1: wrong OTP
        const wrongAttempt1 = await otpRepository.verifyOtp({
            identifier: email,
            plainOtp: '111111',
            purpose: 'login'
        });

        assert.equal(wrongAttempt1.success, false);
        assert.equal(wrongAttempt1.remainingAttempts, 2);

        // Attempt 2: wrong OTP
        const wrongAttempt2 = await otpRepository.verifyOtp({
            identifier: email,
            plainOtp: '222222',
            purpose: 'login'
        });

        assert.equal(wrongAttempt2.success, false);
        assert.equal(wrongAttempt2.remainingAttempts, 1);
    });

    it('locks out OTP after 3 failed attempts (max attempts reached)', async () => {
        const email = 'lockout_test@example.com';
        const correctOtp = '999999';

        await otpRepository.createOtpRecord({
            identifier: email,
            plainOtp: correctOtp,
            purpose: 'login'
        });

        // 3 failed attempts
        await otpRepository.verifyOtp({ identifier: email, plainOtp: '000001', purpose: 'login' });
        await otpRepository.verifyOtp({ identifier: email, plainOtp: '000002', purpose: 'login' });
        const thirdFail = await otpRepository.verifyOtp({ identifier: email, plainOtp: '000003', purpose: 'login' });

        assert.equal(thirdFail.success, false);
        assert.equal(thirdFail.remainingAttempts, 0);

        // Fourth attempt with the CORRECT OTP must be blocked because max attempts exceeded!
        const fourthAttempt = await otpRepository.verifyOtp({
            identifier: email,
            plainOtp: correctOtp,
            purpose: 'login'
        });

        assert.equal(fourthAttempt.success, false);
        assert(fourthAttempt.error.includes('Maximum verification attempts exceeded'));
    });

    it('invalidates previous unverified OTPs when a new OTP is dispatched', async () => {
        const email = 'reissue_test@example.com';
        const oldOtp = '111111';
        const newOtp = '222222';

        await otpRepository.createOtpRecord({ identifier: email, plainOtp: oldOtp, purpose: 'login' });
        await otpRepository.createOtpRecord({ identifier: email, plainOtp: newOtp, purpose: 'login' });

        // Old OTP must be rejected
        const oldVerify = await otpRepository.verifyOtp({ identifier: email, plainOtp: oldOtp, purpose: 'login' });
        assert.equal(oldVerify.success, false);

        // New OTP must succeed
        const newVerify = await otpRepository.verifyOtp({ identifier: email, plainOtp: newOtp, purpose: 'login' });
        assert.equal(newVerify.success, true);
    });
});
