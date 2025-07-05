import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmationModal({ 
  open, 
  onOpenChange, 
  onConfirm,
  title = "Confirm Generation",
  description = "Are you sure you want to generate this content? This will process all your configured pipeline components."
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md w-[90vw] sm:w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="text-yellow-400" size={20} />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-gray-400 mb-6">{description}</p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Confirm & Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}