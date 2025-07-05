import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentService: string;
  onServiceChange: (service: string) => void;
  onApiKeyUpdate?: (apiKey: string | null) => void;
}

export default function SettingsModal({ 
  open, 
  onOpenChange, 
  currentService, 
  onServiceChange,
  onApiKeyUpdate
}: SettingsModalProps) {
  const [selectedService, setSelectedService] = useState(currentService);
  const [useCustomApiKey, setUseCustomApiKey] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  const handleSave = () => {
    onServiceChange("gemini"); // Always use Gemini as the only service
    if (onApiKeyUpdate) {
      onApiKeyUpdate(useCustomApiKey && customApiKey.trim() ? customApiKey.trim() : null);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedService(currentService);
    setUseCustomApiKey(false);
    setCustomApiKey('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md w-[90vw] sm:w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Gemini AI Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your Google Gemini AI settings. The system automatically selects the best service for video or podcast generation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-700 p-3 rounded-md">
            <p className="text-sm text-gray-300 font-medium mb-1">
              AI Service: Google Gemini
            </p>
            <p className="text-xs text-gray-400">
              Automatically uses Gemini 2.0 Flash for content analysis and Veo for video generation based on your output selection.
            </p>
          </div>

          {/* Gemini API Key Configuration */}
          <div className="border-t border-gray-600 pt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">
                Gemini API Key Configuration
              </Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-custom-key"
                  checked={useCustomApiKey}
                  onCheckedChange={(checked) => setUseCustomApiKey(checked as boolean)}
                />
                <Label htmlFor="use-custom-key" className="text-sm text-gray-300 cursor-pointer">
                  Use custom Gemini API key
                </Label>
              </div>
              
              {useCustomApiKey && (
                <div className="space-y-2">
                  <Label htmlFor="api-key" className="text-sm text-gray-400">
                    Gemini API Key
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your Gemini API key..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-400">
                    Your API key will override the default key and be stored securely for this session.
                  </p>
                </div>
              )}
              
              {!useCustomApiKey && (
                <p className="text-xs text-gray-400">
                  Using default Gemini API key. Enable custom key option to use your own.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}