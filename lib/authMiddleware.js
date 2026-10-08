import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from './prisma';
import { userRepository } from './repositories/userRepository';
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || typeof secret !== 'string' || !secret.trim()) {
        throw new Error('FATAL: JWT_SECRET environment variable is missing. The application refuses to operate without a configured secret.');
    }
    return secret.trim();
}

const JWT_SECRET = getJwtSecret();
const SESSION_COOKIE_NAME = 's2h_session';
/**
 * Base64URL encoding/decoding helper
 */
function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4)
        base64 += '=';
    return Buffer.from(base64, 'base64').toString('utf-8');
}
/**
 * Create a cryptographically signed HMAC-SHA256 session token
 */
export function signSessionToken(payload, expiresInSeconds = 86400) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresInSeconds;
    const sessionData = {
        ...payload,
        iat: issuedAt,
        exp: expiresAt,
        issuedAt,
        expiresAt
    };
    const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(JSON.stringify(sessionData));
    const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}
/**
 * Cryptographically verify and decode a session token
 */
export function verifySessionToken(token) {
    try {
        if (!token || typeof token !== 'string')
            return null;
        const parts = token.split('.');
        if (parts.length !== 3)
            return null;
        const [encodedHeader, encodedPayload, signature] = parts;
        const expectedSignature = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        // Constant-time comparison to prevent timing attacks
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            return null;
        }
        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        const currentTimestamp = Math.floor(Date.now() / 1000);
        // Check expiration
        if (payload.expiresAt < currentTimestamp) {
            return null;
        }
        return payload;
    }
    catch (err) {
        return null;
    }
}
/**
 * Refresh an active session token if it is close to expiration (within 6 hours)
 */
export function refreshSessionToken(session) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const RENEWAL_WINDOW = 6 * 3600; // 6 hours
    // If token is near expiration, return fresh 24h signed token
    if (session.expiresAt - currentTimestamp < RENEWAL_WINDOW) {
        return signSessionToken({
            userId: session.userId,
            email: session.email,
            role: session.role,
            verified: session.verified,
            studentId: session.studentId,
            collegeId: session.collegeId,
            companyId: session.companyId
        });
    }
    // Token is still fresh
    return signSessionToken(session);
}
/**
 * Extract authenticated session from incoming NextRequest (Cookie or Bearer Header)
 */
export async function getAuthenticatedSession(request) {
    // 1. Check HttpOnly Cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
    }));
    const sessionCookie = cookies[SESSION_COOKIE_NAME];
    if (sessionCookie) {
        const verified = verifySessionToken(sessionCookie);
        if (verified)
            return verified;
    }
    // 2. Check Authorization Header (Bearer token)
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.substring(7).trim();
        const verified = verifySessionToken(bearerToken);
        if (verified)
            return verified;
    }
    return null;
}
/**
 * Server-Side Role Enforcement Guard
 */
export function authorizeRole(session, allowedRoles) {
    if (!session) {
        return {
            authorized: false,
            errorResponse: NextResponse.json({ error: 'Authentication required. Please login.', code: 'UNAUTHENTICATED' }, { status: 401 })
        };
    }
    if (!session.verified) {
        return {
            authorized: false,
            errorResponse: NextResponse.json({ error: 'Account verification required. Please complete email OTP verification.', code: 'UNVERIFIED' }, { status: 403 })
        };
    }
    if (!allowedRoles.includes(session.role) && session.role !== 'admin') {
        // Log unauthorized attempt
        logSecurityEvent('UNAUTHORIZED_ROLE_ACCESS', {
            userId: session.userId,
            attemptedRole: session.role,
            allowedRoles
        });
        return {
            authorized: false,
            errorResponse: NextResponse.json({ error: 'Access denied. You do not have permission to access this resource.', code: 'FORBIDDEN' }, { status: 403 })
        };
    }
    return { authorized: true };
}
/**
 * Server-Side Ownership Guard (Verifies caller owns the student / college / company record)
 */
export async function authorizeOwnership(session, targetResourceId, resourceType) {
    if (!session) {
        return {
            authorized: false,
            errorResponse: NextResponse.json({ error: 'Authentication required', code: 'UNAUTHENTICATED' }, { status: 401 })
        };
    }
    // Admin bypass
    if (session.role === 'admin')
        return { authorized: true };
    let isOwner = false;
    if (resourceType === 'student') {
        // Match by studentId, userId, or email
        let student = null;
        try {
            student = await prisma.student.findUnique({ where: { id: targetResourceId } }) || await prisma.student.findUnique({ where: { userId: targetResourceId } });
        } catch (e) {
            // Safe fallback when DB is offline
        }
        if (student) {
            isOwner = student.userId === session.userId || (Boolean(session.studentId) && student.id === session.studentId);
        }
        else {
            isOwner = targetResourceId === session.userId || (Boolean(session.studentId) && targetResourceId === session.studentId);
        }
        // College can view their own enrolled students
        if (!isOwner && session.role === 'college' && session.collegeId) {
            if (student && student.collegeId === session.collegeId) {
                isOwner = true;
            }
        }
    }
    else if (resourceType === 'college') {
        let college = null;
        try {
            college = await prisma.college.findUnique({ where: { id: targetResourceId } }) || await prisma.college.findUnique({ where: { userId: targetResourceId } });
        } catch (e) {}
        if (college) {
            isOwner = college.userId === session.userId || (Boolean(session.collegeId) && college.id === session.collegeId);
        } else {
            isOwner = targetResourceId === session.userId || (Boolean(session.collegeId) && targetResourceId === session.collegeId);
        }
    }
    else if (resourceType === 'company') {
        let company = null;
        try {
            company = await prisma.company.findUnique({ where: { id: targetResourceId } }) || await prisma.company.findUnique({ where: { userId: targetResourceId } });
        } catch (e) {}
        if (company) {
            isOwner = company.userId === session.userId || (Boolean(session.companyId) && company.id === session.companyId);
        } else {
            isOwner = targetResourceId === session.userId || (Boolean(session.companyId) && targetResourceId === session.companyId);
        }
    }
    if (!isOwner) {
        logSecurityEvent('RESOURCE_OWNERSHIP_VIOLATION', {
            userId: session.userId,
            userRole: session.role,
            targetResourceId,
            resourceType
        });
        return {
            authorized: false,
            errorResponse: NextResponse.json({ error: 'Access denied. You cannot view or modify another entity\'s private records.', code: 'FORBIDDEN_OWNERSHIP' }, { status: 403 })
        };
    }
    return { authorized: true };
}
/**
 * Security Event Audit Logger (Safe logging without exposing passwords or plaintext OTPs)
 */
export function logSecurityEvent(eventType, metadata) {
    const timestamp = new Date().toISOString();
    const safeLog = {
        timestamp,
        eventType,
        ...metadata
    };
    // Strip any accidental sensitive credentials
    delete safeLog.password;
    delete safeLog.otp;
    delete safeLog.code;
    delete safeLog.token;
    console.log(`🛡️ [SECURITY AUDIT] ${timestamp} | EVENT: ${eventType}`, JSON.stringify(safeLog));
}
