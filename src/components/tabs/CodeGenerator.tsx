'use client';

import { useState } from 'react';
import { NetworkConfig } from '@/lib/neural-network-types';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download } from 'lucide-react';

interface CodeGeneratorProps {
  config: NetworkConfig;
}

type FrameworkType = 'pytorch' | 'tensorflow';

export function CodeGenerator({ config }: CodeGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const [framework, setFramework] = useState<FrameworkType>('pytorch');

  const generatePyTorchCode = () => {
    const layers = config.hiddenLayers.map((layer, i) => {
      const inputSize = i === 0 ? config.inputLayer.neurons : config.hiddenLayers[i - 1].neurons;
      return `    nn.Linear(${inputSize}, ${layer.neurons}),
    nn.${getPyTorchActivationName(layer.activation)}(),`;
    }).join('\n');
    
    const lastHiddenSize = config.hiddenLayers.length > 0 
      ? config.hiddenLayers[config.hiddenLayers.length - 1].neurons 
      : config.inputLayer.neurons;

    return `import torch
import torch.nn as nn

class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.model = nn.Sequential(
${layers}
            nn.Linear(${lastHiddenSize}, ${config.outputLayer.neurons}),
            nn.${getPyTorchActivationName(config.outputLayer.activation)}()
        )
    
    def forward(self, x):
        return self.model(x)

model = NeuralNetwork()
criterion = nn.${config.outputLayer.activation === 'sigmoid' ? 'BCELoss()' : 'MSELoss()'}
optimizer = torch.optim.${config.optimizer.charAt(0).toUpperCase() + config.optimizer.slice(1)}(model.parameters(), lr=${config.learningRate})

# Training
for epoch in range(1000):
    optimizer.zero_grad()
    output = model(X)
    loss = criterion(output, y)
    loss.backward()
    optimizer.step()
`;
  };

  const generateTensorFlowCode = () => {
    const layers = config.hiddenLayers.map((layer) => {
      return `    layers.Dense(${layer.neurons}, activation='${layer.activation}'),`;
    }).join('\n');

    return `import tensorflow as tf
from tensorflow.keras import layers

model = tf.keras.Sequential([
    layers.Input(shape=(${config.inputLayer.neurons},)),
${layers}
    layers.Dense(${config.outputLayer.neurons}, activation='${config.outputLayer.activation}')
])

model.compile(
    optimizer='${config.optimizer}',
    loss='${config.outputLayer.activation === 'sigmoid' ? 'binary_crossentropy' : 'mse'}',
    metrics=['accuracy']
)

model.fit(X, y, epochs=1000, batch_size=${config.batchSize})
`;
  };

  const generateCode = () => {
    return framework === 'pytorch' ? generatePyTorchCode() : generateTensorFlowCode();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = generateCode();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = framework === 'pytorch' ? 'model_pytorch.py' : 'model_tensorflow.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const code = generateCode();
  const lines = code.split('\n');

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Generated Code</h2>
            <p className="text-sm opacity-60 mt-1">Export your network architecture</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Framework Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-[var(--border)]">
              <button
                className={`px-4 py-2 text-sm transition-colors ${
                  framework === 'pytorch' 
                    ? 'bg-[var(--muted)]' 
                    : 'bg-transparent opacity-60 hover:opacity-100'
                }`}
                onClick={() => setFramework('pytorch')}
              >
                PyTorch
              </button>
              <button
                className={`px-4 py-2 text-sm transition-colors ${
                  framework === 'tensorflow' 
                    ? 'bg-[var(--muted)]' 
                    : 'bg-transparent opacity-60 hover:opacity-100'
                }`}
                onClick={() => setFramework('tensorflow')}
              >
                TensorFlow
              </button>
            </div>
          </div>
        </div>

        {/* Code Block */}
        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card)]">
          {/* Code Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs opacity-50">model.py</span>
          </div>
          
          {/* Code Content */}
          <div className="p-4 overflow-auto max-h-[400px]">
            <pre className="text-sm font-mono">
              {lines.map((line, i) => (
                <div key={i} className="flex leading-7">
                  <span className="w-8 opacity-40 text-right mr-4 select-none text-xs">
                    {i + 1}
                  </span>
                  <span className={getLineClass(line)}>
                    {line || ' '}
                  </span>
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}

function getPyTorchActivationName(activation: string): string {
  const mapping: Record<string, string> = {
    'relu': 'ReLU()',
    'sigmoid': 'Sigmoid()',
    'tanh': 'Tanh()',
    'leaky_relu': 'LeakyReLU()',
    'linear': 'Identity()',
    'softmax': 'Softmax()',
    'elu': 'ELU()',
  };
  return mapping[activation] || 'ReLU()';
}

function getLineClass(line: string): string {
  if (line.trim().startsWith('#')) {
    return 'opacity-50';
  }
  if (line.includes('import ')) {
    return 'text-purple-500 dark:text-purple-400';
  }
  if (line.includes('class ') || line.includes('def ')) {
    return 'text-cyan-600 dark:text-cyan-400';
  }
  if (line.includes('nn.') || line.includes('layers.') || line.includes('tf.')) {
    return 'text-blue-600 dark:text-blue-400';
  }
  if (line.includes('=')) {
    return 'text-amber-600 dark:text-amber-300';
  }
  if (line.includes('for ') || line.includes('if ')) {
    return 'text-pink-600 dark:text-pink-400';
  }
  return '';
}
