import { NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/authMiddleware';
import { resumeService } from '@/lib/services/resumeService';

export async function GET(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId') || session?.userId || 'std_1';

        const resumeData = await resumeService.buildResumeFromProfile(studentId);

        return NextResponse.json({
            success: true,
            studentId,
            resumeData
        });
    } catch (error) {
        console.error('[resume-builder-get] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getAuthenticatedSession(request);
        const body = await request.json().catch(() => ({}));
        const studentId = body.studentId || session?.userId || 'std_1';

        // Returns formatted ATS resume string and updated data
        const { resumeData } = body;
        if (!resumeData) {
            return NextResponse.json({
                success: false,
                error: 'Resume data is required to generate formatted output.'
            }, { status: 400 });
        }

        const atsEvaluation = resumeService.calculateAtsScore(
            JSON.stringify(resumeData),
            body.jobDescription || '',
            body.targetRole || ''
        );

        return NextResponse.json({
            success: true,
            studentId,
            atsEvaluation,
            message: 'Resume saved and evaluated successfully.'
        });
    } catch (error) {
        console.error('[resume-builder-post] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
