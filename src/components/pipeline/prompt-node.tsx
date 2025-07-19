import { Handle, Position } from 'reactflow';
import { Zap, Play } from 'lucide-react';
import {
  CustomPromptSection,
  BasePromptSection,
  EvidencePromptSection,
  StylePromptSection,
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
      finalPrompt += `EVIDENCE GUIDELINES:\n${data.evidenceData.summary || 'Evidence summary will be loaded here'}\n\n`;
      finalPrompt += `KEY GUIDELINES:\n${data.evidenceData.extractedGuidelines?.join('\n- ') || 'Evidence guidelines will be loaded here'}\n\n`;
    }
    
    // Add style data if connected
    if (connectedComponentsWithIds.some(c => c.type === 'style-personalization') && data.styleData) {
      finalPrompt += `COMMUNICATION STYLE:\n`;
      finalPrompt += `Tone: ${data.styleData.tone || 'Style will be loaded here'}\n`;
      finalPrompt += `Pace: ${data.styleData.pace || 'Style will be loaded here'}\n`;
      finalPrompt += `Vocabulary: ${data.styleData.vocabulary || 'Style will be loaded here'}\n`;
      
      // Include advanced fields if they have values
      if (data.styleData.energy) {
        finalPrompt += `Energy: ${data.styleData.energy}\n`;
      }
      if (data.styleData.formality) {
        finalPrompt += `Formality: ${data.styleData.formality}\n`;
      }
      if (data.styleData.humor) {
        finalPrompt += `Humor: ${data.styleData.humor}\n`;
      }
      if (data.styleData.empathy) {
        finalPrompt += `Empathy: ${data.styleData.empathy}\n`;
      }
      if (data.styleData.confidence) {
        finalPrompt += `Confidence: ${data.styleData.confidence}\n`;
      }
      if (data.styleData.storytelling) {
        finalPrompt += `Storytelling: ${data.styleData.storytelling}\n`;
      }
      
      if (data.styleData.keyPhrases && data.styleData.keyPhrases.length > 0) {
        finalPrompt += `Key Phrases: ${data.styleData.keyPhrases.join(', ')}\n`;
      }
      finalPrompt += `Target Audience: ${data.styleData.targetAudience || 'Style will be loaded here'}\n`;
      finalPrompt += `Content Structure: ${data.styleData.contentStructure || 'Style will be loaded here'}\n\n`;
    }
    
    // Add personal data if connected
    if (connectedComponentsWithIds.some(c => c.type === 'personal-data') && data.personalData) {
      finalPrompt += `PERSONAL HEALTH METRICS:\n`;
      finalPrompt += `Average Daily Steps: ${data.personalData.averageDailySteps || 'Not configured'}\n`;
      finalPrompt += `Average Heart Rate: ${data.personalData.averageHeartRate || 'Not configured'} BPM\n\n`;
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
          {!hasAnyConnections ? (
            <BasePromptSection>
              <div className="text-purple-300 font-medium mb-1">👋 Getting Started</div>
              You are a health content generation assistant that works with data providers.

              Connect components to collect data that will be passed to an MCP server.
            </BasePromptSection>
          ) : (
            <div key={`connected-sections-${connectionsKey}-${immediateKey}-${deletedKey}-${data._updateTimestamp || 0}`} className="space-y-3">
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
              disabled={connectedComponentsWithIds.length === 0}
              className="bg-purple-500 hover:bg-purple-400 disabled:bg-purple-600/50 disabled:cursor-not-allowed cursor-pointer text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
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