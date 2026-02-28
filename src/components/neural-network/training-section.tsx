'use client';

import React from 'react';
import { useNeuralNetworkStore } from '@/store/neural-network-store';
import { OPTIMIZERS, LOSS_FUNCTIONS } from '@/types/neural-network';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Square, Settings, ChevronDown, ChevronRight } from 'lucide-react';

interface TrainingSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function TrainingSection({ isExpanded, onToggle }: TrainingSectionProps) {
  const { 
    trainingConfig, 
    setTrainingConfig, 
    training,
    startTraining,
    stopTraining,
    viewMode 
  } = useNeuralNetworkStore();

  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Training</span>
          {training.isTraining && (
            <div className="flex items-center gap-1 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-400">Running</span>
            </div>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Learning Rate */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-gray-500">Learning Rate</Label>
              <span className="text-xs text-violet-400 font-mono">{trainingConfig.learningRate}</span>
            </div>
            <Slider
              value={[trainingConfig.learningRate * 1000]}
              onValueChange={([value]) => setTrainingConfig({ learningRate: value / 1000 })}
              min={0.1}
              max={10}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Epochs */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-gray-500">Epochs</Label>
              <span className="text-xs text-violet-400 font-mono">{trainingConfig.epochs}</span>
            </div>
            <Slider
              value={[trainingConfig.epochs]}
              onValueChange={([value]) => setTrainingConfig({ epochs: value })}
              min={1}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Batch Size */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-gray-500">Batch Size</Label>
              <span className="text-xs text-violet-400 font-mono">{trainingConfig.batchSize}</span>
            </div>
            <Slider
              value={[trainingConfig.batchSize]}
              onValueChange={([value]) => setTrainingConfig({ batchSize: value })}
              min={8}
              max={256}
              step={8}
              className="w-full"
            />
          </div>

          {/* Optimizer - Advanced Only */}
          {viewMode === 'advanced' && (
            <div className="space-y-1">
              <Label className="text-[10px] text-gray-500">Optimizer</Label>
              <Select
                value={trainingConfig.optimizer}
                onValueChange={(value) => setTrainingConfig({ optimizer: value as typeof trainingConfig.optimizer })}
              >
                <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {OPTIMIZERS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Loss Function - Advanced Only */}
          {viewMode === 'advanced' && (
            <div className="space-y-1">
              <Label className="text-[10px] text-gray-500">Loss Function</Label>
              <Select
                value={trainingConfig.lossFunction}
                onValueChange={(value) => setTrainingConfig({ lossFunction: value as typeof trainingConfig.lossFunction })}
              >
                <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10">
                  {LOSS_FUNCTIONS.map(loss => (
                    <SelectItem key={loss.value} value={loss.value}>
                      {loss.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Training Progress */}
          {training.isTraining && (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Epoch</span>
                <span className="text-white font-mono">{training.currentEpoch} / {trainingConfig.epochs}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Loss</span>
                <span className="text-amber-400 font-mono">{training.currentLoss.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Accuracy</span>
                <span className="text-green-400 font-mono">{(training.currentAccuracy * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
