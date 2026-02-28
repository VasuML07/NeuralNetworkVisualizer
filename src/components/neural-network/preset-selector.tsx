'use client';

import React from 'react';
import { useNeuralNetworkStore, NETWORK_PRESETS } from '@/store/neural-network-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Network, Sparkles, Brain, ArrowLeftRight, Eye } from 'lucide-react';

const CATEGORY_ICONS = {
  mlp: Network,
  cnn: Eye,
  rnn: Brain,
  transformer: Sparkles,
  autoencoder: ArrowLeftRight,
};

const CATEGORY_COLORS = {
  mlp: 'from-violet-500/20 to-purple-500/20',
  cnn: 'from-amber-500/20 to-orange-500/20',
  rnn: 'from-pink-500/20 to-rose-500/20',
  transformer: 'from-cyan-500/20 to-blue-500/20',
  autoencoder: 'from-green-500/20 to-emerald-500/20',
};

export function PresetSelector() {
  const { loadPreset, network } = useNeuralNetworkStore();

  return (
    <ScrollArea className="h-[200px]">
      <div className="p-3 space-y-2">
        <p className="text-xs text-gray-500 mb-3">
          Choose a preset architecture to get started quickly
        </p>
        {NETWORK_PRESETS.map((preset) => {
          const Icon = CATEGORY_ICONS[preset.category];
          const isActive = network.name === preset.name;
          
          return (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-violet-500/20 border border-violet-500/30' 
                  : 'bg-white/[0.02] hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[preset.category]} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 text-white/80" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">{preset.name}</div>
                <div className="text-[10px] text-gray-500">{preset.layers.length} layers</div>
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-violet-500" />
              )}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
