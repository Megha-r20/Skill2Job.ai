import { NextResponse } from 'next/server';
import { extractSkillsFromJobDescription } from '@/lib/ai';
export async function POST(request) {
    try {
        const body = await request.json();
        const { description } = body;
        if (!description || description.trim().length === 0) {
            return NextResponse.json({ error: 'Job description text is required' }, { status: 400 });
        }
        const result = await extractSkillsFromJobDescription(description);
        return NextResponse.json({
            success: true,
            ...result
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
