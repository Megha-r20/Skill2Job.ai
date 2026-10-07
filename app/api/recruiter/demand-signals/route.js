import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ success: true, signals: [] }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }); }
