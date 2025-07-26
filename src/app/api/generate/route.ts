import { NextRequest, NextResponse } from 'next/server';

// Types for Backend API
interface BackendGenerationRequest {
  mode: 'video' | 'audio';
  prompt: string;
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
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract generation parameters from request
    const {
      format,
      prompt,
      evidenceData,
      styleData,
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

    // Build the enhanced prompt with all context
    let enhancedPrompt = prompt;
    
    if (evidenceData?.fileContent) {
      enhancedPrompt += `\n\nEvidence-based guidelines:\n${evidenceData.fileContent.substring(0, 2000)}`;
    }
    
    if (styleData) {
      const styleDescription = [
        styleData.tone && `Tone: ${styleData.tone}`,
        styleData.pace && `Pace: ${styleData.pace}`,
        styleData.vocabulary && `Vocabulary: ${styleData.vocabulary}`,
        styleData.energy && `Energy: ${styleData.energy}`,
        styleData.formality && `Formality: ${styleData.formality}`,
        styleData.humor && `Humor: ${styleData.humor}`,
        styleData.empathy && `Empathy: ${styleData.empathy}`,
        styleData.confidence && `Confidence: ${styleData.confidence}`,
        styleData.storytelling && `Storytelling: ${styleData.storytelling}`,
        styleData.targetAudience && `Target audience: ${styleData.targetAudience}`,
        styleData.contentStructure && `Content structure: ${styleData.contentStructure}`
      ].filter(Boolean).join(', ');
      
      if (styleDescription) {
        enhancedPrompt += `\n\nCommunication style: ${styleDescription}`;
      }
      
      if (styleData.keyPhrases?.length) {
        enhancedPrompt += `\n\nKey phrases to include: ${styleData.keyPhrases.join(', ')}`;
      }
    }
    
    if (personalData) {
      const personalDescription = [
        personalData.averageDailySteps && `Average daily steps: ${personalData.averageDailySteps.toLocaleString()}`,
        personalData.averageHeartRate && `Average heart rate: ${personalData.averageHeartRate} BPM`,
        personalData.age && `Age: ${personalData.age} years`,
        personalData.biologicalSex && `Biological sex: ${personalData.biologicalSex}`,
        personalData.fitnessGoals && `Fitness goals: ${personalData.fitnessGoals}`,
        personalData.restingHeartRate && `Resting heart rate: ${personalData.restingHeartRate} BPM`
      ].filter(Boolean).join(', ');
      
      if (personalDescription) {
        enhancedPrompt += `\n\nPersonal health data: ${personalDescription}`;
      }
    }

    // Build credentials object - only for video generation or when explicitly provided
    const credentials: any = {};
    
    // For video generation, we need credentials
    if (format === 'video') {
      const geminiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Gemini API key is required for video generation. Please provide it in Settings or set GEMINI_API_KEY environment variable.' 
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
      // Only add custom API key if provided
      const geminiKey = customApiKey || process.env.GEMINI_API_KEY;
      if (geminiKey && customApiKey) { // Only add if custom key provided, not env var
        credentials.gemini_api_key = geminiKey;
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
      generate_thumbnail: format === 'audio', // Generate thumbnails for audio content
    };

    // Only add credentials if we have any (for video or explicit audio credentials)
    if (Object.keys(credentials).length > 0) {
      backendRequest.credentials = credentials;
    }

    // Add thumbnail prompt for audio
    if (format === 'audio') {
      backendRequest.thumbnail_prompt = `Professional ${styleData?.tone || 'modern'} podcast cover design`;
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
    console.log(`Generating ${format} content with request:`, {
      mode: backendRequest.mode,
      generate_thumbnail: backendRequest.generate_thumbnail,
      credentials: backendRequest.credentials ? Object.keys(backendRequest.credentials).reduce((acc, key) => {
        acc[key] = key.includes('key') || key.includes('credentials') ? '[REDACTED]' : backendRequest.credentials[key];
        return acc;
      }, {} as any) : 'none',
      parameters: backendRequest.parameters || 'none'
    });

    // Make request to backend service with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const backendResponse = await fetch(`${BACKEND_URL}/mcp`, {
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

      // Store generation job info for tracking
      const jobInfo = {
        id: backendResult.job_id,
        format,
        prompt: enhancedPrompt,
        originalPrompt: prompt,
        evidenceUsed: !!evidenceData?.fileContent,
        styleUsed: !!styleData,
        personalDataUsed: !!personalData,
        createdAt: new Date().toISOString(),
        status: backendResult.status,
        progress: backendResult.progress || 0,
        currentStep: backendResult.current_step || 'Initializing',
        message: backendResult.message
      };

      return NextResponse.json({
        success: true,
        jobId: backendResult.job_id,
        status: backendResult.status,
        progress: backendResult.progress || 0,
        currentStep: backendResult.current_step || 'Initializing',
        message: backendResult.message,
        jobInfo
      });

    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Backend request timed out after 30 seconds');
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
        console.error('Backend service connection failed:', fetchError.message);
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