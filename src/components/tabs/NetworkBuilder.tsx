'use client';

import { NetworkConfig, ActivationFunction, ACTIVATION_FUNCTIONS, OPTIMIZERS } from '@/lib/neural-network-types';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface NetworkBuilderProps {
  config: NetworkConfig;
  onUpdateInputNeurons: (neurons: number) => void;
  onUpdateOutputNeurons: (neurons: number) => void;
  onUpdateOutputActivation: (activation: ActivationFunction) => void;
  onAddHiddenLayer: () => void;
  onRemoveHiddenLayer: (index: number) => void;
  onUpdateHiddenLayer: (index: number, updates: Partial<{ neurons: number; activation: ActivationFunction; dropout: number }>) => void;
  onUpdateLearningRate: (lr: number) => void;
  onUpdateOptimizer: (optimizer: 'sgd' | 'adam' | 'rmsprop') => void;
  onUpdateBatchSize: (size: number) => void;
  onReset: () => void;
  onProceed: () => void;
}

export function NetworkBuilder({
  config,
  onUpdateInputNeurons,
  onUpdateOutputNeurons,
  onUpdateOutputActivation,
  onAddHiddenLayer,
  onRemoveHiddenLayer,
  onUpdateHiddenLayer,
  onUpdateLearningRate,
  onUpdateOptimizer,
  onUpdateBatchSize,
  onReset,
  onProceed,
}: NetworkBuilderProps) {
  const totalParams = calculateTotalParams(config);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-xl mx-auto py-8 px-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Build Your Network</h2>
          <p className="text-sm mt-1 opacity-60">{config.hiddenLayers.length + 2} layers · {totalParams.toLocaleString()} parameters</p>
        </div>

        {/* Input Layer */}
        <Card className="p-5 border bg-[var(--card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Input Layer</h3>
            <span className="text-xs opacity-60">{config.inputLayer.neurons} features</span>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[config.inputLayer.neurons]}
              onValueChange={([value]) => onUpdateInputNeurons(value)}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={config.inputLayer.neurons}
              onChange={(e) => onUpdateInputNeurons(parseInt(e.target.value) || 1)}
              min={1}
              max={10}
              className="w-16 h-9 text-center text-sm bg-[var(--muted)] border"
            />
          </div>
        </Card>

        {/* Hidden Layers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Hidden Layers</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={onAddHiddenLayer}
              disabled={config.hiddenLayers.length >= 6}
              className="h-8"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          
          {config.hiddenLayers.map((layer, index) => (
            <Card key={layer.id} className="p-5 border bg-[var(--card)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs opacity-60">Layer {index + 1}</span>
                {config.hiddenLayers.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-60 hover:opacity-100 hover:text-red-500"
                    onClick={() => onRemoveHiddenLayer(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="text-xs opacity-60 w-16">Neurons</Label>
                  <Slider
                    value={[layer.neurons]}
                    onValueChange={([value]) => onUpdateHiddenLayer(index, { neurons: value })}
                    min={1}
                    max={16}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={layer.neurons}
                    onChange={(e) => onUpdateHiddenLayer(index, { neurons: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={16}
                    className="w-14 h-8 text-center text-xs bg-[var(--muted)] border"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label className="text-xs opacity-60 w-16">Activation</Label>
                  <Select
                    value={layer.activation}
                    onValueChange={(value: ActivationFunction) => onUpdateHiddenLayer(index, { activation: value })}
                  >
                    <SelectTrigger className="h-8 bg-[var(--muted)] border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[var(--card)] border">
                      {ACTIVATION_FUNCTIONS.filter(a => ['relu', 'sigmoid', 'tanh', 'leaky_relu'].includes(a.value)).map(func => (
                        <SelectItem key={func.value} value={func.value}>
                          {func.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Output Layer */}
        <Card className="p-5 border bg-[var(--card)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Output Layer</h3>
            <span className="text-xs opacity-60">{config.outputLayer.neurons} outputs</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-xs opacity-60 w-16">Neurons</Label>
              <Slider
                value={[config.outputLayer.neurons]}
                onValueChange={([value]) => onUpdateOutputNeurons(value)}
                min={1}
                max={5}
                step={1}
                className="flex-1"
              />
              <Input
                type="number"
                value={config.outputLayer.neurons}
                onChange={(e) => onUpdateOutputNeurons(parseInt(e.target.value) || 1)}
                min={1}
                max={5}
                className="w-14 h-8 text-center text-xs bg-[var(--muted)] border"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="text-xs opacity-60 w-16">Activation</Label>
              <Select
                value={config.outputLayer.activation}
                onValueChange={(value: ActivationFunction) => onUpdateOutputActivation(value)}
              >
                <SelectTrigger className="h-8 bg-[var(--muted)] border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border">
                  {ACTIVATION_FUNCTIONS.filter(a => ['sigmoid', 'softmax', 'linear'].includes(a.value)).map(func => (
                    <SelectItem key={func.value} value={func.value}>
                      {func.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Training Config */}
        <Card className="p-5 border bg-[var(--card)]">
          <h3 className="text-sm font-medium mb-4">Training</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-xs opacity-60 w-24">Learning Rate</Label>
              <Slider
                value={[Math.log10(config.learningRate)]}
                onValueChange={([value]) => onUpdateLearningRate(Math.pow(10, value))}
                min={-4}
                max={0}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs w-14 text-right">{config.learningRate.toExponential(0)}</span>
            </div>

            <div className="flex items-center gap-4">
              <Label className="text-xs opacity-60 w-24">Optimizer</Label>
              <Select value={config.optimizer} onValueChange={(v: 'sgd' | 'adam' | 'rmsprop') => onUpdateOptimizer(v)}>
                <SelectTrigger className="h-8 bg-[var(--muted)] border flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[var(--card)] border">
                  {OPTIMIZERS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Label className="text-xs opacity-60 w-24">Batch Size</Label>
              <div className="flex gap-2 flex-1">
                {[16, 32, 64, 128].map(size => (
                  <Button
                    key={size}
                    size="sm"
                    variant={config.batchSize === size ? 'default' : 'outline'}
                    className={`flex-1 h-8 text-xs ${config.batchSize === size ? 'bg-[var(--muted)]' : ''}`}
                    onClick={() => onUpdateBatchSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onReset}
          >
            Reset
          </Button>
          <Button
            className="flex-1 dark:bg-white dark:text-black bg-slate-900 text-white hover:opacity-90"
            onClick={onProceed}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

function calculateTotalParams(config: NetworkConfig): number {
  let params = 0;
  let prevNeurons = config.inputLayer.neurons;

  for (const layer of config.hiddenLayers) {
    params += prevNeurons * layer.neurons + layer.neurons;
    prevNeurons = layer.neurons;
  }

  params += prevNeurons * config.outputLayer.neurons + config.outputLayer.neurons;
  return params;
}
