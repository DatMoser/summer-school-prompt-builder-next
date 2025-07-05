import { Dialog, DialogContent } from '@/components/ui/dialog';

interface LoadingModalProps {
  open: boolean;
  progress: number;
  status: string;
}

export default function LoadingModal({ open, progress, status }: LoadingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md w-[90vw] sm:w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <div className="text-center py-4">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Generating Your Content</h3>
          <p className="text-gray-400 mb-4">Processing your personalized media pipeline...</p>
          
          <div className="bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500">{status}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
