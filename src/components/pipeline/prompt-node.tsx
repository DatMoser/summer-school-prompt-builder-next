import { Handle, Position } from 'reactflow';
import { Zap, Play } from 'lucide-react';
import { 
  EvidencePromptSection, 
  StylePromptSection, 
  PersonalDataPromptSection, 
  OutputSelectorPromptSection,
  CustomPromptSection,
  BasePromptSection
} from './prompt-sections';

interface PromptNodeData {
  configured: boolean;
  title: string;
  description: string;
  onConfigure: () => void;
  onDelete?: () => void;
  prompt: string;
  connectedComponents: string[];
  connectedComponentsWithIds?: Array<{id: string, type: string}>;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  customText?: string;
  onCustomTextChange?: (text: string) => void;
  selectedComponentType?: string;
}

export function PromptNode({ data, selected }: { data: PromptNodeData; selected?: boolean }) {
  // Use the connected components with IDs for more reliable rendering
  const connectedComponentsWithIds = data.connectedComponentsWithIds || [];
  const hasAnyConnections = connectedComponentsWithIds.length > 0;
  
  // Only log significant changes
  // console.log(`🎨 PROMPT NODE RENDER - ${connectedComponentsWithIds.length} connections`);

  return (
    <div className="relative group">
      <div 
        className={`bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg border border-purple-400/20 w-[500px] min-h-[400px] hover:shadow-purple-500/20 hover:shadow-xl transition-all ${
          selected ? 'ring-2 ring-blue-400' : ''
        }`}
      >
        {/* Input handles for connecting components */}
        <Handle type="target" position={Position.Left} id="prompt-left" className="w-5 h-5 bg-purple-200 border-2 border-purple-500" />
        <Handle type="target" position={Position.Top} id="prompt-top" className="w-5 h-5 bg-purple-200 border-2 border-purple-500" />
        <Handle type="target" position={Position.Right} id="prompt-right" className="w-5 h-5 bg-purple-200 border-2 border-purple-500" />
        <Handle type="target" position={Position.Bottom} id="prompt-bottom" className="w-5 h-5 bg-purple-200 border-2 border-purple-500" />
        
        {/* Header - Fixed */}
        <div className="flex items-center gap-2 mb-4">
          <Zap className="text-white text-lg" size={20} />
          <h3 className="font-medium text-white text-lg">AI Prompt Builder</h3>
        </div>
        
        <div className="text-xs text-white/80 mb-4">
          Connected: {connectedComponentsWithIds.length} components
        </div>
        
        {/* Prompt Sections - Expandable */}
        <div className="mb-4">
          {!hasAnyConnections ? (
            <BasePromptSection>
              <div className="text-purple-300 font-medium mb-1">👋 Getting Started</div>
              You are a health content generation assistant that works with data providers.
              
              Connect components to collect data that will be passed to an MCP server.
            </BasePromptSection>
          ) : (
            <>
              <BasePromptSection>
                <div className="text-purple-300 font-medium mb-1">🤖 System Prompt</div>
                You are a health content generation assistant. The following data providers are connected:
              </BasePromptSection>

              {/* Render sections for each connected component by ID */}
              {connectedComponentsWithIds.map(component => {
                const isHighlighted = data.selectedComponentType === component.type;
                
                switch (component.type) {
                  case 'evidence-input':
                    return (
                      <EvidencePromptSection 
                        key={component.id}
                        componentId={component.id}
                        highlighted={isHighlighted}
                      />
                    );
                  case 'style-personalization':
                    return (
                      <StylePromptSection 
                        key={component.id}
                        componentId={component.id}
                        highlighted={isHighlighted}
                      />
                    );
                  case 'personal-data':
                    return (
                      <PersonalDataPromptSection 
                        key={component.id}
                        componentId={component.id}
                        highlighted={isHighlighted}
                      />
                    );
                  case 'output-selector':
                    return (
                      <OutputSelectorPromptSection 
                        key={component.id}
                        componentId={component.id}
                        highlighted={isHighlighted}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </>
          )}
        </div>
        
        {/* Bottom Section */}
        <div>
          {/* Custom Text Section */}
          <div className="mb-3">
            <CustomPromptSection
              value={data.customText || ''}
              onChange={data.onCustomTextChange || (() => {})}
              placeholder="Add your custom prompt instructions here..."
            />
          </div>
          
          {/* Connected Data Providers Summary */}
          {hasAnyConnections && (
            <div className="mb-3 text-xs">
              <div className="text-purple-200 mb-2">📊 Connected Data Providers:</div>
              <div className="flex flex-wrap gap-1">
                {connectedComponentsWithIds.map(component => {
                  const dataInfo = {
                    'evidence-input': { name: 'Evidence Guidelines', color: 'emerald' },
                    'style-personalization': { name: 'Style Preferences', color: 'yellow' },
                    'personal-data': { name: 'Health Metrics', color: 'blue' },
                    'output-selector': { name: 'Format Settings', color: 'orange' }
                  }[component.type];

                  if (!dataInfo) return null;

                  return (
                    <span 
                      key={component.id}
                      className={`bg-${dataInfo.color}-500/30 px-2 py-1 rounded text-${dataInfo.color}-100 text-xs`}
                    >
                      {dataInfo.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Generate button */}
          <div className="flex justify-center">
            <button
              onClick={data.onGenerate}
              disabled={connectedComponentsWithIds.length === 0}
              className="bg-purple-500 hover:bg-purple-400 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
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