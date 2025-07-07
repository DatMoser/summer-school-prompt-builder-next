import { Handle, Position } from 'reactflow';
import { Upload, User, Settings, X, Palette } from 'lucide-react';

interface NodeData {
  configured: boolean;
  title: string;
  description: string;
  onConfigure: () => void;
  onDelete?: () => void;
  configContent?: string; // Brief display of configuration
  connected?: boolean; // Whether this node has outgoing connections
  activeHandle?: string; // The handle that's currently connected
  onHover?: (hovering: boolean) => void; // Hover event handler
}

interface CustomNodeProps {
  data: NodeData;
  selected?: boolean;
}

export function EvidenceInputNode({ data, selected }: CustomNodeProps) {
  return (
    <div className="relative group">
      <div 
        className={`bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-xl shadow-lg border border-emerald-400/20 w-64 hover:shadow-emerald-500/20 hover:shadow-xl transition-all cursor-pointer ${
          selected ? 'ring-2 ring-blue-400' : ''
        }`}
        onClick={data.onConfigure}
        onMouseEnter={() => {
          data.onHover?.(true);
        }}
        onMouseLeave={() => {
          data.onHover?.(false);
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Upload className="text-white text-lg" size={16} />
            <h3 className="font-medium text-white text-sm">{data.title}</h3>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${data.configured ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {data.configured ? (
              <span className="text-white text-xs font-bold">✓</span>
            ) : (
              <Settings size={10} className="text-white" />
            )}
          </div>
        </div>
        
        <div className={`text-xs mb-3 px-2 py-1 rounded-full text-center ${
          data.configured 
            ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
            : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
        }`}>
          {data.configured ? "✓ Configured" : "⚠ Needs Configuration"}
        </div>
        
        {/* Configuration Content Display */}
        {data.configured && data.configContent && (
          <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-lg p-2 mb-3 text-xs text-emerald-100">
            <div className="truncate">{data.configContent}</div>
          </div>
        )}
        
        {/* Source handles - show all if not connected, only active one if connected */}
        {(!data.connected || data.activeHandle === 'evidence-top') && (
          <Handle type="source" position={Position.Top} id="evidence-top" />
        )}
        {(!data.connected || data.activeHandle === 'evidence-right') && (
          <Handle type="source" position={Position.Right} id="evidence-right" />
        )}
        {(!data.connected || data.activeHandle === 'evidence-bottom') && (
          <Handle type="source" position={Position.Bottom} id="evidence-bottom" />
        )}
        {(!data.connected || data.activeHandle === 'evidence-left') && (
          <Handle type="source" position={Position.Left} id="evidence-left" />
        )}
      </div>
      
      {/* Hover-triggered delete button */}
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
        >
          <X size={12} className="text-white" />
        </button>
      )}
    </div>
  );
}

export function StylePersonalizationNode({ data, selected }: CustomNodeProps) {
  return (
    <div className="relative group">
      <div 
        className={`bg-gradient-to-br from-yellow-500 to-yellow-600 p-5 rounded-xl shadow-lg border border-yellow-400/20 w-64 hover:shadow-yellow-500/20 hover:shadow-xl transition-all cursor-pointer ${
          selected ? 'ring-2 ring-blue-400' : ''
        }`}
        onClick={data.onConfigure}
        onMouseEnter={() => {
          data.onHover?.(true);
        }}
        onMouseLeave={() => {
          data.onHover?.(false);
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Palette className="text-white text-lg" size={16} />
            <h3 className="font-medium text-white text-sm">{data.title}</h3>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${data.configured ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {data.configured ? (
              <span className="text-white text-xs font-bold">✓</span>
            ) : (
              <Settings size={10} className="text-white" />
            )}
          </div>
        </div>
        
        <div className={`text-xs mb-3 px-2 py-1 rounded-full text-center ${
          data.configured 
            ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
            : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
        }`}>
          {data.configured ? "✓ Configured" : "⚠ Needs Configuration"}
        </div>
        
        {/* Configuration Content Display */}
        {data.configured && data.configContent && (
          <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-2 mb-3 text-xs text-yellow-100">
            <div className="truncate">{data.configContent}</div>
          </div>
        )}
        
        {/* Source handles - show all if not connected, only active one if connected */}
        {(!data.connected || data.activeHandle === 'style-top') && (
          <Handle type="source" position={Position.Top} id="style-top" />
        )}
        {(!data.connected || data.activeHandle === 'style-right') && (
          <Handle type="source" position={Position.Right} id="style-right" />
        )}
        {(!data.connected || data.activeHandle === 'style-bottom') && (
          <Handle type="source" position={Position.Bottom} id="style-bottom" />
        )}
        {(!data.connected || data.activeHandle === 'style-left') && (
          <Handle type="source" position={Position.Left} id="style-left" />
        )}
      </div>
      
      {/* Hover-triggered delete button */}
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
        >
          <X size={12} className="text-white" />
        </button>
      )}
    </div>
  );
}

export function PersonalDataNode({ data, selected }: CustomNodeProps) {
  return (
    <div className="relative group">
      <div 
        className={`bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-lg border border-blue-400/20 w-64 hover:shadow-blue-500/20 hover:shadow-xl transition-all cursor-pointer ${
          selected ? 'ring-2 ring-blue-400' : ''
        }`}
        onClick={data.onConfigure}
        onMouseEnter={() => {
          data.onHover?.(true);
        }}
        onMouseLeave={() => {
          data.onHover?.(false);
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <User className="text-white text-lg" size={16} />
            <h3 className="font-medium text-white text-sm">{data.title}</h3>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${data.configured ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {data.configured ? (
              <span className="text-white text-xs font-bold">✓</span>
            ) : (
              <Settings size={10} className="text-white" />
            )}
          </div>
        </div>
        
        <div className={`text-xs mb-3 px-2 py-1 rounded-full text-center ${
          data.configured 
            ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
            : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
        }`}>
          {data.configured ? "✓ Configured" : "⚠ Needs Configuration"}
        </div>
        
        {/* Configuration Content Display */}
        {data.configured && data.configContent && (
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-2 mb-3 text-xs text-blue-100">
            <div className="truncate">{data.configContent}</div>
          </div>
        )}
        
        {/* Source handles - show all if not connected, only active one if connected */}
        {(!data.connected || data.activeHandle === 'personal-top') && (
          <Handle type="source" position={Position.Top} id="personal-top" />
        )}
        {(!data.connected || data.activeHandle === 'personal-right') && (
          <Handle type="source" position={Position.Right} id="personal-right" />
        )}
        {(!data.connected || data.activeHandle === 'personal-bottom') && (
          <Handle type="source" position={Position.Bottom} id="personal-bottom" />
        )}
        {(!data.connected || data.activeHandle === 'personal-left') && (
          <Handle type="source" position={Position.Left} id="personal-left" />
        )}
      </div>
      
      {/* Hover-triggered delete button */}
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
        >
          <X size={12} className="text-white" />
        </button>
      )}
    </div>
  );
}

export function OutputSelectorNode({ data, selected }: CustomNodeProps) {
  return (
    <div className="relative group">
      <div 
        className={`bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-xl shadow-lg border border-orange-400/20 w-64 hover:shadow-orange-500/20 hover:shadow-xl transition-all cursor-pointer ${
          selected ? 'ring-2 ring-blue-400' : ''
        }`}
        onClick={data.onConfigure}
        onMouseEnter={() => {
          data.onHover?.(true);
        }}
        onMouseLeave={() => {
          data.onHover?.(false);
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Settings className="text-white text-lg" size={16} />
            <h3 className="font-medium text-white text-sm">{data.title}</h3>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${data.configured ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {data.configured ? (
              <span className="text-white text-xs font-bold">✓</span>
            ) : (
              <Settings size={10} className="text-white" />
            )}
          </div>
        </div>
        
        <div className={`text-xs mb-3 px-2 py-1 rounded-full text-center ${
          data.configured 
            ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
            : 'bg-yellow-500/20 text-yellow-100 border border-yellow-400/30'
        }`}>
          {data.configured ? "✓ Configured" : "⚠ Needs Configuration"}
        </div>
        
        {/* Configuration Content Display */}
        {data.configured && data.configContent && (
          <div className="bg-orange-500/10 border border-orange-400/20 rounded-lg p-2 mb-3 text-xs text-orange-100">
            <div className="truncate">{data.configContent}</div>
          </div>
        )}
        
        {/* Source handles - show all if not connected, only active one if connected */}
        {(!data.connected || data.activeHandle === 'output-top') && (
          <Handle type="source" position={Position.Top} id="output-top" />
        )}
        {(!data.connected || data.activeHandle === 'output-right') && (
          <Handle type="source" position={Position.Right} id="output-right" />
        )}
        {(!data.connected || data.activeHandle === 'output-bottom') && (
          <Handle type="source" position={Position.Bottom} id="output-bottom" />
        )}
        {(!data.connected || data.activeHandle === 'output-left') && (
          <Handle type="source" position={Position.Left} id="output-left" />
        )}
      </div>
      
      {/* Hover-triggered delete button */}
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
        >
          <X size={12} className="text-white" />
        </button>
      )}
    </div>
  );
}