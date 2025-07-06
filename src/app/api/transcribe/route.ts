import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(request: NextRequest) {
  try {
    const { url, startTime, endTime } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    console.log(`Transcript request for video ID: ${videoId}`);

    console.log('Fetching transcript using youtube-transcript-api');

    try {
      // Fetch transcript using youtube-transcript
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (!transcriptData || transcriptData.length === 0) {
        throw new Error('No transcript available for this video');
      }
      
      // Convert transcript data to text and apply time filtering if needed
      let filteredTranscript = transcriptData;
      
      if (startTime !== undefined || endTime !== undefined) {
        filteredTranscript = transcriptData.filter(item => {
          const itemTime = (item.offset || 0) / 1000; // Convert to seconds
          if (startTime !== undefined && itemTime < startTime) return false;
          if (endTime !== undefined && itemTime > endTime) return false;
          return true;
        });
      }
      
      const transcript = filteredTranscript.map(item => item.text).join(' ');
      
      const result = {
        transcript,
        segments: filteredTranscript.map(item => ({
          text: item.text,
          offset: item.offset || 0,
          duration: item.duration || 0
        }))
      };

      // Now analyze the transcript for style elements using Gemini
      let styleAnalysis = null;
      try {
        console.log('Calling Gemini for style analysis...');
        
        const customApiKey = request.headers.get('x-gemini-api-key');
        
        const styleResponse = await fetch(`${request.nextUrl.origin}/api/analyze-style`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(customApiKey && { 'x-gemini-api-key': customApiKey })
          },
          body: JSON.stringify({
            transcript: result.transcript,
            customApiKey
          })
        });

        if (styleResponse.ok) {
          const styleData = await styleResponse.json();
          styleAnalysis = styleData.styleAnalysis;
          console.log('Style analysis completed successfully');
        } else {
          const errorData = await styleResponse.json().catch(() => ({}));
          console.error('Style analysis failed:', errorData);
        }
      } catch (styleError) {
        console.error('Error during style analysis:', styleError);
      }

      return NextResponse.json({
        success: true,
        transcript: result.transcript,
        segments: result.segments,
        styleAnalysis,
        videoId,
        startTime,
        endTime,
        source: 'youtube-transcript'
      });

    } catch (transcriptError: any) {
      console.error('YouTube transcript error:', transcriptError);
      
      return NextResponse.json(
        { 
          error: transcriptError.message || 'Failed to fetch YouTube transcript',
          videoId
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Transcription error:', error);
    
    return NextResponse.json(
      { error: 'Transcript service error' },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}