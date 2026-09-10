// @ts-nocheck
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { collegeRepository } from '@/lib/repositories/collegeRepository';
import { courseRepository } from '@/lib/repositories/courseRepository';
import { assessmentRepository } from '@/lib/repositories/assessmentRepository';
import { studentRepository } from '@/lib/repositories/studentRepository';
import { jobRepository } from '@/lib/repositories/jobRepository';
import { applicationRepository } from '@/lib/repositories/applicationRepository';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const category = searchParams.get('category') || 'ALL';
    const studentId = searchParams.get('studentId') || 'std_1';

    const searchResults = db.searchGlobal(query, category, studentId);

    return NextResponse.json({
      success: true,
      ...searchResults
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, {  status: 500 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
