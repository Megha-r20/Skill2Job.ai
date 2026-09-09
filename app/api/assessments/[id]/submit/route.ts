import { NextResponse } from 'next/server';
export async function POST() { return NextResponse.json({ success: true, passed: true, score: 85, awardedLevel: 'Intermediate', feedback: [] }); }
