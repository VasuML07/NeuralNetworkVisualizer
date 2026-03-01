import { create } from 'zustand';
import { LayerConfig, NetworkState, CodeGenerationOptions, Framework, generateId } from '@/types/neural-network';

interface NeuralNetworkStore {
  // Network State - Only layers and neurons
  network: NetworkState;
  
  // Code Generation Options
  codeOptions: CodeGenerationOptions;
  
  // Actions
  setLayerCount: (count: number) => void;
  setNeuronsForLayer: (layerId: string, neurons: number) => void;
  setFramework: (framework: Framework) => void;
  setClassName: (name: string) => void;
  resetNetwork: () => void;
}

// Create default network with 1 layer and 1 neuron
const createDefaultNetwork = (): NetworkState => ({
  layers: [
    { id: generateId(), neurons: 1 },
  ],
});

export const useNeuralNetworkStore = create<NeuralNetworkStore>((set, get) => ({
  network: createDefaultNetwork(),
  
  codeOptions: {
    framework: 'pytorch',
    className: 'NeuralNetwork',
  },

  setLayerCount: (count: number) => {
    const { network } = get();
    const currentLayers = network.layers;
    
    // Minimum 1 layer, no maximum
    const newCount = Math.max(1, count);
    
    if (newCount === currentLayers.length) return;
    
    if (newCount > currentLayers.length) {
      // Add layers - preserve existing values
      const layersToAdd = newCount - currentLayers.length;
      const newLayers = [...currentLayers];
      
      for (let i = 0; i < layersToAdd; i++) {
        newLayers.push({
          id: generateId(),
          neurons: 1, // Default neurons for new layers
        });
      }
      
      set({ network: { layers: newLayers } });
    } else {
      // Remove layers (keep first ones)
      const newLayers = currentLayers.slice(0, newCount);
      set({ network: { layers: newLayers } });
    }
  },

  setNeuronsForLayer: (layerId: string, neurons: number) => {
    const { network } = get();
    const newLayers = network.layers.map(layer =>
      layer.id === layerId ? { ...layer, neurons: Math.max(1, neurons) } : layer
    );
    set({ network: { layers: newLayers } });
  },

  setFramework: (framework: Framework) => {
    set(state => ({ codeOptions: { ...state.codeOptions, framework } }));
  },

  setClassName: (name: string) => {
    set(state => ({ codeOptions: { ...state.codeOptions, className: name } }));
  },

  resetNetwork: () => {
    set({ network: createDefaultNetwork() });
  },
}));

// Utility function to calculate total parameters
export function calculateParameters(layers: LayerConfig[]): number {
  if (layers.length < 2) return 0;
  
  let total = 0;
  for (let i = 1; i < layers.length; i++) {
    const prevNeurons = layers[i - 1].neurons;
    const currNeurons = layers[i].neurons;
    total += prevNeurons * currNeurons + currNeurons; // weights + biases
  }
  return total;
}
