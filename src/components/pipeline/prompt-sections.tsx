import { X } from 'lucide-react';

export interface PromptSectionProps {
  onRemove?: () => void;
  highlighted?: boolean;
  componentId?: string;
}

export interface EvidencePromptSectionProps extends PromptSectionProps {
  evidenceData?: {
    summary?: string;
    extractedGuidelines?: string[];
    fileContent?: string;
    fileName?: string;
  };
}

export interface StylePromptSectionProps extends PromptSectionProps {
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
}

export interface PersonalDataPromptSectionProps extends PromptSectionProps {
  personalData?: {
    averageDailySteps?: number;
    averageHeartRate?: number;
    age?: number;
    biologicalSex?: string;
    fitnessGoals?: string;
    restingHeartRate?: number;
  };
}

export interface VisualStylingPromptSectionProps extends PromptSectionProps {
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
}

export interface OutputSelectorPromptSectionProps extends PromptSectionProps {
  outputSelectorData?: {
    selectedFormat?: string;
  };
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

export function EvidencePromptSection({ onRemove, highlighted, componentId, evidenceData }: EvidencePromptSectionProps) {
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
        {evidenceData ? (
          <div>
            <div className="mb-2">
              <span className="text-purple-200 font-medium">EVIDENCE GUIDELINES:</span>
              <div className="mt-1 text-gray-300">{evidenceData.summary || 'No summary available'}</div>
            </div>
            
            {evidenceData.extractedGuidelines && evidenceData.extractedGuidelines.length > 0 && (
              <div className="mb-2">
                <span className="text-purple-200 font-medium">KEY GUIDELINES:</span>
                <div className="mt-1 text-gray-300">
                  {evidenceData.extractedGuidelines.map((guideline, index) => (
                    <div key={index}>• {guideline}</div>
                  ))}
                </div>
              </div>
            )}
            
            {evidenceData.fileContent && (
              <div>
                <span className="text-purple-200 font-medium">SOURCE CONTENT:</span>
                <div className="mt-1 text-gray-300 ">
                  {evidenceData.fileContent.substring(0, 150)}...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 italic">Configure evidence input to see content here</div>
        )}
      </div>
    </div>
  );
}

export function StylePromptSection({ onRemove, highlighted, componentId, styleData }: StylePromptSectionProps) {
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
        {styleData ? (
          <div>
            <div className="mb-2">
              <span className="text-purple-200 font-medium">COMMUNICATION STYLE:</span>
              <div className="mt-1 text-gray-300 space-y-1">
                <div>Tone: {styleData.tone || 'Not set'}</div>
                <div>Pace: {styleData.pace || 'Not set'}</div>
                <div>Vocabulary: {styleData.vocabulary || 'Not set'}</div>
                {styleData.energy && <div>Energy: {styleData.energy}</div>}
                {styleData.formality && <div>Formality: {styleData.formality}</div>}
                {styleData.humor && <div>Humor: {styleData.humor}</div>}
                {styleData.empathy && <div>Empathy: {styleData.empathy}</div>}
                {styleData.confidence && <div>Confidence: {styleData.confidence}</div>}
                {styleData.storytelling && <div>Storytelling: {styleData.storytelling}</div>}
              </div>
            </div>
            
            {styleData.keyPhrases && styleData.keyPhrases.length > 0 && (
              <div className="mb-2">
                <span className="text-purple-200 font-medium">KEY PHRASES:</span>
                <div className="mt-1 text-gray-300">{styleData.keyPhrases.join(', ')}</div>
              </div>
            )}
            
            {styleData.targetAudience && (
              <div className="mb-2">
                <span className="text-purple-200 font-medium">TARGET AUDIENCE:</span>
                <div className="mt-1 text-gray-300">{styleData.targetAudience}</div>
              </div>
            )}
            
            {styleData.contentStructure && (
              <div>
                <span className="text-purple-200 font-medium">CONTENT STRUCTURE:</span>
                <div className="mt-1 text-gray-300">{styleData.contentStructure}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 italic">Configure style personalization to see content here</div>
        )}
      </div>
    </div>
  );
}

export function PersonalDataPromptSection({ onRemove, highlighted, componentId, personalData }: PersonalDataPromptSectionProps) {
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
        {personalData ? (
          <div>
            <div className="mb-2">
              <span className="text-purple-200 font-medium">PERSONAL HEALTH METRICS:</span>
              <div className="mt-1 text-gray-300 space-y-1">
                <div>Average Daily Steps: {personalData.averageDailySteps?.toLocaleString() || 'Not set'}</div>
                <div>Average Heart Rate: {personalData.averageHeartRate || 'Not set'} BPM</div>
                {personalData.age && <div>Age: {personalData.age} years</div>}
                {personalData.biologicalSex && <div>Biological Sex: {personalData.biologicalSex}</div>}
                {personalData.fitnessGoals && <div>Fitness Goals: {personalData.fitnessGoals}</div>}
                {personalData.restingHeartRate && <div>Resting Heart Rate: {personalData.restingHeartRate} BPM</div>}
              </div>
            </div>
            <div className="text-gray-300 text-xs italic">
              Use this data to personalize health content and recommendations.
            </div>
          </div>
        ) : (
          <div className="text-gray-400 italic">Configure personal data to see content here</div>
        )}
      </div>
    </div>
  );
}

export function VisualStylingPromptSection({ onRemove, highlighted, componentId, visualStylingData }: VisualStylingPromptSectionProps) {
  return (
    <div 
      className={`bg-purple-500/10 border border-purple-400/20 rounded-lg p-3 mb-3 relative group transition-all duration-300 ${
        highlighted ? 'ring-4 ring-pink-400 bg-pink-500/80 shadow-2xl shadow-pink-500/40 border-pink-400/60 scale-105 -translate-y-1 pink-pulse !bg-pink-500/80' : ''
      }`}
      data-component-id={componentId}
      data-component-type="visual-styling"
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
        <div className="text-purple-300 font-medium mb-1">🎨 Visual Styling</div>
        {visualStylingData ? (
          <div>
            <div className="mb-2">
              <span className="text-purple-200 font-medium">VISUAL STYLING:</span>
              <div className="mt-1 text-gray-300 space-y-1">
                {visualStylingData.videoStyle && (
                  <div>
                    <div className="text-gray-400">Video Style:</div>
                    {visualStylingData.videoStyle.colorScheme && <div>• Color Scheme: {visualStylingData.videoStyle.colorScheme}</div>}
                    {visualStylingData.videoStyle.visualTheme && <div>• Design Theme: {visualStylingData.videoStyle.visualTheme}</div>}
                    {visualStylingData.videoStyle.fontStyle && <div>• Font Style: {visualStylingData.videoStyle.fontStyle}</div>}
                    {visualStylingData.videoStyle.layoutStyle && <div>• Layout Style: {visualStylingData.videoStyle.layoutStyle}</div>}
                    {visualStylingData.videoStyle.backgroundStyle && <div>• Background Style: {visualStylingData.videoStyle.backgroundStyle}</div>}
                    {visualStylingData.videoStyle.animationLevel && <div>• Animation Level: {visualStylingData.videoStyle.animationLevel}</div>}
                  </div>
                )}
                {visualStylingData.podcastThumbnail && (
                  <div>
                    <div className="text-gray-400">Podcast Thumbnail:</div>
                    {visualStylingData.podcastThumbnail.colorScheme && <div>• Color Scheme: {visualStylingData.podcastThumbnail.colorScheme}</div>}
                    {visualStylingData.podcastThumbnail.designTheme && <div>• Design Theme: {visualStylingData.podcastThumbnail.designTheme}</div>}
                    {visualStylingData.podcastThumbnail.fontStyle && <div>• Font Style: {visualStylingData.podcastThumbnail.fontStyle}</div>}
                    {visualStylingData.podcastThumbnail.layoutType && <div>• Layout Type: {visualStylingData.podcastThumbnail.layoutType}</div>}
                    {visualStylingData.podcastThumbnail.backgroundStyle && <div>• Background Style: {visualStylingData.podcastThumbnail.backgroundStyle}</div>}
                    {visualStylingData.podcastThumbnail.iconStyle && <div>• Icon Style: {visualStylingData.podcastThumbnail.iconStyle}</div>}
                  </div>
                )}
              </div>
            </div>
            
            {visualStylingData.healthFocus && (
              <div className="mb-2">
                <span className="text-purple-200 font-medium">HEALTH FOCUS:</span>
                <div className="mt-1 text-gray-300">{visualStylingData.healthFocus}</div>
              </div>
            )}
            
            {visualStylingData.targetDemographic && (
              <div>
                <span className="text-purple-200 font-medium">TARGET DEMOGRAPHIC:</span>
                <div className="mt-1 text-gray-300">{visualStylingData.targetDemographic}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 italic">Configure visual styling to see content here</div>
        )}
      </div>
    </div>
  );
}

export function OutputSelectorPromptSection({ onRemove, highlighted, componentId, outputSelectorData }: OutputSelectorPromptSectionProps) {
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
        {outputSelectorData ? (
          <div>
            <div className="mb-2">
              <span className="text-purple-200 font-medium">OUTPUT FORMAT:</span>
              <div className="mt-1 text-gray-300">
                {outputSelectorData.selectedFormat ? 
                  outputSelectorData.selectedFormat.charAt(0).toUpperCase() + outputSelectorData.selectedFormat.slice(1) 
                  : 'Not selected'
                }
              </div>
            </div>
            <div className="text-gray-300 text-xs italic">
              Generate content optimized for {outputSelectorData.selectedFormat || 'selected'} format.
            </div>
          </div>
        ) : (
          <div className="text-gray-400 italic">Configure output selector to see content here</div>
        )}
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