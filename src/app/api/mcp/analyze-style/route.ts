import { NextRequest, NextResponse } from 'next/server';

// Environment configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

interface StyleGenerationRequest {
  styleDescription: string;
  type?: 'generate-preset';
}

interface StyleGenerationResponse {
  tone: string;
  pace: string;
  vocabulary_level: string;
  target_audience: string;
  content_structure: string;
  energy_level: string;
  formality: string;
  humor_style: string;
  empathy_level: string;
  confidence_level: string;
  storytelling: string;
  keyPhrases: string[];
  additionalInstructions?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract style description from request
    const {
      styleDescription,
      type = 'generate-preset'
    } = body as StyleGenerationRequest;

    // Validate required fields
    if (!styleDescription) {
      return NextResponse.json(
        { success: false, error: 'Style description is required' },
        { status: 400 }
      );
    }

    // Build request for backend MCP service
    const backendRequest = {
      prompt: styleDescription,  // Backend expects 'prompt' field
      type
    };

    // Log the request for debugging
    console.log('Requesting style generation from backend:', {
      styleDescription: styleDescription.substring(0, 100) + (styleDescription.length > 100 ? '...' : ''),
      type
    });

    // Make request to backend service with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/mcp/analyze-style`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend style analysis error:', errorText);
        
        // Provide more specific error messages based on status code
        let userFriendlyError = 'Style generation service error';
        if (backendResponse.status === 503) {
          userFriendlyError = 'Style generation service is temporarily unavailable. Please try again in a few moments.';
        } else if (backendResponse.status === 500) {
          userFriendlyError = 'Internal server error in style generation service. Please check your configuration in Settings.';
        } else if (backendResponse.status === 404) {
          userFriendlyError = 'Style generation endpoint not found. Please verify your backend service is running correctly.';
        } else if (backendResponse.status >= 400 && backendResponse.status < 500) {
          userFriendlyError = 'Invalid request to style generation service. Please check your input.';
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

      const backendResult: StyleGenerationResponse = await backendResponse.json();

      // Transform backend response to match frontend expected format
      const transformedResult = {
        tone: backendResult.tone || '',
        pace: backendResult.pace || '',
        vocabulary: backendResult.vocabulary_level || '',
        targetAudience: backendResult.target_audience || '',
        contentStructure: backendResult.content_structure || '',
        energy: backendResult.energy_level || '',
        formality: backendResult.formality || '',
        humor: backendResult.humor_style || '',
        empathy: backendResult.empathy_level || '',
        confidence: backendResult.confidence_level || '',
        storytelling: backendResult.storytelling || '',
        keyPhrases: backendResult.keyPhrases || [],
        additionalInstructions: backendResult.additionalInstructions || '',
        sourceDescription: `AI-generated: "${styleDescription}"`
      };

      console.log('Style generation successful:', {
        originalFields: Object.keys(backendResult),
        transformedFields: Object.keys(transformedResult)
      });

      return NextResponse.json({
        success: true,
        ...transformedResult
      });

    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Backend style generation request timed out after 30 seconds');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Request timed out - The style generation service took too long to respond. Please try again or check if the service is running.',
            details: 'Request timeout after 30 seconds'
          },
          { status: 504 }
        );
      }
      
      // Handle network errors (service unavailable)
      if (fetchError instanceof Error && (
        fetchError.message.includes('fetch') || 
        fetchError.message.includes('ECONNREFUSED') ||
        fetchError.message.includes('network')
      )) {
        console.error('Backend style generation service connection failed:', fetchError.message);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Style generation service is unavailable - Cannot connect to the backend service. Please ensure it is running and accessible.',
            details: fetchError.message
          },
          { status: 503 }
        );
      }
      
      throw fetchError; // Re-throw unexpected errors to outer catch
    }

  } catch (error: unknown) {
    console.error('Style generation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate style - An unexpected error occurred while processing your request.',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}