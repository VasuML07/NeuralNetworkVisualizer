import { create } from 'zustand';
import { 
  NeuralLayer, 
  NetworkConfig, 
  NetworkPreset, 
  AnimationState, 
  CodeGenerationOptions,
  ViewMode,
  TrainingConfig,
  TrainingState,
  VisualizationSettings,
  LAYER_COLORS
} from '@/types/neural-network';

const generateId = () => Math.random().toString(36).substring(2, 11);

// Layer factory with proper defaults
const createLayer = (type: NeuralLayer['type'], index: number, prevUnits?: number): NeuralLayer => {
  const baseLayer: NeuralLayer = {
    id: generateId(),
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1).replace('2d', '')} ${index + 1}`,
    units: 64,
    activation: 'relu',
    useBias: true,
    initializer: 'he_normal',
  };

  switch (type) {
    case 'input':
      return { 
        ...baseLayer, 
        units: 784, 
        name: 'Input',
        activation: 'linear'
      };
    case 'dense':
      return { 
        ...baseLayer, 
        units: prevUnits ? Math.max(32, Math.floor(prevUnits / 2)) : 128, 
        activation: 'relu' 
      };
    case 'conv2d':
      return { 
        ...baseLayer, 
        filters: 32, 
        kernelSize: [3, 3], 
        stride: [1, 1], 
        padding: 'same', 
        activation: 'relu',
        units: 0 // Not applicable for conv layers
      };
    case 'maxpool2d':
      return { 
        ...baseLayer, 
        kernelSize: [2, 2], 
        stride: [2, 2], 
        name: `MaxPool ${index + 1}`,
        activation: 'linear',
        units: 0
      };
    case 'avgpool2d':
      return { 
        ...baseLayer, 
        kernelSize: [2, 2], 
        stride: [2, 2], 
        name: `AvgPool ${index + 1}`,
        activation: 'linear',
        units: 0
      };
    case 'dropout':
      return { 
        ...baseLayer, 
        dropout: 0.5, 
        name: `Dropout ${index + 1}`,
        activation: 'linear',
        units: 0
      };
    case 'batchnorm':
      return { 
        ...baseLayer, 
        name: `BatchNorm ${index + 1}`,
        activation: 'linear',
        units: 0
      };
    case 'lstm':
      return { 
        ...baseLayer, 
        units: 64, 
        activation: 'tanh' 
      };
    case 'gru':
      return { 
        ...baseLayer, 
        units: 64, 
        activation: 'tanh' 
      };
    case 'flatten':
      return { 
        ...baseLayer, 
        name: `Flatten ${index + 1}`,
        activation: 'linear',
        units: 0
      };
    case 'output':
      return { 
        ...baseLayer, 
        units: 10, 
        activation: 'softmax', 
        name: 'Output' 
      };
    default:
      return baseLayer;
  }
};

// Preset architectures
export const NETWORK_PRESETS: NetworkPreset[] = [
  {
    id: 'mlp-basic',
    name: 'Basic MLP',
    description: 'Simple 2-layer network for classification',
    category: 'mlp',
    inputShape: [784],
    layers: [
      createLayer('input', 0),
      createLayer('dense', 1, 784),
      createLayer('dense', 2, 128),
      createLayer('output', 3, 64),
    ],
  },
  {
    id: 'mlp-deep',
    name: 'Deep MLP',
    description: '4 hidden layers with dropout',
    category: 'mlp',
    inputShape: [784],
    layers: [
      createLayer('input', 0),
      createLayer('dense', 1, 784),
      createLayer('dropout', 2),
      createLayer('dense', 3, 256),
      createLayer('dense', 4, 128),
      createLayer('dense', 5, 64),
      createLayer('output', 6, 64),
    ],
  },
  {
    id: 'cnn-mnist',
    name: 'CNN for MNIST',
    description: 'Convolutional network for image classification',
    category: 'cnn',
    inputShape: [28, 28, 1],
    layers: [
      createLayer('input', 0),
      createLayer('conv2d', 1),
      createLayer('maxpool2d', 2),
      createLayer('conv2d', 3),
      createLayer('maxpool2d', 4),
      createLayer('flatten', 5),
      createLayer('dense', 6, 128),
      createLayer('dropout', 7),
      createLayer('output', 8, 64),
    ],
  },
  {
    id: 'autoencoder',
    name: 'Autoencoder',
    description: 'Encoder-decoder architecture',
    category: 'autoencoder',
    inputShape: [784],
    layers: [
      createLayer('input', 0),
      createLayer('dense', 1, 784),
      createLayer('dense', 2, 256),
      createLayer('dense', 3, 64),
      createLayer('dense', 4, 256),
      createLayer('dense', 5, 784),
      createLayer('output', 6, 784),
    ],
  },
  {
    id: 'lstm-text',
    name: 'LSTM Network',
    description: 'Recurrent network for sequences',
    category: 'rnn',
    inputShape: [100, 64],
    layers: [
      createLayer('input', 0),
      createLayer('lstm', 1, 64),
      createLayer('dropout', 2),
      createLayer('dense', 3, 32),
      createLayer('output', 4, 32),
    ],
  },
];

interface NeuralNetworkState {
  // Network State
  network: NetworkConfig;
  presets: NetworkPreset[];
  selectedLayerId: string | null;
  
  // View State
  viewMode: ViewMode;
  zoom: number;
  pan: { x: number; y: number };
  
  // Animation State
  animation: AnimationState;
  
  // Training State
  trainingConfig: TrainingConfig;
  training: TrainingState;
  
  // Visualization Settings
  visualization: VisualizationSettings;
  
  // Code Generation
  codeOptions: CodeGenerationOptions;
  
  // UI State
  expandedSections: {
    architecture: boolean;
    training: boolean;
    visualization: boolean;
    code: boolean;
  };
  
  // Network Actions
  setNetwork: (network: NetworkConfig) => void;
  addLayer: (type: NeuralLayer['type'], afterIndex?: number) => void;
  removeLayer: (layerId: string) => void;
  updateLayer: (layerId: string, updates: Partial<NeuralLayer>) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  selectLayer: (layerId: string | null) => void;
  loadPreset: (presetId: string) => void;
  resetNetwork: () => void;
  
  // View Actions
  setViewMode: (mode: ViewMode) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  
  // Animation Actions
  setAnimation: (animation: Partial<AnimationState>) => void;
  
  // Training Actions
  setTrainingConfig: (config: Partial<TrainingConfig>) => void;
  startTraining: () => void;
  stopTraining: () => void;
  updateTrainingProgress: (epoch: number, loss: number, accuracy: number) => void;
  
  // Visualization Actions
  setVisualization: (settings: Partial<VisualizationSettings>) => void;
  
  // Code Actions
  setCodeOptions: (options: Partial<CodeGenerationOptions>) => void;
  
  // UI Actions
  toggleSection: (section: 'architecture' | 'training' | 'visualization' | 'code') => void;
}

const createDefaultNetwork = (): NetworkConfig => {
  const layers = [
    createLayer('input', 0),
    createLayer('dense', 1, 784),
    createLayer('dense', 2, 64),
    createLayer('output', 3, 64),
  ];
  
  // Assign proper IDs
  layers.forEach((l, i) => {
    l.id = generateId();
    l.name = l.type === 'input' ? 'Input' : 
             l.type === 'output' ? 'Output' : 
             `${l.type.charAt(0).toUpperCase() + l.type.slice(1)} ${i}`;
  });
  
  return {
    id: generateId(),
    name: 'My Network',
    layers,
    inputShape: [784],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const useNeuralNetworkStore = create<NeuralNetworkState>((set, get) => ({
  // Network State
  network: createDefaultNetwork(),
  presets: NETWORK_PRESETS,
  selectedLayerId: null,
  
  // View State
  viewMode: 'beginner',
  zoom: 1,
  pan: { x: 0, y: 0 },
  
  // Animation State
  animation: {
    isPlaying: false,
    speed: 1,
    currentStep: 0,
    totalSteps: 100,
  },
  
  // Training State
  trainingConfig: {
    learningRate: 0.001,
    epochs: 10,
    batchSize: 32,
    optimizer: 'adam',
    lossFunction: 'cross_entropy',
  },
  training: {
    isTraining: false,
    currentEpoch: 0,
    currentLoss: 0,
    currentAccuracy: 0,
    lossHistory: [],
    accuracyHistory: [],
  },
  
  // Visualization Settings
  visualization: {
    showWeights: false,
    showActivations: false,
    showGradients: false,
    animateTraining: true,
  },
  
  // Code Generation
  codeOptions: {
    framework: 'pytorch',
    includeTraining: true,
    includeComments: true,
    className: 'NeuralNetwork',
  },
  
  // UI State
  expandedSections: {
    architecture: false,
    training: false,
    visualization: false,
    code: false,
  },

  // Network Actions
  setNetwork: (network) => set({ network }),

  addLayer: (type, afterIndex) => {
    const { network } = get();
    const layers = network.layers;
    
    // Limit max layers
    if (layers.length >= 20) {
      return;
    }
    
    // Determine insert position
    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : layers.length - 1;
    const prevLayer = layers[insertIndex - 1] || layers[0];
    
    // Create new layer
    const newLayer = createLayer(type, insertIndex, prevLayer?.units);
    newLayer.id = generateId();
    
    // Insert layer
    const newLayers = [...layers];
    newLayers.splice(insertIndex, 0, newLayer);
    
    set({
      network: { 
        ...network, 
        layers: newLayers, 
        updatedAt: new Date() 
      },
      selectedLayerId: newLayer.id,
    });
  },

  removeLayer: (layerId) => {
    const { network, selectedLayerId } = get();
    const layer = network.layers.find(l => l.id === layerId);
    
    // Prevent removing input/output or going below 3 layers
    if (network.layers.length <= 3 || layer?.type === 'input' || layer?.type === 'output') {
      return;
    }
    
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
    
    // Prevent moving input/output
    if (fromIndex === 0 || fromIndex === network.layers.length - 1 || 
        toIndex === 0 || toIndex === network.layers.length - 1) {
      return;
    }
    
    const newLayers = [...network.layers];
    const [removed] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, removed);
    
    set({ network: { ...network, layers: newLayers, updatedAt: new Date() } });
  },

  selectLayer: (layerId) => set({ selectedLayerId: layerId }),

  loadPreset: (presetId) => {
    const preset = get().presets.find((p) => p.id === presetId);
    if (preset) {
      const layers = preset.layers.map((l, i) => ({
        ...l,
        id: generateId(),
        name: l.type === 'input' ? 'Input' : 
              l.type === 'output' ? 'Output' : 
              `${l.type.charAt(0).toUpperCase() + l.type.slice(1).replace('2d', '')} ${i}`
      }));
      
      set({
        network: {
          id: generateId(),
          name: preset.name,
          layers,
          inputShape: preset.inputShape,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        selectedLayerId: null,
        training: {
          isTraining: false,
          currentEpoch: 0,
          currentLoss: 0,
          currentAccuracy: 0,
          lossHistory: [],
          accuracyHistory: [],
        },
      });
    }
  },

  resetNetwork: () => set({ 
    network: createDefaultNetwork(), 
    selectedLayerId: null,
    training: {
      isTraining: false,
      currentEpoch: 0,
      currentLoss: 0,
      currentAccuracy: 0,
      lossHistory: [],
      accuracyHistory: [],
    },
  }),

  // View Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
  
  setPan: (pan) => set({ pan }),

  // Animation Actions
  setAnimation: (animation) => set((state) => ({ animation: { ...state.animation, ...animation } })),

  // Training Actions
  setTrainingConfig: (config) => set((state) => ({ 
    trainingConfig: { ...state.trainingConfig, ...config } 
  })),

  startTraining: () => set((state) => ({ 
    training: { 
      ...state.training, 
      isTraining: true,
      currentEpoch: 0,
      lossHistory: [],
      accuracyHistory: [],
    },
    animation: { ...state.animation, isPlaying: true },
  })),

  stopTraining: () => set((state) => ({ 
    training: { ...state.training, isTraining: false },
    animation: { ...state.animation, isPlaying: false },
  })),

  updateTrainingProgress: (epoch, loss, accuracy) => set((state) => ({
    training: {
      ...state.training,
      currentEpoch: epoch,
      currentLoss: loss,
      currentAccuracy: accuracy,
      lossHistory: [...state.training.lossHistory, loss],
      accuracyHistory: [...state.training.accuracyHistory, accuracy],
    },
  })),

  // Visualization Actions
  setVisualization: (settings) => set((state) => ({ 
    visualization: { ...state.visualization, ...settings } 
  })),

  // Code Actions
  setCodeOptions: (options) => set((state) => ({ 
    codeOptions: { ...state.codeOptions, ...options } 
  })),

  // UI Actions
  toggleSection: (section) => set((state) => ({
    expandedSections: {
      ...state.expandedSections,
      [section]: !state.expandedSections[section],
    },
  })),
}));
