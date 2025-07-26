import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // This endpoint is called when the application is closing
    // Currently it doesn't need to do anything specific
    // but we provide it to prevent 404 errors
    
    console.log('Cleanup endpoint called');
    
    return NextResponse.json({
      success: true,
      message: 'Cleanup completed'
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}