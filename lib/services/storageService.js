import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { validateFileMagicBytes, detectMimeTypeFromMagicBytes } from '@/lib/utils/fileValidation';

function getJwtSecret() {
    return (process.env.JWT_SECRET || '').trim();
}

/**
 * Check if AWS S3 (or Supabase S3-compatible storage) is configured
 */
function getS3Client() {
    const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const endpoint = process.env.S3_ENDPOINT;

    if (!bucket || !accessKeyId || !secretAccessKey) {
        return null;
    }

    const clientConfig = {
        region,
        credentials: {
            accessKeyId,
            secretAccessKey
        }
    };

    if (endpoint) {
        clientConfig.endpoint = endpoint;
        clientConfig.forcePathStyle = true; // Required for Supabase / MinIO
    }

    return {
        client: new S3Client(clientConfig),
        bucket
    };
}

/**
 * Check if Vercel Blob is configured
 */
function isVercelBlobConfigured() {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Generates an unpredictable cryptographic storage key
 */
export function generateSecureStorageKey(folder = 'resumes', extension = 'pdf') {
    const randomUuid = crypto.randomUUID();
    const timestamp = Date.now();
    const cleanExt = extension.replace(/^\./, '').toLowerCase() || 'bin';
    return `${folder}/${randomUuid}-${timestamp}.${cleanExt}`;
}

/**
 * Generates a signed URL for a local private storage file using HMAC-SHA256
 */
export function signLocalDownloadUrl(storageKey, expiresInSeconds = 3600) {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const secret = getJwtSecret();
    const dataToSign = `${storageKey}:${expiresAt}`;
    const signature = crypto
        .createHmac('sha256', secret)
        .update(dataToSign)
        .digest('hex');

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    return `${appUrl}/api/storage/file?key=${encodeURIComponent(storageKey)}&expires=${expiresAt}&sig=${signature}`;
}

/**
 * Verifies the HMAC-SHA256 signature and expiration of a local storage signed URL
 */
export function verifyLocalSignedUrl(storageKey, expiresAt, signature) {
    try {
        if (!storageKey || !expiresAt || !signature) return false;

        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (Number(expiresAt) < currentTimestamp) {
            return false; // Expired
        }

        const secret = getJwtSecret();
        const dataToSign = `${storageKey}:${expiresAt}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(dataToSign)
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (e) {
        return false;
    }
}

export const storageService = {
    /**
     * Upload a file securely with magic bytes inspection, non-guessable storage key, and signed URL.
     * @param {Object} params
     * @param {Buffer} params.buffer - Raw binary file buffer
     * @param {string} params.originalName - Name of the file as submitted
     * @param {string[]} params.allowedMimes - Allowed MIME types according to magic bytes
     * @param {string} params.folder - Storage folder (e.g. 'resumes', 'documents')
     * @param {number} [params.expiresInSeconds=3600] - Duration for signed URL in seconds
     */
    async upload({ buffer, originalName = 'file.pdf', allowedMimes = ['application/pdf'], folder = 'resumes', expiresInSeconds = 3600 }) {
        // 1. Verify binary magic bytes
        const validation = validateFileMagicBytes(buffer, allowedMimes);
        if (!validation.valid) {
            throw new Error(validation.error || 'Invalid file format based on magic bytes.');
        }

        const mimeType = validation.detectedMime;
        const extensionMap = {
            'application/pdf': 'pdf',
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/webp': 'webp'
        };
        const ext = extensionMap[mimeType] || 'bin';
        const storageKey = generateSecureStorageKey(folder, ext);

        // 2. Upload to S3 / Supabase if configured
        const s3Config = getS3Client();
        if (s3Config) {
            const { client, bucket } = s3Config;
            await client.send(new PutObjectCommand({
                Bucket: bucket,
                Key: storageKey,
                Body: buffer,
                ContentType: mimeType,
                Metadata: {
                    originalName: encodeURIComponent(originalName)
                }
            }));

            // Generate presigned download URL
            const getCmd = new GetObjectCommand({
                Bucket: bucket,
                Key: storageKey
            });
            const signedUrl = await getSignedUrl(client, getCmd, { expiresIn: expiresInSeconds });

            return {
                provider: 's3',
                key: storageKey,
                signedUrl,
                mimeType,
                size: buffer.length
            };
        }

        // 3. Upload to Vercel Blob if configured
        if (isVercelBlobConfigured()) {
            try {
                const { put } = await import('@vercel/blob');
                const blob = await put(storageKey, buffer, {
                    access: 'public', // Or private if configured with vercel blob credentials
                    contentType: mimeType
                });
                return {
                    provider: 'vercel-blob',
                    key: storageKey,
                    signedUrl: blob.url,
                    mimeType,
                    size: buffer.length
                };
            } catch (blobErr) {
                console.warn('[storageService] Vercel Blob upload failed, falling back to secure private storage:', blobErr.message);
            }
        }

        // 4. Secure Private Local Storage (Outside public/ directory, accessed via HMAC signed URL)
        const privateStorageDir = path.join(process.cwd(), 'storage', 'private_uploads');
        const targetDir = path.join(privateStorageDir, folder);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(privateStorageDir, storageKey);
        fs.writeFileSync(filePath, buffer);

        const signedUrl = signLocalDownloadUrl(storageKey, expiresInSeconds);

        return {
            provider: 'private-local',
            key: storageKey,
            signedUrl,
            mimeType,
            size: buffer.length
        };
    },

    /**
     * Generate a fresh signed URL for an existing storage key
     */
    async getSignedUrl(storageKey, expiresInSeconds = 3600) {
        const s3Config = getS3Client();
        if (s3Config) {
            const { client, bucket } = s3Config;
            const getCmd = new GetObjectCommand({
                Bucket: bucket,
                Key: storageKey
            });
            return await getSignedUrl(client, getCmd, { expiresIn: expiresInSeconds });
        }

        return signLocalDownloadUrl(storageKey, expiresInSeconds);
    },

    /**
     * Retrieve the file buffer from private storage
     */
    async getFile(storageKey) {
        // Prevent directory traversal attacks
        const normalizedKey = path.normalize(storageKey).replace(/^(\.\.[\/\\])+/, '');

        const s3Config = getS3Client();
        if (s3Config) {
            const { client, bucket } = s3Config;
            const res = await client.send(new GetObjectCommand({
                Bucket: bucket,
                Key: normalizedKey
            }));
            const byteArray = await res.Body.transformToByteArray();
            return {
                buffer: Buffer.from(byteArray),
                contentType: res.ContentType || 'application/octet-stream'
            };
        }

        const privateStorageDir = path.join(process.cwd(), 'storage', 'private_uploads');
        const filePath = path.join(privateStorageDir, normalizedKey);

        // Security check: Ensure file resides strictly inside privateStorageDir
        if (!filePath.startsWith(privateStorageDir)) {
            throw new Error('Access denied: Illegal file path traversal attempt.');
        }

        if (!fs.existsSync(filePath)) {
            return null;
        }

        const buffer = fs.readFileSync(filePath);
        const mimeType = detectMimeTypeFromMagicBytes(buffer) || 'application/octet-stream';
        return {
            buffer,
            contentType: mimeType
        };
    }
};
