//this tells ne
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNeuralNetworkStore, calculateParameters, calculateOverfittingRisk } from '@/store/neural-network-store';
import { getCode, getFileName } from '@/lib/code-generator';
import { Framework, LAYER_COLORS } from '@/types/neural-network';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RotateCcw, Copy, Download, Check, Network, Code2, Info, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

// Network Canvas Component
function NetworkCanvas({ layers }: { layers: { id: string; neurons: number }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw network
    const totalLayers = layers.length;
    if (totalLayers === 0) return;

    const layerSpacing = width / (totalLayers + 1);
    const maxDisplayNeurons = 10;

    interface NeuronPos {
      x: number;
      y: number;
      layerIndex: number;
      color: string;
    }

    const neuronsByLayer: NeuronPos[][] = layers.map((layer, layerIndex) => {
      const neurons: NeuronPos[] = [];
      const x = layerSpacing * (layerIndex + 1);
      const displayCount = Math.min(layer.neurons, maxDisplayNeurons);
      const neuronRadius = Math.max(6, Math.min(14, 150 / Math.max(1, displayCount)));
      const availableHeight = height - 100;
      const spacing = Math.min(availableHeight / (displayCount + 1), 40);
      const startY = (height - (displayCount - 1) * spacing) / 2;

      // Single layer uses input color, first layer is input, last is output, middle are hidden
      const color = totalLayers === 1 ? LAYER_COLORS.input :
                    layerIndex === 0 ? LAYER_COLORS.input :
                    layerIndex === totalLayers - 1 ? LAYER_COLORS.output :
                    LAYER_COLORS.hidden;

      for (let i = 0; i < displayCount; i++) {
        neurons.push({ x, y: startY + i * spacing, layerIndex, color });
      }

      return neurons;
    });

    // Draw connections (only if more than 1 layer)
    ctx.lineWidth = 1;
    for (let l = 0; l < neuronsByLayer.length - 1; l++) {
      const currentLayer = neuronsByLayer[l];
      const nextLayer = neuronsByLayer[l + 1];

      for (const from of currentLayer) {
        for (const to of nextLayer) {
          const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
          gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.15)');
          ctx.beginPath();
          ctx.strokeStyle = gradient;
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        }
      }
    }

    // Draw neurons
    neuronsByLayer.forEach((layerNeurons, layerIndex) => {
      layerNeurons.forEach((neuron) => {
        const radius = 8;

        // Glow
        const glow = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, radius * 3);
        glow.addColorStop(0, `${neuron.color}40`);
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(neuron.x, neuron.y, radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Body
        const body = ctx.createRadialGradient(neuron.x - 2, neuron.y - 2, 0, neuron.x, neuron.y, radius);
        body.addColorStop(0, neuron.color);
        body.addColorStop(1, `${neuron.color}80`);
        ctx.beginPath();
        ctx.fillStyle = body;
        ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = neuron.color;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Labels
      const layer = layers[layerIndex];
      const labelX = layerNeurons[0]?.x || 0;
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      
      // Layer label - simple naming
      const label = `Layer ${layerIndex + 1}`;
      ctx.fillText(label, labelX, height - 30);
      
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(`${layer.neurons} neuron${layer.neurons !== 1 ? 's' : ''}`, labelX, height - 16);
    });
  }, [layers, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[300px]">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="rounded-lg"
      />
    </div>
  );
}

// Overfitting Risk Badge Component
function OverfittingRiskBadge({ risk }: { risk: 'low' | 'moderate' | 'high' }) {
  const config = {
    low: { color: 'bg-green-500', label: '🟢 Low Risk', textColor: 'text-green-400' },
    moderate: { color: 'bg-yellow-500', label: '🟡 Moderate Risk', textColor: 'text-yellow-400' },
    high: { color: 'bg-red-500', label: '🔴 High Risk', textColor: 'text-red-400' },
  };

  const { label, textColor } = config[risk];

  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-medium ${textColor}`}>{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            <p>This is a heuristic estimate based on model capacity vs dataset size. Not a guaranteed prediction.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Builder Tab Component
function BuilderTab() {
  const { network, trainingSamples, setLayerCount, setNeuronsForLayer, setTrainingSamples, resetNetwork } = useNeuralNetworkStore();

  const handleLayerCountChange = (value: string) => {
    const count = parseInt(value) || 1;
    setLayerCount(count);
  };

  const handleTrainingSamplesChange = (value: string) => {
    const samples = parseInt(value) || 1;
    setTrainingSamples(samples);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Canvas Area */}
      <div className="flex-1 min-h-[300px] bg-gradient-to-br from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f] rounded-lg overflow-hidden">
        <NetworkCanvas layers={network.layers} />
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-4">
        {/* Layer Count */}
        <div className="flex items-center gap-4">
          <Label className="text-sm text-gray-300 w-32">Number of Layers</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={network.layers.length}
            onChange={(e) => handleLayerCountChange(e.target.value)}
            className="w-24 bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Neurons per Layer */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Neurons per Layer</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-2">
            {network.layers.map((layer, idx) => (
              <div key={layer.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16 truncate">
                  Layer {idx + 1}
                </span>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={layer.neurons}
                  onChange={(e) => setNeuronsForLayer(layer.id, parseInt(e.target.value) || 1)}
                  className="w-20 h-8 text-xs bg-white/5 border-white/10 text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Training Samples */}
        <div className="flex items-center gap-4">
          <Label className="text-sm text-gray-300 w-32">Training Samples</Label>
          <Input
            type="number"
            min={1}
            max={10000000}
            value={trainingSamples}
            onChange={(e) => handleTrainingSamplesChange(e.target.value)}
            className="w-24 bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={resetNetwork} variant="outline" className="border-white/10 hover:bg-white/5">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

// Code Tab Component
function CodeTab() {
  const { network, codeOptions, setFramework } = useNeuralNetworkStore();
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    return getCode(network.layers, codeOptions.framework, codeOptions.className);
  }, [network.layers, codeOptions.framework, codeOptions.className]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = getFileName(codeOptions.framework, codeOptions.className);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Framework Tabs */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {(['pytorch', 'tensorflow', 'jax'] as Framework[]).map((fw) => (
            <button
              key={fw}
              onClick={() => setFramework(fw)}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                codeOptions.framework === fw
                  ? 'bg-violet-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {fw === 'tensorflow' ? 'TensorFlow' : fw.charAt(0).toUpperCase() + fw.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button onClick={handleCopy} variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
            {copied ? <Check className="w-4 h-4 mr-1 text-green-400" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 bg-[#0d0d12] rounded-lg border border-white/5 overflow-hidden">
        <pre className="p-4 text-xs font-mono text-gray-300 leading-relaxed overflow-auto h-full">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

// Info Tab Component
function InfoTab() {
  const { network, trainingSamples } = useNeuralNetworkStore();
  const totalParams = calculateParameters(network.layers);
  const totalNeurons = network.layers.reduce((sum, l) => sum + l.neurons, 0);
  const overfittingRisk = calculateOverfittingRisk(totalParams, trainingSamples);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Architecture Summary</h3>
        <div className="bg-white/5 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Layers</span>
            <span className="text-white font-mono">{network.layers.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Neurons</span>
            <span className="text-white font-mono">{totalNeurons.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Parameters</span>
            <span className="text-violet-400 font-mono">{totalParams.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Training Samples</span>
            <span className="text-white font-mono">{trainingSamples.toLocaleString()}</span>
          </div>
          
          {/* Overfitting Risk Indicator */}
          <div className="pt-2 border-t border-white/5 mt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Overfitting Risk</span>
              <OverfittingRiskBadge risk={overfittingRisk} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-3">Layer Details</h3>
        <div className="space-y-2">
          {network.layers.map((layer, idx) => {
            const isInput = idx === 0 && network.layers.length > 1;
            const isOutput = idx === network.layers.length - 1 && network.layers.length > 1;
            const layerType = network.layers.length === 1 ? 'Layer' :
                              isInput ? 'Input' : 
                              isOutput ? 'Output' : 'Hidden';
            const color = network.layers.length === 1 ? LAYER_COLORS.input :
                          isInput ? LAYER_COLORS.input : 
                          isOutput ? LAYER_COLORS.output : 
                          LAYER_COLORS.hidden;

            return (
              <div key={layer.id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <div className="flex-1">
                  <div className="text-sm text-white">{layerType} {idx + 1}</div>
                  <div className="text-xs text-gray-500">{layer.neurons} neuron{layer.neurons !== 1 ? 's' : ''}</div>
                </div>
                {idx > 0 && (
                  <div className="text-xs text-gray-500">
                    → {network.layers[idx - 1].neurons} × {layer.neurons} + {layer.neurons} = {(network.layers[idx - 1].neurons * layer.neurons + layer.neurons).toLocaleString()} params
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-3">About</h3>
        <div className="text-sm text-gray-400 space-y-2">
          <p>This neural network visualizer allows you to design and understand feedforward neural networks.</p>
          <p>Configure the number of layers and neurons per layer, then export production-ready code for PyTorch, TensorFlow, or JAX.</p>
        </div>
      </div>
    </div>
  );
}

// Main Page
export default function NeuralNetworkVisualizer() {
  const [activeTab, setActiveTab] = useState('builder');

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white">
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="bg-white/5 border border-white/5 p-1 w-fit">
            <TabsTrigger value="builder" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white">
              <Network className="w-4 h-4 mr-2" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white">
              <Code2 className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white">
              <Info className="w-4 h-4 mr-2" />
              Info
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 flex-1 overflow-auto">
            <TabsContent value="builder" className="h-full mt-0">
              <BuilderTab />
            </TabsContent>
            <TabsContent value="code" className="h-full mt-0">
              <CodeTab />
            </TabsContent>
            <TabsContent value="info" className="mt-0">
              <InfoTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
