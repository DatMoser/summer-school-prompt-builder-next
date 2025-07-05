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
  const [nodes, setNodes] = useState<PipelineNode[]>([
    // Start with a prompt node in the center
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
  ]);
  const [connections, setConnections] = useState<PipelineConnection[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal states
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [personalDataModalOpen, setPersonalDataModalOpen] = useState(false);
  const [outputSelectorModalOpen, setOutputSelectorModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);

  // Data states
  const [evidenceData, setEvidenceData] = useState<EvidenceData | null>(null);
  const [styleData, setStyleData] = useState<StyleData | null>(null);
  const [personalData, setPersonalData] = useState<PersonalHealthData | null>(null);
  const [outputSelectorData, setOutputSelectorData] = useState<OutputSelectorData | null>(null);
  const [selectedService, setSelectedService] = useState<string>('gemini');
  const [customApiKey, setCustomApiKey] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");

  const [selectedNodeForConfig, setSelectedNodeForConfig] = useState<string | null>(null);
  const [selectedComponentType, setSelectedComponentType] = useState<string | null>(null);
  const [hoveredComponentType, setHoveredComponentType] = useState<string | null>(null);

  // Prompt state - simplified since visual is now handled by components
  const [promptText, setPromptText] = useState<string>('You are a health content generation assistant with access to MCP tools.\n\nConnect components to access their data through the MCP protocol.');

  // Cleanup uploaded files when component unmounts or page is closed
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
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
      // Also try to cleanup when component unmounts
      fetch('/api/cleanup', { method: 'POST' }).catch(console.error);
    };
  }, []);

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
      <div className="absolute top-4 right-4 z-50">
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
      />

      <LoadingModal
        open={loadingModalOpen}
        progress={generationProgress}
        status={generationStatus}
      />
    </div>
  );
}
