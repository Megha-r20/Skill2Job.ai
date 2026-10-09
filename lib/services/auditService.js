import { auditRepository } from '../repositories/auditRepository.js';

export const auditService = {
    /**
     * Sanitizes payload and writes an event to the centralized audit repository.
     */
    async logEvent({
        action,
        category = 'SYSTEM',
        actor = {},
        targetResource = {},
        status = 'SUCCESS',
        severity = 'LOW',
        details = {},
        request = null
    }) {
        // Extract network metadata if NextRequest was provided
        let ipAddress = actor.ipAddress || '127.0.0.1';
        let userAgent = actor.userAgent || 'WebBrowser';

        if (request) {
            ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                        request.headers.get('x-real-ip') || ipAddress;
            userAgent = request.headers.get('user-agent') || userAgent;
        }

        // Sanitize details to guarantee zero credential leakage
        const sanitizedDetails = { ...details };
        delete sanitizedDetails.password;
        delete sanitizedDetails.otp;
        delete sanitizedDetails.code;
        delete sanitizedDetails.token;
        delete sanitizedDetails.passwordHash;
        delete sanitizedDetails.otpHash;
        delete sanitizedDetails.secret;

        const eventData = {
            action,
            category,
            actor: {
                userId: actor.userId || 'system',
                name: actor.name || 'System Actor',
                role: actor.role || 'system',
                email: actor.email || 'system@skill2job.ai',
                ipAddress,
                userAgent
            },
            targetResource: {
                type: targetResource.type || 'System',
                id: targetResource.id || 'sys_id',
                name: targetResource.name || 'General Resource'
            },
            status,
            severity,
            details: sanitizedDetails
        };

        const recorded = await auditRepository.recordEvent(eventData);

        // Console log for stdout monitoring
        const logSymbol = status === 'BLOCKED' ? '🚫' : status === 'WARNING' ? '⚠️' : '🛡️';
        console.log(`${logSymbol} [AUDIT TRAIL] ${recorded.timestamp} | ${action} | Status: ${status} | Actor: ${recorded.actor.role}:${recorded.actor.name}`);

        return recorded;
    },

    /**
     * Retrieves audit logs for admin viewing with filters and search.
     */
    async getAuditTrail(params = {}) {
        return auditRepository.findAll(params);
    },

    /**
     * Retrieves high-level KPI metrics for the audit dashboard.
     */
    async getAuditStatistics() {
        return auditRepository.getStatistics();
    },

    /**
     * Generates exportable matrix for CSV / JSON compliance export.
     */
    async getExportData(params = {}) {
        return auditRepository.getExportData(params);
    }
};
