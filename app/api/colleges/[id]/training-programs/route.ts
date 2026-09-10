import { NextResponse } from 'next/server';
export async function GET() { return NextResponse.json({ success: true, programs: [] }, {  headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }); }
export async function POST() { return NextResponse.json({ success: true , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }); }
