import React, { useState, useRef, useCallback } from 'react';
import { EdgeProps, getSmoothStepPath, useReactFlow } from 'reactflow';
import { X } from 'lucide-react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { setEdges } = useReactFlow();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Use proper deletion handler from parent if available
    if (data?.onDelete) {
      data.onDelete(id);
    } else {
      // Fallback to ReactFlow's internal deletion
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    }
  };

  const handleMouseEnter = useCallback(() => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Set a timeout to reset hover state after 2 seconds
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      hoverTimeoutRef.current = null;
    }, 2000);
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <g>
      <path
        id={id}
        style={{
          stroke: isHovered ? '#ef4444' : '#6366f1',
          strokeWidth: isHovered ? 4 : 3,
          fill: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          ...style,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Invisible larger path for easier hovering */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Delete button on hover */}
      {isHovered && (
        <foreignObject
          width={24}
          height={24}
          x={labelX - 12}
          y={labelY - 12}
          className="edge-delete-button"
        >
          <button
            onClick={handleDeleteClick}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110"
            title="Delete connection"
            onMouseEnter={() => setIsHovered(true)}
          >
            <X size={12} />
          </button>
        </foreignObject>
      )}
    </g>
  );
}