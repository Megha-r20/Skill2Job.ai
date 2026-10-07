import { NextResponse } from 'next/server';
export async function GET(request, { params }) {
    try {
        const certId = params.id;
        return NextResponse.json({
            success: true,
            certificate: {
                id: certId,
                certificateNumber: certId,
                studentName: 'Alex Rivera',
                skillOrCourseName: certId.includes('PY') ? 'Python Fundamentals & OOP' : certId.includes('DSA') ? 'Data Structures & Algorithms' : certId.includes('SQL') ? 'SQL Relational Queries & Database Architecture' : 'Software Engineering Professional',
                type: 'skill',
                level: 'Intermediate',
                score: 88,
                issuedDate: '2026-08-25',
                verificationUrl: `/verify/${certId}`,
                isValid: true
            }
        });
    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
    }
}
