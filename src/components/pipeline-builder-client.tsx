"use client";

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
import SettingsModal from "./pipeline/modals/settings-modal";
import StylePersonalizationModal from "./pipeline/modals/style-personalization-modal";
import VisualStylingModal from "./pipeline/modals/visual-styling-modal";
import ProcessingModal, { GenerationResult } from "./pipeline/modals/processing-modal";
import GalleryModal from "./gallery/gallery-modal";
import TitleInputModal from "./pipeline/modals/title-input-modal";
import HelpModal from "./pipeline/modals/help-modal";
import { Button } from "./ui/button";

export default function PipelineBuilder() {
  // Initialize state with lazy initialization to check localStorage first
  const [nodes, setNodes] = useState<PipelineNode[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedNodes = localStorage.getItem('pipeline-builder-nodes');
        if (savedNodes) {
          const parsed = JSON.parse(savedNodes);
          return parsed;
        }
      } catch (error) {
        console.error('❌ Error loading saved nodes:', error);
      }
    }

    // Default state if no saved data
    // console.log('🎆 Initial load: Using default prompt node');
    return [
      {
        id: 'prompt-1',
        type: 'prompt',
        position: { x: 400, y: 300 },
        data: {
          configured: true,
          title: 'AI Prompt Builder',
          description: 'Build and edit AI prompt',
          prompt: 'Generate content based on the following:',
          connectedComponents: [],
        },
      }
    ];
  });

  useEffect(() => {
    // Track node changes
  }, [nodes]);


  const [connections, setConnections] = useState<PipelineConnection[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedConnections = localStorage.getItem('pipeline-builder-connections');
        if (savedConnections) {
          const parsed = JSON.parse(savedConnections);
          // console.log('🔗 Initial load: Found saved connections in localStorage:', parsed.length);
          return parsed;
        }
      } catch (error) {
        console.error('❌ Error loading saved connections:', error);
      }
    }

    return [];
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal states
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [visualStylingModalOpen, setVisualStylingModalOpen] = useState(false);
  const [personalDataModalOpen, setPersonalDataModalOpen] = useState(false);
  const [outputSelectorModalOpen, setOutputSelectorModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [processingModalOpen, setProcessingModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [titleInputModalOpen, setTitleInputModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [currentGenerationFormat, setCurrentGenerationFormat] = useState<'video' | 'audio'>('video');
  const [currentGenerationTitle, setCurrentGenerationTitle] = useState<string>('');

  // Data states with lazy initialization from localStorage
  const [evidenceData, setEvidenceData] = useState<EvidenceData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-evidence-data');
        if (saved) {
          // console.log('📊 Initial load: Found saved evidence data');
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('❌ Error loading saved evidence data:', error);
      }
    }
    return null;
  });

  const [styleData, setStyleData] = useState<StyleData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-style-data');
        if (saved) {
          // console.log('🎨 Initial load: Found saved style data');
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('❌ Error loading saved style data:', error);
      }
    }
    return null;
  });

  const [visualStylingData, setVisualStylingData] = useState<VisualStylingData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-visual-styling-data');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('❌ Error loading saved visual styling data:', error);
      }
    }
    return null;
  });

  const [personalData, setPersonalData] = useState<PersonalHealthData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-personal-data');
        if (saved) {
          // console.log('👨‍⚕️ Initial load: Found saved personal data');
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('❌ Error loading saved personal data:', error);
      }
    }
    return null;
  });

  const [outputSelectorData, setOutputSelectorData] = useState<OutputSelectorData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-output-selector-data');
        if (saved) {
          // console.log('📺 Initial load: Found saved output selector data');
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('❌ Error loading saved output selector data:', error);
      }
    }
    return null;
  });

  const [selectedService, setSelectedService] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-selected-service');
        if (saved) {
          // console.log('⚙️ Initial load: Found saved selected service:', saved);
          return saved;
        }
      } catch (error) {
        console.error('❌ Error loading saved selected service:', error);
      }
    }
    return 'gemini';
  });

  const [customApiKey, setCustomApiKey] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-custom-api-key');
        if (saved) {
          // console.log('🔑 Initial load: Found saved custom API key');
          return saved;
        }
      } catch (error) {
        console.error('❌ Error loading saved custom API key:', error);
      }
    }
    return null;
  });

  // Backend credentials state
  const [backendCredentials, setBackendCredentials] = useState<{
    geminiApiKey?: string;
    googleCloudCredentials?: any;
    googleCloudProject?: string;
    vertexAiRegion?: string;
    gcsBucket?: string;
    elevenlabsApiKey?: string;
  }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-backend-credentials');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('❌ Error loading saved backend credentials:', error);
      }
    }
    return {};
  });

  // Backend health check state
  const [backendHealthStatus, setBackendHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy' | 'unknown'>('unknown');
  const [lastBackendHealthCheck, setLastBackendHealthCheck] = useState<Date | null>(null);

  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");

  const [selectedNodeForConfig, setSelectedNodeForConfig] = useState<string | null>(null);
  const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
  const [hoveredComponentType, setHoveredComponentType] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Prompt state with lazy initialization from localStorage
  const [promptText, setPromptText] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-prompt-text');
        if (saved) {
          // console.log('📜 Initial load: Found saved prompt text');
          return saved;
        }
      } catch (error) {
        console.error('❌ Error loading saved prompt text:', error);
      }
    }
    return 'Generate content based on the following:';
  });

  // Local storage keys
  const STORAGE_KEYS = {
    nodes: 'pipeline-builder-nodes',
    connections: 'pipeline-builder-connections',
    evidenceData: 'pipeline-builder-evidence-data',
    styleData: 'pipeline-builder-style-data',
    visualStylingData: 'pipeline-builder-visual-styling-data',
    personalData: 'pipeline-builder-personal-data',
    outputSelectorData: 'pipeline-builder-output-selector-data',
    selectedService: 'pipeline-builder-selected-service',
    customApiKey: 'pipeline-builder-custom-api-key',
    promptText: 'pipeline-builder-prompt-text',
    backendCredentials: 'pipeline-builder-backend-credentials',
  };

  // Save state to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      // console.log('💾 Attempting to save state to localStorage...', {
      //   nodesCount: nodes.length,
      //   connectionsCount: connections.length,
      //   hasEvidenceData: !!evidenceData,
      //   hasStyleData: !!styleData,
      //   hasPersonalData: !!personalData,
      //   hasOutputSelectorData: !!outputSelectorData,
      //   selectedService,
      //   hasCustomApiKey: !!customApiKey,
      //   promptTextLength: promptText.length
      // });

      const nodesWithPositions = nodes.map(node => ({
        ...node,
        position: node.position // Ensure positions are explicitly saved
      }));

      // console.log('💾 About to save nodes:', nodesWithPositions.map(n => ({ id: n.id, type: n.type, position: n.position })));

      localStorage.setItem(STORAGE_KEYS.nodes, JSON.stringify(nodesWithPositions));

      // Verify what was actually saved
      const savedData = localStorage.getItem(STORAGE_KEYS.nodes);
      // const parsedSaved = JSON.parse(savedData!);
      // console.log('📍 Verified saved positions:', parsedSaved.map((n: any) => ({ id: n.id, position: n.position })));
      localStorage.setItem(STORAGE_KEYS.connections, JSON.stringify(connections));

      if (evidenceData) {
        localStorage.setItem(STORAGE_KEYS.evidenceData, JSON.stringify(evidenceData));
      } else {
        localStorage.removeItem(STORAGE_KEYS.evidenceData);
      }
      if (styleData) {
        localStorage.setItem(STORAGE_KEYS.styleData, JSON.stringify(styleData));
      } else {
        localStorage.removeItem(STORAGE_KEYS.styleData);
      }
      if (visualStylingData) {
        localStorage.setItem(STORAGE_KEYS.visualStylingData, JSON.stringify(visualStylingData));
      } else {
        localStorage.removeItem(STORAGE_KEYS.visualStylingData);
      }
      if (personalData) {
        localStorage.setItem(STORAGE_KEYS.personalData, JSON.stringify(personalData));
      } else {
        localStorage.removeItem(STORAGE_KEYS.personalData);
      }
      if (outputSelectorData) {
        localStorage.setItem(STORAGE_KEYS.outputSelectorData, JSON.stringify(outputSelectorData));
      } else {
        localStorage.removeItem(STORAGE_KEYS.outputSelectorData);
      }

      localStorage.setItem(STORAGE_KEYS.selectedService, selectedService);
      if (customApiKey) {
        localStorage.setItem(STORAGE_KEYS.customApiKey, customApiKey);
      } else {
        localStorage.removeItem(STORAGE_KEYS.customApiKey);
      }
      localStorage.setItem(STORAGE_KEYS.promptText, promptText);
      localStorage.setItem(STORAGE_KEYS.backendCredentials, JSON.stringify(backendCredentials));

      setLastSaveTime(new Date());
      // console.log('✅ State successfully saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save state to localStorage:', error);
    }
  }, [nodes, connections, evidenceData, styleData, visualStylingData, personalData, outputSelectorData, selectedService, customApiKey, promptText, backendCredentials]);

  // Load state from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      // console.log('🔍 Checking localStorage for saved data...');

      const savedNodes = localStorage.getItem(STORAGE_KEYS.nodes);
      const savedConnections = localStorage.getItem(STORAGE_KEYS.connections);
      const savedEvidenceData = localStorage.getItem(STORAGE_KEYS.evidenceData);
      const savedStyleData = localStorage.getItem(STORAGE_KEYS.styleData);
      const savedVisualStylingData = localStorage.getItem(STORAGE_KEYS.visualStylingData);
      const savedPersonalData = localStorage.getItem(STORAGE_KEYS.personalData);
      const savedOutputSelectorData = localStorage.getItem(STORAGE_KEYS.outputSelectorData);
      const savedSelectedService = localStorage.getItem(STORAGE_KEYS.selectedService);
      const savedCustomApiKey = localStorage.getItem(STORAGE_KEYS.customApiKey);
      const savedPromptText = localStorage.getItem(STORAGE_KEYS.promptText);
      const savedBackendCredentials = localStorage.getItem(STORAGE_KEYS.backendCredentials);

      // console.log('📊 localStorage contents check:', {
      //   hasNodes: !!savedNodes,
      //   hasConnections: !!savedConnections,
      //   hasEvidenceData: !!savedEvidenceData,
      //   hasStyleData: !!savedStyleData,
      //   hasPersonalData: !!savedPersonalData,
      //   hasOutputSelectorData: !!savedOutputSelectorData,
      //   hasSelectedService: !!savedSelectedService,
      //   hasCustomApiKey: !!savedCustomApiKey,
      //   hasPromptText: !!savedPromptText
      // });

      if (savedNodes) {
        const parsedNodes = JSON.parse(savedNodes);
        setNodes(parsedNodes);
        // console.log('📝 Restored nodes from localStorage:', parsedNodes.length, 'nodes');
      }

      if (savedConnections) {
        const parsedConnections = JSON.parse(savedConnections);
        setConnections(parsedConnections);
        // console.log('🔗 Restored connections from localStorage:', parsedConnections.length, 'connections');
      }

      if (savedEvidenceData) {
        setEvidenceData(JSON.parse(savedEvidenceData));
        // console.log('📊 Restored evidence data from localStorage');
      }

      if (savedStyleData) {
        setStyleData(JSON.parse(savedStyleData));
        // console.log('🎨 Restored style data from localStorage');
      }

      if (savedVisualStylingData) {
        setVisualStylingData(JSON.parse(savedVisualStylingData));
        // console.log('🎨 Restored visual styling data from localStorage');
      }

      if (savedPersonalData) {
        setPersonalData(JSON.parse(savedPersonalData));
        // console.log('👨‍⚕️ Restored personal data from localStorage');
      }

      if (savedOutputSelectorData) {
        setOutputSelectorData(JSON.parse(savedOutputSelectorData));
        // console.log('📺 Restored output selector data from localStorage');
      }

      if (savedSelectedService) {
        setSelectedService(savedSelectedService);
        // console.log('⚙️ Restored selected service from localStorage:', savedSelectedService);
      }

      if (savedCustomApiKey) {
        setCustomApiKey(savedCustomApiKey);
        // console.log('🔑 Restored custom API key from localStorage');
      }

      if (savedPromptText) {
        setPromptText(savedPromptText);
        // console.log('📜 Restored prompt text from localStorage');
      }

      if (savedBackendCredentials) {
        setBackendCredentials(JSON.parse(savedBackendCredentials));
        // console.log('🔑 Restored backend credentials from localStorage');
      }

    } catch (error) {
      console.error('❌ Failed to load state from localStorage:', error);
    }
  }, []);

  // Clear localStorage (useful for development or if user wants to reset)
  const clearLocalStorage = useCallback(() => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Also clear gallery data
      localStorage.removeItem('pipeline-builder-generation-history');
      
      // console.log('🗑️ Cleared all pipeline state and gallery data from localStorage');
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error);
    }
  }, []);

  // Auto-save state changes with shorter delay for frequent updates
  useEffect(() => {
    // console.log('🔄 Auto-save triggered by state change');
    const timeoutId = setTimeout(() => {
      // console.log('⏰ Auto-save timer executing...');
      saveToLocalStorage();
    }, 300); // Shorter delay for more responsive saves

    return () => {
      // console.log('❌ Auto-save timer cleared');
      clearTimeout(timeoutId);
    };
  }, [saveToLocalStorage]);

  // Backend health check function
  const checkBackendHealth = useCallback(async () => {
    setBackendHealthStatus('checking');
    
    try {
      // Use the Next.js API proxy to avoid CORS issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/health/backend', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const healthData = await response.json().catch(() => null);
        setBackendHealthStatus('healthy');
      } else {
        console.warn(`Backend health check failed with status: ${response.status} ${response.statusText}`);
        setBackendHealthStatus('unhealthy');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Backend health check timed out after 5 seconds');
        } else if (error.message.includes('fetch')) {
          console.error('Backend health check failed - connection refused or network error:', error.message);
        } else {
          console.error('Backend health check failed:', error.message);
        }
      } else {
        console.error('Backend health check failed with unknown error:', error);
      }
      setBackendHealthStatus('unhealthy');
    } finally {
      setLastBackendHealthCheck(new Date());
    }
  }, []);

  // Initial health check and periodic health checks
  useEffect(() => {
    checkBackendHealth();
    
    // Check health every 60 seconds
    const interval = setInterval(checkBackendHealth, 60000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);
  
  // Debug: Log when component mounts to verify state loading
  useEffect(() => {
    // console.log('🚀 PipelineBuilder mounted with state:', {
    //   nodesCount: nodes.length,
    //   connectionsCount: connections.length,
    //   hasEvidenceData: !!evidenceData,
    //   hasStyleData: !!styleData,
    //   hasPersonalData: !!personalData,
    //   hasOutputSelectorData: !!outputSelectorData,
    //   selectedService,
    //   hasCustomApiKey: !!customApiKey
    // });
  }, []); // Empty dependency array ensures this runs only once on mount

  // Debug: Track when nodes state changes
  useEffect(() => {
    // console.log('🔄 Pipeline Builder: Nodes state changed:', {
    //   count: nodes.length,
    //   positions: nodes.map(n => ({ id: n.id, type: n.type, position: n.position }))
    // });
    // console.log('💾 This should trigger auto-save...');
  }, [nodes]);

  // Save state when component unmounts or page is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save state before page unloads
      saveToLocalStorage();
    };

    // Save on page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Save on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save state on unmount
      saveToLocalStorage();
    };
  }, [saveToLocalStorage]);

  // Update connected components when connections change
  useEffect(() => {

    setNodes(prevNodes => {
      const promptNode = prevNodes.find(n => n.type === 'prompt');
      if (!promptNode) return prevNodes;

      // Find connected component types - only include connections to existing nodes
      const connectedComponentTypes = connections
        .filter(conn => conn.target === promptNode.id)
        .map(conn => {
          // Look up source node from prevNodes (current state)
          const sourceNode = prevNodes.find(n => n.id === conn.source);
          if (!sourceNode) {
            // console.log(`⚠️ Connection references deleted node: ${conn.source}, ignoring...`);
            return null;
          }
          return sourceNode.type;
        })
        .filter((type): type is PipelineNode['type'] => type !== null);

      // Also track connected components with their specific IDs - only include existing nodes
      const connectedComponentsWithIds = connections
        .filter(conn => conn.target === promptNode.id)
        .map(conn => {
          const sourceNode = prevNodes.find(n => n.id === conn.source);
          if (!sourceNode) {
            // console.log(`⚠️ Connection references deleted node: ${conn.source}, ignoring...`);
            return null;
          }
          return { id: sourceNode.id, type: sourceNode.type };
        })
        .filter((item): item is { id: string, type: PipelineNode['type'] } => item !== null);

      // Only update if the connected components actually changed
      const currentConnectedComponents = promptNode.data.connectedComponents || [];
      const currentConnectedComponentsWithIds = promptNode.data.connectedComponentsWithIds || [];

      const typesChanged = JSON.stringify(currentConnectedComponents.sort()) !== JSON.stringify(connectedComponentTypes.sort());
      const idsChanged = JSON.stringify(currentConnectedComponentsWithIds) !== JSON.stringify(connectedComponentsWithIds);

      // Check if this is an immediate update from node deletion
      const hasImmediateUpdate = promptNode.data._immediateUpdate;
      const deletedNodeId = promptNode.data._deletedNodeId;


      // Force update if we have an immediate update flag or if components changed
      if (!typesChanged && !idsChanged && !hasImmediateUpdate) {
        return prevNodes; // No change needed
      }

      // If we have an immediate update, force the update regardless of comparison
      if (hasImmediateUpdate) {
      }


      // Update the prompt node's connected components
      const updatedNodes = prevNodes.map(node =>
        node.type === 'prompt'
          ? {
            ...node,
            data: {
              ...node.data,
              // For immediate updates, keep the already-calculated data from handleNodeDelete
              // For normal updates, use the newly calculated data
              connectedComponents: hasImmediateUpdate ? node.data.connectedComponents : connectedComponentTypes,
              connectedComponentsWithIds: hasImmediateUpdate ? node.data.connectedComponentsWithIds : connectedComponentsWithIds,
              // Clear immediate update flags after processing
              _immediateUpdate: undefined,
              _deletedNodeId: undefined,
              // Force re-render with new timestamp
              _updateTimestamp: Date.now()
            }
          }
          : node
      );


      return updatedNodes;
    });
  }, [connections, nodes]);

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    setSelectedNodeForConfig(nodeId);
    switch (nodeType) {
      case 'evidence-input':
        setEvidenceModalOpen(true);
        break;
      case 'style-personalization':
        setStyleModalOpen(true);
        break;
      case 'visual-styling':
        setVisualStylingModalOpen(true);
        break;
      case 'personal-data':
        setPersonalDataModalOpen(true);
        break;
      case 'output-selector':
        setOutputSelectorModalOpen(true);
        break;
      case 'prompt':
        // Prompt node doesn't need a modal - it's editable inline
        break;
    }
  };

  const handlePromptChange = (newPrompt: string) => {
    setPromptText(newPrompt);
    // Update the prompt node's data
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.type === 'prompt'
          ? { ...node, data: { ...node.data, prompt: newPrompt } }
          : node
      )
    );
  };

  // Generate the final MCP-compatible prompt
  const generateMCPPrompt = () => {
    const promptNode = nodes.find(n => n.type === 'prompt');
    const connectedComponents = promptNode?.data.connectedComponentsWithIds || [];
    
    let finalPrompt = "You are a health content generation assistant. Create personalized health content using the following data:\n\n";
    
    // Add evidence data if connected
    if (connectedComponents.some(c => c.type === 'evidence-input') && evidenceData) {
      finalPrompt += `EVIDENCE GUIDELINES:\n${evidenceData.summary}\n\n`;
      finalPrompt += `KEY GUIDELINES:\n${evidenceData.extractedGuidelines.join('\n- ')}\n\n`;
      if (evidenceData.fileContent) {
        finalPrompt += `SOURCE CONTENT:\n${evidenceData.fileContent}\n\n`;
      }
    }
    
    // Add style data if connected
    if (connectedComponents.some(c => c.type === 'style-personalization') && styleData) {
      finalPrompt += `COMMUNICATION STYLE:\n`;
      finalPrompt += `Tone: ${styleData.tone}\n`;
      finalPrompt += `Pace: ${styleData.pace}\n`;
      finalPrompt += `Vocabulary: ${styleData.vocabulary}\n`;
      
      // Include advanced fields if they have values
      if (styleData.energy) {
        finalPrompt += `Energy: ${styleData.energy}\n`;
      }
      if (styleData.formality) {
        finalPrompt += `Formality: ${styleData.formality}\n`;
      }
      if (styleData.humor) {
        finalPrompt += `Humor: ${styleData.humor}\n`;
      }
      if (styleData.empathy) {
        finalPrompt += `Empathy: ${styleData.empathy}\n`;
      }
      if (styleData.confidence) {
        finalPrompt += `Confidence: ${styleData.confidence}\n`;
      }
      if (styleData.storytelling) {
        finalPrompt += `Storytelling: ${styleData.storytelling}\n`;
      }
      
      if (styleData.keyPhrases?.length) {
        finalPrompt += `\nKEY PHRASES:\n${styleData.keyPhrases.join(', ')}\n\n`;
      }
      finalPrompt += `TARGET AUDIENCE:\n${styleData.targetAudience}\n`;
      finalPrompt += `CONTENT STRUCTURE:\n${styleData.contentStructure}\n\n`;
    }
    
    // Add personal data if connected
    if (connectedComponents.some(c => c.type === 'personal-data') && personalData) {
      finalPrompt += `PERSONAL HEALTH METRICS:\n`;
      finalPrompt += `Average Daily Steps: ${personalData.averageDailySteps}\n`;
      finalPrompt += `Average Heart Rate: ${personalData.averageHeartRate} BPM\n\n`;
      finalPrompt += `Use this data to personalize health content and recommendations.\n\n`;
    }
    
    // Add visual styling if connected
    if (connectedComponents.some(c => c.type === 'visual-styling') && visualStylingData) {
      finalPrompt += `VISUAL STYLING REQUIREMENTS:\n`;
      
      // Add video styling for video format
      if (outputSelectorData?.selectedFormat === 'video' && visualStylingData.videoStyle) {
        const video = visualStylingData.videoStyle;
        finalPrompt += `Video Style: ${video.visualTheme} theme with ${video.colorScheme} colors\n`;
        finalPrompt += `Typography: ${video.fontStyle} fonts\n`;
        finalPrompt += `Layout: ${video.layoutStyle} composition\n`;
        finalPrompt += `Background: ${video.backgroundStyle} style\n`;
        finalPrompt += `Animation: ${video.animationLevel} level\n`;
      }
      
      // Add podcast thumbnail styling for audio format
      if (outputSelectorData?.selectedFormat === 'podcast' && visualStylingData.podcastThumbnail) {
        const podcast = visualStylingData.podcastThumbnail;
        finalPrompt += `Podcast Thumbnail: ${podcast.designTheme} design with ${podcast.colorScheme} colors\n`;
        finalPrompt += `Typography: ${podcast.fontStyle} fonts in ${podcast.layoutType} layout\n`;
        finalPrompt += `Background: ${podcast.backgroundStyle} style\n`;
        if (podcast.iconStyle && podcast.iconStyle !== 'none') {
          finalPrompt += `Icons: ${podcast.iconStyle} style elements\n`;
        }
      }
      
      if (visualStylingData.healthFocus) {
        finalPrompt += `Health Focus: ${visualStylingData.healthFocus}\n`;
      }
      
      if (visualStylingData.targetDemographic) {
        finalPrompt += `Target Demographic: ${visualStylingData.targetDemographic}\n`;
      }
      
      if (visualStylingData.customPrompt) {
        finalPrompt += `Custom Visual Instructions: ${visualStylingData.customPrompt}\n`;
      }
      
      finalPrompt += `\n`;
    }
    
    // Add output format if connected
    if (connectedComponents.some(c => c.type === 'output-selector') && outputSelectorData) {
      finalPrompt += `OUTPUT FORMAT: ${outputSelectorData.selectedFormat}\n\n`;
      finalPrompt += `Generate content optimized for ${outputSelectorData.selectedFormat} format.\n\n`;
    }
    
    // Add custom instructions
    if (promptNode?.data.customText) {
      finalPrompt += `ADDITIONAL INSTRUCTIONS:\n${promptNode.data.customText}\n\n`;
    } else {
      finalPrompt += `Create comprehensive, evidence-based health content that follows the communication style and incorporates personal health data for personalization.\n\n`;
    }
    
    return finalPrompt.trim();
  };

  const handleGenerate = () => {
    const errors = [];
    const warnings = [];
    
    // Check if we have a prompt node
    const promptNode = nodes.find(n => n.type === 'prompt');
    if (!promptNode) {
      errors.push('❌ No prompt component found. Please add an AI Prompt Builder component.');
    } else {
      // Check for connections
      const connectedComponents = promptNode.data.connectedComponentsWithIds || [];
      const hasConnections = connections.some(conn => conn.target === promptNode.id);
      
      if (!hasConnections || connectedComponents.length === 0) {
        errors.push('❌ No components connected to AI Prompt Builder. Please connect at least one component.');
      } else {
        // Check individual component configurations
        const hasOutputSelector = connectedComponents.some(c => c.type === 'output-selector');
        const hasEvidenceInput = connectedComponents.some(c => c.type === 'evidence-input');
        const hasStylePersonalization = connectedComponents.some(c => c.type === 'style-personalization');
        const hasVisualStyling = connectedComponents.some(c => c.type === 'visual-styling');
        const hasPersonalData = connectedComponents.some(c => c.type === 'personal-data');
        
        // Check Output Selector (required)
        if (!hasOutputSelector) {
          errors.push('❌ No Output Selector connected. Please connect and configure an Output Selector to specify video or podcast format.');
        } else if (!outputSelectorData) {
          errors.push('❌ Output Selector not configured. Please configure the Output Selector to specify generation format.');
        }
        
        // Check Evidence Input (recommended)
        if (!hasEvidenceInput) {
          warnings.push('⚠️ No Evidence-Based Input connected. Content will be generated without evidence guidelines.');
        } else if (!evidenceData || !evidenceData.fileContent || evidenceData.fileContent.trim().length === 0) {
          errors.push('❌ Evidence-Based Input connected but not configured. Please upload and process evidence documents.');
        }
        
        // Check Style Personalization (optional)
        if (hasStylePersonalization && (!styleData)) {
          errors.push('❌ Conversational Style connected but not configured. Please configure communication style settings.');
        }
        
        // Check Visual Styling (optional)
        if (hasVisualStyling && (!visualStylingData)) {
          errors.push('❌ Visual Styling connected but not configured. Please configure visual appearance settings.');
        }
        
        // Check Personal Data (optional)
        if (hasPersonalData && (!personalData)) {
          errors.push('❌ Personal Health Profile connected but not configured. Please configure personal health data.');
        }
      }
    }
    
    // Show comprehensive error/warning message if there are issues
    if (errors.length > 0 || warnings.length > 0) {
      let message = '';
      
      if (errors.length > 0) {
        message += 'Configuration Issues Found:\n\n';
        message += errors.join('\n') + '\n';
      }
      
      if (warnings.length > 0) {
        if (errors.length > 0) message += '\n';
        message += 'Warnings:\n\n';
        message += warnings.join('\n') + '\n';
      }
      
      if (errors.length > 0) {
        message += '\nPlease fix the errors above before generating content.';
        alert(message);
        return;
      } else {
        // Only warnings - ask for confirmation
        message += '\nDo you want to proceed with content generation despite these warnings?';
        if (!confirm(message)) {
          return;
        }
      }
    }

    setConfirmationModalOpen(true);
  };

  const handleConfirmGeneration = async () => {
    setConfirmationModalOpen(false);
    
    const format = outputSelectorData?.selectedFormat || 'video';
    setCurrentGenerationFormat(format === 'podcast' ? 'audio' : 'video');
    setTitleInputModalOpen(true);
  };

  const handleTitleConfirm = (title: string) => {
    setCurrentGenerationTitle(title);
    setTitleInputModalOpen(false);
    setProcessingModalOpen(true);
  };

  const handleTitleCancel = () => {
    setTitleInputModalOpen(false);
    setCurrentGenerationTitle('');
  };

  const handleProcessingComplete = (result: GenerationResult) => {
    // Update existing gallery item instead of creating a new one
    try {
      const savedHistory = localStorage.getItem('pipeline-builder-generation-history');
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      
      // Find existing item by ID and update it
      const existingItemIndex = history.findIndex((item: any) => item.id === result.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item with completion data
        const existingItem = history[existingItemIndex];
        const updatedItem = {
          ...existingItem,
          title: currentGenerationTitle || existingItem.title || `Generated ${result.format === 'video' ? 'Video' : 'Podcast'} Content`,
          downloadUrl: result.downloadUrl,
          thumbnailUrl: result.thumbnailUrl,
          duration: result.duration,
          fileSize: result.fileSize,
          status: 'completed',
          progress: 100,
          lastUpdated: new Date().toISOString()
        };
        
        history[existingItemIndex] = updatedItem;
      } else {
        // Fallback: create new item if somehow it doesn't exist
        console.warn('Gallery item not found for completed job, creating new item');
        const promptNode = nodes.find(n => n.type === 'prompt');
        const connectedComponents = promptNode ? connections
          .filter(conn => conn.target === promptNode.id)
          .map(conn => {
            const sourceNode = nodes.find(n => n.id === conn.source);
            return sourceNode ? sourceNode.type : 'unknown';
          }) : [];
        
        const newItem = {
          id: result.id,
          title: currentGenerationTitle || `Generated ${result.format === 'video' ? 'Video' : 'Podcast'} Content`,
          format: result.format,
          downloadUrl: result.downloadUrl,
          thumbnailUrl: result.thumbnailUrl,
          duration: result.duration,
          fileSize: result.fileSize,
          createdAt: new Date().toISOString(),
          status: 'completed',
          metadata: {
            evidenceUsed: evidenceData !== null,
            styleUsed: styleData !== null,
            personalDataUsed: personalData !== null,
            connectedComponents: connectedComponents
          }
        };
        
        history.unshift(newItem);
      }
      
      localStorage.setItem('pipeline-builder-generation-history', JSON.stringify(history));
      
      // Reset generation state
      setCurrentGenerationTitle('');
      
      // Open gallery instead of showing alert
      setGalleryModalOpen(true);
      
    } catch (error) {
      console.error('Failed to save to gallery:', error);
    }
  };

  const handleProcessingCancel = () => {
    // Handle cancellation logic if needed
    setProcessingModalOpen(false);
  };

  return (
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden relative">
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {/* Backend Health Status Indicator */}
        <div 
          className={`text-xs px-2 py-1 rounded border flex items-center gap-1 cursor-pointer transition-colors ${
            backendHealthStatus === 'healthy' 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-400/30 hover:bg-emerald-500/20' 
              : backendHealthStatus === 'unhealthy'
              ? 'text-red-400 bg-red-500/10 border-red-400/30 hover:bg-red-500/20'
              : backendHealthStatus === 'checking'
              ? 'text-blue-400 bg-blue-500/10 border-blue-400/30'
              : 'text-gray-400 bg-gray-800/80 border-gray-600'
          }`}
          onClick={() => setSettingsModalOpen(true)}
          title={
            backendHealthStatus === 'healthy' 
              ? 'Backend service is running normally. Click to open settings.' 
              : backendHealthStatus === 'unhealthy'
              ? 'Backend service is offline or unreachable. Click to open settings and check configuration.'
              : backendHealthStatus === 'checking'
              ? 'Checking backend service health... Click to open settings.'
              : 'Backend service status unknown. Click to open settings and check configuration.'
          }
        >
          {backendHealthStatus === 'checking' && <Loader2 className="w-3 h-3 animate-spin" />}
          {backendHealthStatus === 'healthy' && <CheckCircle className="w-3 h-3" />}
          {backendHealthStatus === 'unhealthy' && <XCircle className="w-3 h-3" />}
          {backendHealthStatus === 'unknown' && <XCircle className="w-3 h-3" />}
          Backend {backendHealthStatus === 'healthy' ? 'Online' : backendHealthStatus === 'checking' ? 'Checking...' : 'Offline'}
        </div>
        
        {/* Save Status Indicator */}
        {lastSaveTime && (
          <div className="text-xs text-gray-400 bg-gray-800/80 px-2 py-1 rounded border border-gray-600">
            💾 Saved {lastSaveTime.toLocaleTimeString()}
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => setGalleryModalOpen(true)}
          className="bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300 p-2 sm:px-3"
        >
          <Images size={16} />
          <span className="hidden sm:inline ml-2">Gallery</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setHelpModalOpen(true)}
          className="bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300 p-2 sm:px-3"
        >
          <HelpCircle size={16} />
          <span className="hidden sm:inline ml-2">Help</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => setSettingsModalOpen(true)}
          className="bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300 p-2 sm:px-3"
        >
          <Settings size={16} />
          <span className="hidden sm:inline ml-2">Settings</span>
        </Button>
      </div>


      {/* Blur overlay when generating */}
      {loadingModalOpen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40" />
      )}

      <ComponentSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        nodes={nodes}
      />

      <CanvasWorkspace
        nodes={nodes}
        connections={connections}
        onNodesChange={setNodes}
        onConnectionsChange={setConnections}
        onNodeClick={handleNodeClick}
        onGenerate={handleGenerate}
        onSelectionChange={setSelectedComponentType}
        onHoverChange={setHoveredComponentType}
        backendHealthStatus={backendHealthStatus}
        evidenceData={evidenceData}
        styleData={styleData}
        visualStylingData={visualStylingData}
        personalData={personalData}
        outputSelectorData={outputSelectorData}
        promptText={promptText}
        onPromptChange={handlePromptChange}
        selectedComponentType={hoveredComponentType || selectedComponentType}
        onClearEvidenceData={() => setEvidenceData(null)}
        onClearStyleData={() => setStyleData(null)}
        onClearVisualStylingData={() => setVisualStylingData(null)}
        onClearPersonalData={() => setPersonalData(null)}
        onClearOutputSelectorData={() => setOutputSelectorData(null)}
      />

      <EvidenceInputModal
        open={evidenceModalOpen}
        onOpenChange={setEvidenceModalOpen}
        customApiKey={customApiKey}
        existingData={evidenceData}
        onDataUpdate={(data) => {
          setEvidenceData(data);
          if (selectedNodeForConfig) {
            setNodes(prev => prev.map(node =>
              node.id === selectedNodeForConfig
                ? { ...node, data: { ...node.data, configured: data !== null } }
                : node
            ));
          }
        }}
      />

      <StylePersonalizationModal
        open={styleModalOpen}
        onOpenChange={setStyleModalOpen}
        customApiKey={customApiKey}
        existingData={styleData}
        onDataUpdate={(data) => {
          setStyleData(data);
          if (selectedNodeForConfig) {
            setNodes(prev => prev.map(node =>
              node.id === selectedNodeForConfig
                ? { ...node, data: { ...node.data, configured: data !== null } }
                : node
            ));
          }
        }}
      />

      <VisualStylingModal
        open={visualStylingModalOpen}
        onOpenChange={setVisualStylingModalOpen}
        existingData={visualStylingData}
        onDataUpdate={(data) => {
          setVisualStylingData(data);
          if (selectedNodeForConfig) {
            setNodes(prev => prev.map(node =>
              node.id === selectedNodeForConfig
                ? { ...node, data: { ...node.data, configured: data !== null } }
                : node
            ));
          }
        }}
      />

      <PersonalDataModal
        open={personalDataModalOpen}
        onOpenChange={setPersonalDataModalOpen}
        onDataUpdate={(data) => {
          setPersonalData(data);
          if (selectedNodeForConfig) {
            setNodes(prev => prev.map(node =>
              node.id === selectedNodeForConfig
                ? { ...node, data: { ...node.data, configured: data !== null } }
                : node
            ));
          }
        }}
      />

      <OutputSelectorModal
        open={outputSelectorModalOpen}
        onOpenChange={setOutputSelectorModalOpen}
        currentData={outputSelectorData}
        hasGeminiKey={!!customApiKey}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onDataUpdate={(data) => {
          setOutputSelectorData(data);
          if (selectedNodeForConfig) {
            setNodes(prev => prev.map(node =>
              node.id === selectedNodeForConfig
                ? { ...node, data: { ...node.data, configured: data !== null } }
                : node
            ));
          }
        }}
      />

      <ConfirmationModal
        open={confirmationModalOpen}
        onOpenChange={setConfirmationModalOpen}
        onConfirm={handleConfirmGeneration}
        title="Confirm Content Generation"
        description="Are you sure you want to generate this content? This will process all your configured pipeline components and create your personalized media."
      />

      <SettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        currentService={selectedService}
        onServiceChange={setSelectedService}
        onApiKeyUpdate={setCustomApiKey}
        currentApiKey={customApiKey}
        onBackendCredentialsUpdate={setBackendCredentials}
        currentBackendCredentials={backendCredentials}
        healthStatus={backendHealthStatus}
        onHealthCheck={checkBackendHealth}
        onResetStorage={() => {
          clearLocalStorage();
          // Reset all state to initial values
          setNodes([
            {
              id: 'prompt-1',
              type: 'prompt',
              position: { x: 400, y: 300 },
              data: {
                configured: true,
                title: 'AI Prompt',
                description: 'Build and edit AI prompt',
                prompt: 'Generate content based on the following:',
                connectedComponents: [],
              },
            }
          ]);
          setConnections([]);
          setEvidenceData(null);
          setStyleData(null);
          setVisualStylingData(null);
          setPersonalData(null);
          setOutputSelectorData(null);
          setSelectedService('gemini');
          setCustomApiKey(null);
          setBackendCredentials({});
          setPromptText('Generate content based on the following:');
          setLastSaveTime(null);
        }}
      />

      <ProcessingModal
        open={processingModalOpen}
        onOpenChange={setProcessingModalOpen}
        format={currentGenerationFormat}
        evidenceData={evidenceData}
        styleData={styleData}
        visualStylingData={visualStylingData}
        personalData={personalData}
        promptText={promptText}
        customApiKey={customApiKey}
        backendCredentials={backendCredentials}
        onComplete={handleProcessingComplete}
        onCancel={handleProcessingCancel}
      />

      <TitleInputModal
        open={titleInputModalOpen}
        onOpenChange={setTitleInputModalOpen}
        format={currentGenerationFormat}
        onConfirm={handleTitleConfirm}
        onCancel={handleTitleCancel}
      />

      <GalleryModal
        open={galleryModalOpen}
        onOpenChange={setGalleryModalOpen}
        onCreateNew={() => {
          setGalleryModalOpen(false);
          // Focus on the pipeline builder to create new content
        }}
      />

      <HelpModal
        open={helpModalOpen}
        onOpenChange={setHelpModalOpen}
      />

      <LoadingModal
        open={loadingModalOpen}
        progress={generationProgress}
        status={generationStatus}
      />
    </div>
  );
}
