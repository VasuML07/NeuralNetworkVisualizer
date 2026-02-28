import { create } from 'zustand';
import { NeuralLayer, NetworkConfig, NetworkPreset, AnimationState, Framework, CodeGenerationOptions } from '@/types/neural-network';

const generateId = () => Math.random().toString(36).substring(2, 11);

const createDefaultLayer = (type: NeuralLayer['type'], index: number): NeuralLayer => {
  const baseLayer: NeuralLayer = {
    id: generateId(),
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${index + 1}`,
    units: 64,
    activation: 'relu',
    useBias: true,
    initializer: 'he_normal',
  };

  switch (type) {
    case 'input':
      return { ...baseLayer, units: 784, name: 'Input' };
    case 'dense':
      return { ...baseLayer, units: 128, activation: 'relu' };
    case 'conv2d':
      return { ...baseLayer, filters: 32, kernelSize: [3, 3], stride: [1, 1], padding: 'same', activation: 'relu' };
    case 'maxpool2d':
      return { ...baseLayer, kernelSize: [2, 2], stride: [2, 2], name: `MaxPool ${index + 1}` };
    case 'avgpool2d':
      return { ...baseLayer, kernelSize: [2, 2], stride: [2, 2], name: `AvgPool ${index + 1}` };
    case 'dropout':
      return { ...baseLayer, dropout: 0.5, name: `Dropout ${index + 1}` };
    case 'batchnorm':
      return { ...baseLayer, name: `BatchNorm ${index + 1}` };
    case 'lstm':
      return { ...baseLayer, units: 64, activation: 'tanh' };
    case 'gru':
      return { ...baseLayer, units: 64, activation: 'tanh' };
    case 'output':
      return { ...baseLayer, units: 10, activation: 'softmax', name: 'Output' };
    default:
      return baseLayer;
  }
};

export const NETWORK_PRESETS: NetworkPreset[] = [
  {
    id: 'mlp-basic',
    name: 'Basic MLP',
    description: 'Simple feedforward network for classification',
    category: 'mlp',
    inputShape: [784],
    layers: [
      createDefaultLayer('input', 0),
      { ...createDefaultLayer('dense', 0), id: generateId(), name: 'Hidden 1', units: 256 },
      { ...createDefaultLayer('dense', 1), id: generateId(), name: 'Hidden 2', units: 128 },
      { ...createDefaultLayer('dropout', 0), id: generateId(), dropout: 0.3 },
      { ...createDefaultLayer('output', 0), id: generateId(), units: 10 },
    ],
  },
  {
    id: 'mlp-deep',
    name: 'Deep MLP',
    description: 'Deep feedforward network with 5 hidden layers',
    category: 'mlp',
    inputShape: [784],
    layers: [
      createDefaultLayer('input', 0),
      { ...createDefaultLayer('dense', 0), id: generateId(), name: 'Hidden 1', units: 512 },
      { ...createDefaultLayer('batchnorm', 0), id: generateId() },
      { ...createDefaultLayer('dense', 1), id: generateId(), name: 'Hidden 2', units: 256 },
      { ...createDefaultLayer('dropout', 0), id: generateId(), dropout: 0.2 },
      { ...createDefaultLayer('dense', 2), id: generateId(), name: 'Hidden 3', units: 128 },
      { ...createDefaultLayer('dense', 3), id: generateId(), name: 'Hidden 4', units: 64 },
      { ...createDefaultLayer('output', 0), id: generateId(), units: 10 },
    ],
  },
  {
    id: 'cnn-mnist',
    name: 'CNN for MNIST',
    description: 'Convolutional network for image classification',
    category: 'cnn',
    inputShape: [28, 28, 1],
    layers: [
      createDefaultLayer('input', 0),
      { ...createDefaultLayer('conv2d', 0), id: generateId(), filters: 32, kernelSize: [3, 3], name: 'Conv 1' },
      { ...createDefaultLayer('maxpool2d', 0), id: generateId(), name: 'Pool 1' },
      { ...createDefaultLayer('conv2d', 1), id: generateId(), filters: 64, kernelSize: [3, 3], name: 'Conv 2' },
      { ...createDefaultLayer('maxpool2d', 1), id: generateId(), name: 'Pool 2' },
      { ...createDefaultLayer('flatten', 0), id: generateId(), name: 'Flatten' },
      { ...createDefaultLayer('dense', 0), id: generateId(), units: 128, name: 'FC 1' },
      { ...createDefaultLayer('dropout', 0), id: generateId(), dropout: 0.5 },
      { ...createDefaultLayer('output', 0), id: generateId(), units: 10 },
    ],
  },
  {
    id: 'cnn-vgg',
    name: 'VGG-style CNN',
    description: 'VGG-style convolutional network',
    category: 'cnn',
    inputShape: [224, 224, 3],
    layers: [
      createDefaultLayer('input', 0),
      { ...createDefaultLayer('conv2d', 0), id: generateId(), filters: 64, kernelSize: [3, 3], name: 'Conv 1' },
      { ...createDefaultLayer('conv2d', 1), id: generateId(), filters: 64, kernelSize: [3, 3], name: 'Conv 2' },
      { ...createDefaultLayer('maxpool2d', 0), id: generateId(), name: 'Pool 1' },
      { ...createDefaultLayer('conv2d', 2), id: generateId(), filters: 128, kernelSize: [3, 3], name: 'Conv 3' },
      { ...createDefaultLayer('conv2d', 3), id: generateId(), filters: 128, kernelSize: [3, 3], name: 'Conv 4' },
      { ...createDefaultLayer('maxpool2d', 1), id: generateId(), name: 'Pool 2' },
      { ...createDefaultLayer('flatten', 0), id: generateId(), name: 'Flatten' },
      { ...createDefaultLayer('dense', 0), id: generateId(), units: 512, name: 'FC 1' },
      { ...createDefaultLayer('dropout', 0), id: generateId(), dropout: 0.5 },
      { ...createDefaultLayer('dense', 1), id: generateId(), units: 256, name: 'FC 2' },
      { ...createDefaultLayer('output', 0), id: generateId(), units: 1000 },
    ],
  },
  {
    id: 'lstm-sentiment',
    name: 'LSTM Sentiment',
    description: 'LSTM network for sequence classification',
    category: 'rnn',
    inputShape: [100, 128],
    layers: [
      createDefaultLayer('input', 0),
      { ...createDefaultLayer('embedding', 0), id: generateId(), units: 128, name: 'Embedding' },
      { ...createDefaultLayer('lstm', 0), id: generateId(), units: 128, name: 'LSTM 1' },
      { ...createDefaultLayer('dropout', 0), id: generateId(), dropout: 0.5 },
      { ...createDefaultLayer('dense', 0), id: generateId(), units: 64, name: 'FC 1' },
      { ...createDefaultLayer('output', 0), id: generateId(), units: 2, activation: 'sigmoid' },
    ],
  },
  {
    id: 'autoencoder',
    name: 'Autoencoder',
    description: 'Encoder-decoder architecture',
    category: 'autoencoder',
    inputShape: [784],
    layers: [
      createDefaultLayer('input', 0),
      { ...createDefaultLayer('dense', 0), id: generateId(), name: 'Encoder 1', units: 256 },
      { ...createDefaultLayer('dense', 1), id: generateId(), name: 'Encoder 2', units: 128 },
      { ...createDefaultLayer('dense', 2), id: generateId(), name: 'Latent', units: 32 },
      { ...createDefaultLayer('dense', 3), id: generateId(), name: 'Decoder 1', units: 128 },
      { ...createDefaultLayer('dense', 4), id: generateId(), name: 'Decoder 2', units: 256 },
      { ...createDefaultLayer('output', 0), id: generateId(), units: 784, activation: 'sigmoid' },
    ],
  },
];

interface NeuralNetworkState {
  network: NetworkConfig;
  presets: NetworkPreset[];
  selectedLayerId: string | null;
  animation: AnimationState;
  codeOptions: CodeGenerationOptions;
  zoom: number;
  pan: { x: number; y: number };
  
  // Actions
  setNetwork: (network: NetworkConfig) => void;
  addLayer: (type: NeuralLayer['type'], afterIndex?: number) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<NeuralLayer>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  selectLayer: (layerId: string | null) => void;
  loadPreset: (presetId: string) => void;
  resetNetwork: () => void;
  setAnimation: (animation: Partial<AnimationState>) => void;
  setCodeOptions: (options: Partial<CodeGenerationOptions>) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
}

const createDefaultNetwork = (): NetworkConfig => ({
  id: generateId(),
  name: 'My Neural Network',
  layers: [
    createDefaultLayer('input', 0),
    { ...createDefaultLayer('dense', 0), id: generateId(), name: 'Hidden Layer', units: 64 },
    createDefaultLayer('output', 0),
  ],
  inputShape: [784],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useNeuralNetworkStore = create<NeuralNetworkState>((set, get) => ({
  network: createDefaultNetwork(),
  presets: NETWORK_PRESETS,
  selectedLayerId: null,
  animation: {
    isPlaying: false,
    speed: 1,
    currentStep: 0,
    totalSteps: 100,
  },
  codeOptions: {
    framework: 'pytorch',
    includeTraining: true,
    includeComments: true,
    className: 'NeuralNetwork',
  },
  zoom: 1,
  pan: { x: 0, y: 0 },

  setNetwork: (network) => set({ network }),

  addLayer: (type, afterIndex) => {
    const { network } = get();
    const newLayer = createDefaultLayer(type, network.layers.length);
    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : network.layers.length - 1;
    const newLayers = [...network.layers];
    newLayers.splice(insertIndex, 0, newLayer);
    set({
      network: { ...network, layers: newLayers, updatedAt: new Date() },
      selectedLayerId: newLayer.id,
    });
  },

  removeLayer: (layerId) => {
    const { network, selectedLayerId } = get();
    if (network.layers.length <= 2) return; // Keep at least input and output
    set({
      network: {
        ...network,
        layers: network.layers.filter((l) => l.id !== layerId),
        updatedAt: new Date(),
      },
      selectedLayerId: selectedLayerId === layerId ? null : selectedLayerId,
    });
  },

  updateLayer: (layerId, updates) => {
    const { network } = get();
    set({
      network: {
        ...network,
        layers: network.layers.map((l) => (l.id === layerId ? { ...l, ...updates } : l)),
        updatedAt: new Date(),
      },
    });
  },

  reorderLayers: (fromIndex, toIndex) => {
    const { network } = get();
    const newLayers = [...network.layers];
    const [removed] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, removed);
    set({ network: { ...network, layers: newLayers, updatedAt: new Date() } });
  },

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),

  loadPreset: (presetId) => {
    const preset = get().presets.find((p) => p.id === presetId);
    if (preset) {
      set({
        network: {
          id: generateId(),
          name: preset.name,
          layers: preset.layers.map((l, i) => ({ ...l, id: generateId() })),
          inputShape: preset.inputShape,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        selectedLayerId: null,
      });
    }
  },

  resetNetwork: () => set({ network: createDefaultNetwork(), selectedLayerId: null }),

  setAnimation: (animation) => set((state) => ({ animation: { ...state.animation, ...animation } })),
  
  setCodeOptions: (options) => set((state) => ({ codeOptions: { ...state.codeOptions, ...options } })),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
  
  setPan: (pan) => set({ pan }),
}));
