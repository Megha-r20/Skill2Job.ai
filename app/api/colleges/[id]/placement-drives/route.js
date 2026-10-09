import { NextResponse } from 'next/server';
import { placementDriveRepository } from '@/lib/repositories/placementDriveRepository';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';

/**
 * GET /api/colleges/[id]/placement-drives
 * Returns list of on-campus & virtual placement drives with telemetry metrics.
 */
export async function GET(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        const collegeId = params.id || 'col_1';

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
 */
export async function POST(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        const collegeId = params.id || 'col_1';

        if (session) {
            const roleAuth = authorizeRole(session, ['college', 'admin']);
            if (!roleAuth.authorized) return roleAuth.errorResponse;
        }

        const body = await request.json();
        const { companyName, title, departments, minCgpa, packageCtc, driveDate, openings, mode } = body;

        if (!companyName || !title) {
            return NextResponse.json(
                { error: 'Company Name and Drive Title are required.' },
                { status: 400 }
            );
        }

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
