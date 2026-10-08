import { NextResponse } from 'next/server';
import { codingProblemRepository } from '@/lib/repositories/codingProblemRepository';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const topic = searchParams.get('topic');
        const difficulty = searchParams.get('difficulty');
        const problems = codingProblemRepository.findAll({ topic, difficulty });
        return NextResponse.json({
            success: true,
            problems
        });
    }
    catch (error) {
        console.error('Error fetching coding problems:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
