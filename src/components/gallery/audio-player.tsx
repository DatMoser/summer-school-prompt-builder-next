import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  ExternalLink 
} from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title: string;
  onFallbackToTab?: () => void;
  className?: string;
}

export default function AudioPlayer({ src, title, onFallbackToTab, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || hasError) {
      if (onFallbackToTab) {
        onFallbackToTab();
      }
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setHasError(true);
      if (onFallbackToTab) {
        onFallbackToTab();
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (audio && !isNaN(duration) && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percent = clickX / rect.width;
      const newTime = percent * duration;
      audio.currentTime = Math.max(0, Math.min(newTime, duration));
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-300 font-medium">Audio playback failed</p>
              <p className="text-xs text-gray-500">Click to open in new tab</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onFallbackToTab}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-gray-800 to-gray-750 border border-gray-600 rounded-xl p-4 shadow-lg ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
      />
      
      <div className="space-y-4">
        {/* Title */}
        <div className="text-sm text-gray-100 font-medium truncate" title={title}>
          {title}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div 
            className="relative w-full h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 border-blue-500 transition-all duration-150 ease-out"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Play/Pause Button */}
          <Button
            size="sm"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white w-10 h-10 rounded-full p-0 shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
          
          {/* Fallback Button */}
          {onFallbackToTab && (
            <Button
              size="sm"
              variant="outline"
              onClick={onFallbackToTab}
              className="bg-gray-700/50 border-gray-500 text-gray-300 hover:bg-gray-600/50 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200"
              title="Open in new tab"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              <span className="text-xs">Open</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}