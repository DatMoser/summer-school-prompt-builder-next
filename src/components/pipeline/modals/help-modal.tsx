import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Palette, 
  Paintbrush, 
  User, 
  Play, 
  Zap, 
  ArrowRight, 
  Lightbulb,
  Heart,
  Shield,
  Brain,
  Target
} from 'lucide-react';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-600 text-white max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">Welcome to PromptRX - Help Guide</DialogTitle>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
                ⚡
              </div>
              <h1 className="text-3xl font-bold">Welcome to PromptRX</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Your AI-powered platform for creating personalized health content
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* How It Works Section */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Lightbulb className="text-yellow-400" size={24} />
              How It Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Upload className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">1. Add Components</h3>
                <p className="text-gray-400 text-sm">Drag components from the sidebar to customize your content generation</p>
              </div>
              
              <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <ArrowRight className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">2. Connect & Configure</h3>
                <p className="text-gray-400 text-sm">Connect components to the AI Prompt Builder and configure your preferences</p>
              </div>
              
              <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <Play className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">3. Generate Content</h3>
                <p className="text-gray-400 text-sm">Click Generate to create personalized health content based on your inputs</p>
              </div>
            </div>
          </div>

          {/* Components Guide */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="text-blue-400" size={24} />
              Available Components
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evidence Input */}
              <div className="flex items-start gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Upload className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-400 mb-1">Evidence-Based Input</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Upload PDF or text files containing medical guidelines, research papers, or evidence-based content to inform your AI.
                  </p>
                  <div className="text-xs text-emerald-300">
                    • Supports PDF & TXT files • Extracts key guidelines • Ensures accuracy
                  </div>
                </div>
              </div>

              {/* Style Personalization */}
              <div className="flex items-start gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Palette className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-1">Conversational Style</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Define your communication style including tone, pace, vocabulary, and target audience preferences.
                  </p>
                  <div className="text-xs text-yellow-300">
                    • Custom tone & pace • Key phrases • Target audience • Advanced options
                  </div>
                </div>
              </div>

              {/* Visual Styling */}
              <div className="flex items-start gap-4 p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Paintbrush className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-pink-400 mb-1">Visual Styling</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Configure visual elements like color schemes, themes, fonts, and layouts for your content.
                  </p>
                  <div className="text-xs text-pink-300">
                    • Color schemes • Design themes • Font styles • Animation levels
                  </div>
                </div>
              </div>

              {/* Personal Data */}
              <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Personal Health Data</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Input personal health metrics to create highly personalized and relevant content.
                  </p>
                  <div className="text-xs text-blue-300">
                    • Health metrics • Activity data • Fitness goals • Demographics
                  </div>
                </div>
              </div>

              {/* Output Selector */}
              <div className="flex items-start gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg col-span-full">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-400 mb-1">Output Format Selection</h3>
                  <p className="text-gray-300 text-sm mb-2">
                    Choose between video or podcast format to optimize your content for the intended medium.
                  </p>
                  <div className="text-xs text-orange-300">
                    • Video format • Podcast format • Optimized generation
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="text-green-400" size={24} />
              Best Practices
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Heart className="text-red-400 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-white">Start with Evidence</h4>
                    <p className="text-gray-400 text-sm">Always begin by uploading relevant medical guidelines or research to ensure accuracy.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Brain className="text-purple-400 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-white">Define Your Style</h4>
                    <p className="text-gray-400 text-sm">Be specific about your communication preferences and target audience.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="text-blue-400 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-white">Personalize with Data</h4>
                    <p className="text-gray-400 text-sm">Include relevant personal health metrics for more targeted content.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Zap className="text-yellow-400 mt-1 flex-shrink-0" size={16} />
                  <div>
                    <h4 className="font-medium text-white">Iterate and Improve</h4>
                    <p className="text-gray-400 text-sm">Review generated content and adjust components to refine results.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Get Started */}
          <div className="text-center pt-4 border-t border-gray-700">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
            >
              <Zap className="mr-2" size={16} />
              Start Creating Content
            </Button>
            <p className="text-gray-400 text-sm mt-2">
              Drag your first component from the sidebar to begin!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}