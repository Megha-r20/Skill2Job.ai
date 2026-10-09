import { NextResponse } from 'next/server';
import { certificateRepository } from '@/lib/repositories/certificateRepository';
import { idParamSchema, validateWithSchema } from '@/lib/validations';

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramValidation = validateWithSchema(idParamSchema, params);
        if (!paramValidation.success) {
            return paramValidation.errorResponse;
        }

        const certId = paramValidation.data.id;
        const cert = await certificateRepository.findByCertificateNumber(certId);

        if (!cert) {
            return NextResponse.json({
                success: false,
                error: `Certificate with reference "${certId}" was not found in the official registry.`
            }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
        }

        const isAuthentic = certificateRepository.verifySignature(cert);

        return NextResponse.json({
            success: true,
            certificate: {
                ...cert,
                isAuthentic,
                tamperProofGuarantee: isAuthentic 
                    ? 'Cryptographic HMAC-SHA256 digital signature verified against central keystore.'
                    : 'SIGNATURE_MISMATCH: Potential credential modification detected.'
            }
        }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
