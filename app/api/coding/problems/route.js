import { NextResponse } from 'next/server';
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const topic = searchParams.get('topic');
        const difficulty = searchParams.get('difficulty');
        let problems = [];
        if (topic && topic !== 'All') {
            problems = problems.filter(p => p.topic.toLowerCase() === topic.toLowerCase());
        }
        if (difficulty && difficulty !== 'All') {
            problems = problems.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
        }
        return NextResponse.json({
            success: true,
            problems
        });
    }
    catch (error) {
        console.error('Error fetching coding problems:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
