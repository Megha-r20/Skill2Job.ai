/**
 * Skill2Job.ai Centralized Audit Trail Repository
 * Tracks security events, access control decisions, hiring actions, and administrative operations.
 */

const mockAuditLogs = [
    {
        id: 'audit_evt_101',
        timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
        action: 'RESOURCE_OWNERSHIP_BLOCKED',
        category: 'ACCESS_CONTROL',
        actor: {
            userId: 'u_student_3',
            name: 'Marcus Vance',
            role: 'student',
            email: 'marcus.vance@student.skill2job.ai',
            ipAddress: '198.51.100.42',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        targetResource: {
            type: 'Student',
            id: 'std_1',
            name: 'Alex Rivera'
        },
        status: 'BLOCKED',
        severity: 'HIGH',
        details: {
            reason: 'Access denied: student attempted to access foreign student profile records. Ownership guard failed closed.',
            endpoint: '/api/students/std_1/academic-report',
            method: 'GET'
        }
    },
    {
        id: 'audit_evt_102',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        action: 'INTERVIEW_SCHEDULED',
        category: 'HIRING',
        actor: {
            userId: 'u_comp_1',
            name: 'TechNova Recruitment Lead',
            role: 'company',
            email: 'recruiter@technova.com',
            ipAddress: '203.0.113.15',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        },
        targetResource: {
            type: 'Application',
            id: 'app_6',
            name: 'Alex Rivera'
        },
        status: 'SUCCESS',
        severity: 'LOW',
        details: {
            roundType: 'Round 1: Technical Coding & Architecture',
            scheduledDate: '2026-10-14',
            format: 'Google Meet',
            notificationSent: true,
            candidateEmail: 'alex.rivera@student.skill2job.ai'
        }
    },
    {
        id: 'audit_evt_103',
        timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
        action: 'CANDIDATE_SHORTLISTED',
        category: 'HIRING',
        actor: {
            userId: 'u_comp_1',
            name: 'TechNova Recruitment Lead',
            role: 'company',
            email: 'recruiter@technova.com',
            ipAddress: '203.0.113.15',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        },
        targetResource: {
            type: 'Application',
            id: 'app_4',
            name: 'Priya Sharma'
        },
        status: 'SUCCESS',
        severity: 'LOW',
        details: {
            matchPercentage: 88,
            verifiedSkills: ['React.js', 'Node.js', 'TypeScript'],
            notificationSent: true
        }
    },
    {
        id: 'audit_evt_104',
        timestamp: new Date(Date.now() - 75 * 60000).toISOString(),
        action: 'CERTIFICATE_ISSUED',
        category: 'VERIFICATION',
        actor: {
            userId: 'sys_proctor_engine',
            name: 'Skill2Job Proctored Assessment Engine',
            role: 'system',
            email: 'system@skill2job.ai',
            ipAddress: '127.0.0.1',
            userAgent: 'Internal-Worker/1.0'
        },
        targetResource: {
            type: 'Certificate',
            id: 'CERT-S2H-PY-2026-9921',
            name: 'Alex Rivera (Python 3 Mastery)'
        },
        status: 'SUCCESS',
        severity: 'LOW',
        details: {
            skillName: 'Python 3',
            score: 92,
            signatureAlgorithm: 'HMAC-SHA256',
            verificationUrl: '/certificates/CERT-S2H-PY-2026-9921'
        }
    },
    {
        id: 'audit_evt_105',
        timestamp: new Date(Date.now() - 110 * 60000).toISOString(),
        action: 'PLACEMENT_DRIVE_CREATED',
        category: 'CAMPUS_DRIVES',
        actor: {
            userId: 'u_col_1',
            name: 'Director of Placement & Training',
            role: 'college',
            email: 'placement@apex.edu',
            ipAddress: '198.51.100.88',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        targetResource: {
            type: 'PlacementDrive',
            id: 'drive_1',
            name: 'Google Cloud Platform On-Campus Drive'
        },
        status: 'SUCCESS',
        severity: 'LOW',
        details: {
            companyName: 'Google Cloud Platform',
            packageCtc: '₹18,00,000 - ₹24,00,000 / year',
            minCgpa: 8.0,
            departments: ['CSE', 'IT', 'AI&DS']
        }
    },
    {
        id: 'audit_evt_106',
        timestamp: new Date(Date.now() - 150 * 60000).toISOString(),
        action: 'MFA_OTP_VERIFIED',
        category: 'AUTH',
        actor: {
            userId: 'u_student_1',
            name: 'Alex Rivera',
            role: 'student',
            email: 'alex.rivera@student.skill2job.ai',
            ipAddress: '198.51.100.42',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)'
        },
        targetResource: {
            type: 'User',
            id: 'u_student_1',
            name: 'Alex Rivera'
        },
        status: 'SUCCESS',
        severity: 'LOW',
        details: {
            purpose: 'authentication',
            channel: 'email',
            attemptsUsed: 1
        }
    },
    {
        id: 'audit_evt_107',
        timestamp: new Date(Date.now() - 210 * 60000).toISOString(),
        action: 'SUSPICIOUS_TOKEN_SIGNATURE_BLOCKED',
        category: 'ACCESS_CONTROL',
        actor: {
            userId: 'anonymous',
            name: 'Unauthenticated Caller',
            role: 'anonymous',
            email: 'unknown',
            ipAddress: '203.0.113.199',
            userAgent: 'curl/7.88.1'
        },
        targetResource: {
            type: 'Session',
            id: 'token_tampered',
            name: 'Forged JWT Session Cookie'
        },
        status: 'BLOCKED',
        severity: 'CRITICAL',
        details: {
            reason: 'HMAC signature mismatch detected. Constant-time timing safe verification failed.',
            endpoint: '/api/admin/stats',
            method: 'GET'
        }
    },
    {
        id: 'audit_evt_108',
        timestamp: new Date(Date.now() - 320 * 60000).toISOString(),
        action: 'SYSTEM_BROADCAST_SENT',
        category: 'ADMIN',
        actor: {
            userId: 'u_admin_1',
            name: 'Global Administrator',
            role: 'admin',
            email: 'admin@skill2job.ai',
            ipAddress: '192.0.2.1',
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64)'
        },
        targetResource: {
            type: 'Notification',
            id: 'notif_broadcast_88',
            name: 'Upcoming Campus Placement Drive Announcement'
        },
        status: 'SUCCESS',
        severity: 'LOW',
        details: {
            recipientRoles: ['student', 'college'],
            totalDispatched: 2500,
            channel: 'in-app'
        }
    }
];

export const auditRepository = {
    /**
     * Retrieves audit events with multi-criteria filtering and pagination.
     */
    async findAll(params = {}) {
        let events = [...mockAuditLogs];

        if (params.category && params.category !== 'All') {
            events = events.filter(e => e.category.toLowerCase() === params.category.toLowerCase());
        }
        if (params.status && params.status !== 'All') {
            events = events.filter(e => e.status.toLowerCase() === params.status.toLowerCase());
        }
        if (params.severity && params.severity !== 'All') {
            events = events.filter(e => e.severity.toLowerCase() === params.severity.toLowerCase());
        }
        if (params.actorRole && params.actorRole !== 'All') {
            events = events.filter(e => e.actor.role.toLowerCase() === params.actorRole.toLowerCase());
        }
        if (params.search && params.search.trim()) {
            const q = params.search.toLowerCase().trim();
            events = events.filter(e =>
                e.action.toLowerCase().includes(q) ||
                (e.actor.name && e.actor.name.toLowerCase().includes(q)) ||
                (e.actor.email && e.actor.email.toLowerCase().includes(q)) ||
                (e.actor.ipAddress && e.actor.ipAddress.includes(q)) ||
                (e.targetResource.name && e.targetResource.name.toLowerCase().includes(q)) ||
                (e.details?.reason && e.details.reason.toLowerCase().includes(q))
            );
        }

        // Sort descending by timestamp
        events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return events;
    },

    /**
     * Finds audit event by ID.
     */
    async findById(id) {
        return mockAuditLogs.find(e => e.id === id) || null;
    },

    /**
     * Records a new audit event.
     */
    async recordEvent(eventData) {
        const newEvent = {
            id: `audit_evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: eventData.timestamp || new Date().toISOString(),
            action: eventData.action || 'SYSTEM_ACTION',
            category: eventData.category || 'SYSTEM',
            actor: {
                userId: eventData.actor?.userId || 'system',
                name: eventData.actor?.name || 'System Service',
                role: eventData.actor?.role || 'system',
                email: eventData.actor?.email || 'system@skill2job.ai',
                ipAddress: eventData.actor?.ipAddress || '127.0.0.1',
                userAgent: eventData.actor?.userAgent || 'Skill2Job-Agent'
            },
            targetResource: {
                type: eventData.targetResource?.type || 'System',
                id: eventData.targetResource?.id || 'sys_resource',
                name: eventData.targetResource?.name || 'General Resource'
            },
            status: eventData.status || 'SUCCESS',
            severity: eventData.severity || 'LOW',
            details: eventData.details || {}
        };

        // Prepend to audit log
        mockAuditLogs.unshift(newEvent);
        return newEvent;
    },

    /**
     * Returns aggregate KPI statistics for admin audit dashboard.
     */
    async getStatistics() {
        const totalEvents = mockAuditLogs.length;
        const blockedCount = mockAuditLogs.filter(e => e.status === 'BLOCKED').length;
        const warningCount = mockAuditLogs.filter(e => e.status === 'WARNING').length;
        const criticalCount = mockAuditLogs.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length;

        const categoryCounts = {};
        mockAuditLogs.forEach(e => {
            categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
        });

        return {
            totalEvents,
            blockedCount,
            warningCount,
            criticalCount,
            categoryCounts
        };
    },

    /**
     * Exports audit trail as RFC 4180 CSV matrix.
     */
    async getExportData(params = {}) {
        const events = await this.findAll(params);
        const headers = [
            'Event ID',
            'Timestamp (ISO)',
            'Action',
            'Category',
            'Actor Name',
            'Actor Role',
            'Actor Email',
            'IP Address',
            'Resource Type',
            'Resource Name',
            'Status',
            'Severity',
            'Details Summary'
        ];

        const rows = events.map(e => [
            e.id,
            e.timestamp,
            e.action,
            e.category,
            e.actor.name,
            e.actor.role,
            e.actor.email,
            e.actor.ipAddress,
            e.targetResource.type,
            e.targetResource.name,
            e.status,
            e.severity,
            typeof e.details === 'object' ? JSON.stringify(e.details) : String(e.details || '')
        ]);

        return { headers, rows, count: rows.length };
    }
};
