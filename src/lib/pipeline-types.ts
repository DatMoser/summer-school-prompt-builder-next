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
  // New dimensions-based approach
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
