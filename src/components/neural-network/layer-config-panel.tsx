'use client';

import React from 'react';
import { useNeuralNetworkStore } from '@/store/neural-network-store';
import { NeuralLayer, ActivationFunction, LayerType, LAYER_COLORS, ACTIVATION_COLORS } from '@/types/neural-network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Layers, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Settings2,
  Zap,
  Box
} from 'lucide-react';

const LAYER_TYPES: { value: LayerType; label: string }[] = [
  { value: 'dense', label: 'Dense' },
  { value: 'conv2d', label: 'Conv2D' },
  { value: 'maxpool2d', label: 'MaxPool2D' },
  { value: 'avgpool2d', label: 'AvgPool2D' },
  { value: 'dropout', label: 'Dropout' },
  { value: 'batchnorm', label: 'BatchNorm' },
  { value: 'lstm', label: 'LSTM' },
  { value: 'gru', label: 'GRU' },
  { value: 'flatten', label: 'Flatten' },
];

const ACTIVATION_FUNCTIONS: { value: ActivationFunction; label: string }[] = [
  { value: 'relu', label: 'ReLU' },
  { value: 'leaky_relu', label: 'Leaky ReLU' },
  { value: 'sigmoid', label: 'Sigmoid' },
  { value: 'tanh', label: 'Tanh' },
  { value: 'softmax', label: 'Softmax' },
  { value: 'gelu', label: 'GELU' },
  { value: 'swish', label: 'Swish' },
  { value: 'linear', label: 'Linear' },
];

const INITIALIZERS = [
  { value: 'he_normal', label: 'He Normal' },
  { value: 'he_uniform', label: 'He Uniform' },
  { value: 'glorot_normal', label: 'Glorot Normal' },
  { value: 'glorot_uniform', label: 'Glorot Uniform' },
  { value: 'random_normal', label: 'Random Normal' },
  { value: 'zeros', label: 'Zeros' },
];

export function LayerConfigPanel() {
  const { network, selectedLayerId, updateLayer, removeLayer, reorderLayers, addLayer } = useNeuralNetworkStore();
  
  const selectedLayer = network.layers.find(l => l.id === selectedLayerId);
  const selectedIndex = network.layers.findIndex(l => l.id === selectedLayerId);

  if (!selectedLayer) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-violet-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No Layer Selected</h3>
        <p className="text-sm text-gray-400 mb-4">
          Click on a layer in the visualization to configure it
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {LAYER_TYPES.slice(0, 4).map(type => (
            <Button
              key={type.value}
              variant="outline"
              size="sm"
              onClick={() => addLayer(type.value)}
              className="border-white/10 hover:bg-white/5"
            >
              + {type.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  const handleMoveUp = () => {
    if (selectedIndex > 1) { // Don't move past input
      reorderLayers(selectedIndex, selectedIndex - 1);
    }
  };

  const handleMoveDown = () => {
    if (selectedIndex < network.layers.length - 2) { // Don't move past output
      reorderLayers(selectedIndex, selectedIndex + 1);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 space-y-4">
        {/* Layer Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${LAYER_COLORS[selectedLayer.type]}30` }}
            >
              <Box className="w-4 h-4" style={{ color: LAYER_COLORS[selectedLayer.type] }} />
            </div>
            <div>
              <Input
                value={selectedLayer.name}
                onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                className="h-7 w-32 bg-transparent border-none p-0 text-sm font-medium text-white focus-visible:ring-0"
              />
              <Badge variant="outline" className="text-[10px] h-4 mt-1 border-white/20 text-gray-400">
                {selectedLayer.type.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-white"
              onClick={handleMoveUp}
              disabled={selectedIndex <= 1}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-white"
              onClick={handleMoveDown}
              disabled={selectedIndex >= network.layers.length - 2}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => removeLayer(selectedLayer.id)}
              disabled={selectedLayer.type === 'input' || selectedLayer.type === 'output'}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Layer Type */}
        {selectedLayer.type !== 'input' && selectedLayer.type !== 'output' && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Layer Type</Label>
            <Select
              value={selectedLayer.type}
              onValueChange={(value: LayerType) => updateLayer(selectedLayer.id, { type: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                {LAYER_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: LAYER_COLORS[type.value] }}
                      />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Units */}
        {(selectedLayer.type === 'dense' || selectedLayer.type === 'lstm' || selectedLayer.type === 'gru' || 
          selectedLayer.type === 'input' || selectedLayer.type === 'output') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">Units/Neurons</Label>
              <span className="text-sm font-mono text-violet-400">{selectedLayer.units}</span>
            </div>
            <Slider
              value={[selectedLayer.units]}
              onValueChange={([value]) => updateLayer(selectedLayer.id, { units: value })}
              min={1}
              max={1024}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {/* Filters for Conv2D */}
        {selectedLayer.type === 'conv2d' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">Filters</Label>
              <span className="text-sm font-mono text-amber-400">{selectedLayer.filters || 32}</span>
            </div>
            <Slider
              value={[selectedLayer.filters || 32]}
              onValueChange={([value]) => updateLayer(selectedLayer.id, { filters: value })}
              min={8}
              max={512}
              step={8}
              className="w-full"
            />
          </div>
        )}

        {/* Kernel Size for Conv2D */}
        {(selectedLayer.type === 'conv2d' || selectedLayer.type === 'maxpool2d' || selectedLayer.type === 'avgpool2d') && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Kernel Size</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-gray-500">Width</Label>
                <Input
                  type="number"
                  value={selectedLayer.kernelSize?.[0] || 3}
                  onChange={(e) => updateLayer(selectedLayer.id, { 
                    kernelSize: [parseInt(e.target.value), selectedLayer.kernelSize?.[1] || 3] as [number, number]
                  })}
                  className="h-8 bg-white/5 border-white/10"
                  min={1}
                  max={11}
                />
              </div>
              <div>
                <Label className="text-[10px] text-gray-500">Height</Label>
                <Input
                  type="number"
                  value={selectedLayer.kernelSize?.[1] || 3}
                  onChange={(e) => updateLayer(selectedLayer.id, { 
                    kernelSize: [selectedLayer.kernelSize?.[0] || 3, parseInt(e.target.value)] as [number, number]
                  })}
                  className="h-8 bg-white/5 border-white/10"
                  min={1}
                  max={11}
                />
              </div>
            </div>
          </div>
        )}

        {/* Activation Function */}
        {selectedLayer.type !== 'dropout' && selectedLayer.type !== 'batchnorm' && 
         selectedLayer.type !== 'flatten' && selectedLayer.type !== 'input' && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Activation
            </Label>
            <Select
              value={selectedLayer.activation}
              onValueChange={(value: ActivationFunction) => updateLayer(selectedLayer.id, { activation: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
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
                      {func.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Dropout Rate */}
        {selectedLayer.type === 'dropout' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-400">Dropout Rate</Label>
              <span className="text-sm font-mono text-red-400">{(selectedLayer.dropout || 0.5) * 100}%</span>
            </div>
            <Slider
              value={[(selectedLayer.dropout || 0.5) * 100]}
              onValueChange={([value]) => updateLayer(selectedLayer.id, { dropout: value / 100 })}
              min={0}
              max={90}
              step={5}
              className="w-full"
            />
          </div>
        )}

        {/* Initializer */}
        {(selectedLayer.type === 'dense' || selectedLayer.type === 'conv2d' || selectedLayer.type === 'lstm' || selectedLayer.type === 'gru') && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Weight Initializer</Label>
            <Select
              value={selectedLayer.initializer || 'he_normal'}
              onValueChange={(value) => updateLayer(selectedLayer.id, { initializer: value as NeuralLayer['initializer'] })}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                {INITIALIZERS.map(init => (
                  <SelectItem key={init.value} value={init.value}>
                    {init.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Use Bias */}
        {(selectedLayer.type === 'dense' || selectedLayer.type === 'conv2d') && (
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Use Bias</Label>
            <Switch
              checked={selectedLayer.useBias !== false}
              onCheckedChange={(checked) => updateLayer(selectedLayer.id, { useBias: checked })}
            />
          </div>
        )}

        {/* Padding for Conv2D */}
        {selectedLayer.type === 'conv2d' && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-400">Padding</Label>
            <Select
              value={selectedLayer.padding || 'same'}
              onValueChange={(value) => updateLayer(selectedLayer.id, { padding: value as 'valid' | 'same' })}
            >
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                <SelectItem value="same">Same</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator className="bg-white/10" />

        {/* Quick Add Layer */}
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Add Layer After This</Label>
          <div className="grid grid-cols-3 gap-1">
            {LAYER_TYPES.slice(0, 6).map(type => (
              <Button
                key={type.value}
                variant="outline"
                size="sm"
                onClick={() => addLayer(type.value, selectedIndex)}
                className="h-7 text-[10px] border-white/10 hover:bg-white/5"
              >
                + {type.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
