import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const STYLE_ANALYSIS_PROMPT = `
Analyze the following transcript for communication style elements. Provide a detailed analysis in the following JSON format:

{
  "tone": "A descriptive summary of the speaker's tone (e.g., 'casual and conversational', 'professional and authoritative', 'enthusiastic and energetic', 'calm and instructional')",
  "pace": "Description of speaking pace and sentence structure (e.g., 'fast-paced with short, punchy sentences', 'moderate pace with balanced explanations', 'slow and deliberate with detailed descriptions')",
  "vocabulary": "Analysis of language complexity and word choice (e.g., 'simple and accessible', 'technical and specialized', 'formal and academic', 'colloquial and everyday')",
  "keyPhrases": ["Array of 3-5 distinctive phrases or expressions that characterize the speaker's style"],
  "communicationStyle": "Overall communication approach (e.g., 'direct and to-the-point', 'storytelling and narrative', 'question-driven and interactive', 'explanatory and educational')",
  "personalityTraits": ["Array of 2-4 personality traits evident in the communication (e.g., 'friendly', 'authoritative', 'humorous', 'empathetic')"],
  "audience": "Who this communication style would appeal to (e.g., 'general audience', 'professionals', 'students', 'casual learners')"
}

Focus on extracting actionable insights that could be used to replicate this communication style. Be specific and detailed in your analysis.

Transcript:
`;

export async function POST(request: NextRequest) {
  try {
    const { transcript, customApiKey } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Get API key from request header or environment
    const apiKey = customApiKey || request.headers.get('x-gemini-api-key') || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is required. Please provide it in the request or set GEMINI_API_KEY environment variable.' },
        { status: 400 }
      );
    }

    console.log('Analyzing transcript with Gemini Pro...');

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create the full prompt
    const fullPrompt = STYLE_ANALYSIS_PROMPT + transcript;

    // Generate the analysis
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const analysisText = response.text();

    console.log('Raw Gemini response:', analysisText);

    // Try to parse the JSON response
    let styleAnalysis;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        styleAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      // Fallback: create a structured response from the text
      styleAnalysis = {
        tone: "Analysis completed",
        pace: "Moderate",
        vocabulary: "Mixed",
        keyPhrases: ["style analysis", "communication patterns"],
        communicationStyle: "Analytical",
        personalityTraits: ["thoughtful"],
        audience: "general audience",
        rawAnalysis: analysisText
      };
    }

    return NextResponse.json({
      success: true,
      styleAnalysis,
      transcript: transcript.substring(0, 500) + (transcript.length > 500 ? '...' : '') // Return truncated transcript for confirmation
    });

  } catch (error) {
    console.error('Style analysis error:', error);
    
    if (error instanceof Error) {
      // Handle specific API errors
      if (error.message.includes('API_KEY')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Gemini API key.' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('quota') || error.message.includes('rate')) {
        return NextResponse.json(
          { error: 'API quota exceeded or rate limited. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze style' },
      { status: 500 }
    );
  }
}