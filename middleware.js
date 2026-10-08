import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Role-protected URL paths
const PROTECTED_ROUTES = [
    { prefix: '/student', allowedRole: 'student' },
    { prefix: '/college', allowedRole: 'college' },
    { prefix: '/recruiter', allowedRole: 'company' },
    { prefix: '/company', allowedRole: 'company' },
    { prefix: '/admin', allowedRole: 'admin' },
];

function getSecretKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret || !secret.trim()) return null;
    return new TextEncoder().encode(secret.trim());
}

/**
 * Edge-compatible cryptographic JWT signature and expiration verification using jose
 */
async function verifyEdgeSession(token) {
    try {
        if (!token || typeof token !== 'string')
            return null;
        const secretKey = getSecretKey();
        if (!secretKey)
            return null;
        const { payload } = await jwtVerify(token, secretKey);
        const nowSec = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < nowSec) {
            return null;
        }
        if (payload.expiresAt && payload.expiresAt < nowSec) {
            return null;
        }
        return payload;
    }
    catch (e) {
        return null;
    }
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    // Match protected page routes
    const matchedRoute = PROTECTED_ROUTES.find(r => pathname.startsWith(r.prefix));
    if (!matchedRoute) {
        return NextResponse.next();
    }
    // Retrieve session token from cookie or authorization header
    const sessionCookie = request.cookies.get('s2h_session')?.value;
    const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
    const token = sessionCookie || authHeader;
    // If unauthenticated or no session token
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
    // Cryptographically verify session token with jose
    const session = await verifyEdgeSession(token);
    if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
    // Role verification guard: redirect cross-role access to user's authorized home dashboard
    if (session.role !== matchedRoute.allowedRole && session.role !== 'admin') {
        let redirectDashboard = '/student/dashboard';
        if (session.role === 'college')
            redirectDashboard = '/college/dashboard';
        if (session.role === 'company')
            redirectDashboard = '/recruiter/dashboard';
        if (session.role === 'admin')
            redirectDashboard = '/admin/dashboard';
        const safeRedirect = new URL(redirectDashboard, request.url);
        safeRedirect.searchParams.set('denied', 'true');
        return NextResponse.redirect(safeRedirect);
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/student/:path*',
        '/college/:path*',
        '/recruiter/:path*',
        '/company/:path*',
        '/admin/:path*',
    ]
};
