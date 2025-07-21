import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Paintbrush, Video, Headphones, Palette } from 'lucide-react';
import { VisualStylingData } from '@/lib/pipeline-types';

interface VisualStylingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataUpdate: (data: VisualStylingData) => void;
  existingData?: VisualStylingData | null;
}

// Empty visual styling template requiring user configuration
const getEmptyVisualStyling = (): VisualStylingData => ({
  videoStyle: {
    colorScheme: '',
    visualTheme: '',
    fontStyle: '',
    layoutStyle: '',
    backgroundStyle: '',
    animationLevel: ''
  },
  podcastThumbnail: {
    colorScheme: '',
    designTheme: '',
    fontStyle: '',
    layoutType: '',
    backgroundStyle: '',
    iconStyle: ''
  },
  healthFocus: '',
  targetDemographic: '',
  customPrompt: '',
  sourceDescription: 'Manual configuration',
  lastModified: new Date().toISOString()
});

export default function VisualStylingModal({
  open,
  onOpenChange,
  onDataUpdate,
  existingData
}: VisualStylingModalProps) {
  const [visualData, setVisualData] = useState<VisualStylingData>(getEmptyVisualStyling());

  // Restore existing data when modal opens
  useEffect(() => {
    if (open && existingData) {
      setVisualData(existingData);
    } else if (open) {
      setVisualData(getEmptyVisualStyling());
    }
  }, [open, existingData]);

  const handleFieldChange = (field: string, value: string) => {
    setVisualData(prev => {
      // Ensure we have the required structure for videoStyle
      const currentVideoStyle = prev.videoStyle || {
        colorScheme: 'warm',
        visualTheme: 'professional',
        fontStyle: 'clean',
        layoutStyle: 'dynamic',
        backgroundStyle: 'gradient',
        animationLevel: 'moderate'
      };
      
      // Ensure we have the required structure for podcastThumbnail
      const currentPodcastThumbnail = prev.podcastThumbnail || {
        colorScheme: 'warm',
        designTheme: 'professional',
        fontStyle: 'clean',
        layoutType: 'balanced',
        backgroundStyle: 'gradient',
        iconStyle: 'medical'
      };
      
      const newVideoStyle = { ...currentVideoStyle, [field]: value };
      
      // Map video fields to podcast thumbnail fields
      const podcastField = field === 'layoutStyle' ? 'layoutType' 
                         : field === 'visualTheme' ? 'designTheme' 
                         : field === 'animationLevel' ? 'iconStyle' 
                         : field;
      
      const newPodcastThumbnail = { ...currentPodcastThumbnail, [podcastField]: value };
      
      return {
        ...prev,
        videoStyle: newVideoStyle,
        podcastThumbnail: newPodcastThumbnail,
        lastModified: new Date().toISOString()
      };
    });
  };

  const handleGeneralFieldChange = (field: keyof VisualStylingData, value: string) => {
    setVisualData(prev => ({
      ...prev,
      [field]: value,
      lastModified: new Date().toISOString()
    }));
  };

  const handleConfirm = () => {
    onDataUpdate(visualData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    if (!existingData) {
      setVisualData(getEmptyVisualStyling());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Paintbrush className="text-pink-400" size={20} />
            Visual Styling
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure unified visual styling that adapts to both video content and podcast thumbnails
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">{/* Unified Visual Styling Section */}

          <div className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color-scheme" className="text-sm font-medium text-gray-300 mb-2 block">
                  Color Scheme
                </Label>
                <select
                  id="color-scheme"
                  value={visualData.videoStyle?.colorScheme || ''}
                  onChange={(e) => handleFieldChange('colorScheme', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 py-2 px-3 rounded-md"
                >
                  <option value="" disabled>Select color scheme</option>
                  <option value="warm">Warm (oranges, reds)</option>
                  <option value="cool">Cool (blues, greens)</option>
                  <option value="vibrant">Vibrant (bright colors)</option>
                  <option value="neutral">Neutral (grays, beiges)</option>
                  <option value="custom">Custom colors</option>
                </select>
              </div>

              <div>
                <Label htmlFor="visual-theme" className="text-sm font-medium text-gray-300 mb-2 block">
                  Design Theme
                </Label>
                <select
                  id="visual-theme"
                  value={visualData.videoStyle?.visualTheme || ''}
                  onChange={(e) => handleFieldChange('visualTheme', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 py-2 px-3 rounded-md"
                >
                  <option value="" disabled>Select visual theme</option>
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="professional">Professional</option>
                  <option value="healthcare">Healthcare-focused</option>
                </select>
              </div>

              <div>
                <Label htmlFor="font-style" className="text-sm font-medium text-gray-300 mb-2 block">
                  Font Style
                </Label>
                <select
                  id="font-style"
                  value={visualData.videoStyle?.fontStyle || ''}
                  onChange={(e) => handleFieldChange('fontStyle', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 py-2 px-3 rounded-md"
                >
                  <option value="" disabled>Select font style</option>
                  <option value="clean">Clean & Modern</option>
                  <option value="bold">Bold & Impactful</option>
                  <option value="elegant">Elegant & Refined</option>
                  <option value="playful">Playful & Friendly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="layout-style" className="text-sm font-medium text-gray-300 mb-2 block">
                  Layout Style
                </Label>
                <select
                  id="layout-style"
                  value={visualData.videoStyle?.layoutStyle || ''}
                  onChange={(e) => handleFieldChange('layoutStyle', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 py-2 px-3 rounded-md"
                >
                  <option value="" disabled>Select layout style</option>
                  <option value="dynamic">Dynamic & Engaging</option>
                  <option value="static">Static & Stable</option>
                  <option value="split-screen">Split Screen (Video) / Balanced (Thumbnail)</option>
                  <option value="presenter-focus">Presenter Focused (Video) / Portrait (Thumbnail)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="background-style" className="text-sm font-medium text-gray-300 mb-2 block">
                  Background Style
                </Label>
                <select
                  id="background-style"
                  value={visualData.videoStyle?.backgroundStyle || ''}
                  onChange={(e) => handleFieldChange('backgroundStyle', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 py-2 px-3 rounded-md"
                >
                  <option value="" disabled>Select background style</option>
                  <option value="gradient">Gradient</option>
                  <option value="solid">Solid Color</option>
                  <option value="subtle-pattern">Subtle Pattern (Video) / Geometric (Thumbnail)</option>
                  <option value="branded">Branded</option>
                </select>
              </div>

              <div>
                <Label htmlFor="animation-level" className="text-sm font-medium text-gray-300 mb-2 block">
                  Animation Level (Video) / Icon Style (Thumbnail)
                </Label>
                <select
                  id="animation-level"
                  value={visualData.videoStyle?.animationLevel || ''}
                  onChange={(e) => handleFieldChange('animationLevel', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 py-2 px-3 rounded-md"
                >
                  <option value="" disabled>Select animation/icon style</option>
                  <option value="minimal">Minimal Animation / Medical Icons</option>
                  <option value="moderate">Moderate Animation / Fitness Icons</option>
                  <option value="dynamic">Dynamic Animation / Lifestyle Icons</option>
                </select>
              </div>
            </div>
          </div>


          {/* Common Settings */}
          <div className="space-y-4 border-t border-gray-700 pt-4">
            <h3 className="text-pink-300 font-medium">Content Focus</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="health-focus" className="text-sm font-medium text-gray-300 mb-2 block">
                  Health Focus Area
                </Label>
                <select
                  id="health-focus"
                  value={visualData.healthFocus}
                  onChange={(e) => handleGeneralFieldChange('healthFocus', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 py-2 px-3 rounded-md"
                >
                  <option value="" disabled>Select health focus</option>
                  <option value="general">General Health</option>
                  <option value="fitness">Fitness & Exercise</option>
                  <option value="nutrition">Nutrition & Diet</option>
                  <option value="mental-health">Mental Health</option>
                  <option value="medical">Medical Information</option>
                  <option value="wellness">Wellness & Lifestyle</option>
                </select>
              </div>

              <div>
                <Label htmlFor="target-demographic" className="text-sm font-medium text-gray-300 mb-2 block">
                  Target Audience
                </Label>
                <select
                  id="target-demographic"
                  value={visualData.targetDemographic}
                  onChange={(e) => handleGeneralFieldChange('targetDemographic', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-gray-200 py-2 px-3 rounded-md"
                >
                  <option value="" disabled>Select target demographic</option>
                  <option value="general">General Audience</option>
                  <option value="young-adults">Young Adults (18-30)</option>
                  <option value="middle-aged">Middle-aged (30-55)</option>
                  <option value="seniors">Seniors (55+)</option>
                  <option value="professionals">Healthcare Professionals</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Custom Prompt Field */}
          <div className="border-t border-gray-700 pt-4">
            <Label htmlFor="customPrompt" className="text-sm font-medium text-pink-300 mb-2 block">
              Additional Visual Instructions (Optional)
            </Label>
            <Textarea
              id="customPrompt"
              value={visualData.customPrompt || ''}
              onChange={(e) => setVisualData(prev => ({ ...prev, customPrompt: e.target.value }))}
              placeholder="e.g., Use more vibrant colors for energy, include medical symbols subtly, make it feel trustworthy and professional..."
              className="bg-gray-700 border-gray-600 text-gray-200 min-h-[80px]"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-1">
              Describe any additional visual preferences to further customize the styling
            </p>
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
            onClick={handleConfirm}
            className="flex-1 bg-pink-600 hover:bg-pink-700"
          >
            Apply Visual Styling
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}