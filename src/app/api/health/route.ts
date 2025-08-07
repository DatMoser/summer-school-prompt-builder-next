import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      status: 'healthy', 
      service: 'promptrx-frontend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }, 
    { status: 200 }
  );
}