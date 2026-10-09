import { NextResponse } from 'next/server';
import { placementDriveRepository } from '@/lib/repositories/placementDriveRepository';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { idParamSchema, validateWithSchema } from '@/lib/validations';
import { z } from 'zod';

const createDriveBodySchema = z.object({
    companyName: z.string().min(1, 'Company Name is required'),
    title: z.string().min(1, 'Drive Title is required'),
    departments: z.array(z.string()).optional(),
    minCgpa: z.union([z.number(), z.string()]).optional(),
    packageCtc: z.string().optional(),
    driveDate: z.string().optional(),
    openings: z.union([z.number(), z.string()]).optional(),
    mode: z.string().optional()
});

/**
 * GET /api/colleges/[id]/placement-drives
 * Returns list of on-campus & virtual placement drives with telemetry metrics.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramValidation = validateWithSchema(idParamSchema, params);
        if (!paramValidation.success) {
            return paramValidation.errorResponse;
        }

        const session = await getAuthenticatedSession(request);
        const collegeId = paramValidation.data.id || 'col_1';

        // Check authentication if session exists
        if (session) {
            const roleAuth = authorizeRole(session, ['college', 'admin']);
            if (!roleAuth.authorized) return roleAuth.errorResponse;
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const department = searchParams.get('department');
        const search = searchParams.get('search');

        const drives = await placementDriveRepository.findAll({
            collegeId,
            status,
            department,
            search
        });

        // Compute summary metrics
        const totalDrives = drives.length;
        const activeDrives = drives.filter(d => d.status !== 'Completed').length;
        const totalOpenings = drives.reduce((sum, d) => sum + (d.openings || 0), 0);
        const totalOffers = drives.reduce((sum, d) => sum + (d.selectedCount || 0), 0);
        const totalRegistered = drives.reduce((sum, d) => sum + (d.registeredStudentsCount || 0), 0);

        return NextResponse.json({
            success: true,
            collegeId,
            count: drives.length,
            summary: {
                totalDrives,
                activeDrives,
                totalOpenings,
                totalOffers,
                totalRegistered
            },
            drives
        });
    } catch (error) {
        console.error('[GET placement-drives error]:', error);
        return NextResponse.json(
            { error: 'Unable to retrieve placement drives.' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/colleges/[id]/placement-drives
 * Schedules a new placement drive.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function POST(request, { params }) {
    try {
        const paramValidation = validateWithSchema(idParamSchema, params);
        if (!paramValidation.success) {
            return paramValidation.errorResponse;
        }

        const session = await getAuthenticatedSession(request);
        const collegeId = paramValidation.data.id || 'col_1';

        if (session) {
            const roleAuth = authorizeRole(session, ['college', 'admin']);
            if (!roleAuth.authorized) return roleAuth.errorResponse;
        }

        const body = await request.json().catch(() => ({}));
        const validation = validateWithSchema(createDriveBodySchema, body);
        if (!validation.success) {
            return validation.errorResponse;
        }

        const { companyName, title, departments, minCgpa, packageCtc, driveDate, openings, mode } = body;

        const newDrive = await placementDriveRepository.create({
            collegeId,
            companyName,
            title,
            departments: departments || ['Computer Science & Engineering', 'Information Technology'],
            minCgpa: minCgpa || 7.0,
            packageCtc: packageCtc || '₹10,00,000 - ₹15,00,000 / year',
            driveDate: driveDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            openings: openings || 10,
            mode: mode || 'On-Campus Lab',
            ...body
        });

        return NextResponse.json({
            success: true,
            drive: newDrive,
            message: `Placement drive successfully created for ${companyName}.`
        });
    } catch (error) {
        console.error('[POST placement-drives error]:', error);
        return NextResponse.json(
            { error: 'Unable to schedule placement drive.' },
            { status: 500 }
        );
    }
}
