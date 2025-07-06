import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { query, maxResults = 10 } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Get the access token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

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

    console.log(`Searching YouTube for: "${query}" with max results: ${maxResults}`);

    // Search for videos using YouTube Data API with caption filter
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults: maxResults,
      order: 'relevance',
      videoCaption: 'closedCaption', // Only return videos with captions
    });

    const searchResults = searchResponse.data.items || [];

    // Process search results - YouTube Data API already filtered for videos with captions
    const videosWithCaptions = searchResults
      .filter(video => video.id?.videoId)
      .map(video => ({
        id: video.id.videoId,
        snippet: {
          title: video.snippet?.title || 'Untitled',
          channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
          description: video.snippet?.description || '',
          thumbnails: video.snippet?.thumbnails || {},
          publishedAt: video.snippet?.publishedAt || '',
        },
        hasCaption: true, // Guaranteed by YouTube Data API filter
      }));

    console.log(`Found ${videosWithCaptions.length} videos with captions from YouTube Data API search`);

    return NextResponse.json({
      videos: videosWithCaptions,
      totalResults: videosWithCaptions.length,
      searchQuery: query,
      source: 'youtube-data-api',
    });

  } catch (error: any) {
    console.error('YouTube search API error:', error);
    
    if (error.code === 401) {
      return NextResponse.json({ error: 'Authentication failed. Please sign in again.' }, { status: 401 });
    }
    
    if (error.code === 403) {
      return NextResponse.json({ error: 'Access denied. Please ensure you have granted YouTube permissions.' }, { status: 403 });
    }
    
    if (error.code === 404) {
      return NextResponse.json({ error: 'YouTube API not found or unavailable.' }, { status: 404 });
    }
    
    if (error.message?.includes('quota')) {
      return NextResponse.json({ error: 'YouTube API quota exceeded. Please try again later.' }, { status: 429 });
    }

    return NextResponse.json({ 
      error: `YouTube search failed: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
}