import { NextRequest, NextResponse } from 'next/server';

// Types for MCP API status response
interface MCPStatusResponse {
  job_id: string;
  status: 'queued' | 'started' | 'finished' | 'failed' | 'not_found';
  download_url?: string;
  progress: number;
  current_step: string;
  total_steps: number;
  step_number: number;
  operation_name?: string;
}

// Environment configuration
const MCP_BASE_URL = process.env.MCP_BASE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
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
    
    // Make request to MCP service
    const mcpResponse = await fetch(`${MCP_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!mcpResponse.ok) {
      if (mcpResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }
      
      const errorText = await mcpResponse.text();
      console.error('MCP API error:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Generation service error: ${mcpResponse.status} ${mcpResponse.statusText}`,
          details: errorText
        },
        { status: mcpResponse.status }
      );
    }

    const mcpResult: MCPStatusResponse = await mcpResponse.json();

    // Build response with additional metadata
    const response = {
      success: true,
      jobId: mcpResult.job_id,
      status: mcpResult.status,
      progress: mcpResult.progress,
      currentStep: mcpResult.current_step,
      totalSteps: mcpResult.total_steps,
      stepNumber: mcpResult.step_number,
      downloadUrl: mcpResult.download_url,
      operationName: mcpResult.operation_name,
      isComplete: mcpResult.status === 'finished',
      isFailed: mcpResult.status === 'failed'
    };

    // If job is complete, we might want to save it to user's gallery
    if (mcpResult.status === 'finished' && mcpResult.download_url) {
      // Here you could trigger saving to user's gallery
      // For now, we'll just include the download URL in the response
      response.downloadUrl = mcpResult.download_url;
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
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Note: This endpoint may not exist in the MCP service yet
    // This is a placeholder for future cancellation functionality
    const mcpResponse = await fetch(`${MCP_BASE_URL}/mcp/${jobId}/cancel`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!mcpResponse.ok) {
      if (mcpResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Job not found or cannot be cancelled' },
          { status: 404 }
        );
      }
      
      const errorText = await mcpResponse.text();
      console.error('MCP API cancellation error:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Cancellation failed: ${mcpResponse.status} ${mcpResponse.statusText}`,
          details: errorText
        },
        { status: mcpResponse.status }
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