'use client';

import React from 'react';
import { useNeuralNetworkStore } from '@/store/neural-network-store';
import { NeuralLayer, ActivationFunction, LayerType, LAYER_COLORS, ACTIVATION_COLORS } from '@/types/neural-network';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, Trash2, ChevronUp, ChevronDown, ChevronRight, Box, Zap } from 'lucide-react';

const LAYER_TYPES: { value: LayerType; label: string }[] = [
  { value: 'dense', label: 'Dense' },
  { value: 'conv2d', label: 'Conv2D' },
  { value: 'maxpool2d', label: 'MaxPool' },
  { value: 'dropout', label: 'Dropout' },
  { value: 'batchnorm', label: 'BatchNorm' },
  { value: 'lstm', label: 'LSTM' },
  { value: 'flatten', label: 'Flatten' },
];

const ACTIVATION_FUNCTIONS: { value: ActivationFunction; label: string }[] = [
  { value: 'relu', label: 'ReLU' },
  { value: 'leaky_relu', label: 'Leaky ReLU' },
  { value: 'sigmoid', label: 'Sigmoid' },
  { value: 'tanh', label: 'Tanh' },
  { value: 'softmax', label: 'Softmax' },
  { value: 'gelu', label: 'GELU' },
  { value: 'linear', label: 'Linear' },
];

interface ArchitectureSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function ArchitectureSection({ isExpanded, onToggle }: ArchitectureSectionProps) {
  const { 
    network, 
    selectedLayerId, 
    updateLayer, 
    removeLayer, 
    reorderLayers, 
    addLayer,
    selectLayer,
    viewMode 
  } = useNeuralNetworkStore();
  
  const selectedLayer = network.layers.find(l => l.id === selectedLayerId);
  const selectedIndex = network.layers.findIndex(l => l.id === selectedLayerId);

  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Architecture</span>
          <Badge variant="outline" className="text-[10px] h-4 ml-2 border-white/10 text-gray-500">
            {network.layers.length} layers
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Quick Add Layer Buttons */}
          <div className="space-y-1">
            <Label className="text-[10px] text-gray-500">Add Layer</Label>
            <div className="flex flex-wrap gap-1">
              {LAYER_TYPES.slice(0, viewMode === 'advanced' ? 7 : 4).map(type => (
                <Button
                  key={type.value}
                  variant="outline"
                  size="sm"
                  onClick={() => addLayer(type.value)}
                  className="h-7 text-[10px] border-white/10 hover:bg-white/5"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Layer List */}
          <div className="space-y-1">
            <Label className="text-[10px] text-gray-500">Network Layers</Label>
            <div className="max-h-[180px] overflow-y-auto space-y-1 custom-scrollbar">
              {network.layers.map((layer, index) => (
                <div
                  key={layer.id}
                  onClick={() => selectLayer(layer.id)}
                  className={`group flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedLayerId === layer.id 
                      ? 'bg-violet-500/20 border border-violet-500/30' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div 
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: `${LAYER_COLORS[layer.type]}20`, color: LAYER_COLORS[layer.type] }}
                  >
                    {layer.type.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{layer.name}</div>
                    <div className="text-[10px] text-gray-500">
                      {layer.units > 0 ? `${layer.units} units` : layer.type}
                      {layer.activation && layer.activation !== 'linear' && ` • ${layer.activation}`}
                    </div>
                  </div>
                  {layer.type !== 'input' && layer.type !== 'output' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Layer Config - Contextual */}
          {selectedLayer && selectedLayer.type !== 'input' && selectedLayer.type !== 'output' && (
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="text-xs font-medium text-gray-400 flex items-center gap-2">
                <Box className="w-3 h-3" />
                Configure: {selectedLayer.name}
              </div>

              {/* Layer Name */}
              <div className="space-y-1">
                <Label className="text-[10px] text-gray-500">Name</Label>
                <input
                  type="text"
                  value={selectedLayer.name}
                  onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                  className="w-full h-7 px-2 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                />
              </div>

              {/* Neurons/Units */}
              {(selectedLayer.type === 'dense' || selectedLayer.type === 'lstm' || selectedLayer.type === 'gru') && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-gray-500">Neurons</Label>
                    <span className="text-xs text-violet-400 font-mono">{selectedLayer.units}</span>
                  </div>
                  <Slider
                    value={[selectedLayer.units]}
                    onValueChange={([value]) => updateLayer(selectedLayer.id, { units: value })}
                    min={8}
                    max={512}
                    step={8}
                    className="w-full"
                  />
                </div>
              )}

              {/* Dropout Rate */}
              {selectedLayer.type === 'dropout' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-gray-500">Dropout Rate</Label>
                    <span className="text-xs text-red-400 font-mono">{((selectedLayer.dropout || 0.5) * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    value={[(selectedLayer.dropout || 0.5) * 100]}
                    onValueChange={([value]) => updateLayer(selectedLayer.id, { dropout: value / 100 })}
                    min={10}
                    max={80}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}

              {/* Activation Function */}
              {selectedLayer.type !== 'dropout' && selectedLayer.type !== 'batchnorm' && selectedLayer.type !== 'flatten' && (
                <div className="space-y-1">
                  <Label className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    Activation
                  </Label>
                  <Select
                    value={selectedLayer.activation}
                    onValueChange={(value: ActivationFunction) => updateLayer(selectedLayer.id, { activation: value })}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/10">
                      {ACTIVATION_FUNCTIONS.map(func => (
                        <SelectItem key={func.value} value={func.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: ACTIVATION_COLORS[func.value] }}
                            />
                            <span>{func.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Layer Order Controls */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] flex-1 border-white/10"
                  onClick={() => reorderLayers(selectedIndex, selectedIndex - 1)}
                  disabled={selectedIndex <= 1}
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] flex-1 border-white/10"
                  onClick={() => reorderLayers(selectedIndex, selectedIndex + 1)}
                  disabled={selectedIndex >= network.layers.length - 2}
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => removeLayer(selectedLayer.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
