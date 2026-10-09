/**
 * Skill2Job.ai Centralized Zod Validation Schemas & Route Helpers
 * Enforces strict runtime validation and type safety across all platform endpoints.
 */

import { z } from 'zod';
import { NextResponse } from 'next/server';

// -------------------------------------------------------------
// Validation Helper Utilities
// -------------------------------------------------------------

/**
 * Validates arbitrary payload against a Zod schema
 * @param {z.ZodSchema} schema
 * @param {any} data
 * @returns {{ success: boolean, data?: any, errorResponse?: NextResponse }}
 */
export function validateWithSchema(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        return {
            success: false,
            errorResponse: NextResponse.json({
                error: 'Validation failed',
                details: result.error.format()
            }, { status: 400 })
        };
    }
    return {
        success: true,
        data: result.data
    };
}

/**
 * Extracts and parses search parameters from request URL against a Zod schema
 * @param {z.ZodSchema} schema
 * @param {URLSearchParams | Request | string} requestOrParams
 * @returns {{ success: boolean, data?: any, errorResponse?: NextResponse }}
 */
export function validateQueryParams(schema, requestOrParams) {
    let paramsObj = {};
    if (typeof requestOrParams === 'string') {
        const url = new URL(requestOrParams, 'http://localhost');
        paramsObj = Object.fromEntries(url.searchParams.entries());
    } else if (requestOrParams && requestOrParams.url) {
        const url = new URL(requestOrParams.url, 'http://localhost');
        paramsObj = Object.fromEntries(url.searchParams.entries());
    } else if (requestOrParams instanceof URLSearchParams) {
        paramsObj = Object.fromEntries(requestOrParams.entries());
    } else if (typeof requestOrParams === 'object' && requestOrParams !== null) {
        paramsObj = requestOrParams;
    }

    return validateWithSchema(schema, paramsObj);
}

// -------------------------------------------------------------
// Common Parameter Schemas
// -------------------------------------------------------------
export const idParamSchema = z.object({
    id: z.string().min(1, 'Resource ID is required')
});

export const driveIdParamSchema = z.object({
    id: z.string().min(1, 'College ID is required'),
    driveId: z.string().min(1, 'Drive ID is required')
});

// -------------------------------------------------------------
// 1. Authentication Schemas
// -------------------------------------------------------------
export const registerSchema = z.object({
    role: z.enum(['student', 'college', 'company']),
    email: z.string().email(),
    password: z.string().min(6).optional(),
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    isGoogleAuth: z.boolean().optional(),
    googleCredential: z.string().optional(),
    collegeName: z.string().optional(),
    department: z.string().optional(),
    graduationYear: z.union([z.string(), z.number()]).optional(),
    companyName: z.string().optional()
});

export const loginSchema = z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    identifier: z.string().optional(),
    password: z.string().optional(),
    otp: z.string().min(4).max(8).optional(),
    googleCredential: z.string().optional(),
    isGoogleAuth: z.boolean().optional(),
}).refine(data => data.email || data.phone || data.identifier || data.googleCredential, {
    message: "Either email, phone, or identity token is required."
});

export const otpSendSchema = z.object({
    identifier: z.string().min(1, 'Valid email or phone number is required'),
    type: z.enum(['email', 'phone']).optional(),
    purpose: z.string().optional().default('registration'),
    name: z.string().optional().default('Skill2Job User')
});

export const otpVerifySchema = z.object({
    identifier: z.string().min(1, 'Identifier is required'),
    code: z.string().min(4, 'Verification code is required'),
    purpose: z.string().optional().default('registration')
});

export const forgotPasswordSchema = z.object({
    identifier: z.string().min(1, 'Email address or Phone number is required')
});

export const resetPasswordSchema = z.object({
    identifier: z.string().min(1, 'Identifier is required'),
    code: z.string().min(4, 'Verification code is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().optional()
}).refine(data => !data.confirmPassword || data.newPassword === data.confirmPassword, {
    message: "Passwords do not match."
});

export const updateContactSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    phone: z.string().optional(),
    email: z.string().email().optional()
});

// -------------------------------------------------------------
// 2. Resume & AI Tool Schemas
// -------------------------------------------------------------
export const atsScoreSchema = z.object({
    resumeText: z.string().min(1, 'Resume text is required'),
    jobDescription: z.string().optional().default('')
});

export const rewriteBulletSchema = z.object({
    bulletText: z.string().min(1, 'Bullet point text is required'),
    targetRole: z.string().optional().default('Software Developer'),
    targetSkill: z.string().optional().default('General Engineering')
});

export const resumeBuilderQuerySchema = z.object({
    studentId: z.string().optional().default('std_1'),
    template: z.string().optional().default('modern')
});

export const extractSkillsSchema = z.object({
    description: z.string().min(1, 'Job description text is required')
});

export const interviewEvaluateSchema = z.object({
    questionId: z.string().optional().default('iq_custom'),
    questionText: z.string().min(1, 'questionText is required'),
    answerText: z.string().min(1, 'answerText is required'),
    category: z.string().optional().default('Technical'),
    studentId: z.string().optional()
});

export const interviewQuestionsQuerySchema = z.object({
    role: z.string().optional().default('Software Developer'),
    category: z.string().optional()
});

// -------------------------------------------------------------
// 3. Assessment & Coding Schemas
// -------------------------------------------------------------
export const assessmentSubmitSchema = z.object({
    studentId: z.string().min(1, 'studentId is required'),
    answers: z.union([z.record(z.any()), z.array(z.any())]),
    tabSwitches: z.union([z.number(), z.string()]).optional().default(0),
    fullscreenExits: z.union([z.number(), z.string()]).optional().default(0),
    timeSpentSeconds: z.union([z.number(), z.string()]).optional().default(0)
});

export const codingSubmitSchema = z.object({
    problemId: z.string().min(1, 'problemId is required'),
    code: z.string().min(1, 'code is required'),
    language: z.string().optional().default('javascript'),
    studentId: z.string().optional()
});

export const codingProblemsQuerySchema = z.object({
    difficulty: z.string().optional(),
    category: z.string().optional()
});

// -------------------------------------------------------------
// 4. Verification & Certificates
// -------------------------------------------------------------
export const certificateVerifyQuerySchema = z.object({
    certificateNumber: z.string().min(1, 'certificateNumber is required')
});

// -------------------------------------------------------------
// 5. College & Placement Drives
// -------------------------------------------------------------
export const placementDriveCreateSchema = z.object({
    companyId: z.string().optional(),
    companyName: z.string().min(1, 'companyName is required'),
    jobTitle: z.string().min(1, 'jobTitle is required'),
    packageLpa: z.union([z.number(), z.string()]).optional().default(6),
    minCgpa: z.union([z.number(), z.string()]).optional().default(6.5),
    eligibleBranches: z.union([z.array(z.string()), z.string()]).optional().default([]),
    driveDate: z.string().min(1, 'driveDate is required'),
    deadline: z.string().optional(),
    rounds: z.array(z.string()).optional(),
    status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional().default('UPCOMING'),
    totalOpenings: z.union([z.number(), z.string()]).optional().default(10)
});

export const placementDriveUpdateSchema = placementDriveCreateSchema.partial();

export const departmentReportQuerySchema = z.object({
    department: z.string().optional(),
    graduationYear: z.union([z.string(), z.number()]).optional()
});

export const reportsExportQuerySchema = z.object({
    format: z.enum(['csv', 'json', 'pdf']).optional().default('csv'),
    department: z.string().optional(),
    year: z.union([z.string(), z.number()]).optional()
});

export const batchAnalyticsQuerySchema = z.object({
    graduationYear: z.union([z.string(), z.number()]).optional()
});

export const collegeUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    location: z.string().optional(),
    departments: z.array(z.string()).optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    website: z.string().url().optional()
});

// -------------------------------------------------------------
// 6. Recruiter Operations
// -------------------------------------------------------------
export const recruiterApplicationsQuerySchema = z.object({
    jobId: z.string().optional(),
    status: z.string().optional(),
    minScore: z.union([z.string(), z.number()]).optional()
});

export const recruiterStatusUpdateSchema = z.object({
    applicationId: z.string().optional(),
    applicationIds: z.array(z.string()).optional(),
    status: z.enum(['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED']),
    notes: z.string().optional()
}).refine(data => data.applicationId || (data.applicationIds && data.applicationIds.length > 0), {
    message: "Either applicationId or applicationIds array is required."
});

export const recruiterInterviewScheduleSchema = z.object({
    applicationId: z.string().min(1, 'applicationId is required'),
    scheduledAt: z.string().min(1, 'scheduledAt date-time string is required'),
    mode: z.enum(['VIDEO', 'IN_PERSON', 'PHONE']).optional().default('VIDEO'),
    meetingLink: z.string().optional().default('https://meet.google.com/xyz-skill2job'),
    notes: z.string().optional()
});

export const skillSearchQuerySchema = z.object({
    skill: z.string().optional().default(''),
    minReadiness: z.union([z.string(), z.number()]).optional(),
    department: z.string().optional()
});

export const recruiterCandidatesQuerySchema = z.object({
    query: z.string().optional().default(''),
    minReadiness: z.union([z.string(), z.number()]).optional(),
    skills: z.string().optional()
});

// -------------------------------------------------------------
// 7. Jobs & Projects
// -------------------------------------------------------------
export const jobPublishSchema = z.object({
    companyId: z.string().optional(),
    companyName: z.string().optional(),
    companyLogo: z.string().optional(),
    title: z.string().min(2, 'Job title must be at least 2 characters'),
    department: z.string().optional(),
    description: z.string().optional(),
    responsibilities: z.union([z.string(), z.array(z.string())]).optional(),
    requirements: z.union([z.string(), z.array(z.string())]).optional(),
    requiredSkills: z.array(z.any()).default([]),
    location: z.string().optional(),
    workMode: z.string().optional(),
    salary: z.string().optional(),
    employmentType: z.string().optional(),
    minCgpa: z.union([z.string(), z.number()]).optional(),
    graduationYear: z.union([z.string(), z.number()]).optional(),
    degree: z.string().optional(),
    branch: z.string().optional(),
    openings: z.union([z.string(), z.number()]).optional(),
    deadline: z.string().optional()
});

export const jobApplySchema = z.object({
    studentId: z.string().min(1, 'studentId is required'),
    resumeUrl: z.string().optional(),
    coverLetter: z.string().optional()
});

export const jobQuerySchema = z.object({
    keyword: z.string().optional(),
    role: z.string().optional(),
    department: z.string().optional(),
    minCgpa: z.union([z.string(), z.number()]).optional(),
    status: z.string().optional()
});

export const projectSubmitSchema = z.object({
    studentId: z.string().min(1, 'studentId is required'),
    projectId: z.string().optional(),
    title: z.string().min(2, 'Project title must be at least 2 characters'),
    description: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional()
});

// -------------------------------------------------------------
// 8. Student Profiles & Coding Imports
// -------------------------------------------------------------
export const studentUpdateSchema = z.object({
    name: z.string().min(2).optional(),
    cgpa: z.union([z.number(), z.string()]).optional(),
    department: z.string().optional(),
    graduationYear: z.union([z.number(), z.string()]).optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    githubUsername: z.string().optional(),
    leetcodeUsername: z.string().optional()
}).passthrough();

export const studentSkillAddSchema = z.object({
    skillName: z.string().min(1, 'skillName is required'),
    category: z.string().optional().default('Programming'),
    level: z.string().optional().default('Beginner'),
    credibilityScore: z.union([z.number(), z.string()]).optional().default(50),
    status: z.string().optional().default('Self-declared')
});

export const codingProfilePlatformImportSchema = z.object({
    platform: z.enum(['github', 'leetcode'], { errorMap: () => ({ message: 'Supported platforms are "github" and "leetcode"' }) }),
    username: z.string().min(1, 'Username is required')
});

export const codingProfileImportSchema = z.object({
    githubUsername: z.string().optional(),
    leetcodeUsername: z.string().optional()
}).refine(data => data.githubUsername || data.leetcodeUsername, {
    message: "Either githubUsername or leetcodeUsername must be provided."
});

export const githubImportSchema = z.object({
    username: z.string().min(1, 'GitHub username is required')
});

export const leetcodeImportSchema = z.object({
    username: z.string().min(1, 'LeetCode username is required')
});

export const studentReadinessQuerySchema = z.object({
    jobId: z.string().optional()
});

export const recommendationsQuerySchema = z.object({
    query: z.string().optional().default('Software Developer')
});

export const roadmapQuerySchema = z.object({
    jobId: z.string().optional(),
    targetRole: z.string().optional()
});

export const whyNotEligibleQuerySchema = z.object({
    jobId: z.string().min(1, 'jobId is required')
});

// -------------------------------------------------------------
// 9. Admin Audit Logs & Notifications
// -------------------------------------------------------------
export const auditLogsAdminQuerySchema = z.object({
    category: z.string().optional().default('All'),
    status: z.string().optional().default('All'),
    severity: z.string().optional().default('All'),
    search: z.string().optional().default('')
});

export const auditLogCreateSchema = z.object({
    action: z.string().min(1, 'Action is required'),
    category: z.string().optional().default('SYSTEM'),
    status: z.string().optional().default('SUCCESS'),
    severity: z.string().optional().default('INFO'),
    details: z.any().optional()
}).passthrough();

export const auditLogsQuerySchema = z.object({
    page: z.union([z.string(), z.number()]).optional().default(1),
    limit: z.union([z.string(), z.number()]).optional().default(50),
    action: z.string().optional(),
    status: z.string().optional(),
    severity: z.string().optional()
});

export const auditLogsExportQuerySchema = z.object({
    format: z.enum(['json', 'csv']).optional().default('csv'),
    category: z.string().optional().default('All'),
    status: z.string().optional().default('All'),
    limit: z.union([z.string(), z.number()]).optional().default(500)
});

export const notificationsGetQuerySchema = z.object({
    category: z.string().optional().default('All'),
    unread: z.enum(['true', 'false']).optional()
});

export const notificationCreateSchema = z.object({
    broadcast: z.boolean().optional(),
    title: z.string().min(1, 'Title is required'),
    message: z.string().min(1, 'Message is required'),
    recipientId: z.string().optional(),
    targetRoles: z.array(z.string()).optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
    type: z.string().optional(),
    link: z.string().optional(),
    sendEmail: z.boolean().optional(),
    recipientEmail: z.string().optional()
});

export const notificationUpdateSchema = z.object({
    notificationId: z.string().optional(),
    markAll: z.boolean().optional()
}).refine(data => data.notificationId || data.markAll, {
    message: 'Provide notificationId or markAll: true'
});

export const notificationsQuerySchema = z.object({
    userId: z.string().min(1, 'userId is required'),
    unreadOnly: z.union([z.string(), z.boolean()]).optional().default(false)
});

export const notificationStatusUpdateSchema = z.object({
    notificationId: z.string().optional(),
    notificationIds: z.array(z.string()).optional(),
    read: z.boolean().optional().default(true)
});

// -------------------------------------------------------------
// 10. Platform Search & Storage
// -------------------------------------------------------------
export const platformSearchQuerySchema = z.object({
    q: z.string().optional().default(''),
    query: z.string().optional(),
    category: z.string().optional().default('ALL'),
    type: z.string().optional()
});

export const storageFileQuerySchema = z.object({
    key: z.string().min(1, 'Storage key is required'),
    expires: z.string().min(1, 'Expiry timestamp is required'),
    sig: z.string().min(1, 'Cryptographic signature is required')
});

export const learnSkillParamSchema = z.object({
    skill: z.string().min(1, 'Skill parameter is required')
});

export const courseCreateSchema = z.object({
    title: z.string().min(2, 'Course title is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    skillName: z.string().optional()
});

export const lessonProgressSchema = z.object({
    completed: z.boolean().optional().default(true),
    score: z.number().optional()
});
