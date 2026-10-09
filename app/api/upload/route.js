import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/authMiddleware';
import { storageService } from '@/lib/services/storageService';
import { validateFileMagicBytes } from '@/lib/utils/fileValidation';

/**
 * POST /api/upload
 * Validates magic bytes, checks file limits, and stores authenticated uploads.
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Authentication required to upload files.' }, { status: 401 });
        }
        const formData = await request.formData();
        const file = formData.get('file');
        const uploadType = formData.get('type') || 'document'; // 'resume' | 'logo' | 'document'
        if (!file) {
            return NextResponse.json({ success: false, error: 'No file payload provided in request.' }, { status: 400 });
        }
        // Validate file size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ success: false, error: 'File size exceeds maximum allowed limit of 5MB.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Validate Magic Bytes according to upload type
        let allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
        if (uploadType === 'resume') {
            allowedMimes = ['application/pdf'];
        } else if (uploadType === 'logo') {
            allowedMimes = ['image/png', 'image/jpeg', 'image/webp'];
        }

        const magicValidation = validateFileMagicBytes(buffer, allowedMimes);
        if (!magicValidation.valid) {
            return NextResponse.json({
                success: false,
                error: magicValidation.error
            }, { status: 400 });
        }

        const uploadResult = await storageService.upload({
            buffer,
            originalName: file.name || 'uploaded_file',
            allowedMimes,
            folder: uploadType === 'resume' ? 'resumes' : (uploadType === 'logo' ? 'logos' : 'documents')
        });

        return NextResponse.json({
            success: true,
            fileId: uploadResult.key,
            originalName: file.name || 'uploaded_file',
            sizeBytes: buffer.length,
            mimeType: uploadResult.mimeType,
            url: uploadResult.signedUrl,
            provider: uploadResult.provider,
            uploadedAt: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json({ success: false, error: error.message || 'File upload failed.' }, { status: 500 });
    }
}
