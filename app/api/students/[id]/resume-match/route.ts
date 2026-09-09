import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/services/aiService';
import fs from 'fs';
import path from 'path';
const pdfParse = require('pdf-parse');

// Removed deprecated config

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const jobId = formData.get('jobId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No resume file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });
    }

    const studentId = params.id;
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Convert file to buffer and extract text
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // In a real SaaS, upload buffer to S3/Vercel Blob here.
    // We simulate by saving locally to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, `${studentId}_resume.pdf`);
    fs.writeFileSync(filePath, buffer);
    const resumeUrl = `/uploads/${studentId}_resume.pdf`;

    // Extract PDF text
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    let job;
    if (jobId) {
      job = await prisma.job.findUnique({ where: { id: jobId } });
    }

    // Send the EXTRACTED PDF TEXT to the real Gemini AI Service!
    const aiAnalysis = await aiService.analyzeResume(resumeText);

    // Save to Postgres
    await prisma.student.update({
      where: { id: studentId },
      data: {
        resumeUrl,
        resumeText: resumeText.substring(0, 10000) // Keep reasonable length
      }
    });

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      resumeUrl
    });
  } catch (error: any) {
    console.error('Resume Parse Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
