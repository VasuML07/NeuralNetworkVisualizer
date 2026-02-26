// Neural Network Laboratory Types

export type ActivationFunction = 
  | 'relu' 
  | 'sigmoid' 
  | 'tanh' 
  | 'leaky_relu' 
  | 'softmax' 
  | 'linear'
  | 'elu'
  | 'selu'
  | 'gelu';

export type OptimizerType = 
  | 'sgd' 
  | 'adam' 
  | 'rmsprop' 
  | 'adagrad' 
  | 'adamw';

export type DatasetType = 
  | 'xor' 
  | 'spiral' 
  | 'circle' 
  | 'moons' 
  | 'blobs';

export interface LayerConfig {
  id: string;
  neurons: number;
  activation: ActivationFunction;
}

export interface NetworkConfig {
  inputNeurons: number;
  hiddenLayers: LayerConfig[];
  outputNeurons: number;
  outputActivation: ActivationFunction;
  learningRate: number;
  optimizer: OptimizerType;
  batchSize: number;
  dataset: DatasetType;
}

export interface TrainingState {
  isTraining: boolean;
  isPaused: boolean;
  currentEpoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  lossHistory: number[];
  gradientHistory: number[];
}

export interface NeuronData {
  x: number;
  y: number;
  activation: number;
  gradient: number;
  layerIndex: number;
  neuronIndex: number;
}

export interface ConnectionData {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  weight: number;
  gradient: number;
  fromLayer: number;
}

export interface GradientData {
  layerIndex: number;
  avgMagnitude: number;
  maxMagnitude: number;
  minMagnitude: number;
}

export interface OptimizationPath {
  x: number;
  y: number;
  loss: number;
}

// Activation function configurations
export const ACTIVATION_FUNCTIONS = [
  { value: 'relu', label: 'ReLU', color: '#22c55e', description: 'Rectified Linear Unit' },
  { value: 'sigmoid', label: 'Sigmoid', color: '#3b82f6', description: 'S-shaped function (0-1)' },
  { value: 'tanh', label: 'Tanh', color: '#8b5cf6', description: 'Hyperbolic tangent (-1 to 1)' },
  { value: 'leaky_relu', label: 'Leaky ReLU', color: '#f59e0b', description: 'Leaky variant of ReLU' },
  { value: 'softmax', label: 'Softmax', color: '#ec4899', description: 'Probability distribution' },
  { value: 'linear', label: 'Linear', color: '#6b7280', description: 'No activation (identity)' },
  { value: 'elu', label: 'ELU', color: '#14b8a6', description: 'Exponential Linear Unit' },
  { value: 'selu', label: 'SELU', color: '#f97316', description: 'Scaled ELU' },
  { value: 'gelu', label: 'GELU', color: '#06b6d4', description: 'Gaussian Error Linear Unit' },
] as const;

export const OPTIMIZERS = [
  { value: 'sgd', label: 'SGD', description: 'Stochastic Gradient Descent' },
  { value: 'adam', label: 'Adam', description: 'Adaptive Moment Estimation' },
  { value: 'rmsprop', label: 'RMSprop', description: 'Root Mean Square Propagation' },
  { value: 'adagrad', label: 'AdaGrad', description: 'Adaptive Gradient Algorithm' },
  { value: 'adamw', label: 'AdamW', description: 'Adam with Weight Decay' },
] as const;

export const DATASETS = [
  { value: 'xor', label: 'XOR', description: 'Classic XOR problem' },
  { value: 'spiral', label: 'Spiral', description: 'Interleaving spirals' },
  { value: 'circle', label: 'Circle', description: 'Concentric circles' },
  { value: 'moons', label: 'Moons', description: 'Two interleaving half circles' },
  { value: 'blobs', label: 'Blobs', description: 'Gaussian blobs' },
] as const;

export const BATCH_SIZES = [1, 8, 16, 32, 64, 128, 256] as const;

// Default configuration
export const DEFAULT_CONFIG: NetworkConfig = {
  inputNeurons: 2,
  hiddenLayers: [
    { id: 'h1', neurons: 8, activation: 'relu' },
    { id: 'h2', neurons: 4, activation: 'relu' },
  ],
  outputNeurons: 1,
  outputActivation: 'sigmoid',
  learningRate: 0.01,
  optimizer: 'adam',
  batchSize: 32,
  dataset: 'xor',
};

// Layer colors
export const LAYER_COLORS = {
  input: '#3b82f6',    // Blue
  hidden: '#8b5cf6',   // Purple
  output: '#22c55e',   // Green
};

// Animation colors
export const ANIMATION_COLORS = {
  forwardPass: '#22c55e',     // Green for forward pass
  backwardPositive: '#3b82f6', // Blue for positive gradients
  backwardNegative: '#ef4444', // Red for negative gradients
  loss: '#f59e0b',            // Amber for loss
  neuron: '#6366f1',          // Indigo for neurons
};
