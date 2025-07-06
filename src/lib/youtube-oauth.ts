import { google } from 'googleapis';

interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
}

interface YouTubeTranscriptResult {
  transcript: string;
  segments: TranscriptSegment[];
}

export async function fetchYouTubeTranscriptWithOAuth(
  videoId: string,
  accessToken: string,
  startTime?: number,
  endTime?: number
): Promise<YouTubeTranscriptResult> {
  try {
    console.log('YouTube OAuth: Starting transcript fetch with token:', {
      videoId,
      hasToken: !!accessToken,
      tokenLength: accessToken?.length || 0
    });
    
    // Create OAuth2 client with access token
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    console.log(`Fetching captions for video ID: ${videoId} with OAuth2`);

    // Step 1: Get list of available captions
    const captionsListResponse = await youtube.captions.list({
      part: ['snippet'],
      videoId: videoId,
    });

    const captions = captionsListResponse.data.items;
    if (!captions || captions.length === 0) {
      throw new Error('No captions available for this video');
    }

    console.log(`Found ${captions.length} caption tracks`);

    // Step 2: Find the best caption track (prefer manual English, then auto-generated)
    let selectedCaption = captions.find(caption => 
      caption.snippet?.language === 'en' && 
      caption.snippet?.trackKind === 'standard'
    );

    // Fallback to auto-generated English
    if (!selectedCaption) {
      selectedCaption = captions.find(caption => 
        caption.snippet?.language === 'en' && 
        caption.snippet?.trackKind === 'ASR'
      );
    }

    // Fallback to any English caption
    if (!selectedCaption) {
      selectedCaption = captions.find(caption => 
        caption.snippet?.language === 'en'
      );
    }

    // Final fallback to the first available caption
    if (!selectedCaption) {
      selectedCaption = captions[0];
    }

    if (!selectedCaption?.id) {
      throw new Error('No suitable caption track found');
    }

    console.log(`Using caption track: ${selectedCaption.snippet?.name} (${selectedCaption.snippet?.language})`);

    // Step 3: Download the caption content
    const captionResponse = await youtube.captions.download({
      id: selectedCaption.id,
      tfmt: 'ttml', // Request TTML format for timing information
    });

    if (!captionResponse.data) {
      throw new Error('Failed to download caption data');
    }

    // Step 4: Parse the TTML content
    const captionContent = String(captionResponse.data);
    const segments = parseTTMLContent(captionContent);

    // Step 5: Filter by time range if specified
    let filteredSegments = segments;
    if (startTime !== undefined || endTime !== undefined) {
      filteredSegments = segments.filter(segment => {
        const segmentTime = segment.offset / 1000; // Convert to seconds
        if (startTime !== undefined && segmentTime < startTime) return false;
        if (endTime !== undefined && segmentTime > endTime) return false;
        return true;
      });
    }

    // Step 6: Combine all text
    const transcript = filteredSegments.map(segment => segment.text).join(' ');

    return {
      transcript,
      segments: filteredSegments
    };

  } catch (error: any) {
    console.error('YouTube OAuth API error:', error);
    
    if (error.code === 401) {
      throw new Error('Authentication failed. Please sign in again.');
    }
    
    if (error.code === 403) {
      if (error.message?.includes('caption track') || error.message?.includes('third-party contributions')) {
        throw new Error(
          'This video\'s captions are not available for third-party access.\n\n' +
          '📺 YouTube only allows caption downloads from:\n' +
          '• Your own uploaded videos\n' +
          '• Videos that explicitly enable third-party contributions\n\n' +
          '💡 Try using the "Manual Description" tab instead to describe your preferred communication style.'
        );
      }
      throw new Error('Access denied. Please ensure you have granted YouTube permissions.');
    }
    
    if (error.code === 404) {
      throw new Error('Video not found or captions not available.');
    }
    
    if (error.message?.includes('quota')) {
      throw new Error('YouTube API quota exceeded. Please try again later.');
    }

    throw new Error(`YouTube API error: ${error.message || 'Unknown error'}`);
  }
}

function parseTTMLContent(content: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  
  try {
    // Parse TTML format - extract <p> elements with timing
    const pElements = content.match(/<p[^>]*begin="([^"]*)"[^>]*dur="([^"]*)"[^>]*>(.*?)<\/p>/gs);
    
    if (pElements) {
      pElements.forEach(element => {
        const beginMatch = element.match(/begin="([^"]*)"/);
        const durMatch = element.match(/dur="([^"]*)"/);
        const textMatch = element.match(/>(.*?)<\/p>/s);
        
        if (beginMatch && textMatch) {
          const offset = parseTimeToMs(beginMatch[1]);
          const duration = durMatch ? parseTimeToMs(durMatch[1]) : 3000;
          const text = textMatch[1]
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&amp;/g, '&')   // Decode HTML entities
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
          
          if (text) {
            segments.push({ text, offset, duration });
          }
        }
      });
    } else {
      // If TTML parsing fails, treat as plain text
      const lines = content.split('\n').filter(line => line.trim());
      lines.forEach((line, index) => {
        if (line.trim()) {
          segments.push({
            text: line.trim(),
            offset: index * 3000, // Assume 3 seconds per line
            duration: 3000
          });
        }
      });
    }

    return segments;
  } catch (error) {
    console.error('Error parsing TTML content:', error);
    // Fallback: return content as single segment
    return [{
      text: content.replace(/<[^>]*>/g, '').trim(),
      offset: 0,
      duration: 0
    }];
  }
}

function parseTimeToMs(timeStr: string): number {
  // Parse formats like "0.5s", "1.234s", "00:01:30.500"
  if (timeStr.endsWith('s')) {
    return parseFloat(timeStr.slice(0, -1)) * 1000;
  }
  
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const [hours, minutes, secondsStr] = parts;
      const seconds = parseFloat(secondsStr);
      return (
        parseInt(hours) * 3600000 +
        parseInt(minutes) * 60000 +
        seconds * 1000
      );
    }
  }
  
  return parseFloat(timeStr) * 1000;
}