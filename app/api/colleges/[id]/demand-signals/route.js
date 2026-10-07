import { NextResponse } from 'next/server';
export async function GET(request, { params }) {
    try {
        const signals = [];
        return NextResponse.json({
            success: true,
            signals
        });
    }
    catch (error) {
        console.error('Error fetching demand signals:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
