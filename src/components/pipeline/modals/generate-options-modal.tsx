import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Video, Podcast } from 'lucide-react';

interface GenerateOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (format: 'video' | 'podcast') => void;
}

export default function GenerateOptionsModal({ open, onOpenChange, onGenerate }: GenerateOptionsModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'video' | 'podcast' | null>(null);

  const handleGenerate = () => {
    if (selectedFormat) {
      onGenerate(selectedFormat);
      setSelectedFormat(null);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedFormat(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Generate Content</DialogTitle>
        </DialogHeader>
        
        <p className="text-gray-400 mb-6">Choose your preferred output format:</p>

        <div className="space-y-3 mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedFormat('video')}
            className={`w-full p-4 text-left transition-all group ${
              selectedFormat === 'video'
                ? 'bg-blue-500/20 border-blue-500 hover:bg-blue-500/30'
                : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <Video 
                size={24} 
                className={`transition-transform group-hover:scale-110 ${
                  selectedFormat === 'video' ? 'text-blue-400' : 'text-blue-500'
                }`} 
              />
              <div>
                <h4 className="font-medium">Video Content</h4>
                <p className="text-sm text-gray-400">Generate personalized video with voiceover</p>
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setSelectedFormat('podcast')}
            className={`w-full p-4 text-left transition-all group ${
              selectedFormat === 'podcast'
                ? 'bg-purple-500/20 border-purple-500 hover:bg-purple-500/30'
                : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <Podcast 
                size={24} 
                className={`transition-transform group-hover:scale-110 ${
                  selectedFormat === 'podcast' ? 'text-purple-400' : 'text-purple-500'
                }`} 
              />
              <div>
                <h4 className="font-medium">Podcast Episode</h4>
                <p className="text-sm text-gray-400">Generate personalized audio content</p>
              </div>
            </div>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!selectedFormat}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
