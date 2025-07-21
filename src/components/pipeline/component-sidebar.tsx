import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Upload, Youtube, Palette, Paintbrush, User, Play, Zap, Stethoscope } from 'lucide-react';
import { PipelineNode } from '@/lib/pipeline-types';

interface ComponentSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  nodes: PipelineNode[];
}

export default function ComponentSidebar({ collapsed, onToggleCollapse, nodes }: ComponentSidebarProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const isNodeUsed = (nodeType: string) => {
    return nodes.some(node => node.type === nodeType);
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-white mb-4"
        >
          <ChevronRight size={20} />
        </Button>
        
        {/* Collapsed component icons */}
        <div className="space-y-4">
          {!isNodeUsed('evidence-input') && (
            <div
              className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center cursor-grab hover:bg-emerald-600 transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, 'evidence-input')}
            >
              <Upload size={20} className="text-white" />
            </div>
          )}
          {!isNodeUsed('style-personalization') && (
            <div
              className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center cursor-grab hover:bg-yellow-600 transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, 'style-personalization')}
            >
              <User size={20} className="text-white" />
            </div>
          )}
          {!isNodeUsed('visual-styling') && (
            <div
              className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center cursor-grab hover:bg-pink-600 transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, 'visual-styling')}
            >
              <Paintbrush size={20} className="text-white" />
            </div>
          )}
          {!isNodeUsed('personal-data') && (
            <div
              className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center cursor-grab hover:bg-blue-600 transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, 'personal-data')}
            >
              <Stethoscope size={20} className="text-white" />
            </div>
          )}
          {!isNodeUsed('output-selector') && (
            <div
              className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center cursor-grab hover:bg-orange-600 transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, 'output-selector')}
            >
              <Play size={20} className="text-white" />
            </div>
          )}
          {!isNodeUsed('prompt') && (
            <div
              className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center cursor-grab hover:bg-purple-700 transition-colors"
              draggable
              onDragStart={(e) => onDragStart(e, 'prompt')}
            >
              <Zap size={20} className="text-white" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            ⚡
          </div>
          PromptRX
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Create personalized health content with AI-powered components
        </p>
      </div>
      
      {/* Components List */}
      <div className="flex-1 p-6 space-y-4">
        {/* Component 1: Evidence-Based Input */}
        {!isNodeUsed('evidence-input') && (
          <div
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-xl shadow-lg border border-emerald-400/20 hover:shadow-emerald-500/20 hover:shadow-xl cursor-grab active:cursor-grabbing transition-all"
            draggable
            onDragStart={(e) => onDragStart(e, 'evidence-input')}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Upload className="text-white text-lg" />
                <h3 className="font-medium text-white">Evidence-Based Input</h3>
              </div>
              <div className="text-emerald-200">⋮</div>
            </div>
            <p className="text-emerald-100 text-sm">
              Upload guidelines (PDF/TXT) for evidence-based interventions
            </p>
            <div className="flex justify-end items-center mt-3">
              <div className="w-3 h-3 bg-white rounded-full border-2 border-emerald-400" />
            </div>
          </div>
        )}

        {/* Component 2: Conversational Style */}
        {!isNodeUsed('style-personalization') && (
          <div
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl shadow-lg border border-yellow-400/20 hover:shadow-yellow-500/20 hover:shadow-xl cursor-grab active:cursor-grabbing transition-all"
            draggable
            onDragStart={(e) => onDragStart(e, 'style-personalization')}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="text-white text-lg" />
                <h3 className="font-medium text-white">Conversational Style</h3>
              </div>
              <div className="text-yellow-200">⋮</div>
            </div>
            <p className="text-yellow-100 text-sm">
              Configure tone, pace, vocabulary and speaking style
            </p>
            <div className="flex justify-end items-center mt-3">
              <div className="w-3 h-3 bg-white rounded-full border-2 border-yellow-400" />
            </div>
          </div>
        )}

        {/* Component 3: Visual Styling */}
        {!isNodeUsed('visual-styling') && (
          <div
            className="bg-gradient-to-br from-pink-500 to-pink-600 p-4 rounded-xl shadow-lg border border-pink-400/20 hover:shadow-pink-500/20 hover:shadow-xl cursor-grab active:cursor-grabbing transition-all"
            draggable
            onDragStart={(e) => onDragStart(e, 'visual-styling')}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Paintbrush className="text-white text-lg" />
                <h3 className="font-medium text-white">Visual Styling</h3>
              </div>
              <div className="text-pink-200">⋮</div>
            </div>
            <p className="text-pink-100 text-sm">
              Unified visual design for videos and podcast thumbnails
            </p>
            <div className="flex justify-end items-center mt-3">
              <div className="w-3 h-3 bg-white rounded-full border-2 border-pink-400" />
            </div>
          </div>
        )}

        {/* Component 4: Personal Data */}
        {!isNodeUsed('personal-data') && (
          <div
            className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg border border-blue-400/20 hover:shadow-blue-500/20 hover:shadow-xl cursor-grab active:cursor-grabbing transition-all"
            draggable
            onDragStart={(e) => onDragStart(e, 'personal-data')}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Stethoscope className="text-white text-lg" />
                <h3 className="font-medium text-white">Personal Health Profile</h3>
              </div>
              <div className="text-blue-200">⋮</div>
            </div>
            <p className="text-blue-100 text-sm">
              Input health metrics and personal preferences
            </p>
            <div className="flex justify-end items-center mt-3">
              <div className="w-3 h-3 bg-white rounded-full border-2 border-blue-400" />
            </div>
          </div>
        )}

        {/* Component 5: Output Selector */}
        {!isNodeUsed('output-selector') && (
          <div
            className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-lg border border-orange-400/20 hover:shadow-orange-500/20 hover:shadow-xl cursor-grab active:cursor-grabbing transition-all"
            draggable
            onDragStart={(e) => onDragStart(e, 'output-selector')}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Play className="text-white text-lg" />
                <h3 className="font-medium text-white">Output Format</h3>
              </div>
              <div className="text-orange-200">⋮</div>
            </div>
            <p className="text-orange-100 text-sm">
              Select output format: video or podcast
            </p>
            <div className="flex justify-end items-center mt-3">
              <div className="w-3 h-3 bg-white rounded-full border-2 border-orange-400" />
            </div>
          </div>
        )}

        {/* Component 6: AI Prompt */}
        {!isNodeUsed('prompt') && (
          <div
            className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-xl shadow-lg border border-purple-400/20 hover:shadow-purple-500/20 hover:shadow-xl cursor-grab active:cursor-grabbing transition-all"
            draggable
            onDragStart={(e) => onDragStart(e, 'prompt')}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="text-white text-lg" />
                <h3 className="font-medium text-white">AI Prompt</h3>
              </div>
              <div className="text-purple-200">⋮</div>
            </div>
            <p className="text-purple-100 text-sm">
              Build and edit your AI prompt with live preview
            </p>
            <div className="flex justify-end items-center mt-3">
              <div className="w-3 h-3 bg-white rounded-full border-2 border-purple-400" />
            </div>
          </div>
        )}

        {/* Show message when all components are used */}
        {isNodeUsed('evidence-input') && isNodeUsed('style-personalization') && isNodeUsed('visual-styling') &&
         isNodeUsed('personal-data') && isNodeUsed('output-selector') && isNodeUsed('prompt') && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-400">All components added!</p>
            <p className="text-sm text-gray-500">Configure each node to enable generation</p>
          </div>
        )}
      </div>

      {/* Sidebar Toggle */}
      <div className="p-4 border-t border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Collapse Sidebar
        </Button>
      </div>
    </div>
  );
}
