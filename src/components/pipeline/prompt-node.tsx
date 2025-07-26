import { Handle, Position } from 'reactflow';
import { Zap, Play } from 'lucide-react';
import {
  CustomPromptSection,
  BasePromptSection,
  EvidencePromptSection,
  StylePromptSection,
  VisualStylingPromptSection,
  PersonalDataPromptSection,
  OutputSelectorPromptSection
} from './prompt-sections';
import { useEffect } from 'react';

interface PromptNodeData {
  configured: boolean;
  title: string;
  description: string;
  onConfigure: () => void;
  onDelete?: () => void;
  prompt: string;
  connectedComponents: string[];
  connectedComponentsWithIds?: Array<{ id: string, type: string }>;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  customText?: string;
  onCustomTextChange?: (text: string) => void;
  selectedComponentType?: string;
  backendHealthStatus?: 'checking' | 'healthy' | 'unhealthy' | 'unknown';
  _immediateUpdate?: boolean;
  _deletedNodeId?: string;
  _updateTimestamp?: number;
  evidenceData?: {
    summary?: string;
    extractedGuidelines?: string[];
  };
  styleData?: {
    tone?: string;
    pace?: string;
    vocabulary?: string;
    energy?: string;
    formality?: string;
    humor?: string;
    empathy?: string;
    confidence?: string;
    storytelling?: string;
    keyPhrases?: string[];
    targetAudience?: string;
    contentStructure?: string;
  };
  personalData?: {
    averageDailySteps?: number;
    averageHeartRate?: number;
  };
  visualStylingData?: {
    videoStyle?: {
      colorScheme?: string;
      visualTheme?: string;
      fontStyle?: string;
      layoutStyle?: string;
      backgroundStyle?: string;
      animationLevel?: string;
    };
    podcastThumbnail?: {
      colorScheme?: string;
      designTheme?: string;
      fontStyle?: string;
      layoutType?: string;
      backgroundStyle?: string;
      iconStyle?: string;
    };
    healthFocus?: string;
    targetDemographic?: string;
  };
  outputSelectorData?: {
    selectedFormat?: string;
  };
}

export function PromptNode({ data, selected }: { data: PromptNodeData; selected?: boolean }) {
  // Use the connected components with IDs for more reliable rendering
  const connectedComponentsWithIds = data.connectedComponentsWithIds || [];
  const hasAnyConnections = connectedComponentsWithIds.length > 0;

  // Create a stable key based on the actual connected component IDs
  const connectionsKey = connectedComponentsWithIds.map(c => c.id).sort().join('-');

  // Include immediate update flags for aggressive re-rendering
  const immediateKey = data._immediateUpdate ? `immediate-${data._updateTimestamp}` : '';
  const deletedKey = data._deletedNodeId ? `deleted-${data._deletedNodeId}` : '';

  // Generate the real-time MCP prompt
  const generateRealTimePrompt = () => {
    if (!hasAnyConnections) return '';
    
    let finalPrompt = "You are a health content generation assistant. Create personalized health content using the following data:\n\n";
    
    // Add evidence data if connected
    if (connectedComponentsWithIds.some(c => c.type === 'evidence-input') && data.evidenceData) {
      if (data.evidenceData.extractedGuidelines && data.evidenceData.extractedGuidelines.length > 0) {
        finalPrompt += `KEY GUIDELINES:\n${data.evidenceData.extractedGuidelines.join('\n- ')}\n\n`;
      }
      if (data.evidenceData.fileContent) {
        finalPrompt += `SOURCE CONTENT:\n${data.evidenceData.fileContent.substring(0, 500)}...\n\n`;
      }
    }
    
    // Add style data if connected
    if (connectedComponentsWithIds.some(c => c.type === 'style-personalization') && data.styleData) {
      finalPrompt += `COMMUNICATION STYLE:\n`;
      
      // Only include fields that have actual values (not empty strings)
      if (data.styleData.tone && data.styleData.tone.trim()) {
        finalPrompt += `Tone: ${data.styleData.tone}\n`;
      }
      if (data.styleData.pace && data.styleData.pace.trim()) {
        finalPrompt += `Pace: ${data.styleData.pace}\n`;
      }
      if (data.styleData.vocabulary && data.styleData.vocabulary.trim()) {
        finalPrompt += `Vocabulary: ${data.styleData.vocabulary}\n`;
      }
      if (data.styleData.energy && data.styleData.energy.trim()) {
        finalPrompt += `Energy: ${data.styleData.energy}\n`;
      }
      if (data.styleData.formality && data.styleData.formality.trim()) {
        finalPrompt += `Formality: ${data.styleData.formality}\n`;
      }
      if (data.styleData.humor && data.styleData.humor.trim()) {
        finalPrompt += `Humor: ${data.styleData.humor}\n`;
      }
      if (data.styleData.empathy && data.styleData.empathy.trim()) {
        finalPrompt += `Empathy: ${data.styleData.empathy}\n`;
      }
      if (data.styleData.confidence && data.styleData.confidence.trim()) {
        finalPrompt += `Confidence: ${data.styleData.confidence}\n`;
      }
      if (data.styleData.storytelling && data.styleData.storytelling.trim()) {
        finalPrompt += `Storytelling: ${data.styleData.storytelling}\n`;
      }
      if (data.styleData.keyPhrases && data.styleData.keyPhrases.length > 0) {
        finalPrompt += `Key Phrases: ${data.styleData.keyPhrases.join(', ')}\n`;
      }
      if (data.styleData.targetAudience && data.styleData.targetAudience.trim()) {
        finalPrompt += `Target Audience: ${data.styleData.targetAudience}\n`;
      }
      if (data.styleData.contentStructure && data.styleData.contentStructure.trim()) {
        finalPrompt += `Content Structure: ${data.styleData.contentStructure}\n`;
      }
      
      // Add custom prompt if provided
      if (data.styleData.customPrompt && data.styleData.customPrompt.trim()) {
        finalPrompt += `Additional Style Instructions: ${data.styleData.customPrompt}\n`;
      }
      finalPrompt += `\n`;
    }
    
    // Add visual styling if connected
    if (connectedComponentsWithIds.some(c => c.type === 'visual-styling') && data.visualStylingData) {
      finalPrompt += `VISUAL STYLING:\n`;
      
      // Unified approach - use values from either videoStyle or podcastThumbnail
      const colorScheme = data.visualStylingData.videoStyle?.colorScheme || data.visualStylingData.podcastThumbnail?.colorScheme;
      const designTheme = data.visualStylingData.videoStyle?.visualTheme || data.visualStylingData.podcastThumbnail?.designTheme;
      const fontStyle = data.visualStylingData.videoStyle?.fontStyle || data.visualStylingData.podcastThumbnail?.fontStyle;
      const layoutStyle = data.visualStylingData.videoStyle?.layoutStyle || data.visualStylingData.podcastThumbnail?.layoutType;
      const backgroundStyle = data.visualStylingData.videoStyle?.backgroundStyle || data.visualStylingData.podcastThumbnail?.backgroundStyle;
      const animationIconStyle = data.visualStylingData.videoStyle?.animationLevel || data.visualStylingData.podcastThumbnail?.iconStyle;
      
      if (colorScheme) finalPrompt += `Color Scheme: ${colorScheme}\n`;
      if (designTheme) finalPrompt += `Design Theme: ${designTheme}\n`;
      if (fontStyle) finalPrompt += `Font Style: ${fontStyle}\n`;
      if (layoutStyle) finalPrompt += `Layout Style: ${layoutStyle}\n`;
      if (backgroundStyle) finalPrompt += `Background Style: ${backgroundStyle}\n`;
      if (animationIconStyle) finalPrompt += `Animation/Icon Style: ${animationIconStyle}\n`;
      
      if (data.visualStylingData.healthFocus) finalPrompt += `Health Focus: ${data.visualStylingData.healthFocus}\n`;
      if (data.visualStylingData.targetDemographic) finalPrompt += `Target Demographic: ${data.visualStylingData.targetDemographic}\n`;
      
      // Add custom prompt if provided
      if (data.visualStylingData.customPrompt && data.visualStylingData.customPrompt.trim()) {
        finalPrompt += `Additional Visual Instructions: ${data.visualStylingData.customPrompt}\n`;
      }
      finalPrompt += `\n`;
    }
    
    // Add personal data if connected
    if (connectedComponentsWithIds.some(c => c.type === 'personal-data') && data.personalData) {
      finalPrompt += `PERSONAL HEALTH METRICS:\n`;
      
      // Basic Demographics & Goals
      if (data.personalData.age) finalPrompt += `Age: ${data.personalData.age} years\n`;
      if (data.personalData.biologicalSex) finalPrompt += `Biological Sex: ${data.personalData.biologicalSex}\n`;
      if (data.personalData.heightCm) finalPrompt += `Height: ${data.personalData.heightCm} cm\n`;
      if (data.personalData.weightKg) finalPrompt += `Weight: ${data.personalData.weightKg} kg\n`;
      if (data.personalData.fitnessGoals) finalPrompt += `Fitness Goals: ${data.personalData.fitnessGoals}\n`;
      
      // Basic Activity Metrics
      finalPrompt += `Daily Steps: ${data.personalData.averageDailySteps?.toLocaleString() || 'Not configured'}\n`;
      if (data.personalData.averageHeartRate) finalPrompt += `Average Heart Rate: ${data.personalData.averageHeartRate} BPM\n`;
      if (data.personalData.sleepHoursPerNight) finalPrompt += `Sleep: ${data.personalData.sleepHoursPerNight} hours/night\n`;
      if (data.personalData.activeEnergyBurned) finalPrompt += `Active Calories: ${data.personalData.activeEnergyBurned}/day\n`;
      if (data.personalData.exerciseMinutesPerWeek) finalPrompt += `Exercise: ${data.personalData.exerciseMinutesPerWeek} min/week\n`;
      
      // Advanced Health Metrics
      if (data.personalData.restingHeartRate) finalPrompt += `Resting Heart Rate: ${data.personalData.restingHeartRate} BPM\n`;
      if (data.personalData.vo2Max) finalPrompt += `VO2 Max: ${data.personalData.vo2Max} ml/kg/min\n`;
      if (data.personalData.walkingHeartRateAverage) finalPrompt += `Walking Heart Rate: ${data.personalData.walkingHeartRateAverage} BPM\n`;
      if (data.personalData.heartRateVariability) finalPrompt += `HRV: ${data.personalData.heartRateVariability}ms\n`;
      if (data.personalData.bloodPressureSystolic && data.personalData.bloodPressureDiastolic) {
        finalPrompt += `Blood Pressure: ${data.personalData.bloodPressureSystolic}/${data.personalData.bloodPressureDiastolic} mmHg\n`;
      }
      if (data.personalData.bodyMassIndex) finalPrompt += `BMI: ${data.personalData.bodyMassIndex}\n`;
      if (data.personalData.bloodGlucose) finalPrompt += `Blood Glucose: ${data.personalData.bloodGlucose} mg/dL\n`;
      if (data.personalData.waterIntakeLiters) finalPrompt += `Water Intake: ${data.personalData.waterIntakeLiters}L/day\n`;
      
      // Activity Patterns
      if (data.personalData.workoutTypes && data.personalData.workoutTypes.length > 0) {
        finalPrompt += `Workout Types: ${data.personalData.workoutTypes.join(', ')}\n`;
      }
      if (data.personalData.mostActiveTimeOfDay) finalPrompt += `Most Active: ${data.personalData.mostActiveTimeOfDay}\n`;
      if (data.personalData.weeklyActivityConsistency) finalPrompt += `Activity Consistency: ${data.personalData.weeklyActivityConsistency}\n`;
      
      finalPrompt += `\n`;
    }
    
    // Add output format if connected
    if (connectedComponentsWithIds.some(c => c.type === 'output-selector') && data.outputSelectorData) {
      finalPrompt += `OUTPUT FORMAT: ${data.outputSelectorData.selectedFormat || 'video'}\n\n`;
    }
    
    // Add custom instructions
    if (data.customText) {
      finalPrompt += `ADDITIONAL INSTRUCTIONS:\n${data.customText}\n\n`;
    } else {
      finalPrompt += `Create comprehensive, evidence-based health content that follows the communication style and incorporates personal health data for personalization.\n\n`;
    }
    
    return finalPrompt.trim();
  };

  useEffect(() => {
    console.log("ConnectedComponents with ID", data.connectedComponentsWithIds)
  }, [data.connectedComponentsWithIds]);

  return (
    <div className="relative group">
      <div
        className={`bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg border border-purple-400/20 w-[500px] hover:shadow-purple-500/20 hover:shadow-xl transition-all ${selected ? 'ring-2 ring-blue-400' : ''
          }`}
      >
        {/* Input handles for connecting components */}
        <Handle type="target" position={Position.Left} id="prompt-left" className="w-5 h-5 bg-purple-200 border-2 border-purple-500" />
        <Handle type="target" position={Position.Top} id="prompt-top" className="w-5 h-5 bg-purple-200 border-2 border-purple-500" />
        <Handle type="target" position={Position.Right} id="prompt-right" className="w-5 h-5 bg-purple-200 border-2 border-purple-500" />
        <Handle type="target" position={Position.Bottom} id="prompt-bottom" className="w-5 h-5 bg-purple-200 border-2 border-purple-500" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Zap className="text-white text-lg" size={20} />
          <h3 className="font-medium text-white text-lg">AI Prompt Builder</h3>
        </div>


        {/* Prompt Sections - Grow with content */}
        <div key={`prompt-sections-${connectionsKey}-${immediateKey}-${deletedKey}-${data._updateTimestamp || 0}`} className="mb-4">
          {/* Always show the base prompt */}
          <BasePromptSection>
            <div className="text-purple-300 font-medium mb-1">👋 Getting Started</div>
            You are a health content generation assistant that works with data providers.

            Connect components to collect data that will be passed to an MCP server.
          </BasePromptSection>
          
          {/* Show connected components as additional sections */}
          {hasAnyConnections && (
            <div key={`connected-sections-${connectionsKey}-${immediateKey}-${deletedKey}-${data._updateTimestamp || 0}`} className="space-y-3 mt-3">
              {/* Individual Component Sections with Hover Highlighting */}
              {connectedComponentsWithIds.some(c => c.type === 'evidence-input') && (
                <EvidencePromptSection 
                  highlighted={data.selectedComponentType === 'evidence-input'}
                  componentId={connectedComponentsWithIds.find(c => c.type === 'evidence-input')?.id}
                  evidenceData={data.evidenceData}
                />
              )}
              
              {connectedComponentsWithIds.some(c => c.type === 'style-personalization') && (
                <StylePromptSection 
                  highlighted={data.selectedComponentType === 'style-personalization'}
                  componentId={connectedComponentsWithIds.find(c => c.type === 'style-personalization')?.id}
                  styleData={data.styleData}
                />
              )}
              
              {connectedComponentsWithIds.some(c => c.type === 'visual-styling') && (
                <VisualStylingPromptSection 
                  highlighted={data.selectedComponentType === 'visual-styling'}
                  componentId={connectedComponentsWithIds.find(c => c.type === 'visual-styling')?.id}
                  visualStylingData={data.visualStylingData}
                />
              )}
              
              {connectedComponentsWithIds.some(c => c.type === 'personal-data') && (
                <PersonalDataPromptSection 
                  highlighted={data.selectedComponentType === 'personal-data'}
                  componentId={connectedComponentsWithIds.find(c => c.type === 'personal-data')?.id}
                  personalData={data.personalData}
                />
              )}
              
              {connectedComponentsWithIds.some(c => c.type === 'output-selector') && (
                <OutputSelectorPromptSection 
                  highlighted={data.selectedComponentType === 'output-selector'}
                  componentId={connectedComponentsWithIds.find(c => c.type === 'output-selector')?.id}
                  outputSelectorData={data.outputSelectorData}
                />
              )}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div>
          {/* Custom Text Section */}
          <div className="mb-3">
            <CustomPromptSection
              value={data.customText || ''}
              onChange={data.onCustomTextChange || (() => { })}
              placeholder="Add your custom prompt instructions here..."
            />
          </div>

          {/* Generate button */}
          <div className="flex justify-center">
            <button
              onClick={data.onGenerate}
              disabled={
                connectedComponentsWithIds.length === 0 || 
                data.backendHealthStatus === 'unhealthy' || 
                data.backendHealthStatus === 'unknown' ||
                data.backendHealthStatus === 'checking'
              }
              className="bg-purple-500 hover:bg-purple-400 disabled:bg-purple-600/50 disabled:cursor-not-allowed cursor-pointer text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
              title={
                data.backendHealthStatus === 'unhealthy' 
                  ? 'Service unavailable - The backend service is offline. Click Settings (top-right) to check your configuration and ensure the backend is running.'
                  : data.backendHealthStatus === 'unknown' || data.backendHealthStatus === 'checking'
                  ? 'Service status unknown - Checking backend service health. Please wait or click Settings to verify configuration.'
                  : connectedComponentsWithIds.length === 0
                  ? 'Connect components to generate content'
                  : 'Generate personalized content'
              }
            >
              <Play size={16} />
              Generate Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}