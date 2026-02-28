'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { 
  NetworkConfig, 
  ACTIVATION_FUNCTIONS, 
  LAYER_COLORS 
} from '@/lib/neural-network-types';

interface NetworkVisualizerProps {
  config: NetworkConfig;
}

export function NetworkVisualizer({ config }: NetworkVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width, 600),
          height: Math.max(rect.height, 400),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { width: svgWidth, height: svgHeight } = dimensions;
  const padding = { left: 100, right: 100, top: 70, bottom: 70 };
  const maxDisplayNeurons = 10;
  const neuronRadius = 14;

  // Calculate all layers with stable display count
  const allLayers = useMemo(() => {
    const layers: { 
      neurons: number; 
      displayNeurons: number;
      type: 'input' | 'hidden' | 'output'; 
      activation?: string; 
      dropout: number; 
      color: string 
    }[] = [];
    
    // Input layer
    layers.push({
      neurons: config.inputLayer.neurons,
      displayNeurons: Math.min(config.inputLayer.neurons, maxDisplayNeurons),
      type: 'input',
      color: LAYER_COLORS.input,
      dropout: 0,
    });
    
    // Hidden layers
    config.hiddenLayers.forEach(layer => {
      const activation = ACTIVATION_FUNCTIONS.find(a => a.value === layer.activation);
      layers.push({
        neurons: layer.neurons,
        displayNeurons: Math.min(layer.neurons, maxDisplayNeurons),
        type: 'hidden',
        activation: layer.activation,
        color: activation?.color || LAYER_COLORS.hidden,
        dropout: layer.dropout,
      });
    });
    
    // Output layer
    const outputActivation = ACTIVATION_FUNCTIONS.find(a => a.value === config.outputLayer.activation);
    layers.push({
      neurons: config.outputLayer.neurons,
      displayNeurons: Math.min(config.outputLayer.neurons, maxDisplayNeurons),
      type: 'output',
      activation: config.outputLayer.activation,
      color: outputActivation?.color || LAYER_COLORS.output,
      dropout: 0,
    });
    
    return layers;
  }, [config]);

  // Calculate stable positions
  const layerSpacing = (svgWidth - padding.left - padding.right) / Math.max(allLayers.length - 1, 1);
  const maxDisplay = Math.max(...allLayers.map(l => l.displayNeurons), 1);
  const neuronSpacing = Math.min(45, (svgHeight - padding.top - padding.bottom) / (maxDisplay + 1));

  // Pre-calculate ALL positions for stability
  const layerPositions = useMemo(() => {
    return allLayers.map((layer, layerIndex) => {
      const x = padding.left + layerIndex * layerSpacing;
      const displayCount = layer.displayNeurons;
      const totalHeight = (displayCount - 1) * neuronSpacing;
      const startY = (svgHeight - totalHeight) / 2;
      
      const neurons: { x: number; y: number; isEllipsis: boolean }[] = [];
      const needEllipsis = layer.neurons > maxDisplayNeurons;
      const ellipsisIndex = Math.floor(displayCount / 2);
      
      for (let i = 0; i < displayCount; i++) {
        neurons.push({
          x,
          y: startY + i * neuronSpacing,
          isEllipsis: needEllipsis && i === ellipsisIndex,
        });
      }
      
      return { x, neurons, layer };
    });
  }, [allLayers, layerSpacing, neuronSpacing, svgHeight]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="relative z-10"
      >
        <defs>
          {/* Neuron gradients */}
          {allLayers.map((layer, index) => (
            <radialGradient
              key={`gradient-${index}`}
              id={`neuron-gradient-${index}`}
              cx="30%"
              cy="30%"
              r="70%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.25" />
              <stop offset="60%" stopColor={layer.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={layer.color} stopOpacity="0.5" />
            </radialGradient>
          ))}
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connections - Draw between adjacent layers */}
        <g className="connections">
          {layerPositions.map((layerData, layerIndex) => {
            if (layerIndex === layerPositions.length - 1) return null;
            
            const nextLayerData = layerPositions[layerIndex + 1];
            const isHovered = hoveredLayer === layerIndex || hoveredLayer === layerIndex + 1;
            const layerColor = layerData.layer.color;
            const nextLayerColor = nextLayerData.layer.color;
            
            return layerData.neurons.map((fromNeuron, i1) => 
              nextLayerData.neurons.map((toNeuron, i2) => (
                <line
                  key={`conn-${layerIndex}-${i1}-${i2}`}
                  x1={fromNeuron.x}
                  y1={fromNeuron.y}
                  x2={toNeuron.x}
                  y2={toNeuron.y}
                  stroke={isHovered ? "#a78bfa" : "#8b8fa3"}
                  strokeWidth={isHovered ? 1.2 : 0.8}
                  strokeOpacity={isHovered ? 0.8 : 0.55}
                  className="transition-all duration-200"
                />
              ))
            );
          })}
        </g>

        {/* Neurons */}
        <g className="neurons">
          {layerPositions.map((layerData, layerIndex) => {
            const isLayerHovered = hoveredLayer === layerIndex;
            const showDropout = layerData.layer.dropout > 0;
            
            return layerData.neurons.map((neuron, neuronIndex) => (
              <g 
                key={`neuron-${layerIndex}-${neuronIndex}`}
                onMouseEnter={() => setHoveredLayer(layerIndex)}
                onMouseLeave={() => setHoveredLayer(null)}
                className="cursor-pointer"
              >
                {/* Neuron circle */}
                <circle
                  cx={neuron.x}
                  cy={neuron.y}
                  r={neuronRadius}
                  fill={`url(#neuron-gradient-${layerIndex})`}
                  stroke={layerData.layer.color}
                  strokeWidth={isLayerHovered ? 2.5 : 1.5}
                  filter={isLayerHovered ? 'url(#glow)' : undefined}
                  className="transition-all duration-150"
                  style={{
                    opacity: showDropout ? 1 - layerData.layer.dropout * 0.4 : 1,
                  }}
                />
                
                {/* Inner highlight */}
                <circle
                  cx={neuron.x - 4}
                  cy={neuron.y - 4}
                  r={3}
                  fill="white"
                  fillOpacity={0.35}
                />

                {/* Ellipsis for hidden neurons */}
                {neuron.isEllipsis && (
                  <text
                    x={neuron.x}
                    y={neuron.y + 4}
                    textAnchor="middle"
                    className="fill-white text-[11px] font-bold pointer-events-none"
                  >
                    ···
                  </text>
                )}

                {/* Dropout ring */}
                {showDropout && (
                  <circle
                    cx={neuron.x}
                    cy={neuron.y}
                    r={neuronRadius + 5}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    strokeOpacity={0.5}
                  />
                )}
              </g>
            ));
          })}
        </g>

        {/* Layer Labels */}
        <g className="labels">
          {layerPositions.map((layerData, index) => {
            const layer = layerData.layer;
            const x = layerData.x;
            
            return (
              <g key={`label-${index}`}>
                {/* Layer name */}
                <text
                  x={x}
                  y={28}
                  textAnchor="middle"
                  className="fill-white text-xs font-semibold"
                >
                  {layer.type === 'input' ? 'Input' : 
                   layer.type === 'output' ? 'Output' : 
                   `Hidden ${index}`}
                </text>
                
                {/* Neuron count */}
                <g transform={`translate(${x}, ${svgHeight - 35})`}>
                  <rect
                    x={-22}
                    y={-10}
                    width={44}
                    height={20}
                    rx={10}
                    fill="rgba(30, 41, 59, 0.9)"
                    stroke={layer.color}
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    className="fill-white text-[11px] font-medium"
                  >
                    {layer.neurons}
                  </text>
                </g>
                
                {/* Activation */}
                {layer.activation && (
                  <g transform={`translate(${x}, ${svgHeight - 58})`}>
                    <rect
                      x={-24}
                      y={-9}
                      width={48}
                      height={18}
                      rx={9}
                      fill={layer.color}
                      fillOpacity={0.15}
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      style={{ fill: layer.color }}
                      className="text-[10px] font-medium"
                    >
                      {ACTIVATION_FUNCTIONS.find(a => a.value === layer.activation)?.label}
                    </text>
                  </g>
                )}
                
                {/* Dropout */}
                {layer.dropout > 0 && (
                  <g transform={`translate(${x}, ${svgHeight - 80})`}>
                    <rect
                      x={-20}
                      y={-8}
                      width={40}
                      height={16}
                      rx={8}
                      fill="#06b6d4"
                      fillOpacity={0.15}
                    />
                    <text
                      x={0}
                      y={2}
                      textAnchor="middle"
                      className="fill-cyan-400 text-[9px]"
                    >
                      Drop {Math.round(layer.dropout * 100)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute top-3 right-3 z-20 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3">
        <div className="text-[10px] font-semibold text-slate-400 mb-2">LAYER TYPES</div>
        <div className="space-y-1.5">
          {[
            { color: LAYER_COLORS.input, label: 'Input' },
            { color: LAYER_COLORS.hidden, label: 'Hidden' },
            { color: LAYER_COLORS.output, label: 'Output' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-offset-slate-900"
                style={{ backgroundColor: item.color, ringColor: item.color }}
              />
              <span className="text-[11px] text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
