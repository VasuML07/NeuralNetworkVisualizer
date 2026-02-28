'use client';

import { LayerConfig, ActivationFunction, ACTIVATION_FUNCTIONS } from '@/lib/neural-network-types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Brain, Droplets } from 'lucide-react';

interface LayerConfigProps {
  layer: LayerConfig;
  index: number;
  onUpdate: (index: number, updates: Partial<LayerConfig>) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export function HiddenLayerConfig({ layer, index, onUpdate, onRemove, canRemove }: LayerConfigProps) {
  const currentActivation = ACTIVATION_FUNCTIONS.find(a => a.value === layer.activation);

  return (
    <div className="p-3 rounded-lg bg-purple-900/10 border border-purple-500/20 relative group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-medium text-purple-200">Hidden {index + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-500/20 text-purple-300 border-0 text-[10px]">
            {layer.neurons} neurons
          </Badge>
          {canRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {/* Neurons */}
        <div className="flex items-center gap-2">
          <Label className="text-[10px] text-slate-400 w-20">Neurons</Label>
          <Slider
            value={[layer.neurons]}
            onValueChange={([value]) => onUpdate(index, { neurons: value })}
            min={1}
            max={16}
            step={1}
            className="flex-1"
          />
          <Input
            type="number"
            value={layer.neurons}
            onChange={(e) => onUpdate(index, { neurons: parseInt(e.target.value) || 1 })}
            min={1}
            max={16}
            className="w-12 h-6 text-center text-[10px] bg-slate-800/50 border-slate-600 text-white"
          />
        </div>

        {/* Activation */}
        <div className="flex items-center gap-2">
          <Label className="text-[10px] text-slate-400 w-20">Activation</Label>
          <Select
            value={layer.activation}
            onValueChange={(value: ActivationFunction) => onUpdate(index, { activation: value })}
          >
            <SelectTrigger className="h-7 bg-slate-800/50 border-slate-600 text-white text-[11px]">
              <SelectValue>
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: currentActivation?.color }}
                  />
                  {currentActivation?.label}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {ACTIVATION_FUNCTIONS.filter(a => !['softmax', 'gelu', 'selu', 'elu'].includes(a.value)).map(func => (
                <SelectItem key={func.value} value={func.value} className="text-white text-xs">
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: func.color }}
                    />
                    <span>{func.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dropout */}
        <div className="flex items-center gap-2">
          <Label className="text-[10px] text-slate-400 w-20 flex items-center gap-1">
            <Droplets className="w-2.5 h-2.5 text-cyan-400" />
            Dropout
          </Label>
          <Slider
            value={[layer.dropout]}
            onValueChange={([value]) => onUpdate(index, { dropout: value })}
            min={0}
            max={0.5}
            step={0.05}
            className="flex-1"
          />
          <Badge className="bg-cyan-500/20 text-cyan-300 border-0 text-[10px] w-10 justify-center">
            {Math.round(layer.dropout * 100)}%
          </Badge>
        </div>
      </div>
    </div>
  );
}
