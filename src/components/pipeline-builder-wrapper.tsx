'use client';

import { useState, useEffect, useCallback } from "react";
import { Settings, Images, HelpCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { EvidenceData, OutputSelectorData, PersonalHealthData, PipelineConnection, PipelineNode, StyleData, VisualStylingData } from "../lib/pipeline-types";
import CanvasWorkspace from "./pipeline/canvas-workspace";
import ComponentSidebar from "./pipeline/component-sidebar";
import ConfirmationModal from "./pipeline/modals/confirmation-modal";
import EvidenceInputModal from "./pipeline/modals/evidence-input-modal";
import LoadingModal from "./pipeline/modals/loading-modal";
import OutputSelectorModal from "./pipeline/modals/output-selector-modal";
import PersonalDataModal from "./pipeline/modals/personal-data-modal";
import ProcessingModal from "./pipeline/modals/processing-modal";
import SettingsModal from "./pipeline/modals/settings-modal";
import StylePersonalizationModal from "./pipeline/modals/style-personalization-modal";
import VisualStylingModal from "./pipeline/modals/visual-styling-modal";
import GenerateOptionsModal from "./pipeline/modals/generate-options-modal";
import GalleryModal from "./gallery/gallery-modal";
import TitleInputModal from "./pipeline/modals/title-input-modal";
import HelpModal from "./pipeline/modals/help-modal";
import { Button } from "./ui/button";

function PipelineBuilder() {
  // Initialize state with lazy initialization to check localStorage first
  const [nodes, setNodes] = useState<PipelineNode[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-nodes');
        return saved ? JSON.parse(saved) : [
          {
            id: '1',
            type: 'promptNode',
            position: { x: 400, y: 100 },
            data: { title: 'Main Prompt' },
          },
        ];
      } catch (error) {
        console.error('Error loading nodes from localStorage:', error);
        return [
          {
            id: '1',
            type: 'promptNode',
            position: { x: 400, y: 100 },
            data: { title: 'Main Prompt' },
          },
        ];
      }
    }
    return [
      {
        id: '1',
        type: 'promptNode',
        position: { x: 400, y: 100 },
        data: { title: 'Main Prompt' },
      },
    ];
  });

  // Continue with rest of the component logic...
  // (This is a simplified version - you'd need to copy the full component logic)
  
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <ComponentSidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Pipeline Builder</h1>
        </div>
        <div className="flex-1">
          <CanvasWorkspace 
            nodes={nodes} 
            setNodes={setNodes}
            connections={[]}
            setConnections={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

export default PipelineBuilder;