import { NextResponse } from 'next/server';
import { placementDriveRepository } from '@/lib/repositories/placementDriveRepository';
import { getAuthenticatedSession, authorizeRole } from '@/lib/authMiddleware';
import { driveIdParamSchema, validateWithSchema } from '@/lib/validations';

/**
 * GET, PUT, DELETE for individual placement drive.
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string, driveId: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function GET(request, { params }) {
    try {
        const paramValidation = validateWithSchema(driveIdParamSchema, params);
        if (!paramValidation.success) {
            return paramValidation.errorResponse;
        }

        const drive = await placementDriveRepository.findById(paramValidation.data.driveId);
        if (!drive) {
            return NextResponse.json({ error: 'Placement drive not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, drive });
    } catch (error) {
        return NextResponse.json({ error: 'Unable to fetch placement drive details.' }, { status: 500 });
    }
}

/**
 * @param {import('next/server').NextRequest} request
 * @param {{ params: { id: string, driveId: string } }} context
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function PUT(request, { params }) {
    try {
        const paramValidation = validateWithSchema(driveIdParamSchema, params);
        if (!paramValidation.success) {
            return paramValidation.errorResponse;
        }
        const session = await getAuthenticatedSession(request);
        if (session) {
            const roleAuth = authorizeRole(session, ['college', 'admin']);
            if (!roleAuth.authorized) return roleAuth.errorResponse;
        }

        const body = await request.json();
        const updated = await placementDriveRepository.update(params.driveId, body);

        if (!updated) {
            return NextResponse.json({ error: 'Placement drive not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            drive: updated,
            message: 'Placement drive details updated.'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Unable to update placement drive.' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getAuthenticatedSession(request);
        if (session) {
            const roleAuth = authorizeRole(session, ['college', 'admin']);
            if (!roleAuth.authorized) return roleAuth.errorResponse;
        }

        const deleted = await placementDriveRepository.delete(params.driveId);
        if (!deleted) {
            return NextResponse.json({ error: 'Placement drive not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Placement drive archived.' });
    } catch (error) {
        return NextResponse.json({ error: 'Unable to delete placement drive.' }, { status: 500 });
    }
}
