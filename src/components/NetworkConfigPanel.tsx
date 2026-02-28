'use client';

import { NetworkConfig, ActivationFunction, ACTIVATION_FUNCTIONS } from '@/lib/neural-network-types';
import { HiddenLayerConfig } from './LayerConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  Plus, 
  RotateCcw, 
  Layers, 
  CircleDot, 
  Zap,
  Sparkles,
  Trash2
} from 'lucide-react';

interface NetworkConfigPanelProps {
  config: NetworkConfig;
  onUpdateInputNeurons: (neurons: number) => void;
  onUpdateOutputNeurons: (neurons: number) => void;
  onUpdateOutputActivation: (activation: ActivationFunction) => void;
  onAddHiddenLayer: () => void;
  onRemoveHiddenLayer: (index: number) => void;
  onUpdateHiddenLayer: (index: number, updates: Partial<{ neurons: number; activation: ActivationFunction; dropout: number }>) => void;
  onReset: () => void;
}

export function NetworkConfigPanel({
  config,
  onUpdateInputNeurons,
  onUpdateOutputNeurons,
  onUpdateOutputActivation,
  onAddHiddenLayer,
  onRemoveHiddenLayer,
  onUpdateHiddenLayer,
  onReset,
}: NetworkConfigPanelProps) {
  const outputActivation = ACTIVATION_FUNCTIONS.find(a => a.value === config.outputLayer.activation);

  const totalParams = calculateTotalParams(config);
  const totalNeurons = config.inputLayer.neurons + 
    config.hiddenLayers.reduce((sum, l) => sum + l.neurons, 0) + 
    config.outputLayer.neurons;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-700/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Network Config</h2>
            <p className="text-xs text-slate-400">Design your architecture</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-3 border border-blue-500/20">
            <div className="text-xl font-bold text-blue-400">{config.hiddenLayers.length + 2}</div>
            <div className="text-[10px] text-blue-300/70">Layers</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-3 border border-purple-500/20">
            <div className="text-xl font-bold text-purple-400">{totalNeurons}</div>
            <div className="text-[10px] text-purple-300/70">Neurons</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-3 border border-green-500/20">
            <div className="text-xl font-bold text-green-400">{formatNumber(totalParams)}</div>
            <div className="text-[10px] text-green-300/70">Params</div>
          </div>
        </div>

        {/* Input Layer */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <CircleDot className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-blue-100">Input Layer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-400">Input Features</Label>
                <Badge className="bg-blue-500/20 text-blue-300 text-xs border-0">
                  {config.inputLayer.neurons}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.inputLayer.neurons]}
                  onValueChange={([value]) => onUpdateInputNeurons(value)}
                  min={1}
                  max={50}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={config.inputLayer.neurons}
                  onChange={(e) => onUpdateInputNeurons(parseInt(e.target.value) || 1)}
                  min={1}
                  max={50}
                  className="w-14 h-8 text-center text-xs bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hidden Layers Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-purple-100">Hidden Layers</span>
              <Badge className="bg-purple-500/20 text-purple-300 text-xs border-0">
                {config.hiddenLayers.length}
              </Badge>
            </div>
            <Button
              size="sm"
              className="h-8 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/20"
              onClick={onAddHiddenLayer}
              disabled={config.hiddenLayers.length >= 10}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Layer
            </Button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {config.hiddenLayers.map((layer, index) => (
              <HiddenLayerConfig
                key={layer.id}
                layer={layer}
                index={index}
                onUpdate={onUpdateHiddenLayer}
                onRemove={onRemoveHiddenLayer}
                canRemove={config.hiddenLayers.length > 1}
              />
            ))}
          </div>
        </div>

        {/* Output Layer */}
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-green-100">Output Layer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-400">Output Neurons</Label>
                <Badge className="bg-green-500/20 text-green-300 text-xs border-0">
                  {config.outputLayer.neurons}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.outputLayer.neurons]}
                  onValueChange={([value]) => onUpdateOutputNeurons(value)}
                  min={1}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={config.outputLayer.neurons}
                  onChange={(e) => onUpdateOutputNeurons(parseInt(e.target.value) || 1)}
                  min={1}
                  max={20}
                  className="w-14 h-8 text-center text-xs bg-slate-800/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Activation Function</Label>
              <Select
                value={config.outputLayer.activation}
                onValueChange={(value: ActivationFunction) => onUpdateOutputActivation(value)}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: outputActivation?.color }}
                      />
                      {outputActivation?.label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {ACTIVATION_FUNCTIONS.map(func => (
                    <SelectItem key={func.value} value={func.value} className="text-white">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: func.color }}
                        />
                        <span>{func.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Network Summary */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-slate-200">Network Summary</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Total Layers:</span>
              <span className="text-white font-medium">{config.hiddenLayers.length + 2}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Neurons:</span>
              <span className="text-white font-medium">{totalNeurons}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Trainable Params:</span>
              <span className="text-cyan-400 font-medium">{totalParams.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Dropout Layers:</span>
              <span className="text-orange-400 font-medium">
                {config.hiddenLayers.filter(l => l.dropout > 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <Button
          variant="outline"
          className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
}

function calculateTotalParams(config: NetworkConfig): number {
  let params = 0;
  let prevNeurons = config.inputLayer.neurons;

  for (const layer of config.hiddenLayers) {
    params += prevNeurons * layer.neurons + layer.neurons; // weights + biases
    prevNeurons = layer.neurons;
  }

  params += prevNeurons * config.outputLayer.neurons + config.outputLayer.neurons;

  return params;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
