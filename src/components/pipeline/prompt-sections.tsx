import { X } from 'lucide-react';

export interface PromptSectionProps {
  onRemove?: () => void;
  highlighted?: boolean;
  componentId?: string;
}

export function BasePromptSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-3 mb-3">
      <div className="text-xs text-purple-100 font-mono whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}

export function EvidencePromptSection({ onRemove, highlighted, componentId }: PromptSectionProps) {
  return (
    <div 
      className={`bg-purple-500/10 border border-purple-400/20 rounded-lg p-3 mb-3 relative group transition-all duration-300 ${
        highlighted ? 'ring-4 ring-emerald-400 bg-emerald-500/80 shadow-2xl shadow-emerald-500/40 border-emerald-400/60 scale-105 -translate-y-1 emerald-pulse !bg-emerald-500/80' : ''
      }`}
      data-component-id={componentId}
      data-component-type="evidence-input"
    >
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-600"
        >
          <X size={12} />
        </button>
      )}
      <div className="text-xs text-purple-100 font-mono whitespace-pre-wrap">
        <div className="text-purple-300 font-medium mb-1">📄 Evidence Guidelines</div>
{`EVIDENCE GUIDELINES:
{{evidenceData.summary}}

KEY GUIDELINES:
{{evidenceData.extractedGuidelines}}

SOURCE CONTENT:
{{evidenceData.fileContent}}`}
      </div>
    </div>
  );
}

export function StylePromptSection({ onRemove, highlighted, componentId }: PromptSectionProps) {
  return (
    <div 
      className={`bg-purple-500/10 border border-purple-400/20 rounded-lg p-3 mb-3 relative group transition-all duration-300 ${
        highlighted ? 'ring-4 ring-yellow-400 bg-yellow-500/80 shadow-2xl shadow-yellow-500/40 border-yellow-400/60 scale-105 -translate-y-1 yellow-pulse !bg-yellow-500/80' : ''
      }`}
      data-component-id={componentId}
      data-component-type="style-personalization"
    >
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-600"
        >
          <X size={12} />
        </button>
      )}
      <div className="text-xs text-purple-100 font-mono whitespace-pre-wrap">
        <div className="text-purple-300 font-medium mb-1">🎨 Communication Style</div>
{`COMMUNICATION STYLE:
Tone: {{styleData.tone}}
Pace: {{styleData.pace}}
Vocabulary: {{styleData.vocabulary}}
Energy: {{styleData.energy}}
Formality: {{styleData.formality}}
Humor: {{styleData.humor}}
Empathy: {{styleData.empathy}}
Confidence: {{styleData.confidence}}
Storytelling: {{styleData.storytelling}}

KEY PHRASES:
{{styleData.keyPhrases}}

TARGET AUDIENCE:
{{styleData.targetAudience}}

CONTENT STRUCTURE:
{{styleData.contentStructure}}`}
      </div>
    </div>
  );
}

export function PersonalDataPromptSection({ onRemove, highlighted, componentId }: PromptSectionProps) {
  return (
    <div 
      className={`bg-purple-500/10 border border-purple-400/20 rounded-lg p-3 mb-3 relative group transition-all duration-300 ${
        highlighted ? 'ring-4 ring-blue-400 bg-blue-500/80 shadow-2xl shadow-blue-500/40 border-blue-400/60 scale-105 -translate-y-1 blue-pulse !bg-blue-500/80' : ''
      }`}
      data-component-id={componentId}
      data-component-type="personal-data"
    >
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-600"
        >
          <X size={12} />
        </button>
      )}
      <div className="text-xs text-purple-100 font-mono whitespace-pre-wrap">
        <div className="text-purple-300 font-medium mb-1">🏥 Personal Health Data</div>
{`PERSONAL HEALTH METRICS:
Average Daily Steps: {{personalData.averageDailySteps}}
Average Heart Rate: {{personalData.averageHeartRate}} BPM

Use this data to personalize health content and recommendations.`}
      </div>
    </div>
  );
}

export function OutputSelectorPromptSection({ onRemove, highlighted, componentId }: PromptSectionProps) {
  return (
    <div 
      className={`bg-purple-500/10 border border-purple-400/20 rounded-lg p-3 mb-3 relative group transition-all duration-300 ${
        highlighted ? 'ring-4 ring-orange-400 bg-orange-500/80 shadow-2xl shadow-orange-500/40 border-orange-400/60 scale-105 -translate-y-1 orange-pulse !bg-orange-500/80' : ''
      }`}
      data-component-id={componentId}
      data-component-type="output-selector"
    >
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-600"
        >
          <X size={12} />
        </button>
      )}
      <div className="text-xs text-purple-100 font-mono whitespace-pre-wrap">
        <div className="text-purple-300 font-medium mb-1">📺 Output Format</div>
{`OUTPUT FORMAT: {{outputData.selectedFormat}}

Generate content optimized for {{outputData.selectedFormat}} format.`}
      </div>
    </div>
  );
}

export function TaskPromptSection() {
  return (
    <BasePromptSection>
      <div className="text-purple-300 font-medium mb-1">🎯 Main Prompt</div>
{`You are a health content generation assistant. Create personalized health content using the provided data:

Evidence Guidelines: {{evidenceText}}
Communication Style: {{styleDescription}}  
Personal Health Data: {{personalMetrics}}
Output Format: {{outputFormat}}

<mcp:call server="health-content-generator">
  <data>
    <evidence>{{evidenceText}}</evidence>
    <style>{{styleDescription}}</style>
    <personal>{{personalMetrics}}</personal>
    <format>{{outputFormat}}</format>
  </data>
</mcp:call>

Generate comprehensive, evidence-based health content that matches the communication style and personal preferences.`}
    </BasePromptSection>
  );
}

export function CustomPromptSection({ 
  value, 
  onChange, 
  placeholder = "Add your custom prompt instructions here..." 
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="bg-gray-500/10 border border-gray-400/20 rounded-lg p-3 mb-3">
      <div className="text-gray-300 font-medium mb-2 text-xs">✏️ Custom Instructions</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-600/20 border border-gray-500/30 text-white placeholder-gray-400/60 resize-none rounded-md p-2 text-xs font-mono min-h-[60px]"
        rows={3}
      />
    </div>
  );
}