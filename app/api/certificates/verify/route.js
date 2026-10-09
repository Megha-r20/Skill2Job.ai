import { NextResponse } from 'next/server';
import { certificateRepository } from '@/lib/repositories/certificateRepository';
import { certificateVerifyQuerySchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const certificateNumber = body.certificateNumber || body.id || body.code;
        const validation = validateWithSchema(certificateVerifyQuerySchema, { certificateNumber });
        if (!validation.success) {
            return validation.errorResponse;
        }

        const cert = await certificateRepository.findByCertificateNumber(certificateNumber);

        if (!cert) {
            return NextResponse.json({
                success: false,
                status: 'NOT_FOUND',
                message: `Certificate "${certificateNumber}" is not registered in the Skill2Hire registry.`
            }, { status: 404 });
        }

        const isAuthentic = certificateRepository.verifySignature(cert);

        return NextResponse.json({
            success: true,
            status: isAuthentic ? 'VERIFIED_AUTHENTIC' : 'FAILED_SIGNATURE',
            certificateNumber: cert.certificateNumber,
            candidate: {
                name: cert.studentName,
                college: cert.collegeName
            },
            credential: {
                skill: cert.skillName,
                level: cert.level,
                score: cert.score,
                issuedDate: cert.issuedDate,
                proctoringStatus: cert.proctoringStatus
            },
            issuer: cert.issuer,
            isAuthentic,
            verificationHash: cert.verificationHash,
            verifiedAt: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
