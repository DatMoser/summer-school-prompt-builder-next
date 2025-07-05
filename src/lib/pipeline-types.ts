export interface PipelineNode {
  id: string;
  type: 'evidence-input' | 'style-personalization' | 'personal-data' | 'output-selector' | 'prompt';
  position: { x: number; y: number };
  data: {
    configured: boolean;
    title: string;
    description: string;
    prompt?: string;
    connectedComponents?: string[];
    connectedComponentsWithIds?: Array<{id: string, type: string}>;
    customText?: string;
  };
}

export interface PipelineConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface EvidenceData {
  fileName: string;
  fileContent: string;
  filePath: string;
  summary: string;
  extractedGuidelines: string[];
}

export interface StyleData {
  youtubeUrl: string;
  startTime?: string;
  endTime?: string;
  transcript: string;
  extractedStyle: {
    tone: string;
    pace: string;
    vocabulary: string;
    keyPhrases: string[];
  };
}

export interface PersonalHealthData {
  averageDailySteps: number;
  averageHeartRate: number;
}

export interface OutputSelectorData {
  selectedFormat: 'video' | 'podcast';
}
