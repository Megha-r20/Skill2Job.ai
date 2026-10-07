import { NextResponse } from 'next/server';
export async function GET(request, { params }) {
    try {
        const skillName = decodeURIComponent(params.skill);
        const ecosystem = [];
        return NextResponse.json({
            success: true,
            ecosystem
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
