'use client';

import React from 'react';
import { useNeuralNetworkStore } from '@/store/neural-network-store';
import { NeuralLayer, LAYER_COLORS, ACTIVATION_COLORS } from '@/types/neural-network';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GripVertical, 
  Trash2, 
  Box,
  Zap,
  Plus
} from 'lucide-react';

interface LayerItemProps {
  layer: NeuralLayer;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

function LayerItem({ layer, index, isSelected, onSelect, onRemove }: LayerItemProps) {
  const canDelete = layer.type !== 'input' && layer.type !== 'output';
  
  return (
    <div
      className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'bg-violet-500/20 border border-violet-500/30' 
          : 'hover:bg-white/5 border border-transparent'
      }`}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <GripVertical className="w-4 h-4 text-gray-600 group-hover:text-gray-400 cursor-grab" />
      
      {/* Layer Icon */}
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${LAYER_COLORS[layer.type]}20` }}
      >
        <Box className="w-4 h-4" style={{ color: LAYER_COLORS[layer.type] }} />
      </div>
      
      {/* Layer Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">{layer.name}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{layer.units} units</span>
          {layer.activation && layer.type !== 'dropout' && layer.type !== 'batchnorm' && layer.type !== 'flatten' && (
            <>
              <span>•</span>
              <span 
                className="flex items-center gap-1"
                style={{ color: ACTIVATION_COLORS[layer.activation] }}
              >
                <Zap className="w-2.5 h-2.5" />
                {layer.activation}
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Delete Button */}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}

export function LayerList() {
  const { 
    network, 
    selectedLayerId, 
    selectLayer, 
    removeLayer, 
    addLayer 
  } = useNeuralNetworkStore();

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Layers</h3>
          <Badge variant="outline" className="text-[10px] border-white/20 text-gray-400">
            {network.layers.length}
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {network.layers.map((layer, index) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              index={index}
              isSelected={selectedLayerId === layer.id}
              onSelect={() => selectLayer(layer.id)}
              onRemove={() => removeLayer(layer.id)}
            />
          ))}
        </div>
      </ScrollArea>
      
      {/* Add Layer Button */}
      <div className="p-3 border-t border-white/10">
        <Button
          variant="outline"
          className="w-full border-dashed border-white/20 hover:bg-white/5 text-gray-400 hover:text-white"
          onClick={() => addLayer('dense')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dense Layer
        </Button>
      </div>
    </div>
  );
}
