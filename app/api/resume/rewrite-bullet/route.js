import { NextResponse } from 'next/server';
import { resumeService } from '@/lib/services/resumeService';

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { bulletText, role, technologies, model } = body;

        if (!bulletText || typeof bulletText !== 'string' || bulletText.trim().length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Please provide a bullet point to rewrite.'
            }, { status: 400 });
        }

        const rewriteResult = await resumeService.rewriteBulletPoint(bulletText, {
            role: role || 'Software Engineer',
            technologies: technologies || '',
            model: model || process.env.GEMINI_MODEL
        });

        return NextResponse.json({
            success: true,
            ...rewriteResult
        });
    } catch (error) {
        console.error('[rewrite-bullet-api] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
