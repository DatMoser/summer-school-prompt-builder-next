import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you'd query a database here
    // For now, return mock data based on ID
    const mockItem = {
      id: itemId,
      title: `Gallery Item ${itemId}`,
      format: 'audio' as const,
      downloadUrl: `https://example.com/audio/${itemId}`,
      duration: 1245,
      fileSize: 15680000,
      createdAt: new Date().toISOString(),
      status: 'completed' as const,
      metadata: {
        evidenceUsed: true,
        styleUsed: true,
        personalDataUsed: true
      }
    };

    return NextResponse.json({
      success: true,
      item: mockItem
    });

  } catch (error: unknown) {
    console.error('Gallery item GET API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch gallery item',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    const body = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Extract updatable fields
    const { title, metadata } = body;

    // In a real implementation, you'd update the database here
    // For now, just return the updated item
    const updatedItem = {
      id: itemId,
      title: title || `Updated Item ${itemId}`,
      format: 'audio' as const,
      downloadUrl: `https://example.com/audio/${itemId}`,
      duration: 1245,
      fileSize: 15680000,
      createdAt: new Date().toISOString(),
      status: 'completed' as const,
      metadata: metadata || {
        evidenceUsed: true,
        styleUsed: true,
        personalDataUsed: true
      }
    };

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: 'Gallery item updated successfully'
    });

  } catch (error: unknown) {
    console.error('Gallery item PUT API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update gallery item',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you'd delete from database here
    // You might also want to delete the actual file from storage
    
    return NextResponse.json({
      success: true,
      deletedId: itemId,
      message: 'Gallery item deleted successfully'
    });

  } catch (error: unknown) {
    console.error('Gallery item DELETE API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete gallery item',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}