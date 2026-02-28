'use client';

import React from 'react';
import { useNeuralNetworkStore } from '@/store/neural-network-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export function AnimationControls() {
  const { 
    animation, 
    setAnimation, 
    zoom, 
    setZoom, 
    setPan,
    network 
  } = useNeuralNetworkStore();

  const togglePlay = () => {
    setAnimation({ isPlaying: !animation.isPlaying });
  };

  const reset = () => {
    setAnimation({ isPlaying: false, currentStep: 0 });
  };

  const handleZoomIn = () => setZoom(zoom + 0.25);
  const handleZoomOut = () => setZoom(zoom - 0.25);
  const handleFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white/[0.02] border-t border-white/10">
      {/* Animation Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlay}
          className="h-8 w-8 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
        >
          {animation.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={reset}
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Speed Slider */}
      <div className="flex items-center gap-2 min-w-[120px]">
        <span className="text-xs text-gray-500">Speed:</span>
        <Slider
          value={[animation.speed]}
          onValueChange={([value]) => setAnimation({ speed: value })}
          min={0.25}
          max={3}
          step={0.25}
          className="w-20"
        />
        <span className="text-xs text-gray-400 w-8">{animation.speed}x</span>
      </div>

      {/* Network Info */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{network.layers.length} layers</span>
        <span>{network.layers.reduce((sum, l) => sum + l.units, 0)} neurons</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="h-7 w-7 text-gray-400 hover:text-white"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <span className="text-xs text-gray-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="h-7 w-7 text-gray-400 hover:text-white"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFit}
          className="h-7 w-7 text-gray-400 hover:text-white"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
