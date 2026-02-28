'use client';

import React from 'react';
import { useNeuralNetworkStore } from '@/store/neural-network-store';
import { Framework } from '@/types/neural-network';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Code2, Copy, Download, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CodeSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const FRAMEWORKS: { value: Framework; label: string }[] = [
  { value: 'pytorch', label: 'PyTorch' },
  { value: 'tensorflow', label: 'TensorFlow' },
  { value: 'jax', label: 'JAX' },
];

export function CodeSection({ isExpanded, onToggle }: CodeSectionProps) {
  const { codeOptions, setCodeOptions, network } = useNeuralNetworkStore();
  const [copied, setCopied] = React.useState(false);

  // Simple code preview
  const codePreview = `class ${codeOptions.className}(nn.Module):
    def __init__(self):
        super().__init__()
        ${network.layers.map(l => `# ${l.name}: ${l.units} units`).join('\n        ')}
    
    def forward(self, x):
        return x`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codePreview);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([codePreview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${codeOptions.className.toLowerCase()}.py`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Export Code</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Framework */}
          <div className="space-y-1">
            <Label className="text-[10px] text-gray-500">Framework</Label>
            <Select
              value={codeOptions.framework}
              onValueChange={(value: Framework) => setCodeOptions({ framework: value })}
            >
              <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                {FRAMEWORKS.map(fw => (
                  <SelectItem key={fw.value} value={fw.value}>
                    {fw.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Include Training */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-400">Include Training Code</Label>
            <Switch
              checked={codeOptions.includeTraining}
              onCheckedChange={(checked) => setCodeOptions({ includeTraining: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 h-7 text-xs border-white/10"
            >
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1 h-7 text-xs border-white/10"
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
