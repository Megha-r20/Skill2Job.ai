import { describe, it, expect } from 'vitest';

// Guarantee JWT secret is set prior to module evaluation
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-at-least-32-chars-long-security';

const { setDbOffline } = await import('../../lib/prisma.js');
setDbOffline();

const {
    signSessionToken,
    verifySessionToken,
    refreshSessionToken,
    authorizeRole,
    authorizeOwnership
} = await import('../../lib/authMiddleware.js');

describe('Vitest Suite: Authentication & Authorization Security', () => {
    describe('1. Cryptographic HMAC-SHA256 Token Signing & Verification', () => {
        it('signs valid JWT session tokens with issuedAt and expiresAt timestamps', () => {
            const payload = {
                userId: 'u_student_42',
                email: 'alex@apex.edu',
                role: 'student',
                studentId: 'std_42',
                verified: true
            };

            const token = signSessionToken(payload, 3600);
            expect(typeof token).toBe('string');
            const parts = token.split('.');
            expect(parts.length).toBe(3);

            const verified = verifySessionToken(token);
            expect(verified).not.toBeNull();
            expect(verified.userId).toBe('u_student_42');
            expect(verified.role).toBe('student');
            expect(verified.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
        });

        it('rejects tampered payloads and forged signatures immediately', () => {
            const token = signSessionToken({ userId: 'u_legit_user', role: 'student' });
            const parts = token.split('.');

            // 1. Tamper payload to elevate role to admin
            const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            decodedPayload.role = 'admin';
            const forgedPayload = Buffer.from(JSON.stringify(decodedPayload)).toString('base64url');
            const forgedToken = `${parts[0]}.${forgedPayload}.${parts[2]}`;

            expect(verifySessionToken(forgedToken)).toBeNull();

            // 2. Tamper signature
            const corruptedSigToken = `${parts[0]}.${parts[1]}.invalid_signature_bits`;
            expect(verifySessionToken(corruptedSigToken)).toBeNull();

            // 3. Malformed token formats
            expect(verifySessionToken('not.a.jwt.token.parts')).toBeNull();
            expect(verifySessionToken('')).toBeNull();
            expect(verifySessionToken(null)).toBeNull();
        });

        it('rejects expired tokens strictly', () => {
            // Sign token with 0 second expiration
            const expiredToken = signSessionToken({ userId: 'u_expired_user', role: 'student' }, -10);
            const verified = verifySessionToken(expiredToken);
            expect(verified).toBeNull();
        });

        it('refreshes near-expiration tokens cleanly with fresh lifetime', () => {
            const currentTime = Math.floor(Date.now() / 1000);
            const nearExpirationSession = {
                userId: 'u_student_1',
                email: 'student@example.com',
                role: 'student',
                studentId: 'std_1',
                expiresAt: currentTime + 1800 // 30 minutes left (within 6h renewal window)
            };

            const refreshedToken = refreshSessionToken(nearExpirationSession);
            const verified = verifySessionToken(refreshedToken);
            expect(verified).not.toBeNull();
            expect(verified.expiresAt).toBeGreaterThan(currentTime + 80000); // 24h extended
        });
    });

    describe('2. Role-Based Authorization Guard (authorizeRole)', () => {
        it('permits authorized roles and denies unauthorized access', () => {
            const studentSession = { userId: 'u_std_1', role: 'student', verified: true };
            const adminSession = { userId: 'u_adm_1', role: 'admin', verified: true };
            const recruiterSession = { userId: 'u_rec_1', role: 'company', verified: true };

            // Student role checking
            const studentCheck = authorizeRole(studentSession, ['student']);
            expect(studentCheck.authorized).toBe(true);

            // Unauthorized student trying recruiter route
            const unauthorizedCheck = authorizeRole(studentSession, ['company']);
            expect(unauthorizedCheck.authorized).toBe(false);
            expect(unauthorizedCheck.errorResponse.status).toBe(403);

            // Multi-role allowance
            const multiCheck = authorizeRole(recruiterSession, ['company', 'admin']);
            expect(multiCheck.authorized).toBe(true);

            // Unauthenticated check
            const nullCheck = authorizeRole(null, ['student']);
            expect(nullCheck.authorized).toBe(false);
            expect(nullCheck.errorResponse.status).toBe(401);
        });
    });

    describe('3. Multi-Tenant Ownership Guard (authorizeOwnership)', () => {
        it('allows users to access their own private records', async () => {
            const session = { userId: 'u_student_1', studentId: 'std_1', role: 'student', verified: true };

            // Student record access by ID
            const studentAccess = await authorizeOwnership(session, 'std_1', 'student');
            expect(studentAccess.authorized).toBe(true);
        });

        it('blocks students from accessing college administration or other student records', async () => {
            const maliciousStudent = { userId: 'u_student_attacker', studentId: 'std_attacker', role: 'student' };

            const blockedCollegeAccess = await authorizeOwnership(maliciousStudent, 'col_apex', 'college');
            expect(blockedCollegeAccess.authorized).toBe(false);
            expect(blockedCollegeAccess.errorResponse.status).toBe(403);

            const blockedOtherStudent = await authorizeOwnership(maliciousStudent, 'std_victim', 'student');
            expect(blockedOtherStudent.authorized).toBe(false);
            expect(blockedOtherStudent.errorResponse.status).toBe(403);
        });

        it('allows platform admin bypass across all tenants', async () => {
            const adminSession = { userId: 'u_super_admin', role: 'admin' };

            const adminAccess = await authorizeOwnership(adminSession, 'std_anyone', 'student');
            expect(adminAccess.authorized).toBe(true);
        });
    });
});
