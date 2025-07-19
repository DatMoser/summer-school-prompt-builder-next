import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Images, 
  RefreshCw,
  Plus,
  FolderOpen
} from 'lucide-react';
import GalleryGrid from './gallery-grid';
import { GalleryItemData } from './gallery-item';

interface GalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNew?: () => void;
}

// No mock data - gallery items are loaded from localStorage only

export default function GalleryModal({ open, onOpenChange, onCreateNew }: GalleryModalProps) {
  const [items, setItems] = useState<GalleryItemData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load items from localStorage on mount
  useEffect(() => {
    if (open) {
      loadGalleryItems();
    }
  }, [open]);

  const loadGalleryItems = () => {
    setIsLoading(true);
    try {
      const savedItems = localStorage.getItem('pipeline-builder-generation-history');
      if (savedItems) {
        const parsedItems = JSON.parse(savedItems).map((item: GalleryItemData & { createdAt: string }) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        setItems(parsedItems);
      } else {
        // No saved items, start with empty gallery
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to load gallery items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGalleryItems = (updatedItems: GalleryItemData[]) => {
    try {
      localStorage.setItem('pipeline-builder-generation-history', JSON.stringify(updatedItems));
      setItems(updatedItems);
    } catch (error) {
      console.error('Failed to save gallery items:', error);
    }
  };

  // Delete functionality removed as per requirements

  const handlePreviewItem = (item: GalleryItemData) => {
    // Open item in new tab for preview
    window.open(item.downloadUrl, '_blank');
  };

  const handleRefresh = () => {
    loadGalleryItems();
  };

  const getStats = () => {
    const completed = items.filter(item => item.status === 'completed').length;
    const processing = items.filter(item => item.status === 'processing').length;
    const videos = items.filter(item => item.format === 'video').length;
    const audio = items.filter(item => item.format === 'audio').length;
    
    return { completed, processing, videos, audio, total: items.length };
  };

  const stats = getStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-6xl w-[95vw] max-h-[90vh] p-0 flex flex-col overflow-hidden" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Images className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-left">
                  Content Gallery
                </DialogTitle>
                <div className="text-sm text-gray-400 mt-1">
                  Manage your generated health content
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {onCreateNew && (
                <Button
                  size="sm"
                  onClick={onCreateNew}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-600">
              Total: {stats.total}
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30">
              Completed: {stats.completed}
            </Badge>
            {stats.processing > 0 && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                Processing: {stats.processing}
              </Badge>
            )}
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-400/30">
              Videos: {stats.videos}
            </Badge>
            <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-400/30">
              Podcasts: {stats.audio}
            </Badge>
          </div>
        </DialogHeader>

        {/* Actions Bar removed - no delete functionality */}

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading your content...</p>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-800/50 rounded-lg p-8 max-w-md mx-auto">
                    <FolderOpen className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No content yet</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Start creating personalized health content to build your library
                    </p>
                    {onCreateNew && (
                      <Button
                        onClick={onCreateNew}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Content
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <GalleryGrid
                  items={items}
                  onPreviewItem={handlePreviewItem}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}