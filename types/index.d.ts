/**
 * Skill2Job.ai Type Definitions
 * Complete TypeScript / JSDoc type definitions for entities, authentication, API responses, and Zod schemas.
 */

import type { z } from 'zod';
import type { NextRequest, NextResponse } from 'next/server';

// -------------------------------------------------------------
// Core Enums & Primitive Unions
// -------------------------------------------------------------
export type UserRole = 'student' | 'college' | 'company' | 'admin' | 'guest';
export type AccountStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'ARCHIVED';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'REJECTED';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type ProctoringStatus = 'CLEAN' | 'WARNING' | 'DISQUALIFIED';
export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RateLimitTier = 'ai' | 'auth' | 'otp' | 'standard';

// -------------------------------------------------------------
// Authentication & Session
// -------------------------------------------------------------
export interface AuthSession {
    userId: string;
    email: string;
    role: UserRole;
    studentId?: string | null;
    collegeId?: string | null;
    companyId?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    iat?: number;
    exp?: number;
}

export interface AuthRoleResult {
    authorized: boolean;
    errorResponse?: NextResponse;
}

export interface AuthOwnershipResult {
    authorized: boolean;
    errorResponse?: NextResponse;
    entity?: any;
}

// -------------------------------------------------------------
// Rate Limiter & Security
// -------------------------------------------------------------
export interface RateLimitCheckResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
    retryAfter: number;
}

export interface ApplyRateLimitResult {
    allowed: boolean;
    remaining?: number;
    limit?: number;
    reset?: number;
    headers?: Record<string, string>;
    response?: NextResponse;
}

export interface PromptGuardResult {
    valid: boolean;
    sanitizedText: string;
    violations: string[];
    error?: string;
}

// -------------------------------------------------------------
// Entity Models
// -------------------------------------------------------------
export interface UserEntity {
    id: string;
    email: string;
    phone?: string | null;
    role: UserRole;
    name?: string | null;
    email_verified: boolean;
    phone_verified: boolean;
    account_status: AccountStatus;
    verification_status: VerificationStatus;
    created_at: Date | string;
    updated_at: Date | string;
}

export interface StudentEntity {
    id: string;
    userId: string;
    name: string;
    collegeId?: string | null;
    collegeName?: string | null;
    department?: string | null;
    cgpa?: number | null;
    graduationYear?: number | null;
    placementReadiness?: number | null;
    placementStatus?: string | null;
    resumeUrl?: string | null;
    resumeText?: string | null;
    githubUsername?: string | null;
    leetcodeUsername?: string | null;
}

export interface VerifiedSkillEntity {
    id: string;
    studentId: string;
    skillName: string;
    status: VerificationStatus;
    credibilityScore: number;
    verifiedAt?: Date | string | null;
    verificationSource?: 'ASSESSMENT' | 'GITHUB' | 'LEETCODE' | 'CERTIFICATE';
}

export interface JobEntity {
    id: string;
    companyId: string;
    title: string;
    department?: string | null;
    description: string;
    requiredSkills: string[];
    minCgpa?: number | null;
    eligibleBranches?: string[];
    salaryRange?: string | null;
    workMode?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
    status: 'draft' | 'published' | 'closed';
    createdAt: Date | string;
}

export interface ApplicationEntity {
    id: string;
    jobId: string;
    studentId: string;
    status: ApplicationStatus;
    matchScore: number;
    appliedAt: Date | string;
    updatedAt: Date | string;
}

export interface InterviewEntity {
    id: string;
    applicationId: string;
    jobId: string;
    studentId: string;
    candidateName: string;
    jobTitle: string;
    scheduledAt: string;
    mode: 'VIDEO' | 'IN_PERSON' | 'PHONE';
    meetingLink?: string | null;
    notes?: string | null;
    status: InterviewStatus;
}

export interface AuditLogEntity {
    id: string;
    timestamp: string;
    action: string;
    category: string;
    actor: {
        userId: string;
        role: UserRole;
        ipAddress?: string;
    };
    targetResource?: {
        type: string;
        id: string;
    };
    status: 'SUCCESS' | 'WARNING' | 'BLOCKED' | 'ERROR';
    severity: AuditSeverity;
    details?: Record<string, any>;
}

// -------------------------------------------------------------
// API Standard Responses
// -------------------------------------------------------------
export interface ApiSuccessResponse<T = any> {
    success: true;
    data?: T;
    [key: string]: any;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
    code?: string;
    details?: any;
    retryAfter?: number;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
