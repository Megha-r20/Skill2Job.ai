import { captureException, captureMessage, addBreadcrumb, flush } from '@sentry/core';

/**
 * List of sensitive key substrings that must be redacted from log payloads.
 */
const SENSITIVE_KEYS = [
    'password',
    'secret',
    'token',
    'apikey',
    'api_key',
    'authorization',
    'cookie',
    'creditcard',
    'cardnumber',
    'cvv',
    'hash',
    'otp',
    'otphash'
];

/**
 * Recursively redacts sensitive keys and values from objects before logging or sending to Sentry.
 */
export function sanitizeContext(data, depth = 0) {
    if (!data || depth > 5) return data;
    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) {
        return data.map(item => sanitizeContext(item, depth + 1));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_KEYS.some(k => lowerKey.includes(k));

        if (isSensitive) {
            sanitized[key] = '[REDACTED]';
        } else if (value && typeof value === 'object') {
            sanitized[key] = sanitizeContext(value, depth + 1);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
}

/**
 * Log levels with numeric priority
 */
const LOG_LEVELS = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
};

class Logger {
    constructor() {
        const envLevel = (process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'warn' : 'info')).toLowerCase();
        this.currentLevelPriority = LOG_LEVELS[envLevel] || LOG_LEVELS.info;
        this.isProduction = process.env.NODE_ENV === 'production';
        this.isTest = process.env.NODE_ENV === 'test';
    }

    shouldLog(level) {
        return (LOG_LEVELS[level] || 20) >= this.currentLevelPriority;
    }

    _formatOutput(level, message, context = null) {
        const timestamp = new Date().toISOString();
        if (this.isProduction) {
            const logObject = {
                timestamp,
                level,
                message,
                ...(context ? { context: sanitizeContext(context) } : {})
            };
            return JSON.stringify(logObject);
        }

        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        if (!context || Object.keys(context).length === 0) {
            return `${prefix} ${message}`;
        }
        return `${prefix} ${message} ${JSON.stringify(sanitizeContext(context))}`;
    }

    /**
     * Debug level logging for verbose developer diagnostic tracing.
     */
    debug(message, context = {}) {
        if (!this.shouldLog('debug')) return;
        const formatted = this._formatOutput('debug', message, context);
        console.debug(formatted);

        try {
            addBreadcrumb({
                category: context?.category || 'debug',
                message,
                level: 'debug',
                data: sanitizeContext(context)
            });
        } catch (_) {}
    }

    /**
     * Info level logging for application events, performance checkpoints, and metrics.
     */
    info(message, context = {}) {
        if (!this.shouldLog('info')) return;
        const formatted = this._formatOutput('info', message, context);
        console.info(formatted);

        try {
            addBreadcrumb({
                category: context?.category || 'info',
                message,
                level: 'info',
                data: sanitizeContext(context)
            });
        } catch (_) {}
    }

    /**
     * Warning level logging for non-fatal irregularities, degradation, and fallback triggers.
     */
    warn(message, context = {}) {
        if (!this.shouldLog('warn')) return;
        const formatted = this._formatOutput('warn', message, context);
        console.warn(formatted);

        try {
            addBreadcrumb({
                category: context?.category || 'warning',
                message,
                level: 'warning',
                data: sanitizeContext(context)
            });
        } catch (_) {}
    }

    /**
     * Error level logging. Outputs formatted error and captures exception in Sentry with full stack and metadata.
     *
     * @param {string} message - High-level error description
     * @param {Error|any} [errorOrContext] - The caught Error object or contextual metadata
     * @param {Object} [additionalContext] - Context metadata if error was passed as 2nd param
     */
    error(message, errorOrContext = null, additionalContext = {}) {
        let err = null;
        let context = {};

        if (errorOrContext instanceof Error) {
            err = errorOrContext;
            context = additionalContext || {};
        } else if (typeof errorOrContext === 'object' && errorOrContext !== null) {
            context = errorOrContext;
            if (context.error instanceof Error) {
                err = context.error;
            }
        } else if (typeof errorOrContext === 'string') {
            err = new Error(errorOrContext);
            context = additionalContext || {};
        }

        const safeContext = sanitizeContext({
            ...context,
            errorMessage: err?.message,
            stack: err?.stack
        });

        const formatted = this._formatOutput('error', message, safeContext);
        console.error(formatted);

        // Send to Sentry
        try {
            if (err) {
                captureException(err, {
                    extra: safeContext,
                    tags: {
                        source: context?.source || 'Skill2Job.ai',
                        route: context?.route || 'unknown'
                    }
                });
            } else {
                captureMessage(message, {
                    level: 'error',
                    extra: safeContext
                });
            }
        } catch (sentryErr) {
            // Never crash application if Sentry telemetry encounters an issue
            if (!this.isTest) {
                console.warn('[Logger] Sentry capture error:', sentryErr.message);
            }
        }
    }

    /**
     * Audit trail logging for compliance, auth milestones, and access control.
     */
    audit(action, actor = 'System', details = {}) {
        const safeDetails = sanitizeContext(details);
        const logEntry = {
            category: 'AUDIT',
            action,
            actor,
            ...safeDetails
        };
        const formatted = this._formatOutput('info', `🛡️ [AUDIT] ${action} by ${actor}`, logEntry);
        console.info(formatted);

        try {
            addBreadcrumb({
                category: 'audit',
                message: `Audit: ${action} by ${actor}`,
                level: 'info',
                data: logEntry
            });
        } catch (_) {}
    }

    /**
     * Flush Sentry events
     */
    async flush(timeout = 2000) {
        try {
            return await flush(timeout);
        } catch (_) {
            return false;
        }
    }
}

export const logger = new Logger();
