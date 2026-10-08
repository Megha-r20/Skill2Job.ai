import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectMimeTypeFromMagicBytes, validateFileMagicBytes } from '../lib/utils/fileValidation.js';

describe('File Security & Magic Bytes Validation', () => {
    it('detects valid PDF magic bytes correctly', () => {
        const pdfBuffer = Buffer.from('%PDF-1.4 sample content');
        const mime = detectMimeTypeFromMagicBytes(pdfBuffer);
        assert.equal(mime, 'application/pdf');

        const validation = validateFileMagicBytes(pdfBuffer, ['application/pdf']);
        assert.equal(validation.valid, true);
        assert.equal(validation.detectedMime, 'application/pdf');
    });

    it('detects valid PNG magic bytes correctly', () => {
        const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
        const mime = detectMimeTypeFromMagicBytes(pngBuffer);
        assert.equal(mime, 'image/png');
    });

    it('detects valid JPEG magic bytes correctly', () => {
        const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
        const mime = detectMimeTypeFromMagicBytes(jpegBuffer);
        assert.equal(mime, 'image/jpeg');
    });

    it('rejects spoofed files (e.g. executable or text file renamed to .pdf)', () => {
        const fakePdf = Buffer.from('MZ\x90\x00\x03\x00\x00\x00'); // Windows PE executable header
        const validation = validateFileMagicBytes(fakePdf, ['application/pdf']);
        assert.equal(validation.valid, false);
        assert(validation.error.includes('Invalid file signature'));
    });

    it('rejects files with unauthorized MIME types', () => {
        const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        // Upload endpoint only allows application/pdf for resumes
        const validation = validateFileMagicBytes(pngBuffer, ['application/pdf']);
        assert.equal(validation.valid, false);
        assert.equal(validation.detectedMime, 'image/png');
        assert(validation.error.includes('not an allowed format'));
    });
});
