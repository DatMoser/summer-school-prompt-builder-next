import { useState, useEffect, useCallback } from "react";
import { Settings } from "lucide-react";
import type { EvidenceData, OutputSelectorData, PersonalHealthData, PipelineConnection, PipelineNode, StyleData } from "../lib/pipeline-types";
import CanvasWorkspace from "../components/pipeline/canvas-workspace";
import ComponentSidebar from "../components/pipeline/component-sidebar";
import ConfirmationModal from "../components/pipeline/modals/confirmation-modal";
import EvidenceInputModal from "../components/pipeline/modals/evidence-input-modal";
import LoadingModal from "../components/pipeline/modals/loading-modal";
import OutputSelectorModal from "../components/pipeline/modals/output-selector-modal";
import PersonalDataModal from "../components/pipeline/modals/personal-data-modal";
import SettingsModal from "../components/pipeline/modals/settings-modal";
import StylePersonalizationModal from "../components/pipeline/modals/style-personalization-modal";
import { Button } from "../components/ui/button";

export default function PipelineBuilder() {
  // Initialize state with lazy initialization to check localStorage first
  const [nodes, setNodes] = useState<PipelineNode[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedNodes = localStorage.getItem('pipeline-builder-nodes');
        if (savedNodes) {
          const parsed = JSON.parse(savedNodes);
          console.log('📝 Initial load: Found saved nodes in localStorage:', parsed.length);
          console.log('📍 Initial load: Positions from localStorage:', parsed.map((n: any) => ({ id: n.id, position: n.position })));
          return parsed;
        }
      } catch (error) {
        console.error('❌ Error loading saved nodes:', error);
      }
    }
    
    // Default state if no saved data
    console.log('🎆 Initial load: Using default prompt node');
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
  
  const [connections, setConnections] = useState<PipelineConnection[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedConnections = localStorage.getItem('pipeline-builder-connections');
        if (savedConnections) {
          const parsed = JSON.parse(savedConnections);
          console.log('🔗 Initial load: Found saved connections in localStorage:', parsed.length);
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
  const [personalDataModalOpen, setPersonalDataModalOpen] = useState(false);
  const [outputSelectorModalOpen, setOutputSelectorModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Data states with lazy initialization from localStorage
  const [evidenceData, setEvidenceData] = useState<EvidenceData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-evidence-data');
        if (saved) {
          console.log('📊 Initial load: Found saved evidence data');
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
          console.log('🎨 Initial load: Found saved style data');
          return JSON.parse(saved);
        }
      } catch (error) {
        console.error('❌ Error loading saved style data:', error);
      }
    }
    return null;
  });
  
  const [personalData, setPersonalData] = useState<PersonalHealthData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-personal-data');
        if (saved) {
          console.log('👨‍⚕️ Initial load: Found saved personal data');
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
          console.log('📺 Initial load: Found saved output selector data');
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
          console.log('⚙️ Initial load: Found saved selected service:', saved);
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
          console.log('🔑 Initial load: Found saved custom API key');
          return saved;
        }
      } catch (error) {
        console.error('❌ Error loading saved custom API key:', error);
      }
    }
    return null;
  });
  
  const [customYouTubeApiKey, setCustomYouTubeApiKey] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pipeline-builder-custom-youtube-api-key');
        if (saved) {
          console.log('📺 Initial load: Found saved custom YouTube API key');
          return saved;
        }
      } catch (error) {
        console.error('❌ Error loading saved custom YouTube API key:', error);
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
          console.log('📜 Initial load: Found saved prompt text');
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
    personalData: 'pipeline-builder-personal-data',
    outputSelectorData: 'pipeline-builder-output-selector-data',
    selectedService: 'pipeline-builder-selected-service',
    customApiKey: 'pipeline-builder-custom-api-key',
    customYouTubeApiKey: 'pipeline-builder-custom-youtube-api-key',
    promptText: 'pipeline-builder-prompt-text',
  };

  // Save state to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      console.log('💾 Attempting to save state to localStorage...', {
        nodesCount: nodes.length,
        connectionsCount: connections.length,
        hasEvidenceData: !!evidenceData,
        hasStyleData: !!styleData,
        hasPersonalData: !!personalData,
        hasOutputSelectorData: !!outputSelectorData,
        selectedService,
        hasCustomApiKey: !!customApiKey,
        hasCustomYouTubeApiKey: !!customYouTubeApiKey,
        promptTextLength: promptText.length
      });
      
      const nodesWithPositions = nodes.map(node => ({
        ...node,
        position: node.position // Ensure positions are explicitly saved
      }));
      
      console.log('💾 About to save nodes:', nodesWithPositions.map(n => ({ id: n.id, type: n.type, position: n.position })));
      
      localStorage.setItem(STORAGE_KEYS.nodes, JSON.stringify(nodesWithPositions));
      
      // Verify what was actually saved
      const savedData = localStorage.getItem(STORAGE_KEYS.nodes);
      const parsedSaved = JSON.parse(savedData!);
      console.log('📍 Verified saved positions:', parsedSaved.map((n: any) => ({ id: n.id, position: n.position })));
      localStorage.setItem(STORAGE_KEYS.connections, JSON.stringify(connections));
      
      if (evidenceData) localStorage.setItem(STORAGE_KEYS.evidenceData, JSON.stringify(evidenceData));
      if (styleData) localStorage.setItem(STORAGE_KEYS.styleData, JSON.stringify(styleData));
      if (personalData) localStorage.setItem(STORAGE_KEYS.personalData, JSON.stringify(personalData));
      if (outputSelectorData) localStorage.setItem(STORAGE_KEYS.outputSelectorData, JSON.stringify(outputSelectorData));
      
      localStorage.setItem(STORAGE_KEYS.selectedService, selectedService);
      if (customApiKey) localStorage.setItem(STORAGE_KEYS.customApiKey, customApiKey);
      if (customYouTubeApiKey) localStorage.setItem(STORAGE_KEYS.customYouTubeApiKey, customYouTubeApiKey);
      localStorage.setItem(STORAGE_KEYS.promptText, promptText);
      
      setLastSaveTime(new Date());
      console.log('✅ State successfully saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save state to localStorage:', error);
    }
  }, [nodes, connections, evidenceData, styleData, personalData, outputSelectorData, selectedService, customApiKey, customYouTubeApiKey, promptText]);

  // Load state from localStorage
  const loadFromLocalStorage = useCallback(() => {
    try {
      console.log('🔍 Checking localStorage for saved data...');
      
      const savedNodes = localStorage.getItem(STORAGE_KEYS.nodes);
      const savedConnections = localStorage.getItem(STORAGE_KEYS.connections);
      const savedEvidenceData = localStorage.getItem(STORAGE_KEYS.evidenceData);
      const savedStyleData = localStorage.getItem(STORAGE_KEYS.styleData);
      const savedPersonalData = localStorage.getItem(STORAGE_KEYS.personalData);
      const savedOutputSelectorData = localStorage.getItem(STORAGE_KEYS.outputSelectorData);
      const savedSelectedService = localStorage.getItem(STORAGE_KEYS.selectedService);
      const savedCustomApiKey = localStorage.getItem(STORAGE_KEYS.customApiKey);
      const savedCustomYouTubeApiKey = localStorage.getItem(STORAGE_KEYS.customYouTubeApiKey);
      const savedPromptText = localStorage.getItem(STORAGE_KEYS.promptText);
      
      console.log('📊 localStorage contents check:', {
        hasNodes: !!savedNodes,
        hasConnections: !!savedConnections,
        hasEvidenceData: !!savedEvidenceData,
        hasStyleData: !!savedStyleData,
        hasPersonalData: !!savedPersonalData,
        hasOutputSelectorData: !!savedOutputSelectorData,
        hasSelectedService: !!savedSelectedService,
        hasCustomApiKey: !!savedCustomApiKey,
        hasCustomYouTubeApiKey: !!savedCustomYouTubeApiKey,
        hasPromptText: !!savedPromptText
      });

      if (savedNodes) {
        const parsedNodes = JSON.parse(savedNodes);
        setNodes(parsedNodes);
        console.log('📝 Restored nodes from localStorage:', parsedNodes.length, 'nodes');
      }
      
      if (savedConnections) {
        const parsedConnections = JSON.parse(savedConnections);
        setConnections(parsedConnections);
        console.log('🔗 Restored connections from localStorage:', parsedConnections.length, 'connections');
      }
      
      if (savedEvidenceData) {
        setEvidenceData(JSON.parse(savedEvidenceData));
        console.log('📊 Restored evidence data from localStorage');
      }
      
      if (savedStyleData) {
        setStyleData(JSON.parse(savedStyleData));
        console.log('🎨 Restored style data from localStorage');
      }
      
      if (savedPersonalData) {
        setPersonalData(JSON.parse(savedPersonalData));
        console.log('👨‍⚕️ Restored personal data from localStorage');
      }
      
      if (savedOutputSelectorData) {
        setOutputSelectorData(JSON.parse(savedOutputSelectorData));
        console.log('📺 Restored output selector data from localStorage');
      }
      
      if (savedSelectedService) {
        setSelectedService(savedSelectedService);
        console.log('⚙️ Restored selected service from localStorage:', savedSelectedService);
      }
      
      if (savedCustomApiKey) {
        setCustomApiKey(savedCustomApiKey);
        console.log('🔑 Restored custom API key from localStorage');
      }
      
      if (savedCustomYouTubeApiKey) {
        setCustomYouTubeApiKey(savedCustomYouTubeApiKey);
        console.log('📺 Restored custom YouTube API key from localStorage');
      }
      
      if (savedPromptText) {
        setPromptText(savedPromptText);
        console.log('📜 Restored prompt text from localStorage');
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
      console.log('🗑️ Cleared all pipeline state from localStorage');
    } catch (error) {
      console.error('❌ Failed to clear localStorage:', error);
    }
  }, []);

  // Auto-save state changes with shorter delay for frequent updates
  useEffect(() => {
    console.log('🔄 Auto-save triggered by state change');
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auto-save timer executing...');
      saveToLocalStorage();
    }, 300); // Shorter delay for more responsive saves
    
    return () => {
      console.log('❌ Auto-save timer cleared');
      clearTimeout(timeoutId);
    };
  }, [saveToLocalStorage]);

  // Debug: Log when component mounts to verify state loading
  useEffect(() => {
    console.log('🚀 PipelineBuilder mounted with state:', {
      nodesCount: nodes.length,
      connectionsCount: connections.length,
      hasEvidenceData: !!evidenceData,
      hasStyleData: !!styleData,
      hasPersonalData: !!personalData,
      hasOutputSelectorData: !!outputSelectorData,
      selectedService,
      hasCustomApiKey: !!customApiKey,
      hasCustomYouTubeApiKey: !!customYouTubeApiKey
    });
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Debug: Track when nodes state changes
  useEffect(() => {
    console.log('🔄 Pipeline Builder: Nodes state changed:', {
      count: nodes.length,
      positions: nodes.map(n => ({ id: n.id, type: n.type, position: n.position }))
    });
    console.log('💾 This should trigger auto-save...');
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
    console.log('🎯 PIPELINE BUILDER: useEffect triggered');
    console.log('Current connections in useEffect:', connections);
    console.log('Current nodes in useEffect:', nodes.map(n => ({ id: n.id, type: n.type })));
    
    setNodes(prevNodes => {
      const promptNode = prevNodes.find(n => n.type === 'prompt');
      if (!promptNode) return prevNodes;

      // Find connected component types - use prevNodes for consistency
      const connectedComponentTypes = connections
        .filter(conn => conn.target === promptNode.id)
        .map(conn => {
          // Look up source node from prevNodes (current state)
          const sourceNode = prevNodes.find(n => n.id === conn.source);
          return sourceNode?.type;
        })
        .filter(Boolean);

      // Also track connected components with their specific IDs
      const connectedComponentsWithIds = connections
        .filter(conn => conn.target === promptNode.id)
        .map(conn => {
          const sourceNode = prevNodes.find(n => n.id === conn.source);
          return sourceNode ? { id: sourceNode.id, type: sourceNode.type } : null;
        })
        .filter(Boolean) as Array<{id: string, type: string}>;

      console.log('📊 CALCULATED CONNECTIONS:');
      console.log('Connected component types:', connectedComponentTypes);
      console.log('Connected components with IDs:', connectedComponentsWithIds);


      // Only update if the connected components actually changed
      const currentConnectedComponents = promptNode.data.connectedComponents || [];
      const currentConnectedComponentsWithIds = promptNode.data.connectedComponentsWithIds || [];
      
      const typesChanged = JSON.stringify(currentConnectedComponents.sort()) !== JSON.stringify(connectedComponentTypes.sort());
      const idsChanged = JSON.stringify(currentConnectedComponentsWithIds) !== JSON.stringify(connectedComponentsWithIds);
      
      if (!typesChanged && !idsChanged) {
        return prevNodes; // No change needed
      }

      // Update the prompt node's connected components
      const updatedNodes = prevNodes.map(node =>
        node.type === 'prompt'
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                connectedComponents: connectedComponentTypes,
                connectedComponentsWithIds: connectedComponentsWithIds
              } 
            }
          : node
      );
      
      console.log('🚀 PIPELINE BUILDER: About to return updated nodes');
      console.log('Updated prompt node data:', updatedNodes.find(n => n.type === 'prompt')?.data);
      
      return updatedNodes;
    });
  }, [connections]);

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    setSelectedNodeForConfig(nodeId);
    switch (nodeType) {
      case 'evidence-input':
        setEvidenceModalOpen(true);
        break;
      case 'style-personalization':
        setStyleModalOpen(true);
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
    setLoadingModalOpen(true);
    setGenerationProgress(0);
    setGenerationStatus("Initializing...");

    const format = outputSelectorData?.selectedFormat || 'video';

    try {
      // Prepare the pipeline run data
      const runData = {
        pipelineId: null,
        outputFormat: format,
        evidenceData: evidenceData,
        styleData: styleData,
        personalData: personalData,
        status: 'pending'
      };

      setGenerationStatus("Starting content generation...");
      setGenerationProgress(10);

      // Create headers with custom API key if provided
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (customApiKey) {
        headers['x-gemini-api-key'] = customApiKey;
      }

      // Start generation process
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(runData)
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const run = await response.json();
      setGenerationProgress(30);
      setGenerationStatus("Processing pipeline components...");

      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/generate/${run.id}`);
          if (!statusResponse.ok) {
            throw new Error('Failed to check generation status');
          }

          const updatedRun = await statusResponse.json();

          if (updatedRun.status === 'processing') {
            setGenerationProgress(60);
            setGenerationStatus("Analyzing evidence and generating content...");
          } else if (updatedRun.status === 'completed') {
            clearInterval(pollInterval);
            setGenerationProgress(100);
            setGenerationStatus("Content generation completed!");

            setTimeout(() => {
              setLoadingModalOpen(false);
              setGenerationProgress(0);
              setGenerationStatus("Initializing...");

              // Trigger download if available
              if (updatedRun.downloadUrl) {
                window.open(updatedRun.downloadUrl, '_blank');
              }

              alert(`Content generation completed! Your ${format} is ready for download.`);
            }, 1000);
          } else if (updatedRun.status === 'failed') {
            clearInterval(pollInterval);
            throw new Error(updatedRun.errorMessage || 'Generation failed');
          }
        } catch (error) {
          clearInterval(pollInterval);
          throw error;
        }
      }, 2000);

    } catch (error) {
      console.error('Generation error:', error);
      setLoadingModalOpen(false);
      setGenerationProgress(0);
      setGenerationStatus("Initializing...");

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Generation failed: ${errorMessage}`);
    }
  };


  const isConnectedPipeline = (startNodeId: string, endNodeId: string): boolean => {
    // Simple path finding - check if there's a route from start to end
    const visited = new Set<string>();
    const queue = [startNodeId];

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;

      if (currentNodeId === endNodeId) {
        return true;
      }

      if (visited.has(currentNodeId)) {
        continue;
      }

      visited.add(currentNodeId);

      // Find all nodes this node connects to
      const outgoingConnections = connections.filter(conn => conn.source === currentNodeId);
      for (const conn of outgoingConnections) {
        if (!visited.has(conn.target)) {
          queue.push(conn.target);
        }
      }
    }

    return false;
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
        onNodesChange={(newNodes) => {
          console.log('💾 Pipeline Builder: onNodesChange called with:', newNodes.length, 'nodes');
          console.log('📍 New positions:', newNodes.map(n => ({ id: n.id, position: n.position })));
          console.log('📍 Current positions:', nodes.map(n => ({ id: n.id, position: n.position })));
          
          // Check if positions actually changed
          const positionsChanged = newNodes.some((newNode, index) => {
            const oldNode = nodes[index];
            return oldNode && (
              Math.abs(newNode.position.x - oldNode.position.x) > 0.1 ||
              Math.abs(newNode.position.y - oldNode.position.y) > 0.1
            );
          });
          
          console.log('📍 Positions actually changed:', positionsChanged);
          
          setNodes(newNodes);
        }}
        onConnectionsChange={setConnections}
        onNodeClick={handleNodeClick}
        onGenerate={handleGenerate}
        onSelectionChange={setSelectedComponentType}
        onHoverChange={(type) => {
          console.log(`📋 Pipeline builder hover change: "${type}"`);
          setHoveredComponentType(type);
        }}
        evidenceData={evidenceData}
        styleData={styleData}
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
        onDataUpdate={(data) => {
          setEvidenceData(data);
          if (selectedNodeForConfig) {
            setNodes(prev => prev.map(node =>
              node.id === selectedNodeForConfig
                ? { ...node, data: { ...node.data, configured: true } }
                : node
            ));
          }
        }}
      />

      <StylePersonalizationModal
        open={styleModalOpen}
        onOpenChange={setStyleModalOpen}
        customApiKey={customApiKey}
        customYouTubeApiKey={customYouTubeApiKey}
        onDataUpdate={(data) => {
          setStyleData(data);
          if (selectedNodeForConfig) {
            setNodes(prev => prev.map(node =>
              node.id === selectedNodeForConfig
                ? { ...node, data: { ...node.data, configured: true } }
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
                ? { ...node, data: { ...node.data, configured: true } }
                : node
            ));
          }
        }}
      />

      <OutputSelectorModal
        open={outputSelectorModalOpen}
        onOpenChange={setOutputSelectorModalOpen}
        onDataUpdate={(data) => {
          setOutputSelectorData(data);
          if (selectedNodeForConfig) {
            setNodes(prev => prev.map(node =>
              node.id === selectedNodeForConfig
                ? { ...node, data: { ...node.data, configured: true } }
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
        onYouTubeApiKeyUpdate={setCustomYouTubeApiKey}
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
          setPersonalData(null);
          setOutputSelectorData(null);
          setSelectedService('gemini');
          setCustomApiKey(null);
          setCustomYouTubeApiKey(null);
          setPromptText('You are a health content generation assistant with access to MCP tools.\n\nConnect components to access their data through the MCP protocol.');
          setLastSaveTime(null);
          console.log('✨ Pipeline reset to initial state');
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
