import React, { useCallback, useRef, useEffect, useMemo } from 'react';
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
import { EvidenceInputNode, StylePersonalizationNode, PersonalDataNode, OutputSelectorNode } from './custom-nodes';
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
  personalData?: any;
  outputSelectorData?: any;
  // Prompt handling
  promptText?: string;
  onPromptChange?: (prompt: string) => void;
  selectedComponentType?: string | null;
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
  personalData,
  outputSelectorData,
  promptText,
  onPromptChange,
  selectedComponentType,
}: CanvasWorkspaceProps) {
  
  // Remove excessive logging - only log when connections change
  // console.log('📦 CANVAS WORKSPACE RECEIVED PROPS');
  // console.log('Nodes:', nodes);
  // console.log('Connections:', connections);
  // console.log('Prompt node data:', nodes.find(n => n.type === 'prompt')?.data);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowNodes, setReactFlowNodes, onNodesChangeRF] = useNodesState([]);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChangeRF] = useEdgesState([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const isDragging = useRef<boolean>(false);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);

  // Memoized node and edge types to prevent ReactFlow warnings
  const nodeTypes = useMemo(() => ({
    'evidence-input': EvidenceInputNode,
    'style-personalization': StylePersonalizationNode,
    'personal-data': PersonalDataNode,
    'output-selector': OutputSelectorNode,
    'prompt': PromptNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    custom: CustomEdge,
  }), []);

  // Handle node deletion
  const handleNodeDelete = useCallback((nodeId: string) => {
    // Remove any connections involving this node FIRST
    const updatedConnections = connections.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    );
    onConnectionsChange(updatedConnections);
    
    // Then remove the node
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    onNodesChange(updatedNodes);
  }, [nodes, connections, onNodesChange, onConnectionsChange]);

  // Handle edge deletion - directly update both states to avoid sync issues
  const handleEdgeDelete = useCallback((edgeId: string) => {
    console.log('🗑️ MANUAL EDGE DELETE called for:', edgeId);
    
    // Update our connections state first
    const updatedConnections = connections.filter(conn => conn.id !== edgeId);
    console.log('Updated connections (manual delete):', updatedConnections);
    onConnectionsChange(updatedConnections);
    
    // Then update ReactFlow's edge state
    onEdgesChangeRF([{ id: edgeId, type: 'remove' }]);
  }, [connections, onConnectionsChange, onEdgesChangeRF]);

  // Generate configuration content for display
  const getConfigContent = useCallback((nodeType: string, configured: boolean) => {
    if (!configured) return undefined;
    
    switch (nodeType) {
      case 'evidence-input':
        return evidenceData ? `File: ${evidenceData.fileName}` : undefined;
      case 'style-personalization':
        return styleData ? `YouTube: ${styleData.youtubeUrl.split('v=')[1]?.substring(0, 8) || 'Configured'}` : undefined;
      case 'personal-data':
        return personalData ? `Steps: ${personalData.averageDailySteps}, HR: ${personalData.averageHeartRate}` : undefined;
      case 'output-selector':
        return outputSelectorData ? `Format: ${outputSelectorData.selectedFormat}` : undefined;
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
        onDelete: () => handleNodeDelete(node.id),
        connected: !!activeConnection,
        activeHandle: activeConnection?.sourceHandle,
        onHover: (hovering: boolean) => {
          console.log(`🔄 Canvas onHover: nodeType="${node.type}", hovering=${hovering}`);
          if (onHoverChange) {
            onHoverChange(hovering ? node.type : null);
          }
        },
      };

      // Special handling for prompt nodes
      if (node.type === 'prompt') {
        console.log('🔧 CONVERTING PROMPT NODE DATA');
        console.log('Node data.connectedComponentsWithIds:', node.data.connectedComponentsWithIds);
        console.log('Node data.connectedComponents:', node.data.connectedComponents);
        
        return {
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            ...baseData,
            prompt: promptText || node.data.prompt || '',
            connectedComponents: node.data.connectedComponents || [],
            connectedComponentsWithIds: node.data.connectedComponentsWithIds || [],
            onPromptChange: onPromptChange || (() => {}),
            onGenerate: onGenerate,
            customText: node.data.customText || '',
            selectedComponentType: selectedComponentType,
            onCustomTextChange: (text: string) => {
              // Update the node's custom text in the pipeline state
              const updatedNodes = nodes.map(n => 
                n.id === node.id 
                  ? { ...n, data: { ...n.data, customText: text } }
                  : n
              );
              onNodesChange(updatedNodes);
            },
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
    if (isDragging.current) return;
    
    // Only log when nodes actually change structure or selectedComponentType changes
    const promptNode = nodes.find(n => n.type === 'prompt');
    const connectionCount = promptNode?.data.connectedComponentsWithIds?.length || 0;
    console.log(`🔄 SYNCING REACTFLOW NODES - ${connectionCount} connections, selectedComponentType: ${selectedComponentType}`);
    
    const rfNodes = convertToReactFlowNodes(nodes);
    
    setReactFlowNodes(current => {
      // Preserve positions and other ReactFlow-specific state from current ReactFlow nodes
      const updatedNodes = rfNodes.map(newNode => {
        const existingNode = current.find(n => n.id === newNode.id);
        if (existingNode) {
          // Preserve position, selected state, and other ReactFlow state but update data
          return { 
            ...newNode, 
            position: existingNode.position,
            selected: existingNode.selected,
            dragging: existingNode.dragging
          };
        }
        return newNode;
      });
      
      return updatedNodes;
    });
  }, [nodes, selectedComponentType]);

  // Sync ReactFlow edges with pipeline connections
  useEffect(() => {
    console.log(`🔄 SYNCING REACTFLOW EDGES - ${connections.length} connections`);
    
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
      // Clear any pending updates
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
      }
      
      // Debounce the position update to prevent excessive re-renders
      updateTimeout.current = setTimeout(() => {
        const updatedNodes = nodes.map(node => {
          const positionChange = positionChanges.find(change => 'id' in change && change.id === node.id);
          if (positionChange && positionChange.type === 'position' && positionChange.position) {
            return { ...node, position: positionChange.position };
          }
          return node;
        });
        onNodesChange(updatedNodes);
      }, 16); // ~60fps update rate
    }
  }, [onNodesChangeRF, nodes, onNodesChange, onSelectionChange]);

  // Handle edge changes (including deletions)
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    console.log('🔄 EDGE CHANGES DETECTED:', changes);
    
    // First update ReactFlow's internal state
    onEdgesChangeRF(changes);
    
    // Handle edge deletions - but only for user-initiated deletions (not manual ones)
    const removedEdges = changes.filter(change => change.type === 'remove');
    if (removedEdges.length > 0) {
      console.log('🔥 REACTFLOW EDGE DELETION DETECTED');
      console.log('Trying to remove edge IDs:', removedEdges.map(e => e.id));
      console.log('Current connection IDs:', connections.map(c => c.id));
      
      // Check if these edges still exist in our connections (they shouldn't if manually deleted)
      const edgesToRemove = removedEdges.filter(change => 
        connections.some(conn => conn.id === change.id)
      );
      
      if (edgesToRemove.length > 0) {
        console.log('Found matching connections to remove:', edgesToRemove.map(e => e.id));
        const updatedConnections = connections.filter(conn => 
          !edgesToRemove.some(change => change.id === conn.id)
        );
        
        console.log('Connections after removal:', updatedConnections.map(c => c.id));
        onConnectionsChange(updatedConnections);
      } else {
        console.log('❌ NO MATCHING CONNECTIONS FOUND - This is the bug!');
        console.log('Edge IDs to remove:', removedEdges.map(e => e.id));
        console.log('Available connection IDs:', connections.map(c => c.id));
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
      
      console.log('🔗 NEW CONNECTION CREATED:', newConnection);
      console.log('Previous connections:', connections);
      
      onConnectionsChange([...connections, newConnection]);
    },
    [connections, onConnectionsChange, isValidConnection]
  );

  // Node title/description helpers
  const getNodeTitle = (nodeType: string) => {
    const titles = {
      'evidence-input': 'Evidence Input',
      'style-personalization': 'Style Personalization',
      'personal-data': 'Personal Data',
      'output-selector': 'Output Selector',
      'prompt': 'AI Prompt',
    };
    return titles[nodeType as keyof typeof titles] || 'Unknown';
  };

  const getNodeDescription = (nodeType: string) => {
    const descriptions = {
      'evidence-input': 'Upload evidence documents',
      'style-personalization': 'Analyze YouTube style',
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

      const newNode: PipelineNode = {
        id: `${type}-${Date.now()}`,
        type: type as any,
        position,
        data: {
          configured: false,
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
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Get selected nodes and edges
        const selectedNodes = reactFlowNodes.filter(node => node.selected);
        const selectedEdges = reactFlowEdges.filter(edge => edge.selected);
        
        // Delete selected nodes
        selectedNodes.forEach(node => {
          handleNodeDelete(node.id);
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