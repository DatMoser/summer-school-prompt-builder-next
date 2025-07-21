import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowInstance,
  EdgeChange,
  NodeChange,
  IsValidConnection,
  OnConnect,
  MiniMap,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PipelineNode, PipelineConnection } from '@/lib/pipeline-types';
import { EvidenceInputNode, StylePersonalizationNode, VisualStylingNode, PersonalDataNode, OutputSelectorNode } from './custom-nodes';
import { PromptNode } from './prompt-node';
import CustomEdge from './custom-edge';

interface CanvasWorkspaceProps {
  nodes: PipelineNode[];
  connections: PipelineConnection[];
  onNodesChange: (nodes: PipelineNode[]) => void;
  onConnectionsChange: (connections: PipelineConnection[]) => void;
  onNodeClick: (nodeId: string, nodeType: string) => void;
  onGenerate: () => void;
  onSelectionChange?: (selectedType: string | null) => void;
  onHoverChange?: (hoveredType: string | null) => void;
  // Configuration data for display
  evidenceData?: any;
  styleData?: any;
  visualStylingData?: any;
  personalData?: any;
  outputSelectorData?: any;
  // Prompt handling
  promptText?: string;
  onPromptChange?: (prompt: string) => void;
  selectedComponentType?: string | null;
  // State clearing callbacks for component deletion
  onClearEvidenceData?: () => void;
  onClearStyleData?: () => void;
  onClearVisualStylingData?: () => void;
  onClearPersonalData?: () => void;
  onClearOutputSelectorData?: () => void;
}

function CanvasWorkspaceContent({
  nodes,
  connections,
  onNodesChange,
  onConnectionsChange,
  onNodeClick,
  onGenerate,
  onSelectionChange,
  onHoverChange,
  evidenceData,
  styleData,
  visualStylingData,
  personalData,
  outputSelectorData,
  promptText,
  onPromptChange,
  selectedComponentType,
  onClearEvidenceData,
  onClearStyleData,
  onClearVisualStylingData,
  onClearPersonalData,
  onClearOutputSelectorData,
}: CanvasWorkspaceProps) {

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowNodes, setReactFlowNodes, onNodesChangeRF] = useNodesState([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChangeRF] = useEdgesState([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const isDragging = useRef<boolean>(false);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);
  const justUpdatedPositions = useRef<boolean>(false);
  const pendingPositionUpdate = useRef<boolean>(false);
  const currentNodes = useRef<PipelineNode[]>(nodes);
  const [pendingPositionChanges, setPendingPositionChanges] = useState<NodeChange[]>([]);
  const isInitialLoad = useRef<boolean>(true);

  // Update currentNodes ref whenever nodes change
  useEffect(() => {
    currentNodes.current = nodes;
  }, [nodes]);

  // Auto-update configured status when data changes
  useEffect(() => {
    const getConfiguredStatus = (nodeType: string) => {
      switch (nodeType) {
        case 'evidence-input':
          return evidenceData !== null && evidenceData !== undefined && 
                 evidenceData.fileContent && evidenceData.fileContent.trim().length > 0;
        case 'style-personalization':
          return styleData !== null && styleData !== undefined;
        case 'visual-styling':
          return visualStylingData !== null && visualStylingData !== undefined;
        case 'personal-data':
          return personalData !== null && personalData !== undefined;
        case 'output-selector':
          return outputSelectorData !== null && outputSelectorData !== undefined;
        default:
          return false;
      }
    };

    // Update nodes with current configuration status
    const updatedNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        configured: getConfiguredStatus(node.type)
      }
    }));

    // Only update if something actually changed
    const hasChanges = updatedNodes.some((node, index) => 
      node.data.configured !== nodes[index].data.configured
    );

    if (hasChanges) {
      onNodesChange(updatedNodes);
    }
  }, [evidenceData, styleData, visualStylingData, personalData, outputSelectorData, nodes, onNodesChange]);

  // Process pending position changes after a delay
  useEffect(() => {
    if (pendingPositionChanges.length === 0) return;


    const timeoutId = setTimeout(() => {
      // Get current ReactFlow positions directly
      setReactFlowNodes(currentRFNodes => {
        // Get the most current nodes and apply changes from ReactFlow positions
        const updatedNodes = currentNodes.current.map(node => {
          const rfNode = currentRFNodes.find(rf => rf.id === node.id);
          if (rfNode) {
            return { ...node, position: rfNode.position };
          }
          return node;
        });

        justUpdatedPositions.current = true;
        setPendingPositionChanges([]); // Clear pending changes

        // Defer the state update to avoid setState during render
        setTimeout(() => {
          onNodesChange(updatedNodes);
        }, 0);

        // Clear the pending flag after update
        setTimeout(() => {
          pendingPositionUpdate.current = false;
        }, 100);

        return currentRFNodes; // Don't modify ReactFlow state
      });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [pendingPositionChanges, onNodesChange]);

  // Memoized node and edge types to prevent ReactFlow warnings
  const nodeTypes = useMemo(() => ({
    'evidence-input': EvidenceInputNode,
    'style-personalization': StylePersonalizationNode,
    'visual-styling': VisualStylingNode,
    'personal-data': PersonalDataNode,
    'output-selector': OutputSelectorNode,
    'prompt': PromptNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  // Handle node deletion
  const handleNodeDelete = useCallback((nodeId: string) => {
    // Find the node to get its type before deletion
    const nodeToDelete = nodes.find(node => node.id === nodeId);
    
    // Clear localStorage data and React state for the deleted component
    if (nodeToDelete) {
      const componentTypeToStorageKey: Record<string, string> = {
        'evidence-input': 'pipeline-builder-evidence-data',
        'style-personalization': 'pipeline-builder-style-data',
        'visual-styling': 'pipeline-builder-visual-styling-data',
        'personal-data': 'pipeline-builder-personal-data',
        'output-selector': 'pipeline-builder-output-selector-data',
      };
      
      const componentTypeToStateClearer: Record<string, (() => void) | undefined> = {
        'evidence-input': onClearEvidenceData,
        'style-personalization': onClearStyleData,
        'visual-styling': onClearVisualStylingData,
        'personal-data': onClearPersonalData,
        'output-selector': onClearOutputSelectorData,
      };
      
      // Clear localStorage
      const storageKey = componentTypeToStorageKey[nodeToDelete.type];
      if (storageKey && typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
      
      // Clear React state
      const stateClearer = componentTypeToStateClearer[nodeToDelete.type];
      if (stateClearer) {
        stateClearer();
      }
    }

    // Remove the node first
    const updatedNodes = nodes.filter(node => node.id !== nodeId);

    // Then remove any connections involving this node
    const updatedConnections = connections.filter(conn =>
      conn.source !== nodeId && conn.target !== nodeId
    );

    // IMMEDIATE PROMPT UPDATE: Update the prompt node's connected components right away
    const finalNodes = updatedNodes.map(node => {
      if (node.type === 'prompt') {
        // Calculate new connected components based on remaining connections
        const remainingConnections = updatedConnections.filter(conn => conn.target === node.id);
        const connectedComponentTypes = remainingConnections
          .map(conn => {
            const sourceNode = updatedNodes.find(n => n.id === conn.source);
            return sourceNode ? sourceNode.type : null;
          })
          .filter((type): type is PipelineNode['type'] => type !== null);

        const connectedComponentsWithIds = remainingConnections
          .map(conn => {
            const sourceNode = updatedNodes.find(n => n.id === conn.source);
            return sourceNode ? { id: sourceNode.id, type: sourceNode.type } : null;
          })
          .filter((item): item is { id: string, type: PipelineNode['type'] } => item !== null);

        return {
          ...node,
          data: {
            ...node.data,
            connectedComponents: connectedComponentTypes,
            connectedComponentsWithIds: connectedComponentsWithIds,
            // Force re-render by updating timestamp and marking as immediate update
            _updateTimestamp: Date.now(),
            _immediateUpdate: true,
            _deletedNodeId: nodeId
          }
        };
      }
      return node;
    });

    // Set flag to prevent sync interference
    justUpdatedPositions.current = true;

    // ALSO directly update ReactFlow nodes to ensure immediate removal
    setReactFlowNodes(current => {
      const filtered = current.filter(node => node.id !== nodeId);
      return filtered;
    });

    // Update both nodes and connections simultaneously
    onNodesChange(finalNodes);
    onConnectionsChange(updatedConnections);
  }, [nodes, connections, onNodesChange, onConnectionsChange, setReactFlowNodes]);

  // Handle edge deletion - directly update both states to avoid sync issues
  const handleEdgeDelete = useCallback((edgeId: string) => {
    // Update our connections state first
    const updatedConnections = connections.filter(conn => conn.id !== edgeId);
    onConnectionsChange(updatedConnections);

    // Then update ReactFlow's edge state
    onEdgesChangeRF([{ id: edgeId, type: 'remove' }]);
  }, [connections, onConnectionsChange, onEdgesChangeRF]);

  // Generate configuration content for display
  const getConfigContent = useCallback((nodeType: string, configured: boolean) => {
    if (!configured) return undefined;

    switch (nodeType) {
      case 'evidence-input':
        return evidenceData ? {
          primary: `File: ${evidenceData.fileName}`,
          secondary: evidenceData.summary ? `${evidenceData.summary.substring(0, 50)}...` : 'Evidence guidelines loaded'
        } : undefined;
      case 'style-personalization':
        return styleData ? {
          primary: `Tone: ${styleData.tone}`,
          secondary: `Target: ${styleData.targetAudience}${styleData.keyPhrases?.length ? ` • ${styleData.keyPhrases.length} phrases` : ''}`
        } : undefined;
      case 'visual-styling':
        return visualStylingData ? {
          primary: visualStylingData.videoStyle ? `Video: ${visualStylingData.videoStyle.visualTheme}` : 
                   visualStylingData.podcastThumbnail ? `Thumbnail: ${visualStylingData.podcastThumbnail.designTheme}` : 'Visual styling configured',
          secondary: visualStylingData.healthFocus ? `Focus: ${visualStylingData.healthFocus}` : 'Custom styling'
        } : undefined;
      case 'personal-data':
        return personalData ? {
          primary: `${personalData.age}yr ${personalData.biologicalSex} • ${personalData.averageDailySteps} steps/day`,
          secondary: `Goals: ${personalData.fitnessGoals}${personalData.restingHeartRate ? ` • RHR: ${personalData.restingHeartRate}` : ''}`
        } : undefined;
      case 'output-selector':
        return outputSelectorData ? {
          primary: `Format: ${outputSelectorData.selectedFormat.charAt(0).toUpperCase() + outputSelectorData.selectedFormat.slice(1)}`,
          secondary: outputSelectorData.selectedFormat === 'video' ? 'Personalized video with voiceover' : 'Personalized audio content'
        } : undefined;
      default:
        return undefined;
    }
  }, [evidenceData, styleData, personalData, outputSelectorData]);

  // Convert our pipeline nodes to ReactFlow nodes - REMOVING useCallback to force fresh data
  const convertToReactFlowNodes = (pipelineNodes: PipelineNode[]): Node[] => {
    return pipelineNodes.map(node => {
      // Find the active connection for this node (if any)
      const activeConnection = connections.find(conn => conn.source === node.id);

      const baseData = {
        ...node.data,
        configContent: getConfigContent(node.type, node.data.configured),
        onConfigure: () => onNodeClick(node.id, node.type),
        // Only allow deletion if the node is not connected to AI Prompt Builder
        onDelete: !activeConnection ? () => handleNodeDelete(node.id) : undefined,
        connected: !!activeConnection,
        activeHandle: activeConnection?.sourceHandle,
        onHover: (hovering: boolean) => {
          if (onHoverChange) {
            onHoverChange(hovering ? node.type : null);
          }
        },
      };

      // Special handling for prompt nodes
      if (node.type === 'prompt') {
        // Create a connection-based key for forcing re-renders
        const connectionIds = (node.data.connectedComponentsWithIds || []).map(c => c.id).sort().join(',');

        // Include immediate update flags in the key to force re-mount on deletion
        const immediateUpdateKey = node.data._immediateUpdate ? `immediate-${node.data._updateTimestamp}` : '';
        const deletedNodeKey = node.data._deletedNodeId ? `deleted-${node.data._deletedNodeId}` : '';

        // Create a more aggressive render key for the entire prompt node
        const promptNodeKey = `prompt-${node.id}-${connectionIds}-${immediateUpdateKey}-${deletedNodeKey}-${node.data._updateTimestamp || 0}`;

        return {
          id: node.id,
          type: node.type,
          position: node.position,
          // FORCE COMPLETE RE-MOUNT by changing the key - especially on deletions
          key: promptNodeKey,
          data: {
            ...baseData,
            prompt: promptText || node.data.prompt || '',
            connectedComponents: node.data.connectedComponents || [],
            connectedComponentsWithIds: node.data.connectedComponentsWithIds || [],
            onPromptChange: onPromptChange || (() => { }),
            onGenerate: onGenerate,
            customText: node.data.customText || '',
            selectedComponentType: selectedComponentType,
            // Add a unique key to force React to see this as a new object when connections change
            _renderKey: `${Date.now()}-${(node.data.connectedComponentsWithIds || []).length}`,
            // Add a timestamp that forces re-render when connections change
            _updateTimestamp: node.data._updateTimestamp || Date.now(),
            // Add connection-based key to ensure React detects changes
            _connectionKey: connectionIds,
            // Add prompt node key for debugging
            _promptNodeKey: promptNodeKey,
            // Pass through immediate update flags to force re-render
            _immediateUpdate: node.data._immediateUpdate,
            _deletedNodeId: node.data._deletedNodeId,
            // Force new object reference on immediate updates
            ...(node.data._immediateUpdate ? { _forceUpdate: Date.now() } : {}),
            onCustomTextChange: (text: string) => {
              // Update the node's custom text in the pipeline state
              const updatedNodes = nodes.map(n =>
                n.id === node.id
                  ? { ...n, data: { ...n.data, customText: text } }
                  : n
              );
              onNodesChange(updatedNodes);
            },
            // Pass the actual data for real-time prompt generation
            evidenceData,
            styleData,
            visualStylingData,
            personalData,
            outputSelectorData,
          },
        };
      }

      return {
        id: node.id,
        type: node.type,
        position: node.position,
        data: baseData,
      };
    });
  };

  // Convert connections to ReactFlow edges
  const convertToReactFlowEdges = useCallback((pipelineConnections: PipelineConnection[]): Edge[] => {
    return pipelineConnections.map(conn => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      sourceHandle: conn.sourceHandle,
      targetHandle: conn.targetHandle,
      type: 'custom',
      deletable: true,
      data: {
        onDelete: handleEdgeDelete,
      },
    }));
  }, [handleEdgeDelete]);

  // Sync ReactFlow nodes with pipeline nodes (but preserve positions from ReactFlow)
  useEffect(() => {
    // Don't sync nodes while dragging to prevent interference
    if (isDragging.current) {
      return;
    }

    // Don't sync if we just updated positions to prevent position reset
    if (justUpdatedPositions.current) {
      justUpdatedPositions.current = false;
      return;
    }

    // Don't sync if we have a pending position update
    if (pendingPositionUpdate.current) {
      return;
    }

    const rfNodes = convertToReactFlowNodes(nodes);

    setReactFlowNodes(current => {
      // If we just updated positions (including deletions), use fresh pipeline data
      if (justUpdatedPositions.current) {
        justUpdatedPositions.current = false; // Reset flag

        // Mark initial load as complete if needed
        if (isInitialLoad.current) {
          isInitialLoad.current = false;
        }

        return rfNodes; // Use fresh pipeline nodes directly - this handles deletions correctly
      }

      // Check if nodes were deleted (pipeline has fewer nodes than ReactFlow)
      const pipelineNodeIds = new Set(rfNodes.map(n => n.id));
      const reactFlowNodeIds = new Set(current.map(n => n.id));
      const deletedNodes = Array.from(reactFlowNodeIds).filter(id => !pipelineNodeIds.has(id));

      if (deletedNodes.length > 0) {
        // Use fresh pipeline data when nodes are deleted
        return rfNodes;
      }

      // Check if prompt node data changed (for connection updates)
      const currentPromptNode = current.find(n => n.type === 'prompt');
      const newPromptNode = rfNodes.find(n => n.type === 'prompt');

      if (currentPromptNode && newPromptNode) {
        const currentConnections = currentPromptNode.data.connectedComponentsWithIds || [];
        const newConnections = newPromptNode.data.connectedComponentsWithIds || [];
        const hasImmediateUpdate = newPromptNode.data._immediateUpdate;

        console.log('🔍 ReactFlow prompt sync check:', {
          currentConnections: currentConnections.map((c: any) => c.id),
          newConnections: newConnections.map((c: any) => c.id),
          hasImmediateUpdate,
          forceUpdate: hasImmediateUpdate || JSON.stringify(currentConnections) !== JSON.stringify(newConnections)
        });

        if (hasImmediateUpdate || JSON.stringify(currentConnections) !== JSON.stringify(newConnections)) {
          // Force update when prompt connections change or immediate update
          console.log('🔄 FORCING ReactFlow prompt node update');
          return rfNodes;
        }
      }

      // Otherwise preserve ReactFlow state while allowing pipeline updates
      const updatedNodes = rfNodes.map(newNode => {
        const existingNode = current.find(n => n.id === newNode.id);
        if (existingNode) {
          // Use pipeline positions only on initial load
          const shouldUsePipelinePosition = isInitialLoad.current;
          const finalPosition = shouldUsePipelinePosition ? newNode.position : existingNode.position;

          // Force new object reference for React to detect changes, especially for prompt nodes
          return {
            ...newNode,
            position: finalPosition,
            selected: existingNode.selected,
            dragging: existingNode.dragging,
            // Force new data reference to trigger re-render
            data: { ...newNode.data }
          };
        }
        return newNode;
      });

      // Mark initial load as complete after first sync
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }

      return updatedNodes;
    });
  }, [nodes, selectedComponentType, connections]);

  // Sync ReactFlow edges with pipeline connections
  useEffect(() => {
    const rfEdges = convertToReactFlowEdges(connections);
    setReactFlowEdges(rfEdges);
  }, [connections, convertToReactFlowEdges, setReactFlowEdges]);

  // Handle node position changes
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChangeRF(changes);

    // Track dragging state
    const dragChanges = changes.filter(change => change.type === 'position');
    if (dragChanges.length > 0) {
      const anyDragging = dragChanges.some(change => change.dragging === true);
      isDragging.current = anyDragging;
    }

    // Track selected nodes for highlighting
    const selectChanges = changes.filter(change => change.type === 'select');
    selectChanges.forEach(change => {
      if ('id' in change) {
        if (change.selected) {
          // Find the node and get its type
          const node = nodes.find(n => n.id === change.id);
          if (node && node.type !== 'prompt') {
            // Pass the selected component type to parent
            onSelectionChange?.(node.type);
          }
        } else {
          // Node was deselected
          onSelectionChange?.(null);
        }
      }
    });

    // Update positions in our pipeline nodes, but only for non-dragging position changes
    const positionChanges = changes.filter(change =>
      change.type === 'position' &&
      change.dragging === false // Only update when drag is complete
    );

    if (positionChanges.length > 0) {
      // Set pending flag to prevent sync interference
      pendingPositionUpdate.current = true;

      // Store the position changes in state to trigger useEffect
      setPendingPositionChanges(positionChanges);
    }
  }, [onNodesChangeRF, nodes, onNodesChange, onSelectionChange]);

  // Handle edge changes (including deletions)
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // First update ReactFlow's internal state
    onEdgesChangeRF(changes);

    // Handle edge deletions - but only for user-initiated deletions (not manual ones)
    const removedEdges = changes.filter(change => change.type === 'remove');
    if (removedEdges.length > 0) {
      // Check if these edges still exist in our connections (they shouldn't if manually deleted)
      const edgesToRemove = removedEdges.filter(change =>
        connections.some(conn => conn.id === change.id)
      );

      if (edgesToRemove.length > 0) {
        const updatedConnections = connections.filter(conn =>
          !edgesToRemove.some(change => change.id === conn.id)
        );

        onConnectionsChange(updatedConnections);
      }
    }
  }, [onEdgesChangeRF, connections, onConnectionsChange]);

  // Connection validation - only allow connections TO the prompt node
  const isValidConnection: IsValidConnection = useCallback((connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) return false;

    // Don't allow self-connections
    if (connection.source === connection.target) return false;

    // Only allow connections TO the prompt node (not from it)
    if (targetNode.type !== 'prompt') return false;

    // Don't allow connections FROM the prompt node
    if (sourceNode.type === 'prompt') return false;

    // Prevent duplicate connections - check current ReactFlow edges state instead of connections
    // This ensures we check the most up-to-date state
    const connectionExists = reactFlowEdges.some(edge =>
      edge.source === connection.source && edge.target === connection.target
    );
    if (connectionExists) return false;

    return true;
  }, [reactFlowEdges, nodes]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) return;

      const newConnection: PipelineConnection = {
        id: `${params.source}-${params.target}-${params.sourceHandle || 'default'}-${params.targetHandle || 'default'}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle || 'default',
        targetHandle: params.targetHandle || 'input',
      };

      onConnectionsChange([...connections, newConnection]);
    },
    [connections, onConnectionsChange, isValidConnection]
  );

  // Node title/description helpers
  const getNodeTitle = (nodeType: string) => {
    const titles = {
      'evidence-input': 'Evidence-Based Input',
      'style-personalization': 'Conversational Style',
      'visual-styling': 'Visual Styling',
      'personal-data': 'Personal Health Profile',
      'output-selector': 'Output Format',
      'prompt': 'AI Prompt',
    };
    return titles[nodeType as keyof typeof titles] || 'Unknown';
  };

  const getNodeDescription = (nodeType: string) => {
    const descriptions = {
      'evidence-input': 'Upload evidence documents',
      'style-personalization': 'Configure speaking style',
      'visual-styling': 'Design visual appearance',
      'personal-data': 'Personal health data',
      'output-selector': 'Select output format',
      'prompt': 'Build and edit AI prompt',
    };
    return descriptions[nodeType as keyof typeof descriptions] || 'Unknown';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type || !reactFlowInstance.current) {
        return;
      }

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Check if there's already stored data for this component type
      const getInitialConfiguredStatus = (nodeType: string) => {
        switch (nodeType) {
          case 'evidence-input':
            return evidenceData !== null && evidenceData !== undefined && 
                   evidenceData.fileContent && evidenceData.fileContent.trim().length > 0;
          case 'style-personalization':
            return styleData !== null && styleData !== undefined;
          case 'visual-styling':
            return visualStylingData !== null && visualStylingData !== undefined;
          case 'personal-data':
            return personalData !== null && personalData !== undefined;
          case 'output-selector':
            return outputSelectorData !== null && outputSelectorData !== undefined;
          default:
            return false;
        }
      };

      const newNode: PipelineNode = {
        id: `${type}-${Date.now()}`,
        type: type as any,
        position,
        data: {
          configured: getInitialConfiguredStatus(type),
          title: getNodeTitle(type),
          description: getNodeDescription(type),
        },
      };

      onNodesChange([...nodes, newNode]);
    },
    [reactFlowInstance, nodes, onNodesChange]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  // Handle keyboard shortcuts for deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent any keyboard interference if user is typing in an input field or modal
      const target = event.target as Element;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        (target as HTMLElement).contentEditable === 'true' ||
        target.closest('[role="dialog"]') ||
        target.closest('.modal') ||
        target.closest('[data-radix-modal]') ||
        target.closest('[data-radix-dialog-content]') ||
        target.closest('dialog') ||
        target.closest('[class*="dialog"]') ||
        target.closest('[class*="modal"]')
      ) {
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Get selected nodes and edges
        const selectedNodes = reactFlowNodes.filter(node => node.selected);
        const selectedEdges = reactFlowEdges.filter(edge => edge.selected);

        // Delete selected nodes (only if they're not connected)
        selectedNodes.forEach(node => {
          // Check if this node is connected to AI Prompt Builder
          const isConnected = connections.some(conn => conn.source === node.id);
          if (!isConnected) {
            handleNodeDelete(node.id);
          }
        });

        // Delete selected edges
        selectedEdges.forEach(edge => {
          handleEdgeDelete(edge.id);
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Cleanup timeout on unmount
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
        pendingPositionUpdate.current = false;
      }
    };
  }, [reactFlowNodes, reactFlowEdges, handleNodeDelete, handleEdgeDelete]);

  return (
    <div className="flex-1 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnection}
        deleteKeyCode={null} // Disable default delete behavior
        className="bg-gray-900"
        fitView
        fitViewOptions={{ padding: 0.5 }}
      >
        <Controls
          className="!bg-gray-800 !border-gray-600 !text-white [&>button]:!bg-gray-700 [&>button]:!border-gray-600 [&>button]:!text-white [&>button:hover]:!bg-gray-600"
        />
        <MiniMap
          className="!bg-gray-800 !border-gray-600"
          maskColor="rgba(0, 0, 0, 0.8)"
          pannable
          zoomable
          nodeColor={(node) => {
            const colors = {
              'evidence-input': '#10b981',
              'style-personalization': '#eab308',
              'visual-styling': '#ec4899',
              'personal-data': '#3b82f6',
              'output-selector': '#f97316',
              'prompt': '#9333ea',
            };
            return colors[node.type as keyof typeof colors] || '#6b7280';
          }}
        />
        <Background color="#374151" gap={16} />
      </ReactFlow>
    </div>
  );
}

export default function CanvasWorkspace(props: CanvasWorkspaceProps) {
  return (
    <ReactFlowProvider>
      <CanvasWorkspaceContent {...props} />
    </ReactFlowProvider>
  );
}