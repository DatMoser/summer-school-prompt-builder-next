import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TitleInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  format: 'video' | 'audio';
  onConfirm: (title: string) => void;
  onCancel: () => void;
}

export default function TitleInputModal({ 
  open, 
  onOpenChange, 
  format, 
  onConfirm, 
  onCancel 
}: TitleInputModalProps) {
  const [title, setTitle] = useState('');

  const handleConfirm = () => {
    if (title.trim()) {
      onConfirm(title.trim());
      setTitle('');
    }
  };

  const handleCancel = () => {
    onCancel();
    setTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      handleConfirm();
    }
  };

  const getPlaceholder = () => {
    return format === 'video' 
      ? 'e.g., "Daily Exercise Routine Video"' 
      : 'e.g., "Heart Health Podcast Episode"';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Name Your {format === 'video' ? 'Video' : 'Podcast'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Give your generated content a descriptive title for easy identification in your gallery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="content-title" className="text-sm font-medium text-gray-300">
              Content Title
            </Label>
            <Input
              id="content-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              maxLength={100}
              autoFocus
            />
            <div className="text-xs text-gray-500 text-right">
              {title.length}/100 characters
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!title.trim()}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
          >
            Continue Generation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}