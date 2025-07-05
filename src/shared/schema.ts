import { z } from "zod";

// Type definitions for pipeline components
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

// Basic user and pipeline types for in-memory storage
export interface User {
  id: number;
  username: string;
  password: string;
}

export interface Pipeline {
  id: number;
  userId: number;
  name: string;
  nodes: PipelineNode[];
  connections: PipelineConnection[];
  isComplete: boolean;
}

export interface PipelineRun {
  id: number;
  pipelineId: number;
  outputFormat: 'video' | 'podcast';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  evidenceData?: EvidenceData;
  styleData?: StyleData;
  personalData?: PersonalHealthData;
  generatedContent?: string;
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface UploadedFile {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  userId: number;
}

// Zod schemas for validation
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertPipelineSchema = z.object({
  name: z.string().min(1),
  nodes: z.array(z.any()).default([]),
  connections: z.array(z.any()).default([]),
  isComplete: z.boolean().default(false),
});

export const insertPipelineRunSchema = z.object({
  pipelineId: z.number(),
  outputFormat: z.enum(['video', 'podcast']),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  evidenceData: z.any().optional(),
  styleData: z.any().optional(),
  personalData: z.any().optional(),
  generatedContent: z.string().optional(),
  downloadUrl: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const insertUploadedFileSchema = z.object({
  fileName: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  userId: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type InsertPipelineRun = z.infer<typeof insertPipelineRunSchema>;
export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;