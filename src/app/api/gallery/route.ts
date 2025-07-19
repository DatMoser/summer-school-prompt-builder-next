import { NextRequest, NextResponse } from 'next/server';

// Gallery item interface (matches the frontend type)
interface GalleryItem {
  id: string;
  title: string;
  format: 'video' | 'audio';
  downloadUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  createdAt: string; // ISO string
  status: 'completed' | 'processing' | 'failed';
  metadata: {
    evidenceUsed: boolean;
    styleUsed: boolean;
    personalDataUsed: boolean;
  };
}

// This is a simple server-side gallery management
// In a real application, you'd use a database with user authentication
// For now, we'll use a simple in-memory store or file-based storage

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // const userId = searchParams.get('userId') || 'default'; // In real app, get from auth
    const format = searchParams.get('format'); // 'video' | 'audio'
    const status = searchParams.get('status'); // 'completed' | 'processing' | 'failed'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // In a real implementation, you'd query a database here
    // For now, return mock data or read from a file
    const mockItems: GalleryItem[] = [
      {
        id: '1',
        title: 'Personalized Heart Health Podcast Episode',
        format: 'audio',
        downloadUrl: 'https://example.com/audio/1',
        duration: 1245,
        fileSize: 15680000,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'completed',
        metadata: {
          evidenceUsed: true,
          styleUsed: true,
          personalDataUsed: true
        }
      },
      {
        id: '2',
        title: 'Daily Exercise Motivation Video',
        format: 'video',
        downloadUrl: 'https://example.com/video/2',
        thumbnailUrl: 'https://via.placeholder.com/400x225/1f2937/ffffff?text=Exercise+Video',
        duration: 180,
        fileSize: 25600000,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: 'completed',
        metadata: {
          evidenceUsed: false,
          styleUsed: true,
          personalDataUsed: true
        }
      }
    ];

    // Filter items based on query parameters
    let filteredItems = mockItems;
    
    if (format) {
      filteredItems = filteredItems.filter(item => item.format === format);
    }
    
    if (status) {
      filteredItems = filteredItems.filter(item => item.status === status);
    }

    // Apply pagination
    const paginatedItems = filteredItems.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      items: paginatedItems,
      total: filteredItems.length,
      offset,
      limit,
      hasMore: offset + limit < filteredItems.length
    });

  } catch (error: unknown) {
    console.error('Gallery GET API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch gallery items',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      jobId,
      title,
      format,
      downloadUrl,
      thumbnailUrl,
      duration,
      fileSize,
      metadata 
    } = body;

    // Validate required fields
    if (!jobId || !title || !format || !downloadUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new gallery item
    const newItem: GalleryItem = {
      id: jobId,
      title,
      format,
      downloadUrl,
      thumbnailUrl,
      duration,
      fileSize,
      createdAt: new Date().toISOString(),
      status: 'completed',
      metadata: {
        evidenceUsed: metadata?.evidenceUsed || false,
        styleUsed: metadata?.styleUsed || false,
        personalDataUsed: metadata?.personalDataUsed || false
      }
    };

    // In a real implementation, you'd save to a database here
    // For now, we'll just return the created item
    
    return NextResponse.json({
      success: true,
      item: newItem,
      message: 'Gallery item created successfully'
    });

  } catch (error: unknown) {
    console.error('Gallery POST API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create gallery item',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',') || [];
    // const userId = searchParams.get('userId') || 'default';

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No item IDs provided' },
        { status: 400 }
      );
    }

    // In a real implementation, you'd delete from database here
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      deletedIds: ids,
      message: `${ids.length} item(s) deleted successfully`
    });

  } catch (error: unknown) {
    console.error('Gallery DELETE API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete gallery items',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}