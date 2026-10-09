import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { certificateRepository } from '@/lib/repositories/certificateRepository';

export async function GET(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student', 'college', 'company']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        if (session?.role === 'student') {
            const ownerAuth = await authorizeOwnership(session, params.id, 'student');
            if (!ownerAuth.authorized) {
                return ownerAuth.errorResponse;
            }
        }

        const certificates = await certificateRepository.findByStudentId(params.id);

        return NextResponse.json({
            success: true,
            studentId: params.id,
            totalCertificates: certificates.length,
            certificates
        });
    } catch (error) {
        console.error('[students-certificates-get] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
