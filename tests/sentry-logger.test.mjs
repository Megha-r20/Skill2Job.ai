import { describe, it } from 'node:test';
import assert from 'node:assert';
import { logger, sanitizeContext } from '../lib/logger.js';

describe('Sentry Logger & Redaction Telemetry Suite', () => {
    describe('1. Sensitive Information Redaction & Sanitization', () => {
        it('redacts sensitive keys including passwords, tokens, secrets, and api keys', () => {
            const rawPayload = {
                user: 'alex_rivera',
                email: 'alex@example.com',
                password: 'superSecretPassword123!',
                apiKey: 'AIzaSyD-sampleGeminiApiKey',
                jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig',
                metadata: {
                    otpCode: '123456',
                    creditCardNumber: '4111-2222-3333-4444',
                    serverRole: 'production-worker'
                }
            };

            const sanitized = sanitizeContext(rawPayload);

            assert.strictEqual(sanitized.user, 'alex_rivera');
            assert.strictEqual(sanitized.email, 'alex@example.com');
            assert.strictEqual(sanitized.password, '[REDACTED]');
            assert.strictEqual(sanitized.apiKey, '[REDACTED]');
            assert.strictEqual(sanitized.jwtToken, '[REDACTED]');
            assert.strictEqual(sanitized.metadata.otpCode, '[REDACTED]');
            assert.strictEqual(sanitized.metadata.creditCardNumber, '[REDACTED]');
            assert.strictEqual(sanitized.metadata.serverRole, 'production-worker');
        });

        it('handles null, undefined, and non-object primitives gracefully', () => {
            assert.strictEqual(sanitizeContext(null), null);
            assert.strictEqual(sanitizeContext(undefined), undefined);
            assert.strictEqual(sanitizeContext('string-primitive'), 'string-primitive');
            assert.strictEqual(sanitizeContext(12345), 12345);
        });

        it('sanitizes arrays of objects recursively', () => {
            const list = [
                { id: 1, userToken: 'tok_abc' },
                { id: 2, userToken: 'tok_xyz' }
            ];
            const sanitizedList = sanitizeContext(list);

            assert.strictEqual(sanitizedList[0].id, 1);
            assert.strictEqual(sanitizedList[0].userToken, '[REDACTED]');
            assert.strictEqual(sanitizedList[1].id, 2);
            assert.strictEqual(sanitizedList[1].userToken, '[REDACTED]');
        });
    });

    describe('2. Structured Logger Operations with Sentry Telemetry', () => {
        it('executes logger.info without errors', () => {
            assert.doesNotThrow(() => {
                logger.info('System performance checkpoint', { metric: 'cpu', value: 34 });
            });
        });

        it('executes logger.warn without errors', () => {
            assert.doesNotThrow(() => {
                logger.warn('Upstash Redis fallback triggered', { reason: 'Offline test environment' });
            });
        });

        it('captures errors with Error instances and contextual metadata', () => {
            assert.doesNotThrow(() => {
                const sampleErr = new Error('Database connection reset');
                logger.error('Failed to execute query', sampleErr, {
                    route: '/api/students',
                    queryTimeMs: 120
                });
            });
        });

        it('captures errors when passed as error objects or strings', () => {
            assert.doesNotThrow(() => {
                logger.error('Unexpected token parse failure', { error: new TypeError('Invalid JSON') });
            });

            assert.doesNotThrow(() => {
                logger.error('Plain error message without object');
            });
        });

        it('executes logger.debug and logger.audit with proper formatting', () => {
            assert.doesNotThrow(() => {
                logger.debug('Tracing AI token generation payload', { promptTokens: 350 });
            });

            assert.doesNotThrow(() => {
                logger.audit('USER_ROLE_ELEVATION', 'admin_1', {
                    targetUserId: 'u_student_1',
                    newRole: 'college_admin'
                });
            });
        });
    });
});
