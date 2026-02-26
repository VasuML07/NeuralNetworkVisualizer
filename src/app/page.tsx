'use client';

import { useState } from 'react';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';
import { NetworkBuilder } from '@/components/tabs/NetworkBuilder';
import { Visualization } from '@/components/tabs/Visualization';
import { CodeGenerator } from '@/components/tabs/CodeGenerator';
import { ModelComplexity } from '@/components/tabs/ModelComplexity';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Brain, Box, Code, BarChart3, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function Home() {
  const {
    config,
    updateInputNeurons,
    updateOutputNeurons,
    updateOutputActivation,
    addHiddenLayer,
    removeHiddenLayer,
    updateHiddenLayer,
    updateLearningRate,
    updateOptimizer,
    updateBatchSize,
    resetConfig,
  } = useNetworkConfig();

  const [activeTab, setActiveTab] = useState('builder');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--background)]">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg dark:bg-white bg-slate-900 flex items-center justify-center">
            <Brain className="w-4 h-4 dark:text-black text-white" />
          </div>
          <span className="text-sm font-medium">Neural Network Lab</span>
        </div>
        
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
      </header>

      {/* Content */}
      <main className="h-[calc(100vh-3.5rem)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          {/* Tabs */}
          <div className="px-6 pt-4">
            <TabsList className="bg-transparent p-0 h-auto gap-1">
              <TabsTrigger 
                value="builder"
                className="px-4 py-2 rounded-lg text-sm data-[state=active]:bg-[var(--muted)] data-[state=inactive]:opacity-60"
              >
                <Box className="w-4 h-4 mr-2" />
                Build
              </TabsTrigger>
              <TabsTrigger 
                value="visualization"
                className="px-4 py-2 rounded-lg text-sm data-[state=active]:bg-[var(--muted)] data-[state=inactive]:opacity-60"
              >
                <Brain className="w-4 h-4 mr-2" />
                Visualize
              </TabsTrigger>
              <TabsTrigger 
                value="code"
                className="px-4 py-2 rounded-lg text-sm data-[state=active]:bg-[var(--muted)] data-[state=inactive]:opacity-60"
              >
                <Code className="w-4 h-4 mr-2" />
                Code
              </TabsTrigger>
              <TabsTrigger 
                value="complexity"
                className="px-4 py-2 rounded-lg text-sm data-[state=active]:bg-[var(--muted)] data-[state=inactive]:opacity-60"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Complexity
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <TabsContent value="builder" className="flex-1 m-0 overflow-hidden">
            <NetworkBuilder
              config={config}
              onUpdateInputNeurons={updateInputNeurons}
              onUpdateOutputNeurons={updateOutputNeurons}
              onUpdateOutputActivation={updateOutputActivation}
              onAddHiddenLayer={addHiddenLayer}
              onRemoveHiddenLayer={removeHiddenLayer}
              onUpdateHiddenLayer={updateHiddenLayer}
              onUpdateLearningRate={updateLearningRate}
              onUpdateOptimizer={updateOptimizer}
              onUpdateBatchSize={updateBatchSize}
              onReset={resetConfig}
              onProceed={() => setActiveTab('visualization')}
            />
          </TabsContent>

          <TabsContent value="visualization" className="flex-1 m-0 overflow-hidden">
            <Visualization config={config} />
          </TabsContent>

          <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
            <CodeGenerator config={config} />
          </TabsContent>

          <TabsContent value="complexity" className="flex-1 m-0 overflow-hidden">
            <ModelComplexity config={config} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
