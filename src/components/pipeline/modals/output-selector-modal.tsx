import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, Podcast } from 'lucide-react';
import { OutputSelectorData } from '@/lib/pipeline-types';

interface OutputSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUpdate: (data: OutputSelectorData) => void;
}

export default function OutputSelectorModal({ open, onOpenChange, onDataUpdate }: OutputSelectorModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'video' | 'podcast' | null>(null);

  const handleConfirm = () => {
    if (selectedFormat) {
      const outputData: OutputSelectorData = {
        selectedFormat
      };
      onDataUpdate(outputData);
      onOpenChange(false);
      setSelectedFormat(null);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedFormat(null);
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

        <div className="space-y-2 mb-3">
          <Button
            variant="outline"
            onClick={() => setSelectedFormat('video')}
            className={`w-full p-2 sm:p-3 text-left transition-all group border-2 ${
              selectedFormat === 'video'
                ? 'bg-blue-500/20 border-blue-500 hover:bg-blue-500/30'
                : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-full transition-all ${
                selectedFormat === 'video' ? 'bg-blue-500/30' : 'bg-gray-600'
              }`}>
                <Video 
                  size={16} 
                  className={`sm:w-5 sm:h-5 transition-colors ${
                    selectedFormat === 'video' ? 'text-blue-400' : 'text-blue-500'
                  }`} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base">Video Content</h4>
                <p className="text-xs text-gray-400">Personalized video with voiceover</p>
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setSelectedFormat('podcast')}
            className={`w-full p-2 sm:p-3 text-left transition-all group border-2 ${
              selectedFormat === 'podcast'
                ? 'bg-purple-500/20 border-purple-500 hover:bg-purple-500/30'
                : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 rounded-full transition-all ${
                selectedFormat === 'podcast' ? 'bg-purple-500/30' : 'bg-gray-600'
              }`}>
                <Podcast 
                  size={16} 
                  className={`sm:w-5 sm:h-5 transition-colors ${
                    selectedFormat === 'podcast' ? 'text-purple-400' : 'text-purple-500'
                  }`} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base">Podcast Episode</h4>
                <p className="text-xs text-gray-400">Personalized audio content</p>
              </div>
            </div>
          </Button>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 border-gray-600 text-sm py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedFormat}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-sm py-2"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}