import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Cryptographically verify Google ID Token using Google's public certificates.
 * Ensures the token is legitimately signed by Google, has not expired,
 * matches the client audience (if configured), and that email_verified is true.
 *
 * @param {string} idToken - The Google ID token received from the client
 * @returns {Promise<{success: boolean, email?: string, name?: string, picture?: string, sub?: string, error?: string}>}
 */
export async function verifyGoogleIdToken(idToken) {
    if (!idToken || typeof idToken !== 'string') {
        return { success: false, error: 'Google ID token (googleCredential) is required.' };
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID || undefined
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return { success: false, error: 'Invalid Google token payload.' };
        }

        // Verify issuer
        const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
        if (!validIssuers.includes(payload.iss)) {
            return { success: false, error: 'Untrusted Google token issuer.' };
        }

        // Verify email presence
        if (!payload.email) {
            return { success: false, error: 'Google ID token does not contain an email address.' };
        }

        // Verify email is verified by Google
        if (payload.email_verified !== true) {
            return { success: false, error: 'Google email address is not verified.' };
        }

        return {
            success: true,
            email: payload.email.toLowerCase(),
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture,
            sub: payload.sub
        };
    } catch (err) {
        return {
            success: false,
            error: err.message || 'Cryptographic verification of Google ID token failed.'
        };
    }
}
