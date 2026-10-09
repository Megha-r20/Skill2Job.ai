import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/authMiddleware';
import { lessonProgressSchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string, lessonId: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request, { params }) {
    const session = await getAuthenticatedSession(request);
    if (!session) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rawBody = await request.json().catch(() => ({}));
    const validation = validateWithSchema(lessonProgressSchema, rawBody);
    if (!validation.success) {
        return validation.errorResponse;
    }

    return NextResponse.json({ success: true, message: 'Progress saved' });
}
