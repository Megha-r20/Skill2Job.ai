/**
 * Cryptographic Magic Bytes (File Signature) Validator
 *
 * Verifies the actual binary content of uploaded files to prevent
 * MIME spoofing, extension renaming, and arbitrary file upload vulnerabilities.
 */

/**
 * Detect MIME type from raw binary magic bytes.
 * @param {Buffer|Uint8Array} buffer - The raw binary buffer of the file.
 * @returns {string|null} - Detected MIME type or null if unrecognized.
 */
export function detectMimeTypeFromMagicBytes(buffer) {
    if (!buffer || buffer.length < 4) {
        return null;
    }

    // PDF signature: %PDF- (0x25, 0x50, 0x44, 0x46)
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        return 'application/pdf';
    }

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (buffer.length >= 8 &&
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
        buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
        return 'image/png';
    }

    // JPEG signature: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return 'image/jpeg';
    }

    // WebP signature: RIFF .... WEBP
    if (buffer.length >= 12 &&
        buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
        buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
        return 'image/webp';
    }

    return null;
}

/**
 * Validates that the uploaded buffer strictly matches allowed MIME types based on magic bytes.
 * @param {Buffer|Uint8Array} buffer - The raw binary buffer
 * @param {string[]} allowedMimes - Array of allowed MIME types (e.g. ['application/pdf'])
 * @returns {{ valid: boolean, detectedMime: string|null, error?: string }}
 */
export function validateFileMagicBytes(buffer, allowedMimes = ['application/pdf']) {
    const detectedMime = detectMimeTypeFromMagicBytes(buffer);

    if (!detectedMime) {
        return {
            valid: false,
            detectedMime: null,
            error: 'Invalid file signature. File header does not match any recognized secure binary signature.'
        };
    }

    if (!allowedMimes.includes(detectedMime)) {
        return {
            valid: false,
            detectedMime,
            error: `File signature detected as '${detectedMime}', which is not an allowed format (${allowedMimes.join(', ')}).`
        };
    }

    return {
        valid: true,
        detectedMime
    };
}
