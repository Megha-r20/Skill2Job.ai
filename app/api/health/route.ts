import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/services/aiService';

export async function GET() {
  try {
    // 1. Test Database Connection
    await prisma.$queryRaw`SELECT 1`;

    // 2. Build Status
    const status = {
      status: 'healthy',
      database: 'connected',
      ai: process.env.GEMINI_API_KEY ? 'configured' : 'mock-mode',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(status, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, {  status: 503 , headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
