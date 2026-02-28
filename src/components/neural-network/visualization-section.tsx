'use client';

import React from 'react';
import { useNeuralNetworkStore } from '@/store/neural-network-store';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, ChevronDown, ChevronRight } from 'lucide-react';

interface VisualizationSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function VisualizationSection({ isExpanded, onToggle }: VisualizationSectionProps) {
  const { visualization, setVisualization, viewMode } = useNeuralNetworkStore();

  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Visualization</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Animate Training */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Animate Training</Label>
            <Switch
              checked={visualization.animateTraining}
              onCheckedChange={(checked) => setVisualization({ animateTraining: checked })}
            />
          </div>

          {/* Advanced Mode Only */}
          {viewMode === 'advanced' && (
            <>
              {/* Show Weights */}
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">Show Weights</Label>
                <Switch
                  checked={visualization.showWeights}
                  onCheckedChange={(checked) => setVisualization({ showWeights: checked })}
                />
              </div>

              {/* Show Activations */}
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">Show Activations</Label>
                <Switch
                  checked={visualization.showActivations}
                  onCheckedChange={(checked) => setVisualization({ showActivations: checked })}
                />
              </div>

              {/* Show Gradients */}
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">Show Gradients</Label>
                <Switch
                  checked={visualization.showGradients}
                  onCheckedChange={(checked) => setVisualization({ showGradients: checked })}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
