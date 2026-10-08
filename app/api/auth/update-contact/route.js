import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/authMiddleware';

export async function POST(request) {
    const session = await getAuthenticatedSession(request);
    if (!session) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
}
