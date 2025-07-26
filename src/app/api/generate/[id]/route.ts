import { NextRequest, NextResponse } from 'next/server';

// Types for Backend API status response
interface BackendStatusResponse {
  job_id: string;
  status: 'queued' | 'started' | 'finished' | 'failed' | 'not_found';
  download_url?: string;
  thumbnail_url?: string;
  progress?: number;
  current_step?: string;
  message?: string;
  error?: string;
  duration?: number;
  file_size?: number;
}

// Environment configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const { searchParams } = new URL(request.url);
    const usePolling = searchParams.get('wait') === 'true';

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Choose endpoint based on whether we want polling or immediate response
    const endpoint = usePolling ? `/mcp/${jobId}/wait` : `/mcp/${jobId}`;
    
    // Make request to backend service with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for status checks
    
    let backendResponse: Response;
    try {
      backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        if (backendResponse.status === 404) {
          return NextResponse.json(
            { success: false, error: 'Job not found or has expired' },
            { status: 404 }
          );
        }
        
        const errorText = await backendResponse.text();
        console.error('Backend API error:', errorText);
        
        // Provide more specific error messages
        let userFriendlyError = 'Generation service error';
        if (backendResponse.status === 503) {
          userFriendlyError = 'Generation service is temporarily unavailable';
        } else if (backendResponse.status === 500) {
          userFriendlyError = 'Internal server error in generation service';
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: userFriendlyError,
            details: errorText,
            statusCode: backendResponse.status
          },
          { status: backendResponse.status }
        );
      }
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Backend status request timed out');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Status check timed out - The generation service is not responding',
            details: 'Request timeout after 10 seconds'
          },
          { status: 504 }
        );
      }
      
      // Handle network errors
      if (fetchError instanceof Error && (
        fetchError.message.includes('fetch') || 
        fetchError.message.includes('ECONNREFUSED') ||
        fetchError.message.includes('network')
      )) {
        console.error('Backend service connection failed:', fetchError.message);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Generation service is unavailable - Cannot connect to check job status',
            details: fetchError.message
          },
          { status: 503 }
        );
      }
      
      throw fetchError; // Re-throw unexpected errors to outer catch
    }

    const backendResult: BackendStatusResponse = await backendResponse.json();

    // Build response with additional metadata
    const response = {
      success: true,
      jobId: backendResult.job_id,
      status: backendResult.status,
      progress: backendResult.progress || 0,
      currentStep: backendResult.current_step || 'Processing',
      message: backendResult.message,
      error: backendResult.error,
      downloadUrl: backendResult.download_url,
      thumbnailUrl: backendResult.thumbnail_url,
      duration: backendResult.duration,
      fileSize: backendResult.file_size,
      isComplete: backendResult.status === 'finished',
      isFailed: backendResult.status === 'failed'
    };

    // If job is complete, we might want to save it to user's gallery
    if (backendResult.status === 'finished' && backendResult.download_url) {
      // Here you could trigger saving to user's gallery
      // For now, we'll just include the download URL in the response
      response.downloadUrl = backendResult.download_url;
      response.thumbnailUrl = backendResult.thumbnail_url;
    }

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('Generation status API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check generation status',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Allow cancelling a job (if the MCP service supports it)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Note: This endpoint may not exist in the backend service yet
    // This is a placeholder for future cancellation functionality
    const backendResponse = await fetch(`${BACKEND_URL}/mcp/${jobId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Job not found or cannot be cancelled' },
          { status: 404 }
        );
      }
      
      const errorText = await backendResponse.text();
      console.error('Backend API cancellation error:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Cancellation failed: ${backendResponse.status} ${backendResponse.statusText}`,
          details: errorText
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully'
    });

  } catch (error: unknown) {
    console.error('Generation cancellation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cancel generation',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}