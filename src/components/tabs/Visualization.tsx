'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { NetworkConfig, ACTIVATION_FUNCTIONS } from '@/lib/neural-network-types';
import { generateDataset, normalizeDataset, DataPoint } from '@/lib/datasets';
import { 
  createNetwork, 
  forward, 
  backward, 
  updateWeights, 
  Layer
} from '@/lib/neural-engine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

interface VisualizationProps {
  config: NetworkConfig;
}

export function Visualization({ config }: VisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkRef = useRef<Layer[]>([]);
  const dataRef = useRef<DataPoint[]>([]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [epoch, setEpoch] = useState(0);

  // Initialize network
  useEffect(() => {
    const layerSizes = [
      ...config.hiddenLayers.map(l => l.neurons),
      config.outputLayer.neurons
    ];
    const activations = [
      ...config.hiddenLayers.map(l => l.activation as 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'linear'),
      config.outputLayer.activation as 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'linear'
    ];
    
    networkRef.current = createNetwork(config.inputLayer.neurons, layerSizes, activations);
    dataRef.current = normalizeDataset(generateDataset('xor', 200));
    
    const timer = setTimeout(() => {
      setEpoch(0);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [config]);

  // Training step
  const trainStep = useCallback(() => {
    const network = networkRef.current;
    const data = dataRef.current;
    if (!network.length || !data.length) return;

    const batchIndices = Array(Math.min(config.batchSize, data.length))
      .fill(0)
      .map(() => Math.floor(Math.random() * data.length));
    
    const predictions: number[][] = [];
    const targets: number[][] = [];
    
    for (const idx of batchIndices) {
      const point = data[idx];
      const output = forward(network, point.input);
      predictions.push(output);
      targets.push(point.target);
      backward(network, point.target, 'mse');
    }
    
    updateWeights(network, config.learningRate, config.optimizer, epoch);
    setEpoch(e => e + 1);
  }, [config, epoch]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      trainStep();
    }, 100 / speed);
    
    return () => clearInterval(interval);
  }, [isRunning, speed, trainStep]);

  // Draw network
  const drawNetwork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    if (width <= 0 || height <= 0) return;
    
    const network = networkRef.current;
    const dark = document.documentElement.classList.contains('dark');
    
    // Colors for light/dark mode
    const bgColor = dark ? '#0f0f14' : '#ffffff';
    const textColor = dark ? '#94a3b8' : '#64748b';
    const subTextColor = dark ? '#64748b' : '#94a3b8';
    
    // Connection colors - gradient from source to target layer
    const connectionBaseColor = dark ? 'rgba(100, 116, 139, 0.4)' : 'rgba(148, 163, 184, 0.5)';
    const connectionActiveColor = dark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.6)';
    
    // Clear
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    
    if (!network.length) return;
    
    // Calculate positions
    const padding = 100;
    const allLayers = [
      { neurons: config.inputLayer.neurons, color: '#3b82f6', name: 'Input' },
      ...config.hiddenLayers.map((l, i) => ({ 
        neurons: l.neurons, 
        color: ACTIVATION_FUNCTIONS.find(a => a.value === l.activation)?.color || '#8b5cf6',
        name: `Hidden ${i + 1}`
      })),
      { neurons: config.outputLayer.neurons, color: '#22c55e', name: 'Output' }
    ];
    
    const layerSpacing = allLayers.length > 1 ? (width - padding * 2) / (allLayers.length - 1) : 0;
    const maxNeurons = Math.max(...allLayers.map(l => l.neurons), 1);
    const neuronSpacing = Math.max(10, Math.min(35, (height - padding * 2) / (maxNeurons + 1)));
    const neuronRadius = Math.max(5, Math.min(14, neuronSpacing / 2.5));
    
    // Calculate neuron positions
    const positions: { x: number; y: number; color: string; layer: number }[][] = [];
    
    allLayers.forEach((layer, layerIndex) => {
      const x = padding + layerIndex * layerSpacing;
      const totalHeight = (layer.neurons - 1) * neuronSpacing;
      const startY = (height - totalHeight) / 2;
      
      const layerPositions = [];
      for (let i = 0; i < layer.neurons; i++) {
        layerPositions.push({
          x,
          y: startY + i * neuronSpacing,
          color: layer.color,
          layer: layerIndex
        });
      }
      positions.push(layerPositions);
    });
    
    // Draw connections with gradient
    for (let l = 0; l < positions.length - 1; l++) {
      const fromLayer = positions[l];
      const toLayer = positions[l + 1];
      const weights = network[l]?.weights;
      const fromColor = allLayers[l].color;
      const toColor = allLayers[l + 1].color;
      
      for (let i = 0; i < fromLayer.length; i++) {
        for (let j = 0; j < toLayer.length; j++) {
          const from = fromLayer[i];
          const to = toLayer[j];
          
          // Weight magnitude for thickness
          let weightMag = 1;
          if (weights && weights[i] && weights[i][j] !== undefined) {
            weightMag = Math.min(Math.abs(weights[i][j]) * 2 + 0.5, 2.5);
          }
          
          // Create gradient for connection
          const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
          
          // Blend colors from source to target layer
          const fromAlpha = dark ? 0.35 : 0.4;
          const toAlpha = dark ? 0.35 : 0.4;
          
          gradient.addColorStop(0, hexToRgba(fromColor, fromAlpha));
          gradient.addColorStop(0.5, connectionBaseColor);
          gradient.addColorStop(1, hexToRgba(toColor, toAlpha));
          
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = weightMag;
          ctx.stroke();
        }
      }
    }
    
    // Draw neurons
    positions.forEach((layerPositions, layerIndex) => {
      const layerColor = allLayers[layerIndex].color;
      
      layerPositions.forEach((pos) => {
        // Outer glow
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, neuronRadius + 3, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(layerColor, dark ? 0.15 : 0.1);
        ctx.fill();
        
        // Neuron fill gradient
        const gradient = ctx.createRadialGradient(
          pos.x - neuronRadius * 0.3, 
          pos.y - neuronRadius * 0.3, 
          0,
          pos.x, 
          pos.y, 
          neuronRadius
        );
        
        if (dark) {
          gradient.addColorStop(0, '#ffffff30');
          gradient.addColorStop(0.5, hexToRgba(layerColor, 0.8));
          gradient.addColorStop(1, hexToRgba(layerColor, 0.6));
        } else {
          gradient.addColorStop(0, '#ffffff50');
          gradient.addColorStop(0.5, hexToRgba(layerColor, 0.9));
          gradient.addColorStop(1, layerColor);
        }
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, neuronRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Border
        ctx.strokeStyle = layerColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner highlight
        ctx.beginPath();
        ctx.arc(pos.x - neuronRadius * 0.25, pos.y - neuronRadius * 0.25, neuronRadius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });
    });
    
    // Draw labels
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    allLayers.forEach((layer, i) => {
      const x = padding + i * layerSpacing;
      
      ctx.fillStyle = textColor;
      ctx.fillText(layer.name, x, 35);
      
      ctx.fillStyle = subTextColor;
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(`${layer.neurons} neurons`, x, height - 35);
      ctx.font = '13px system-ui, sans-serif';
    });
    
  }, [config]);

  // Redraw on changes
  useEffect(() => {
    drawNetwork();
    
    // Observe theme changes
    const observer = new MutationObserver(() => {
      drawNetwork();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, [drawNetwork, epoch]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = Math.max(100, container.clientWidth);
      canvas.height = Math.max(100, container.clientHeight);
      drawNetwork();
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawNetwork]);

  const handleReset = () => {
    setIsRunning(false);
    setEpoch(0);
    
    const layerSizes = [
      ...config.hiddenLayers.map(l => l.neurons),
      config.outputLayer.neurons
    ];
    const activations = [
      ...config.hiddenLayers.map(l => l.activation as 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'linear'),
      config.outputLayer.activation as 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'linear'
    ];
    networkRef.current = createNetwork(config.inputLayer.neurons, layerSizes, activations);
    drawNetwork();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={trainStep}
            disabled={isRunning}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-9 p-0"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <div className="w-px h-6 bg-[var(--border)] mx-2" />
          
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-60">Speed</span>
            <Slider
              value={[speed]}
              onValueChange={([v]) => setSpeed(v)}
              min={0.5}
              max={5}
              step={0.5}
              className="w-24"
            />
            <span className="text-sm w-8">{speed}x</span>
          </div>
        </div>
        
        <Badge variant="secondary" className="text-sm font-normal">
          Epoch {epoch}
        </Badge>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </div>
  );
}

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
