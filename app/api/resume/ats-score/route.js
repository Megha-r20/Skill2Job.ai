import { NextResponse } from 'next/server';
import { resumeService } from '@/lib/services/resumeService';

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { resumeText, jobDescription, targetRole } = body;

        if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Resume text is required for ATS scoring.'
            }, { status: 400 });
        }

        const atsResults = resumeService.calculateAtsScore(
            resumeText,
            jobDescription || '',
            targetRole || ''
        );

        return NextResponse.json({
            success: true,
            ...atsResults
        });
    } catch (error) {
        console.error('[ats-score-api] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
