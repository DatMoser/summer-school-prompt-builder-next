import { NextResponse } from 'next/server';

export async function GET() {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
  
  try {
    // Test connection to the backend service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const backendHealth = await response.json();
      return NextResponse.json({
        status: 'healthy',
        service: 'promptrx-frontend',
        backend: {
          status: 'healthy',
          url: BACKEND_URL,
          response: backendHealth
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'degraded',
        service: 'promptrx-frontend',
        backend: {
          status: 'unhealthy',
          url: BACKEND_URL,
          error: `Backend returned ${response.status} ${response.statusText}`
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }, { status: 503 });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    
    return NextResponse.json({
      status: 'unhealthy',
      service: 'promptrx-frontend',
      backend: {
        status: 'unreachable',
        url: BACKEND_URL,
        error: isTimeout ? 'Backend health check timed out after 5 seconds' : errorMessage
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }, { status: 503 });
  }
}