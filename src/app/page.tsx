'use client';

import React, { useState, useRef, useEffect } from 'react';
import { NetworkCanvas } from '@/components/neural-network/network-canvas';
import { LayerConfigPanel } from '@/components/neural-network/layer-config-panel';
import { LayerList } from '@/components/neural-network/layer-list';
import { PresetsPanel } from '@/components/neural-network/presets-panel';
import { CodeGenerationPanel } from '@/components/neural-network/code-generation-panel';
import { AnimationControls } from '@/components/neural-network/animation-controls';
import { useNeuralNetworkStore } from '@/store/neural-network-store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Network, 
  Settings, 
  Code2, 
  Layers, 
  Sparkles, 
  RotateCcw,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

export default function NeuralNetworkVisualizer() {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { network, resetNetwork } = useNeuralNetworkStore();
  const [activeTab, setActiveTab] = useState('layers');

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
    toast.success('Network reset to default');
  };

  const handleShare = () => {
    const config = JSON.stringify(network, null, 2);
    navigator.clipboard.writeText(config);
    toast.success('Network config copied to clipboard!');
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] text-white overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Neural Network Visualizer
            </h1>
            <p className="text-xs text-gray-500">Design • Visualize • Understand</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-400 hover:text-white hover:bg-white/5"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Layer List & Presets */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-black/20 border-r border-white/10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="w-full justify-start px-2 pt-2 bg-transparent">
                  <TabsTrigger 
                    value="layers" 
                    className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
                  >
                    <Layers className="w-3.5 h-3.5 mr-1.5" />
                    Layers
                  </TabsTrigger>
                  <TabsTrigger 
                    value="presets"
                    className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Presets
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="layers" className="flex-1 mt-0 overflow-hidden">
                  <LayerList />
                </TabsContent>
                <TabsContent value="presets" className="flex-1 mt-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-3">
                      <PresetsPanel />
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-white/10" />

          {/* Center - Canvas */}
          <ResizablePanel defaultSize={55} minSize={40}>
            <div className="h-full flex flex-col">
              {/* Canvas Container */}
              <div 
                ref={containerRef}
                className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f18] to-[#0a0a0f]"
              >
                <NetworkCanvas 
                  width={dimensions.width} 
                  height={dimensions.height} 
                />
                
                {/* Floating Info Card */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                      <span className="text-xs text-gray-400">Interactive Mode</span>
                    </div>
                    <div className="h-3 w-px bg-white/20" />
                    <span className="text-xs text-gray-400">
                      Click neurons to select • Drag to pan • Scroll to zoom
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Animation Controls */}
              <AnimationControls />
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-px bg-white/10" />

          {/* Right Sidebar - Config & Code */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full bg-black/20 border-l border-white/10">
              <Tabs defaultValue="config" className="h-full flex flex-col">
                <TabsList className="w-full justify-start px-2 pt-2 bg-transparent">
                  <TabsTrigger 
                    value="config"
                    className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Config
                  </TabsTrigger>
                  <TabsTrigger 
                    value="code"
                    className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
                  >
                    <Code2 className="w-3.5 h-3.5 mr-1.5" />
                    Code
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="config" className="flex-1 mt-0 overflow-hidden">
                  <LayerConfigPanel />
                </TabsContent>
                <TabsContent value="code" className="flex-1 mt-0 overflow-hidden">
                  <CodeGenerationPanel />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-black/40 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Neural Network Visualizer v1.0</span>
          <span className="text-gray-600">|</span>
          <span>Built with Next.js & Canvas</span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            Total Parameters: <span className="text-violet-400 font-mono">
              {network.layers.reduce((sum, layer, idx) => {
                if (layer.type === 'dense' && idx > 0) {
                  const prevUnits = network.layers[idx - 1]?.units || 0;
                  return sum + (prevUnits * layer.units) + layer.units;
                }
                return sum;
              }, 0).toLocaleString()}
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}
