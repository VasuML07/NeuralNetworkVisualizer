'use client';

import { useMemo, useState } from 'react';
import { NetworkConfig } from '@/lib/neural-network-types';

interface ModelComplexityProps {
  config: NetworkConfig;
}

type Precision = 'float32' | 'float16' | 'float64';

interface LayerStats {
  name: string;
  inputSize: number;
  outputSize: number;
  parameters: number;
  flops: number;
  memoryBytes: number;
}

export function ModelComplexity({ config }: ModelComplexityProps) {
  const [precision, setPrecision] = useState<Precision>('float32');

  const bytesPerParam = {
    float16: 2,
    float32: 4,
    float64: 8,
  };

  const stats = useMemo(() => {
    const layers: LayerStats[] = [];
    let totalParams = 0;
    let totalFlops = 0;

    let prevSize = config.inputLayer.neurons;

    // Hidden layers
    config.hiddenLayers.forEach((layer, i) => {
      const params = prevSize * layer.neurons + layer.neurons;
      const flops = 2 * prevSize * layer.neurons;
      
      layers.push({
        name: `Hidden ${i + 1}`,
        inputSize: prevSize,
        outputSize: layer.neurons,
        parameters: params,
        flops: flops,
        memoryBytes: params * bytesPerParam[precision],
      });

      totalParams += params;
      totalFlops += flops;
      prevSize = layer.neurons;
    });

    // Output layer
    const outputParams = prevSize * config.outputLayer.neurons + config.outputLayer.neurons;
    const outputFlops = 2 * prevSize * config.outputLayer.neurons;
    
    layers.push({
      name: 'Output',
      inputSize: prevSize,
      outputSize: config.outputLayer.neurons,
      parameters: outputParams,
      flops: outputFlops,
      memoryBytes: outputParams * bytesPerParam[precision],
    });

    totalParams += outputParams;
    totalFlops += outputFlops;

    const totalMemory = totalParams * bytesPerParam[precision];

    return {
      layers,
      totalParams,
      totalFlops,
      totalMemory,
    };
  }, [config, precision]);

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toString();
  };

  const formatMemory = (bytes: number): string => {
    if (bytes >= 1e9) return (bytes / 1e9).toFixed(2) + ' GB';
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(2) + ' MB';
    if (bytes >= 1e3) return (bytes / 1e3).toFixed(2) + ' KB';
    return bytes + ' B';
  };

  const getWarning = () => {
    if (stats.totalParams > 10_000_000) {
      return { type: 'high', message: '⚠️ Very large model – requires significant compute resources' };
    }
    if (stats.totalParams > 1_000_000) {
      return { type: 'medium', message: '⚠️ Large model – may require high compute resources' };
    }
    return null;
  };

  const warning = getWarning();
  const maxLayerParams = Math.max(...stats.layers.map(l => l.parameters), 1);

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold">Model Complexity</h2>
            <p className="text-sm opacity-60 mt-1">Resource estimates for your network</p>
          </div>
          
          {/* Precision Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-60">Precision:</span>
            <div className="flex rounded-lg overflow-hidden border border-[var(--border)]">
              {(['float16', 'float32', 'float64'] as Precision[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPrecision(p)}
                  className={`px-3 py-1.5 text-xs transition-colors ${
                    precision === p 
                      ? 'bg-[var(--muted)]' 
                      : 'bg-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="text-xs opacity-60 mb-1">Total Parameters</div>
            <div className="text-2xl font-semibold">{formatNumber(stats.totalParams)}</div>
            <div className="text-xs opacity-40 mt-1">{stats.totalParams.toLocaleString()}</div>
          </div>
          
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="text-xs opacity-60 mb-1">Memory Usage</div>
            <div className="text-2xl font-semibold">{formatMemory(stats.totalMemory)}</div>
            <div className="text-xs opacity-40 mt-1">{precision} precision</div>
          </div>
          
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="text-xs opacity-60 mb-1">Compute Cost</div>
            <div className="text-2xl font-semibold">{formatNumber(stats.totalFlops)} FLOPs</div>
            <div className="text-xs opacity-40 mt-1">Forward pass</div>
          </div>
        </div>

        {/* Warning */}
        {warning && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm border ${
            warning.type === 'high' 
              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}>
            {warning.message}
          </div>
        )}

        {/* Layer Breakdown */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-4">Layer Breakdown</h3>
          
          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card)]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                  <th className="text-left text-xs font-medium opacity-60 px-4 py-3">Layer</th>
                  <th className="text-right text-xs font-medium opacity-60 px-4 py-3">Input</th>
                  <th className="text-right text-xs font-medium opacity-60 px-4 py-3">Output</th>
                  <th className="text-right text-xs font-medium opacity-60 px-4 py-3">Parameters</th>
                  <th className="text-right text-xs font-medium opacity-60 px-4 py-3">FLOPs</th>
                  <th className="text-left text-xs font-medium opacity-60 px-4 py-3 w-32">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {stats.layers.map((layer, i) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-sm">{layer.name}</td>
                    <td className="px-4 py-3 text-sm opacity-60 text-right">{layer.inputSize}</td>
                    <td className="px-4 py-3 text-sm opacity-60 text-right">{layer.outputSize}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">{layer.parameters.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm opacity-60 text-right font-mono">{formatNumber(layer.flops)}</td>
                    <td className="px-4 py-3">
                      <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${(layer.parameters / maxLayerParams) * 100}%`,
                            backgroundColor: 'var(--foreground)',
                            opacity: 0.5
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formula Reference */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h4 className="text-xs font-medium opacity-60 mb-3">Calculation Reference</h4>
          <div className="space-y-2 text-xs opacity-50 font-mono">
            <div>Parameters = (input × neurons) + neurons</div>
            <div>FLOPs = 2 × input × neurons</div>
            <div>Memory = Parameters × {bytesPerParam[precision]} bytes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
