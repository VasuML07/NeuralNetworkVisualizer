// Simplified types for Neural Network Visualizer
// Users can only configure: number of layers and neurons per layer

export type Framework = 'pytorch' | 'tensorflow' | 'jax';

export interface LayerConfig {
  id: string;
  neurons: number;
}

export interface NetworkState {
  layers: LayerConfig[];
}

export interface CodeGenerationOptions {
  framework: Framework;
  className: string;
}

// Default colors for visualization
export const LAYER_COLORS = {
  input: '#3b82f6',
  hidden: '#8b5cf6',
  output: '#22c55e',
};

// Helper to generate unique IDs
export const generateId = () => Math.random().toString(36).substring(2, 11);
