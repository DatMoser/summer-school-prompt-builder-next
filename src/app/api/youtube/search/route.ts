import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { maxResults = 50, pageToken } = await request.json();

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

    console.log(`Fetching user's uploaded videos with max results: ${maxResults}`);

    // First, get the user's channel ID
    const channelResponse = await youtube.channels.list({
      part: ['id', 'contentDetails'],
      mine: true,
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return NextResponse.json({ error: 'No channel found for authenticated user' }, { status: 404 });
    }

    const channel = channelResponse.data.items[0];
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return NextResponse.json({ error: 'No uploads playlist found' }, { status: 404 });
    }

    // Get videos from the uploads playlist
    const playlistParams: any = {
      part: ['snippet'],
      playlistId: uploadsPlaylistId,
      maxResults: maxResults,
    };

    if (pageToken) {
      playlistParams.pageToken = pageToken;
    }

    const playlistResponse = await youtube.playlistItems.list(playlistParams);
    const playlistItems = playlistResponse.data.items || [];

    // Extract video IDs to check for captions
    const videoIds = playlistItems
      .map(item => item.snippet?.resourceId?.videoId)
      .filter(id => id) as string[];

    if (videoIds.length === 0) {
      return NextResponse.json({
        videos: [],
        totalResults: 0,
        nextPageToken: null,
        source: 'youtube-uploads-playlist',
      });
    }

    // Check which videos have captions
    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: videoIds,
    });

    const videosWithDetails = videosResponse.data.items || [];

    // Check for captions availability
    const captionPromises = videosWithDetails.map(async (video) => {
      try {
        const captionsResponse = await youtube.captions.list({
          part: ['snippet'],
          videoId: video.id!,
        });
        return {
          videoId: video.id!,
          hasCaption: captionsResponse.data.items && captionsResponse.data.items.length > 0,
        };
      } catch (error) {
        console.warn(`Failed to check captions for video ${video.id}:`, error);
        return {
          videoId: video.id!,
          hasCaption: false,
        };
      }
    });

    const captionResults = await Promise.all(captionPromises);
    const captionMap = new Map(captionResults.map(r => [r.videoId, r.hasCaption]));

    // Filter videos that have captions
    const videosWithCaptions = videosWithDetails
      .filter(video => captionMap.get(video.id!) === true)
      .map(video => ({
        id: video.id!,
        snippet: {
          title: video.snippet?.title || 'Untitled',
          channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
          description: video.snippet?.description || '',
          thumbnails: video.snippet?.thumbnails || {},
          publishedAt: video.snippet?.publishedAt || '',
          duration: video.contentDetails?.duration || '',
        },
        hasCaption: true,
      }));

    console.log(`Found ${videosWithCaptions.length} uploaded videos with captions`);

    return NextResponse.json({
      videos: videosWithCaptions,
      totalResults: videosWithCaptions.length,
      nextPageToken: playlistResponse.data.nextPageToken || null,
      source: 'youtube-uploads-playlist',
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
      return NextResponse.json({ error: 'No videos found or YouTube API unavailable.' }, { status: 404 });
    }
    
    if (error.message?.includes('quota')) {
      return NextResponse.json({ error: 'YouTube API quota exceeded. Please try again later.' }, { status: 429 });
    }

    return NextResponse.json({ 
      error: `YouTube search failed: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
}