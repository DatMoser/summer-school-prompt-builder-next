export interface PipelineNode {
  id: string;
  type: 'evidence-input' | 'style-personalization' | 'visual-styling' | 'personal-data' | 'output-selector' | 'prompt';
  position: { x: number; y: number };
  data: {
    configured: boolean;
    title: string;
    description: string;
    prompt?: string;
    connectedComponents?: string[];
    connectedComponentsWithIds?: Array<{id: string, type: string}>;
    customText?: string;
    // Debug/optimization properties
    _immediateUpdate?: boolean;
    _updateTimestamp?: number;
    _deletedNodeId?: string;
    _renderKey?: string;
    _connectionKey?: string;
    _promptNodeKey?: string;
    _forceUpdate?: number;
    // React component props (for prompt node)
    onPromptChange?: (prompt: string) => void;
    onGenerate?: () => void;
    selectedComponentType?: string | null;
    onCustomTextChange?: (text: string) => void;
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
  // Conversational style dimensions
  tone: string;
  pace: string;
  vocabulary: string;
  energy: string;
  formality: string;
  humor: string;
  empathy: string;
  confidence: string;
  storytelling: string;
  keyPhrases: string[];
  targetAudience: string;
  contentStructure: string;
  // Metadata
  sourceDescription?: string; // Description of where this style came from (e.g., "Trump-like style", "Custom manual entry")
  isAIGenerated?: boolean; // Whether this was generated via AI or manually entered
}

export interface VisualStylingData {
  // Video styling options
  videoStyle?: {
    colorScheme: string; // "warm", "cool", "vibrant", "neutral", "custom"
    visualTheme: string; // "modern", "classic", "minimalist", "professional", "healthcare"
    fontStyle: string; // "clean", "bold", "elegant", "playful"
    layoutStyle: string; // "dynamic", "static", "split-screen", "presenter-focus"
    backgroundStyle: string; // "gradient", "solid", "subtle-pattern", "branded"
    animationLevel: string; // "minimal", "moderate", "dynamic"
  };
  
  // Podcast thumbnail styling options
  podcastThumbnail?: {
    colorScheme: string; // "warm", "cool", "vibrant", "neutral", "custom"
    designTheme: string; // "modern", "classic", "minimalist", "professional", "healthcare"
    fontStyle: string; // "clean", "bold", "elegant", "playful"
    layoutType: string; // "text-focused", "icon-focused", "balanced", "portrait"
    backgroundStyle: string; // "gradient", "solid", "geometric", "branded"
    iconStyle: string; // "medical", "fitness", "lifestyle", "abstract", "none"
  };
  
  // Custom colors (if colorScheme is "custom")
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  // Branding options
  branding?: {
    includeLogo: boolean;
    logoPosition: string; // "top-left", "top-right", "bottom-left", "bottom-right", "center"
    brandColors: boolean; // Whether to use brand colors
  };
  
  // Content-specific styling
  healthFocus: string; // "general", "fitness", "nutrition", "mental-health", "medical", "wellness"
  targetDemographic: string; // "young-adults", "middle-aged", "seniors", "professionals", "general"
  
  // Metadata
  sourceDescription?: string;
  lastModified?: string;
}

export interface PersonalHealthData {
  // Basic Demographics & Goals (Apple Health profile data)
  age: number; // Birth date → calculated age
  biologicalSex: string; // "Male", "Female", "Other" - Apple Health profile
  heightCm?: number; // Height in cm - Apple Health
  weightKg?: number; // Weight in kg - Apple Health
  fitnessGoals: string; // User-defined goals (not directly from Apple Health but contextual)
  
  // Basic Activity Metrics (Apple Health HealthKit data)
  averageDailySteps: number; // Step count data
  averageHeartRate?: number; // Heart rate data from Apple Watch/devices
  sleepHoursPerNight?: number; // Sleep analysis data
  activeEnergyBurned?: number; // Active calories per day
  exerciseMinutesPerWeek?: number; // Workout time tracking
  
  // Advanced Health Metrics (optional - Apple Health + Apple Watch)
  restingHeartRate?: number; // Resting heart rate from Apple Watch
  vo2Max?: number; // Cardio fitness from Apple Watch
  walkingHeartRateAverage?: number; // Walking heart rate average
  heartRateVariability?: number; // HRV from Apple Watch (RMSSD)
  bloodPressureSystolic?: number; // Blood pressure readings (if logged)
  bloodPressureDiastolic?: number; // Blood pressure readings (if logged)
  bodyMassIndex?: number; // Calculated from height/weight
  bloodGlucose?: number; // Blood glucose readings (if tracked)
  waterIntakeLiters?: number; // Water intake tracking
  
  // Activity Pattern Analysis (derived from Apple Health data)
  workoutTypes?: string[]; // Types of workouts tracked (running, cycling, etc.)
  mostActiveTimeOfDay?: string; // When user is most active based on data
  weeklyActivityConsistency?: string; // "High", "Medium", "Low" based on patterns
  
  // Metadata
  sourceDescription?: string; // "Apple Health", "Manual Entry", etc.
  lastSyncDate?: string; // When data was last synced from Apple Health
}

export interface OutputSelectorData {
  selectedFormat: 'video' | 'podcast';
}
