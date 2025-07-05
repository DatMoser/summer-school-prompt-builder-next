import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PersonalHealthData } from '@/lib/pipeline-types';
import { Activity, Heart } from 'lucide-react';

interface PersonalDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUpdate: (data: PersonalHealthData) => void;
}

export default function PersonalDataModal({ open, onOpenChange, onDataUpdate }: PersonalDataModalProps) {
  const [formData, setFormData] = useState<PersonalHealthData>({
    averageDailySteps: 8000,
    averageHeartRate: 70
  });

  const handleInputChange = (field: keyof PersonalHealthData, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    onDataUpdate(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setFormData({
      averageDailySteps: 8000,
      averageHeartRate: 70
    });
  };

  const isFormValid = formData.averageDailySteps > 0 && formData.averageHeartRate > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-lg w-[90vw] sm:w-full max-h-[80vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Personal Health Data</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter your personal health metrics for content personalization
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Average Daily Steps */}
          <div>
            <Label htmlFor="steps" className="text-sm font-medium text-gray-300 mb-2 block">
              Average Daily Steps
            </Label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <Input
                id="steps"
                type="number"
                min="1000"
                max="50000"
                value={formData.averageDailySteps}
                onChange={(e) => handleInputChange('averageDailySteps', parseInt(e.target.value) || 8000)}
                className="bg-gray-700 border-gray-600 text-gray-200 pl-10 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 8000"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Your typical daily step count from activity trackers or apps
            </p>
          </div>

          {/* Average Heart Rate */}
          <div>
            <Label htmlFor="heartrate" className="text-sm font-medium text-gray-300 mb-2 block">
              Average Heart Rate (BPM)
            </Label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <Input
                id="heartrate"
                type="number"
                min="40"
                max="200"
                value={formData.averageHeartRate}
                onChange={(e) => handleInputChange('averageHeartRate', parseInt(e.target.value) || 70)}
                className="bg-gray-700 border-gray-600 text-gray-200 pl-10 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 70"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Your resting heart rate measured by fitness trackers or healthcare devices
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!isFormValid}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}