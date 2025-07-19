import { NextRequest, NextResponse } from 'next/server';

// Types for MCP API
interface MCPGenerationRequest {
  mode: 'video' | 'audio';
  prompt: string;
  image?: {
    bytesBase64Encoded?: string;
    gcsUri?: string;
    mimeType?: string;
  };
  lastFrame?: {
    bytesBase64Encoded?: string;
    gcsUri?: string;
    mimeType?: string;
  };
  video?: {
    bytesBase64Encoded?: string;
    gcsUri?: string;
    mimeType?: string;
  };
  parameters?: {
    aspectRatio?: string;
    durationSeconds?: number;
    enhancePrompt?: boolean;
    generateAudio?: boolean;
    negativePrompt?: string;
    personGeneration?: string;
    resolution?: string;
    sampleCount?: number;
    seed?: number;
    storageUri?: string;
  };
}

interface MCPGenerationResponse {
  job_id: string;
  status: 'queued' | 'started' | 'finished' | 'failed';
  progress: number;
  current_step: string;
  total_steps: number;
  step_number: number;
}

// Environment configuration
const MCP_BASE_URL = process.env.MCP_BASE_URL || 'http://localhost:8000';

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
      customApiKey
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

    // Build MCP request
    const mcpRequest: MCPGenerationRequest = {
      mode: format,
      prompt: enhancedPrompt,
      parameters: {
        aspectRatio: '16:9',
        durationSeconds: format === 'video' ? 30 : 120, // 30s video, 2min audio
        enhancePrompt: true,
        generateAudio: true,
        sampleCount: 1
      }
    };

    // Make request to MCP service
    const mcpResponse = await fetch(`${MCP_BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(customApiKey && { 'Authorization': `Bearer ${customApiKey}` })
      },
      body: JSON.stringify(mcpRequest)
    });

    if (!mcpResponse.ok) {
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

    const mcpResult: MCPGenerationResponse = await mcpResponse.json();

    // Store generation job info for tracking
    const jobInfo = {
      id: mcpResult.job_id,
      format,
      prompt: enhancedPrompt,
      originalPrompt: prompt,
      evidenceUsed: !!evidenceData?.fileContent,
      styleUsed: !!styleData,
      personalDataUsed: !!personalData,
      createdAt: new Date().toISOString(),
      status: mcpResult.status,
      progress: mcpResult.progress,
      currentStep: mcpResult.current_step,
      totalSteps: mcpResult.total_steps,
      stepNumber: mcpResult.step_number
    };

    return NextResponse.json({
      success: true,
      jobId: mcpResult.job_id,
      status: mcpResult.status,
      progress: mcpResult.progress,
      currentStep: mcpResult.current_step,
      totalSteps: mcpResult.total_steps,
      stepNumber: mcpResult.step_number,
      jobInfo
    });

  } catch (error: unknown) {
    console.error('Generation API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to start generation',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}