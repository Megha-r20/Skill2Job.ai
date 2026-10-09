import { NextResponse } from 'next/server';
import { getAuthenticatedSession, authorizeRole, authorizeOwnership } from '@/lib/authMiddleware';
import { certificateRepository } from '@/lib/repositories/certificateRepository';
import { idParamSchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramVal = validateWithSchema(idParamSchema, params);
        if (!paramVal.success) return paramVal.errorResponse;
        const studentId = paramVal.data.id;

        const session = await getAuthenticatedSession(request);
        const roleAuth = authorizeRole(session, ['student', 'college', 'company']);
        if (!roleAuth.authorized) {
            return roleAuth.errorResponse;
        }

        if (session?.role === 'student') {
            const ownerAuth = await authorizeOwnership(session, studentId, 'student');
            if (!ownerAuth.authorized) {
                return ownerAuth.errorResponse;
            }
        }

        const certificates = await certificateRepository.findByStudentId(studentId);

        return NextResponse.json({
            success: true,
            studentId,
            totalCertificates: certificates.length,
            certificates
        });
    } catch (error) {
        console.error('[students-certificates-get] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
