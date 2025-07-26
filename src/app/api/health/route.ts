import { NextRequest, NextResponse } from 'next/server';

// Environment configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Proxy the health check request to the backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const healthData = await response.json();
      return NextResponse.json(healthData, { status: 200 });
    } else {
      return NextResponse.json(
        { 
          status: 'unhealthy', 
          message: `Backend responded with status: ${response.status} ${response.statusText}`,
          timestamp: new Date().toISOString()
        }, 
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Health check proxy error:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Backend health check timed out after 5 seconds';
      } else if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Backend service is not running or unreachable';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        message: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}