import { NextRequest, NextResponse } from 'next/server';

// Types for Backend API
interface BackendGenerationRequest {
  mode: 'video' | 'audio';
  prompt: string;
  provider?: 'openai' | 'gemini';
  generate_thumbnail?: boolean;
  thumbnail_prompt?: string;
  credentials: {
    gemini_api_key?: string;
    google_cloud_credentials?: any;
    google_cloud_project?: string;
    vertex_ai_region?: string;
    gcs_bucket?: string;
    elevenlabs_api_key?: string;
  };
  parameters?: {
    model?: string;
    durationSeconds?: number;
    aspectRatio?: string;
    generateAudio?: boolean;
    sampleCount?: number;
  };
}

interface BackendGenerationResponse {
  job_id: string;
  status: 'queued' | 'started' | 'finished' | 'failed';
  progress?: number;
  current_step?: string;
  message?: string;
}

// Environment configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081';

export async function POST(request: NextRequest) {
  console.log('🎯 GENERATE API POST - REQUEST RECEIVED');
  try {
    const body = await request.json();
    
    // Extract API key from request headers
    const apiKey = request.headers.get('X-API-Key');
    console.log('📝 GENERATE API - REQUEST BODY:', body);
    
    // Extract generation parameters from request
    const {
      format,
      prompt,
      provider = 'openai', // Default to OpenAI
      evidenceData,
      styleData,
      visualStylingData,
      personalData,
      customApiKey,
      googleCloudCredentials,
      googleCloudProject,
      vertexAiRegion,
      gcsBucket,
      elevenlabsApiKey
    } = body;

    // Validate required fields
    if (!format || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: format and prompt' },
        { status: 400 }
      );
    }

    if (!['video', 'audio'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Must be "video" or "audio"' },
        { status: 400 }
      );
    }

    // Use the prompt as-is since it's already been enhanced by the AI prompt builder
    // The prompt now comes pre-formatted from the generateMCPPrompt() function
    let enhancedPrompt = prompt;

    // Build credentials object - only for video generation or when explicitly provided
    const credentials: any = {};
    
    // For video generation, we need credentials
    if (format === 'video') {
      const geminiKey = customApiKey;
      if (!geminiKey) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Gemini API key is required for video generation. Please provide it in Settings.' 
          },
          { status: 400 }
        );
      }
      credentials.gemini_api_key = geminiKey;
      
      // Add other video-required credentials
      if (googleCloudCredentials) credentials.google_cloud_credentials = googleCloudCredentials;
      if (googleCloudProject) credentials.google_cloud_project = googleCloudProject;
      if (vertexAiRegion) credentials.vertex_ai_region = vertexAiRegion;
      if (gcsBucket) credentials.gcs_bucket = gcsBucket;
      
      // Add environment variable fallbacks for video
      if (!credentials.google_cloud_project && process.env.GOOGLE_CLOUD_PROJECT) {
        credentials.google_cloud_project = process.env.GOOGLE_CLOUD_PROJECT;
      }
      if (!credentials.vertex_ai_region && process.env.VERTEX_AI_REGION) {
        credentials.vertex_ai_region = process.env.VERTEX_AI_REGION;
      }
      if (!credentials.gcs_bucket && process.env.GCS_BUCKET) {
        credentials.gcs_bucket = process.env.GCS_BUCKET;
      }
    }
    
    // For audio generation, only add credentials if explicitly provided (backend uses env vars)
    if (format === 'audio') {
      // Only add Gemini API key if provider is gemini and custom key provided
      if (provider === 'gemini') {
        const geminiKey = customApiKey;
        if (geminiKey) {
          credentials.gemini_api_key = geminiKey;
        }
      }
      
      // Only add ElevenLabs key if explicitly provided
      if (elevenlabsApiKey) {
        credentials.elevenlabs_api_key = elevenlabsApiKey;
      }
    }

    // Build backend request
    const backendRequest: any = {
      mode: format,
      prompt: enhancedPrompt,
      provider: provider, // Include provider parameter
      generate_thumbnail: format === 'audio' && !!visualStylingData?.podcastThumbnail, // Generate thumbnails only when visual styling is connected
    };

    // Only add credentials if we have any (for video or explicit audio credentials)
    if (Object.keys(credentials).length > 0) {
      backendRequest.credentials = credentials;
    }

    // Add thumbnail prompt for audio when visual styling is connected
    if (format === 'audio' && visualStylingData?.podcastThumbnail) {
      let thumbnailPrompt = '';
      
      const thumbnail = visualStylingData.podcastThumbnail;
      thumbnailPrompt = `Create a ${thumbnail.designTheme || 'professional'} podcast cover design with a ${thumbnail.colorScheme || 'warm'} color scheme. `;
      thumbnailPrompt += `Use ${thumbnail.fontStyle || 'clean'} typography in a ${thumbnail.layoutType || 'balanced'} layout. `;
      thumbnailPrompt += `The background should be ${thumbnail.backgroundStyle || 'gradient'} style. `;
      
      if (thumbnail.iconStyle && thumbnail.iconStyle !== 'none') {
        thumbnailPrompt += `Include ${thumbnail.iconStyle} icons or elements. `;
      }
      
      if (visualStylingData.healthFocus) {
        thumbnailPrompt += `The design should focus on ${visualStylingData.healthFocus}. `;
      }
      
      if (visualStylingData.customPrompt) {
        thumbnailPrompt += visualStylingData.customPrompt;
      }
      
      backendRequest.thumbnail_prompt = thumbnailPrompt.trim();
    }

    // Add parameters for video
    if (format === 'video') {
      backendRequest.parameters = {
        model: 'veo-3.0-generate-preview',
        durationSeconds: 8, // 8s video as per backend docs
        aspectRatio: '16:9',
        generateAudio: true,
        sampleCount: 1
      };
    }

    // Log the request for debugging
    console.log('🚀 Generate API - Request to Backend:', {
      format,
      generate_thumbnail: backendRequest.generate_thumbnail,
      thumbnail_prompt: backendRequest.thumbnail_prompt,
      visualStylingConnected: !!visualStylingData?.podcastThumbnail,
      backendRequest
    });

    // Make request to backend service with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Add X-API-Key header if provided
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }
      
      const backendResponse = await fetch(`${BACKEND_URL}/mcp`, {
        method: 'POST',
        headers,
        body: JSON.stringify(backendRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend API error:', errorText);
        
        // Provide more specific error messages based on status code
        let userFriendlyError = 'Generation service error';
        if (backendResponse.status === 503) {
          userFriendlyError = 'Generation service is temporarily unavailable. Please try again in a few moments.';
        } else if (backendResponse.status === 500) {
          userFriendlyError = 'Internal server error in generation service. Please check your configuration in Settings.';
        } else if (backendResponse.status === 404) {
          userFriendlyError = 'Generation endpoint not found. Please verify your backend service is running correctly.';
        } else if (backendResponse.status >= 400 && backendResponse.status < 500) {
          userFriendlyError = 'Invalid request to generation service. Please check your configuration.';
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

      const backendResult: BackendGenerationResponse = await backendResponse.json();
      console.log('🔄 Generate API - Backend Response Received:', backendResult);

      // Store generation job info for tracking
      const jobInfo = {
        id: backendResult.job_id,
        format,
        prompt: enhancedPrompt,
        evidenceUsed: !!evidenceData?.fileContent,
        styleUsed: !!styleData,
        personalDataUsed: !!personalData,
        createdAt: new Date().toISOString(),
        status: backendResult.status,
        progress: backendResult.progress || 0,
        currentStep: backendResult.current_step || 'Initializing',
        message: backendResult.message
      };

      const responseData = {
        success: true,
        jobId: backendResult.job_id,
        status: backendResult.status,
        progress: backendResult.progress || 0,
        currentStep: backendResult.current_step || 'Initializing',
        message: backendResult.message,
        jobInfo
      };

      console.log('📤 Generate API - Sending Response to Client:', responseData);
      
      return NextResponse.json(responseData);

    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Request timed out - The generation service took too long to respond. Please try again or check if the service is running.',
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
        return NextResponse.json(
          { 
            success: false, 
            error: 'Generation service is unavailable - Cannot connect to the backend service. Please ensure it is running and accessible.',
            details: fetchError.message
          },
          { status: 503 }
        );
      }
      
      throw fetchError; // Re-throw unexpected errors to outer catch
    }

  } catch (error: unknown) {
    console.error('Generation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start generation - An unexpected error occurred while processing your request.',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}