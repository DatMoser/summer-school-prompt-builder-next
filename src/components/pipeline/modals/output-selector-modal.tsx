import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, Podcast } from 'lucide-react';
import { OutputSelectorData } from '@/lib/pipeline-types';

interface OutputSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUpdate: (data: OutputSelectorData) => void;
  currentData?: OutputSelectorData | null;
  hasGeminiKey?: boolean;
  onOpenSettings?: () => void;
}

export default function OutputSelectorModal({ open, onOpenChange, onDataUpdate, currentData, hasGeminiKey, onOpenSettings }: OutputSelectorModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'video' | 'podcast' | null>(null);

  // Initialize with current data when modal opens, default to podcast
  useEffect(() => {
    if (open && currentData?.selectedFormat) {
      setSelectedFormat(currentData.selectedFormat as 'video' | 'podcast');
    } else if (open && !currentData) {
      setSelectedFormat('podcast'); // Default to podcast
    }
  }, [open, currentData]);

  const handleConfirm = () => {
    if (selectedFormat) {
      const outputData: OutputSelectorData = {
        selectedFormat
      };
      onDataUpdate(outputData);
      onOpenChange(false);
      // Don't reset selection here - keep it for next time
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset to current data on cancel
    if (currentData?.selectedFormat) {
      setSelectedFormat(currentData.selectedFormat as 'video' | 'podcast');
    } else {
      setSelectedFormat(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-sm w-[85vw] sm:w-full max-h-[75vh] overflow-y-auto p-3 sm:p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base sm:text-lg font-semibold">Output Format</DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Choose your output format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mb-4">
          {/* Podcast option - now first and default */}
          <div 
            onClick={() => setSelectedFormat('podcast')}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
              selectedFormat === 'podcast'
                ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full transition-all duration-200 ${
                selectedFormat === 'podcast' 
                  ? 'bg-purple-500/30 ring-2 ring-purple-400/50' 
                  : 'bg-gray-600 group-hover:bg-gray-500'
              }`}>
                <Podcast 
                  size={20} 
                  className={`transition-colors duration-200 ${
                    selectedFormat === 'podcast' ? 'text-purple-300' : 'text-purple-400 group-hover:text-purple-300'
                  }`} 
                />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-base mb-1 transition-colors ${
                  selectedFormat === 'podcast' ? 'text-purple-100' : 'text-white group-hover:text-purple-100'
                }`}>
                  Podcast Episode
                </h4>
                <p className="text-sm text-gray-400 group-hover:text-gray-300">
                  Personalized audio content with natural voice narration
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                selectedFormat === 'podcast'
                  ? 'border-purple-400 bg-purple-500'
                  : 'border-gray-500 group-hover:border-gray-400'
              }`}>
                {selectedFormat === 'podcast' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
          
          {/* Video option - only show if Gemini key is available */}
          {hasGeminiKey && (
            <div 
              onClick={() => setSelectedFormat('video')}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                selectedFormat === 'video'
                  ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full transition-all duration-200 ${
                  selectedFormat === 'video' 
                    ? 'bg-blue-500/30 ring-2 ring-blue-400/50' 
                    : 'bg-gray-600 group-hover:bg-gray-500'
                }`}>
                  <Video 
                    size={20} 
                    className={`transition-colors duration-200 ${
                      selectedFormat === 'video' ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300'
                    }`} 
                  />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-base mb-1 transition-colors ${
                    selectedFormat === 'video' ? 'text-blue-100' : 'text-white group-hover:text-blue-100'
                  }`}>
                    Video Content
                  </h4>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300">
                    Personalized video content with sound
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  selectedFormat === 'video'
                    ? 'border-blue-400 bg-blue-500'
                    : 'border-gray-500 group-hover:border-gray-400'
                }`}>
                  {selectedFormat === 'video' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Message when video is not available */}
          {!hasGeminiKey && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-gray-600 bg-gray-700/50 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gray-600">
                    <Video size={20} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-base mb-1 text-gray-300">
                      Video Content
                    </h4>
                    <p className="text-sm text-gray-400">
                      Requires Gemini API key. Configure in Settings to enable video generation.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Configure API Key Button */}
              {onOpenSettings && (
                <div className="text-center">
                  <Button
                    onClick={() => {
                      onOpenSettings();
                      onOpenChange(false);
                    }}
                    variant="outline"
                    className="bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 text-sm px-4 py-2"
                  >
                    Configure Gemini API Key
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 border-gray-600 text-white py-2.5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedFormat}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white py-2.5 font-medium"
          >
            Confirm Selection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}