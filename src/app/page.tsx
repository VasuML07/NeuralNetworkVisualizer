'use client';

import React, { useState, useRef, useEffect } from 'react';
import { NetworkCanvas } from '@/components/neural-network/network-canvas';
import { ArchitectureSection } from '@/components/neural-network/architecture-section';
import { TrainingSection } from '@/components/neural-network/training-section';
import { VisualizationSection } from '@/components/neural-network/visualization-section';
import { CodeSection } from '@/components/neural-network/code-section';
import { PresetSelector } from '@/components/neural-network/preset-selector';
import { useNeuralNetworkStore } from '@/store/neural-network-store';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Square, 
  Plus, 
  RotateCcw, 
  Network,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function NeuralNetworkVisualizer() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    network, 
    resetNetwork, 
    addLayer,
    training,
    startTraining,
    stopTraining,
    viewMode,
    setViewMode,
    expandedSections,
    toggleSection,
    selectedLayerId
  } = useNeuralNetworkStore();

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleReset = () => {
    resetNetwork();
    toast.success('Network reset');
  };

  const handleTrain = () => {
    if (training.isTraining) {
      stopTraining();
      toast.info('Training stopped');
    } else {
      startTraining();
      toast.success('Training started');
      
      // Simulate training progress
      let epoch = 0;
      const interval = setInterval(() => {
        epoch++;
        const loss = Math.random() * 0.5 + 0.1;
        const accuracy = Math.min(0.99, 0.5 + epoch * 0.05);
        
        useNeuralNetworkStore.getState().updateTrainingProgress(epoch, loss, accuracy);
        
        if (epoch >= 10) {
          clearInterval(interval);
          stopTraining();
          toast.success('Training complete!');
        }
      }, 500);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Minimal Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Network className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-medium text-white">Neural Network Visualizer</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('beginner')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'beginner' 
                  ? 'bg-violet-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setViewMode('advanced')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'advanced' 
                  ? 'bg-violet-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Collapsible Sections */}
        <div className="w-64 bg-black/20 border-r border-white/5 flex flex-col overflow-hidden">
          {/* Presets - Always visible for quick access */}
          <div className="border-b border-white/5">
            <div className="flex items-center gap-2 px-4 py-3">
              <Sparkles className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-white">Presets</span>
            </div>
            <PresetSelector />
          </div>

          {/* Collapsible Sections */}
          <div className="flex-1 overflow-y-auto">
            <ArchitectureSection 
              isExpanded={expandedSections.architecture}
              onToggle={() => toggleSection('architecture')}
            />
            <TrainingSection 
              isExpanded={expandedSections.training}
              onToggle={() => toggleSection('training')}
            />
            <VisualizationSection 
              isExpanded={expandedSections.visualization}
              onToggle={() => toggleSection('visualization')}
            />
            <CodeSection 
              isExpanded={expandedSections.code}
              onToggle={() => toggleSection('code')}
            />
          </div>
        </div>

        {/* Center - Canvas & Controls */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Container */}
          <div 
            ref={containerRef}
            className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f]"
          >
            <NetworkCanvas 
              width={dimensions.width} 
              height={dimensions.height} 
            />
            
            {/* Selected Layer Info - Contextual */}
            {selectedLayerId && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 px-3 py-2">
                <div className="text-xs text-gray-400">
                  Layer selected • Configure in sidebar
                </div>
              </div>
            )}

            {/* Training Status - Contextual */}
            {training.isTraining && (
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-lg border border-green-500/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400">
                    Epoch {training.currentEpoch} • Loss: {training.currentLoss.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Bottom Action Bar - Simplified */}
          <div className="flex items-center justify-center gap-3 px-4 py-3 bg-black/40 border-t border-white/5">
            {/* Primary Action: Train */}
            <Button
              onClick={handleTrain}
              className={`h-10 px-6 ${
                training.isTraining 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-violet-500 hover:bg-violet-600 text-white'
              }`}
            >
              {training.isTraining ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Training
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Train
                </>
              )}
            </Button>

            {/* Secondary Actions */}
            <Button
              variant="outline"
              onClick={() => addLayer('dense')}
              className="h-10 px-4 border-white/10 hover:bg-white/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Layer
            </Button>

            <Button
              variant="outline"
              onClick={handleReset}
              className="h-10 px-4 border-white/10 hover:bg-white/5"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Right Panel - Only show in Advanced mode or when training */}
        {(viewMode === 'advanced' || training.isTraining) && (
          <div className="w-64 bg-black/20 border-l border-white/5 flex flex-col">
            {/* Network Stats */}
            <div className="p-4 border-b border-white/5">
              <h3 className="text-xs font-medium text-gray-400 mb-3">Network Info</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Layers</span>
                  <span className="text-white font-mono">{network.layers.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Total Neurons</span>
                  <span className="text-white font-mono">
                    {network.layers.reduce((sum, l) => sum + l.units, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Parameters</span>
                  <span className="text-violet-400 font-mono">
                    {network.layers.reduce((sum, layer, idx) => {
                      if (layer.type === 'dense' && idx > 0) {
                        const prevUnits = network.layers[idx - 1]?.units || 0;
                        return sum + (prevUnits * layer.units) + layer.units;
                      }
                      return sum;
                    }, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Training Progress Chart - Only during training */}
            {training.isTraining && training.lossHistory.length > 0 && (
              <div className="p-4 border-b border-white/5">
                <h3 className="text-xs font-medium text-gray-400 mb-3">Training Progress</h3>
                <div className="h-20 flex items-end gap-1">
                  {training.lossHistory.slice(-10).map((loss, i) => (
                    <div 
                      key={i}
                      className="flex-1 bg-amber-500/30 rounded-t"
                      style={{ height: `${Math.min(100, loss * 100)}%` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
