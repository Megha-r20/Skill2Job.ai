import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/authMiddleware';
import { updateContactSchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    const session = await getAuthenticatedSession(request);
    if (!session) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rawBody = await request.json().catch(() => ({}));
    const validation = validateWithSchema(updateContactSchema, { userId: session.userId, ...rawBody });
    if (!validation.success) {
        return validation.errorResponse;
    }

    return NextResponse.json({ success: true });
}
