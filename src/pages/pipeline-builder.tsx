import { useState, useEffect, useCallback } from "react";
import { Settings, Images } from "lucide-react";
import type { EvidenceData, OutputSelectorData, PersonalHealthData, PipelineConnection, PipelineNode, StyleData, VisualStylingData } from "../lib/pipeline-types";
import CanvasWorkspace from "../components/pipeline/canvas-workspace";
import ComponentSidebar from "../components/pipeline/component-sidebar";
import ConfirmationModal from "../components/pipeline/modals/confirmation-modal";
import EvidenceInputModal from "../components/pipeline/modals/evidence-input-modal";
import LoadingModal from "../components/pipeline/modals/loading-modal";
import OutputSelectorModal from "../components/pipeline/modals/output-selector-modal";
import PersonalDataModal from "../components/pipeline/modals/personal-data-modal";
import SettingsModal from "../components/pipeline/modals/settings-modal";
import StylePersonalizationModal from "../components/pipeline/modals/style-personalization-modal";
import VisualStylingModal from "../components/pipeline/modals/visual-styling-modal";
import ProcessingModal, { GenerationResult } from "../components/pipeline/modals/processing-modal";
import GalleryModal from "../components/gallery/gallery-modal";
import TitleInputModal from "../components/pipeline/modals/title-input-modal";
import { Button } from "../components/ui/button";

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
          title: 'AI Prompt',
          description: 'Build and edit AI prompt',
          prompt: 'You are a health content generation assistant with access to MCP tools.\n\nConnect components to access their data through the MCP protocol.',
          connectedComponents: [],
        },
      }
    ];
  });

  useEffect(() => {
    console.log("🥳🍾 Just detected that nodes changed", nodes)
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
    return 'You are a health content generation assistant with access to MCP tools.\n\nConnect components to access their data through the MCP protocol.';
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
      if (customApiKey) localStorage.setItem(STORAGE_KEYS.customApiKey, customApiKey);
      localStorage.setItem(STORAGE_KEYS.promptText, promptText);

      setLastSaveTime(new Date());
      // console.log('✅ State successfully saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save state to localStorage:', error);
    }
  }, [nodes, connections, evidenceData, styleData, visualStylingData, personalData, outputSelectorData, selectedService, customApiKey, promptText]);

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
      // console.log('🗑️ Cleared all pipeline state from localStorage');
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

  // Cleanup uploaded files when component unmounts or page is closed
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        // Save state before cleanup
        saveToLocalStorage();
        await fetch('/api/cleanup', { method: 'POST' });
      } catch (error) {
        console.error('Failed to cleanup files:', error);
      }
    };

    // Cleanup on page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save state and cleanup on unmount
      saveToLocalStorage();
      fetch('/api/cleanup', { method: 'POST' }).catch(console.error);
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

      // Debug logging for deletion scenario
      console.log('🔍 PROMPT UPDATE CHECK:', {
        currentCount: currentConnectedComponentsWithIds.length,
        newCount: connectedComponentsWithIds.length,
        typesChanged,
        idsChanged,
        hasImmediateUpdate,
        deletedNodeId,
        currentIds: currentConnectedComponentsWithIds.map(c => c.id),
        newIds: connectedComponentsWithIds.map(c => c.id)
      });

      // Force update if we have an immediate update flag or if components changed
      if (!typesChanged && !idsChanged && !hasImmediateUpdate) {
        console.log('❌ No changes detected, skipping prompt update');
        return prevNodes; // No change needed
      }

      // If we have an immediate update, force the update regardless of comparison
      if (hasImmediateUpdate) {
        console.log('⚡ IMMEDIATE UPDATE DETECTED - forcing prompt update');
      }

      console.log('✅ Changes detected, updating prompt node');

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

      // Debug logs for prompt node updates (crucial for deletion bug hunt)
      const updatedPromptNode = updatedNodes.find(n => n.type === 'prompt');
      console.log('🔗 Updated prompt connectedComponentsWithIds:', updatedPromptNode?.data.connectedComponentsWithIds);

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
    // Check if we have a prompt node and basic requirements
    const promptNode = nodes.find(n => n.type === 'prompt');
    if (!promptNode) {
      alert('Please add a prompt component to generate content.');
      return;
    }

    // Check for minimum viable configuration (evidence + any connections)
    const hasEvidence = evidenceData !== null;
    const hasConnections = connections.some(conn => conn.target === promptNode.id);

    if (!hasEvidence || !hasConnections) {
      alert('Please configure evidence input and connect components to the prompt to generate content.');
      return;
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
    // Save to gallery history in localStorage
    try {
      const savedHistory = localStorage.getItem('pipeline-builder-generation-history');
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      
      // Get connected components information
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
      
      history.unshift(newItem); // Add to beginning
      localStorage.setItem('pipeline-builder-generation-history', JSON.stringify(history));
      
      // Reset generation state
      setCurrentGenerationTitle('');
      
      // Show success message
      alert(`"${newItem.title}" generated successfully! Added to your gallery.`);
      
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
        evidenceData={evidenceData}
        styleData={styleData}
        visualStylingData={visualStylingData}
        personalData={personalData}
        outputSelectorData={outputSelectorData}
        promptText={promptText}
        onPromptChange={handlePromptChange}
        selectedComponentType={hoveredComponentType || selectedComponentType}
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
                prompt: '',
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
          setPromptText('You are a health content generation assistant with access to MCP tools.\n\nConnect components to access their data through the MCP protocol.');
          setLastSaveTime(null);
        }}
      />

      <ProcessingModal
        open={processingModalOpen}
        onOpenChange={setProcessingModalOpen}
        format={currentGenerationFormat}
        evidenceData={evidenceData}
        styleData={styleData}
        personalData={personalData}
        promptText={promptText}
        customApiKey={customApiKey}
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

      <LoadingModal
        open={loadingModalOpen}
        progress={generationProgress}
        status={generationStatus}
      />
    </div>
  );
}
