import { NextResponse } from 'next/server';
import { storageService, verifyLocalSignedUrl } from '@/lib/services/storageService';
import { getAuthenticatedSession } from '@/lib/authMiddleware';
import { storageFileQuerySchema, validateQueryParams } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/**
 * GET /api/storage/file
 * Securely serves files from local/cloud storage with cryptographic HMAC and authentication check.
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request) {
    try {
        const queryVal = validateQueryParams(storageFileQuerySchema, request);
        if (!queryVal.success) {
            return NextResponse.json({ error: 'Missing required signed URL parameters' }, { status: 400 });
        }
        const { key, expires, sig } = queryVal.data;

        // 1. Verify cryptographic HMAC signature and timestamp
        const isValidSignature = verifyLocalSignedUrl(key, expires, sig);
        if (!isValidSignature) {
            return NextResponse.json({
                error: 'Invalid or expired signed URL. Access denied.',
                code: 'FORBIDDEN_INVALID_SIGNATURE'
            }, { status: 403 });
        }

        // 2. Enforce active authentication
        const session = await getAuthenticatedSession(request);
        if (!session) {
            return NextResponse.json({
                error: 'Authentication required to access private storage documents.',
                code: 'UNAUTHENTICATED'
            }, { status: 401 });
        }

        // 3. Fetch file from private storage
        const fileData = await storageService.getFile(key);
        if (!fileData) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // 4. Stream response with strict private cache and correct content-type
        return new NextResponse(fileData.buffer, {
            status: 200,
            headers: {
                'Content-Type': fileData.contentType,
                'Content-Disposition': 'inline',
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                'X-Content-Type-Options': 'nosniff'
            }
        });
    } catch (error) {
        console.error('[storage-api] Error serving secure file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
