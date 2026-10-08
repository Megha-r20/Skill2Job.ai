import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Ensure JWT_SECRET is configured before loading authMiddleware
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-at-least-32-chars-long-security';

// Dynamic import so environment variable is guaranteed to be set
const {
    signSessionToken,
    verifySessionToken,
    authorizeRole,
    authorizeOwnership
} = await import('../lib/authMiddleware.js');

describe('Authentication & Security Safeguards', () => {
    it('signs and verifies valid JWT session tokens with HMAC-SHA256', () => {
        const payload = { userId: 'u_student_1', role: 'student', email: 'alex@example.com', verified: true };
        const token = signSessionToken(payload, 3600);
        assert(typeof token === 'string' && token.split('.').length === 3);

        const verified = verifySessionToken(token);
        assert(verified !== null, 'Token should be valid');
        assert.equal(verified.userId, 'u_student_1');
        assert.equal(verified.role, 'student');
    });

    it('rejects forged tokens with tampered payloads or signatures', () => {
        const token = signSessionToken({ userId: 'u_student_1', role: 'student', verified: true });
        const parts = token.split('.');

        // Tamper with payload (elevate role to admin)
        const tamperedPayload = Buffer.from(JSON.stringify({ userId: 'u_student_1', role: 'admin', verified: true })).toString('base64url');
        const forgedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

        const result = verifySessionToken(forgedToken);
        assert.equal(result, null, 'Tampered token must be rejected (returns null)');
    });

    it('rejects expired tokens strictly', () => {
        // Sign token that expires in the past (-10 seconds)
        const expiredToken = signSessionToken({ userId: 'u_student_1', verified: true }, -10);
        const result = verifySessionToken(expiredToken);
        assert.equal(result, null, 'Expired token must be rejected (returns null)');
    });

    it('enforces role authorization correctly', () => {
        const studentSession = { userId: 'u_1', role: 'student', verified: true };
        const adminSession = { userId: 'u_admin', role: 'admin', verified: true };
        const recruiterSession = { userId: 'u_rec', role: 'company', verified: true };

        // Student-only endpoint
        const studentAuth = authorizeRole(studentSession, ['student']);
        assert.equal(studentAuth.authorized, true);

        // Recruiter trying to access student-only endpoint
        const unauthorizedAuth = authorizeRole(recruiterSession, ['student']);
        assert.equal(unauthorizedAuth.authorized, false);

        // Admin accessing protected role endpoint
        const adminAuth = authorizeRole(adminSession, ['company']);
        assert.equal(adminAuth.authorized, true);
    });

    it('enforces strict ownership authorization and fails closed', async () => {
        const studentSession = {
            userId: 'u_student_1',
            studentId: 'std_1',
            role: 'student',
            verified: true
        };

        // Accessing own record
        const ownAuth = await authorizeOwnership(studentSession, 'std_1', 'student');
        assert.equal(ownAuth.authorized, true);

        // Accessing another student's record
        const strangerAuth = await authorizeOwnership(studentSession, 'std_999', 'student');
        assert.equal(strangerAuth.authorized, false);

        // Null / undefined session must fail closed
        const nullAuth = await authorizeOwnership(null, 'std_1', 'student');
        assert.equal(nullAuth.authorized, false);
    });
});
