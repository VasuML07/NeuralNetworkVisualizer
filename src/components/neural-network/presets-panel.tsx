'use client';

import React from 'react';
import { useNeuralNetworkStore, NETWORK_PRESETS } from '@/store/neural-network-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Sparkles, Network, Brain, ArrowLeftRight, Eye } from 'lucide-react';

const CATEGORY_ICONS = {
  mlp: Network,
  cnn: Layers,
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

export function PresetsPanel() {
  const { loadPreset, network } = useNeuralNetworkStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium text-white">Architecture Templates</h3>
        <Badge variant="outline" className="text-[10px] border-white/20 text-gray-400">
          {NETWORK_PRESETS.length} presets
        </Badge>
      </div>
      
      <div className="grid gap-2">
        {NETWORK_PRESETS.map((preset) => {
          const Icon = CATEGORY_ICONS[preset.category];
          const isActive = network.name === preset.name;
          
          return (
            <Card
              key={preset.id}
              className={`cursor-pointer transition-all duration-200 border ${
                isActive 
                  ? 'border-violet-500/50 bg-violet-500/10' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
              }`}
              onClick={() => loadPreset(preset.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${CATEGORY_COLORS[preset.category]} flex items-center justify-center shrink-0`}>
                    <Icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white truncate">{preset.name}</h4>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-violet-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{preset.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] h-4 border-white/10 text-gray-500">
                        {preset.layers.length} layers
                      </Badge>
                      <Badge variant="outline" className="text-[10px] h-4 border-white/10 text-gray-500 uppercase">
                        {preset.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
