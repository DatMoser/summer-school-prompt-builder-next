import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, User, ChevronDown, ChevronUp } from 'lucide-react';
import { StyleData } from '@/lib/pipeline-types';

interface StylePersonalizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customApiKey?: string | null;
  onDataUpdate: (data: StyleData) => void;
}

// Empty style template requiring user configuration
const getEmptyStyle = (): StyleData => ({
  tone: '',
  pace: '',
  vocabulary: '',
  energy: '',
  formality: '',
  humor: '',
  empathy: '',
  confidence: '',
  storytelling: '',
  keyPhrases: [],
  targetAudience: '',
  contentStructure: '',
  customPrompt: '',
  sourceDescription: '',
  isAIGenerated: false
});

export default function StylePersonalizationModal({
  open,
  onOpenChange,
  customApiKey,
  onDataUpdate
}: StylePersonalizationModalProps) {
  const [styleData, setStyleData] = useState<StyleData>(getEmptyStyle());
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyPhrasesText, setKeyPhrasesText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Convert key phrases array to text for editing
  useEffect(() => {
    setKeyPhrasesText(styleData.keyPhrases.join(', '));
  }, [styleData.keyPhrases]);

  // Update style data when key phrases text changes
  const handleKeyPhrasesChange = (text: string) => {
    setKeyPhrasesText(text);
    const phrases = text.split(',').map(phrase => phrase.trim()).filter(phrase => phrase.length > 0);
    setStyleData(prev => ({ ...prev, keyPhrases: phrases }));
  };

  // Handle individual field changes
  const handleFieldChange = (field: keyof StyleData, value: string) => {
    setStyleData(prev => ({ ...prev, [field]: value }));
  };

  // Generate style using AI
  const generateAIStyle = async () => {
    if (!aiPrompt.trim()) {
      setErrorMessage('Please describe the style you want to generate');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(customApiKey && { 'x-gemini-api-key': customApiKey })
        },
        body: JSON.stringify({
          styleDescription: aiPrompt,
          type: 'generate-preset'
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate style';

        if (response.status === 400) {
          const errorData = await response.json();
          errorMessage = errorData.error || 'Invalid request. Please check your input and try again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please check your API key in Settings.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Your API key may not have permission to access this service.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. The AI service is temporarily unavailable. Please try again later.';
        } else if (response.status >= 500) {
          errorMessage = 'AI service is currently unavailable. Please try again in a few minutes.';
        } else {
          errorMessage = `Request failed with status ${response.status}. Please try again.`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Check if the result contains the expected fields
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from AI service. Please try again.');
      }

      // Update style data with AI-generated values
      setStyleData({
        tone: result.tone || styleData.tone,
        pace: result.pace || styleData.pace,
        vocabulary: result.vocabulary || styleData.vocabulary,
        energy: result.energy || styleData.energy,
        formality: result.formality || styleData.formality,
        humor: result.humor || styleData.humor,
        empathy: result.empathy || styleData.empathy,
        confidence: result.confidence || styleData.confidence,
        storytelling: result.storytelling || styleData.storytelling,
        keyPhrases: result.keyPhrases || styleData.keyPhrases,
        targetAudience: result.targetAudience || styleData.targetAudience,
        contentStructure: result.contentStructure || styleData.contentStructure,
        sourceDescription: `AI-generated: "${aiPrompt}"`,
        isAIGenerated: true
      });

      setAiPrompt(''); // Clear the prompt after successful generation
    } catch (error) {
      console.error('Error generating AI style:', error);

      let userMessage = 'Failed to generate style. Please try again.';

      if (error instanceof Error) {
        userMessage = error.message;
      } else if (typeof error === 'string') {
        userMessage = error;
      }

      // Check for network errors
      if (userMessage.includes('fetch')) {
        userMessage = 'Network error. Please check your internet connection and try again.';
      }

      setErrorMessage(userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    onDataUpdate(styleData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setStyleData(getDefaultStyle());
    setAiPrompt('');
  };

  const isFormValid = () => {
    return styleData.tone || styleData.pace || styleData.vocabulary || styleData.targetAudience || styleData.customPrompt;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <User className="text-yellow-400" size={20} />
            Conversational Style
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure the communication tone, pace, vocabulary and speaking style for your content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Style Generator Section */}
          <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-4">
            <h3 className="text-yellow-300 font-medium mb-3 flex items-center gap-2">
              <Wand2 size={16} />
              AI Style Generator
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="ai-prompt" className="text-sm font-medium text-gray-300 mb-2 block">
                  Describe the style you want
                </Label>
                <Textarea
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., 'Make it sound like Trump', 'Professional doctor explaining to patients', 'Energetic fitness influencer', 'Calm meditation instructor'"
                  className="bg-gray-700 border-gray-600 text-gray-200 min-h-[80px]"
                  rows={3}
                />
              </div>
              <Button
                onClick={generateAIStyle}
                disabled={isGenerating || !aiPrompt.trim()}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Style...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Style
                  </>
                )}
              </Button>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-400/20 rounded-lg">
                  <p className="text-red-300 text-sm">
                    <span className="font-medium">Error: </span>
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Style Dimensions */}
          <div className="space-y-4">
            <h3 className="text-yellow-300 font-medium">Basic Dimensions</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone" className="text-sm font-medium text-gray-300 mb-2 block">
                  Tone
                </Label>
                <Input
                  id="tone"
                  value={styleData.tone}
                  onChange={(e) => handleFieldChange('tone', e.target.value)}
                  placeholder="e.g., Professional, Casual, Authoritative"
                  className="bg-gray-700 border-gray-600 text-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="pace" className="text-sm font-medium text-gray-300 mb-2 block">
                  Pace
                </Label>
                <Input
                  id="pace"
                  value={styleData.pace}
                  onChange={(e) => handleFieldChange('pace', e.target.value)}
                  placeholder="e.g., Fast-paced, Slow and deliberate"
                  className="bg-gray-700 border-gray-600 text-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="vocabulary" className="text-sm font-medium text-gray-300 mb-2 block">
                  Vocabulary Level
                </Label>
                <Input
                  id="vocabulary"
                  value={styleData.vocabulary}
                  onChange={(e) => handleFieldChange('vocabulary', e.target.value)}
                  placeholder="e.g., Simple terms, Technical language"
                  className="bg-gray-700 border-gray-600 text-gray-200"
                />
              </div>

              <div>
                <Label htmlFor="targetAudience" className="text-sm font-medium text-gray-300 mb-2 block">
                  Target Audience
                </Label>
                <Input
                  id="targetAudience"
                  value={styleData.targetAudience}
                  onChange={(e) => handleFieldChange('targetAudience', e.target.value)}
                  placeholder="e.g., Healthcare professionals, General public"
                  className="bg-gray-700 border-gray-600 text-gray-200"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contentStructure" className="text-sm font-medium text-gray-300 mb-2 block">
                Content Structure
              </Label>
              <Input
                id="contentStructure"
                value={styleData.contentStructure}
                onChange={(e) => handleFieldChange('contentStructure', e.target.value)}
                placeholder="e.g., Bullet points, Narrative flow"
                className="bg-gray-700 border-gray-600 text-gray-200"
              />
            </div>
          </div>

          {/* Advanced Dimensions - Collapsible */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-yellow-300 font-medium hover:text-yellow-200 transition-colors hover:cursor-pointer"
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              Advanced Dimensions (Optional)
            </button>

            {showAdvanced && (
              <div className="space-y-4 border-l-2 border-yellow-400/20 pl-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="energy" className="text-sm font-medium text-gray-300 mb-2 block">
                      Energy Level
                    </Label>
                    <Input
                      id="energy"
                      value={styleData.energy}
                      onChange={(e) => handleFieldChange('energy', e.target.value)}
                      placeholder="e.g., High energy, Calm and composed"
                      className="bg-gray-700 border-gray-600 text-gray-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="formality" className="text-sm font-medium text-gray-300 mb-2 block">
                      Formality
                    </Label>
                    <Input
                      id="formality"
                      value={styleData.formality}
                      onChange={(e) => handleFieldChange('formality', e.target.value)}
                      placeholder="e.g., Very formal, Conversational"
                      className="bg-gray-700 border-gray-600 text-gray-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="humor" className="text-sm font-medium text-gray-300 mb-2 block">
                      Humor Style
                    </Label>
                    <Input
                      id="humor"
                      value={styleData.humor}
                      onChange={(e) => handleFieldChange('humor', e.target.value)}
                      placeholder="e.g., Witty, No humor, Light jokes"
                      className="bg-gray-700 border-gray-600 text-gray-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="empathy" className="text-sm font-medium text-gray-300 mb-2 block">
                      Empathy Level
                    </Label>
                    <Input
                      id="empathy"
                      value={styleData.empathy}
                      onChange={(e) => handleFieldChange('empathy', e.target.value)}
                      placeholder="e.g., Very empathetic, Direct and factual"
                      className="bg-gray-700 border-gray-600 text-gray-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confidence" className="text-sm font-medium text-gray-300 mb-2 block">
                      Confidence Level
                    </Label>
                    <Input
                      id="confidence"
                      value={styleData.confidence}
                      onChange={(e) => handleFieldChange('confidence', e.target.value)}
                      placeholder="e.g., Very confident, Humble and questioning"
                      className="bg-gray-700 border-gray-600 text-gray-200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="storytelling" className="text-sm font-medium text-gray-300 mb-2 block">
                      Storytelling Approach
                    </Label>
                    <Input
                      id="storytelling"
                      value={styleData.storytelling}
                      onChange={(e) => handleFieldChange('storytelling', e.target.value)}
                      placeholder="e.g., Lots of personal stories, Data-driven"
                      className="bg-gray-700 border-gray-600 text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="keyPhrases" className="text-sm font-medium text-gray-300 mb-2 block">
                    Key Phrases & Expressions
                  </Label>
                  <Textarea
                    id="keyPhrases"
                    value={keyPhrasesText}
                    onChange={(e) => handleKeyPhrasesChange(e.target.value)}
                    placeholder="e.g., Let me tell you, Believe me, Listen folks (separate with commas)"
                    className="bg-gray-700 border-gray-600 text-gray-200 min-h-[80px]"
                    rows={3}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Separate phrases with commas
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Custom Prompt Field */}
          <div className="mt-6">
            <Label htmlFor="customPrompt" className="text-sm font-medium text-gray-300 mb-2 block">
              Additional Style Instructions (Optional)
            </Label>
            <Textarea
              id="customPrompt"
              value={styleData.customPrompt || ''}
              onChange={(e) => setStyleData(prev => ({ ...prev, customPrompt: e.target.value }))}
              placeholder="e.g., Make it sound more conversational and relatable, use medical analogies, emphasize safety and trust..."
              className="bg-gray-700 border-gray-600 text-gray-200 min-h-[80px]"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-1">
              Describe any additional style preferences to further customize the communication style
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Confirm Style
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}