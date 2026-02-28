'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { NeuralLayer, LAYER_COLORS, ACTIVATION_COLORS } from '@/types/neural-network';
import { useNeuralNetworkStore } from '@/store/neural-network-store';

interface NetworkCanvasProps {
  width: number;
  height: number;
}

interface NeuronPos {
  x: number;
  y: number;
  radius: number;
  layerIndex: number;
  neuronIndex: number;
  color: string;
}

interface ConnectionLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  weight: number;
}

export function NetworkCanvas({ width, height }: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { network, animation, zoom, pan, selectedLayerId, selectLayer } = useNeuralNetworkStore();
  const [hoveredNeuron, setHoveredNeuron] = useState<NeuronPos | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getNeuronsForLayer = useCallback((layer: NeuralLayer, layerIndex: number, totalLayers: number): NeuronPos[] => {
    const neurons: NeuronPos[] = [];
    const maxNeurons = 12; // Visual limit
    const displayUnits = Math.min(layer.units, maxNeurons);
    
    const layerSpacing = width / (totalLayers + 1);
    const x = layerSpacing * (layerIndex + 1);
    
    const neuronRadius = Math.max(6, Math.min(16, 200 / displayUnits));
    const availableHeight = height - 80;
    const neuronSpacing = Math.min(availableHeight / (displayUnits + 1), 50);
    
    const startY = (height - (displayUnits - 1) * neuronSpacing) / 2;
    
    const baseColor = LAYER_COLORS[layer.type];
    const activationColor = layer.activation ? ACTIVATION_COLORS[layer.activation] : baseColor;
    
    for (let i = 0; i < displayUnits; i++) {
      neurons.push({
        x,
        y: startY + i * neuronSpacing,
        radius: neuronRadius,
        layerIndex,
        neuronIndex: i,
        color: i === 0 ? baseColor : activationColor,
      });
    }
    
    // Add indicator if there are more neurons
    if (layer.units > maxNeurons) {
      neurons.push({
        x,
        y: startY + displayUnits * neuronSpacing,
        radius: 4,
        layerIndex,
        neuronIndex: -1, // Indicator
        color: baseColor,
      });
    }
    
    return neurons;
  }, [width, height]);

  const generateConnections = useCallback((neuronsByLayer: NeuronPos[][]): ConnectionLine[] => {
    const connections: ConnectionLine[] = [];
    
    for (let l = 0; l < neuronsByLayer.length - 1; l++) {
      const currentLayer = neuronsByLayer[l];
      const nextLayer = neuronsByLayer[l + 1];
      
      for (const from of currentLayer) {
        for (const to of nextLayer) {
          if (from.neuronIndex === -1 || to.neuronIndex === -1) continue;
          connections.push({
            x1: from.x,
            y1: from.y,
            x2: to.x,
            y2: to.y,
            weight: Math.random() * 0.5 + 0.25,
          });
        }
      }
    }
    
    return connections;
  }, []);

  const drawNetwork = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    // Clear canvas
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid pattern
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
    
    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Get neurons for each layer
    const neuronsByLayer = network.layers.map((layer, index) => 
      getNeuronsForLayer(layer, index, network.layers.length)
    );
    
    // Generate connections
    const connections = generateConnections(neuronsByLayer);
    
    // Draw connections with animation
    const animProgress = animation.isPlaying 
      ? (animation.currentStep % 100) / 100 
      : 0;
    
    connections.forEach((conn, index) => {
      const gradient = ctx.createLinearGradient(conn.x1, conn.y1, conn.x2, conn.y2);
      
      if (animation.isPlaying) {
        const lineProgress = (animProgress + index * 0.001) % 1;
        const alpha = 0.1 + 0.15 * Math.sin(lineProgress * Math.PI * 2);
        gradient.addColorStop(0, `rgba(139, 92, 246, ${alpha})`);
        gradient.addColorStop(lineProgress, `rgba(59, 130, 246, ${alpha + 0.3})`);
        gradient.addColorStop(1, `rgba(139, 92, 246, ${alpha})`);
      } else {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.15)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.15)');
      }
      
      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.moveTo(conn.x1, conn.y1);
      ctx.lineTo(conn.x2, conn.y2);
      ctx.stroke();
    });
    
    // Draw neurons
    neuronsByLayer.forEach((layerNeurons, layerIndex) => {
      const layer = network.layers[layerIndex];
      const isSelected = selectedLayerId === layer.id;
      
      layerNeurons.forEach((neuron) => {
        const isHovered = hoveredNeuron?.layerIndex === layerIndex && 
                         hoveredNeuron?.neuronIndex === neuron.neuronIndex;
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, neuron.radius * 3
        );
        glowGradient.addColorStop(0, `${neuron.color}40`);
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.fillStyle = glowGradient;
        ctx.arc(neuron.x, neuron.y, neuron.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Neuron body
        const bodyGradient = ctx.createRadialGradient(
          neuron.x - neuron.radius * 0.3, 
          neuron.y - neuron.radius * 0.3, 
          0,
          neuron.x, neuron.y, neuron.radius
        );
        bodyGradient.addColorStop(0, `${neuron.color}`);
        bodyGradient.addColorStop(1, `${neuron.color}80`);
        
        ctx.beginPath();
        ctx.fillStyle = bodyGradient;
        ctx.arc(neuron.x, neuron.y, neuron.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = isSelected ? '#ffffff' : `${neuron.color}`;
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();
        
        // Highlight on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.arc(neuron.x, neuron.y, neuron.radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Pulsing effect during animation
        if (animation.isPlaying) {
          const pulseRadius = neuron.radius + Math.sin(time * 0.003 + layerIndex) * 3;
          ctx.beginPath();
          ctx.strokeStyle = `${neuron.color}40`;
          ctx.lineWidth = 2;
          ctx.arc(neuron.x, neuron.y, pulseRadius + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      
      // Draw layer label
      const labelX = layerNeurons[0]?.x || 0;
      const labelY = height - 25;
      
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      ctx.fillText(layer.name, labelX, labelY);
      
      // Units info
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillText(`${layer.units} units`, labelX, labelY + 14);
    });
    
    ctx.restore();
    
    // Draw title
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(network.name, 20, 30);
    
    // Draw zoom level
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(zoom * 100)}%`, width - 20, 30);
  }, [network, animation, zoom, pan, selectedLayerId, hoveredNeuron, width, height, getNeuronsForLayer, generateConnections]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Enable high DPI rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    let startTime = performance.now();
    
    const animate = (time: number) => {
      drawNetwork(ctx, time - startTime);
      
      if (animation.isPlaying) {
        const { setAnimation } = useNeuralNetworkStore.getState();
        setAnimation({ currentStep: animation.currentStep + 1 });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [drawNetwork, animation.isPlaying, width, height]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    if (isDragging) {
      const { setPan } = useNeuralNetworkStore.getState();
      setPan({
        x: e.clientX - rect.left - dragStart.x,
        y: e.clientY - rect.top - dragStart.y,
      });
      return;
    }
    
    // Check if hovering over a neuron
    const neuronsByLayer = network.layers.map((layer, index) => 
      getNeuronsForLayer(layer, index, network.layers.length)
    );
    
    let found: NeuronPos | null = null;
    for (const layerNeurons of neuronsByLayer) {
      for (const neuron of layerNeurons) {
        const dx = x - neuron.x;
        const dy = y - neuron.y;
        if (Math.sqrt(dx * dx + dy * dy) < neuron.radius + 5) {
          found = neuron;
          break;
        }
      }
      if (found) break;
    }
    
    setHoveredNeuron(found);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left click
      if (hoveredNeuron) {
        const layer = network.layers[hoveredNeuron.layerIndex];
        selectLayer(layer.id);
      } else {
        setIsDragging(true);
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          setDragStart({
            x: e.clientX - rect.left - pan.x,
            y: e.clientY - rect.top - pan.y,
          });
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { setZoom } = useNeuralNetworkStore.getState();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(zoom + delta);
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        style={{ width, height, cursor: isDragging ? 'grabbing' : hoveredNeuron ? 'pointer' : 'grab' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="rounded-lg"
      />
      
      {/* Tooltip */}
      {hoveredNeuron && hoveredNeuron.neuronIndex !== -1 && (
        <div
          className="absolute pointer-events-none bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl"
          style={{ left: mousePos.x + 15, top: mousePos.y - 40 }}
        >
          <div className="font-medium text-white">
            {network.layers[hoveredNeuron.layerIndex].name}
          </div>
          <div className="text-gray-400 text-xs">
            Type: {network.layers[hoveredNeuron.layerIndex].type.toUpperCase()}
          </div>
          <div className="text-gray-400 text-xs">
            Activation: {network.layers[hoveredNeuron.layerIndex].activation}
          </div>
          {hoveredNeuron.neuronIndex === 0 && (
            <div className="text-gray-400 text-xs">
              Units: {network.layers[hoveredNeuron.layerIndex].units}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
