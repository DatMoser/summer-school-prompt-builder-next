import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Headphones, 
  Download, 
  Play, 
  Clock,
  Calendar,
  FileIcon,
  ExternalLink,
  Trash2
} from 'lucide-react';
import AudioPlayer from './audio-player';

export interface GalleryItemData {
  id: string;
  title: string;
  format: 'video' | 'audio';
  downloadUrl: string | null;
  thumbnailUrl?: string;
  duration?: number | null;
  fileSize?: number | null;
  createdAt: Date;
  status: 'completed' | 'processing' | 'failed' | 'finished' | 'started' | 'queued';
  progress?: number;
  error?: string;
  lastUpdated?: string;
  metadata?: {
    evidenceUsed: boolean;
    styleUsed: boolean;
    personalDataUsed: boolean;
    connectedComponents?: string[];
  };
  evidenceData?: any;
  styleData?: any;
  personalData?: any;
}

interface GalleryItemProps {
  item: GalleryItemData;
  onPreview?: (item: GalleryItemData) => void;
  onDelete?: (itemId: string) => void;
}

export default function GalleryItem({ item, onPreview, onDelete }: GalleryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'finished':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30';
      case 'processing':
      case 'started':
      case 'queued':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const handleDownload = () => {
    if (item.downloadUrl) {
      window.open(item.downloadUrl, '_blank');
    }
  };

  const handleThumbnailDownload = () => {
    if (item.thumbnailUrl) {
      window.open(item.thumbnailUrl, '_blank');
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(item);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      onDelete(item.id);
    }
  };

  return (
    <Card 
      className="bg-gray-800 border-gray-700 overflow-hidden transition-all duration-200 hover:bg-gray-700/50 hover:border-gray-600 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Thumbnail/Preview Area - Clickable for downloads */}
        <div 
          className="relative aspect-video bg-gray-900/50 flex items-center justify-center cursor-pointer group/thumbnail" 
          onClick={(item.status === 'completed' || item.status === 'finished') && item.downloadUrl ? handleDownload : undefined}
          title={(item.status === 'completed' || item.status === 'finished') && item.downloadUrl ? `Click to download ${item.title}` : undefined}
        >
          {item.thumbnailUrl ? (
            <img 
              src={item.thumbnailUrl} 
              alt={item.title}
              className="w-full h-full object-cover transition-opacity group-hover/thumbnail:opacity-80"
            />
          ) : (
            <div className="flex items-center justify-center">
              {item.format === 'video' ? (
                <Video className="w-12 h-12 text-gray-500 group-hover/thumbnail:text-gray-400 transition-colors" />
              ) : (
                <Headphones className="w-12 h-12 text-gray-500 group-hover/thumbnail:text-gray-400 transition-colors" />
              )}
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(item.status)}`}
            >
              {item.status}
            </Badge>
          </div>

          {/* Format Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-gray-800/80 text-gray-300 border-gray-600 text-xs">
              {item.format.toUpperCase()}
            </Badge>
          </div>

          {/* Download Overlay - appears on hover when ready */}
          {(item.status === 'completed' || item.status === 'finished') && item.downloadUrl && isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Download className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-medium">Click to Download</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-3">
          {/* Title */}
          <h3 className="font-medium text-white text-sm mb-3 line-clamp-2">
            {item.title}
          </h3>

          {/* Audio Player for audio content */}
          {item.format === 'audio' && (item.status === 'completed' || item.status === 'finished') && item.downloadUrl && (
            <div className="mb-3 space-y-2">
              <AudioPlayer
                src={item.downloadUrl}
                title=""
                onFallbackToTab={handlePreview}
                className="bg-gray-900/50 border-gray-600"
              />
              
              {/* Download buttons for audio */}
              <div className="flex gap-2">
                {item.thumbnailUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleThumbnailDownload}
                    className="flex-1 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Thumbnail
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1 bg-blue-600/20 border-blue-400/30 text-blue-300 hover:bg-blue-600/30 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Audio
                </Button>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-xs text-gray-400 mb-3">
            <div className="flex items-center gap-4">
              {item.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(item.duration)}</span>
                </div>
              )}
              {item.fileSize && (
                <div className="flex items-center gap-1">
                  <FileIcon className="w-3 h-3" />
                  <span>{formatFileSize(item.fileSize)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(item.createdAt)}</span>
            </div>

            {/* Usage Indicators */}
            {(item.metadata?.evidenceUsed || item.metadata?.styleUsed || item.metadata?.personalDataUsed) && (
              <div className="flex gap-1 mt-1">
                {item.metadata?.evidenceUsed && (
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-400/30 text-xs px-2 py-0">
                    Evidence
                  </Badge>
                )}
                {item.metadata?.styleUsed && (
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-400/30 text-xs px-2 py-0">
                    Style
                  </Badge>
                )}
                {item.metadata?.personalDataUsed && (
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-400/30 text-xs px-2 py-0">
                    Personal
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons - Only show delete for failed/incomplete items */}
          <div className="flex gap-2">
            {/* Delete button for failed jobs or when explicitly enabled */}
            {(item.status === 'failed' || item.status === 'started' || item.status === 'queued') && onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                className="bg-red-600/20 border-red-400/30 text-red-300 hover:bg-red-600/30 text-xs"
                title={`Delete ${item.title}`}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
            
            {/* Completed items show helpful instruction */}
            {(item.status === 'completed' || item.status === 'finished') && item.downloadUrl && item.format === 'video' && (
              <div className="flex-1 text-xs text-gray-500 text-center py-2">
                Click thumbnail to download
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}