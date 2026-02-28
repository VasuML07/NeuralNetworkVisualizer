// Neural Network Types for the Visualizer

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

export type OptimizerType = 'sgd' | 'adam' | 'rmsprop';

export interface LayerConfig {
  id: string;
  neurons: number;
  activation: ActivationFunction;
  dropout: number; // 0 to 0.5
}

export interface NetworkConfig {
  inputLayer: {
    neurons: number;
  };
  hiddenLayers: LayerConfig[];
  outputLayer: {
    neurons: number;
    activation: ActivationFunction;
  };
  // Training config
  learningRate: number;
  optimizer: OptimizerType;
  batchSize: number;
}

export interface NeuronPosition {
  x: number;
  y: number;
  layerIndex: number;
  neuronIndex: number;
}

export interface Connection {
  from: NeuronPosition;
  to: NeuronPosition;
  weight?: number;
}

export interface TrainingState {
  isRunning: boolean;
  isPaused: boolean;
  epoch: number;
  loss: number;
  accuracy: number;
  lossHistory: number[];
  accuracyHistory: number[];
}

export interface GradientInfo {
  layer: number;
  meanMagnitude: number;
  maxMagnitude: number;
  isPositive: boolean;
}

export const ACTIVATION_FUNCTIONS: { value: ActivationFunction; label: string; color: string; description: string }[] = [
  { value: 'relu', label: 'ReLU', color: '#22c55e', description: 'Rectified Linear Unit' },
  { value: 'sigmoid', label: 'Sigmoid', color: '#3b82f6', description: 'S-shaped activation function' },
  { value: 'tanh', label: 'Tanh', color: '#8b5cf6', description: 'Hyperbolic tangent' },
  { value: 'leaky_relu', label: 'Leaky ReLU', color: '#f59e0b', description: 'Leaky Rectified Linear Unit' },
  { value: 'softmax', label: 'Softmax', color: '#ec4899', description: 'Probability distribution' },
  { value: 'linear', label: 'Linear', color: '#6b7280', description: 'No activation' },
  { value: 'elu', label: 'ELU', color: '#14b8a6', description: 'Exponential Linear Unit' },
  { value: 'selu', label: 'SELU', color: '#f97316', description: 'Scaled ELU' },
  { value: 'gelu', label: 'GELU', color: '#06b6d4', description: 'Gaussian Error Linear Unit' },
];

export const OPTIMIZERS: { value: OptimizerType; label: string; description: string }[] = [
  { value: 'sgd', label: 'SGD', description: 'Stochastic Gradient Descent' },
  { value: 'adam', label: 'Adam', description: 'Adaptive Moment Estimation' },
  { value: 'rmsprop', label: 'RMSprop', description: 'Root Mean Square Propagation' },
];

export const LAYER_COLORS = {
  input: '#3b82f6',   // Blue
  hidden: '#8b5cf6',  // Purple
  output: '#22c55e',  // Green
};

export const DEFAULT_CONFIG: NetworkConfig = {
  inputLayer: {
    neurons: 2,
  },
  hiddenLayers: [
    { id: 'hidden-1', neurons: 8, activation: 'relu', dropout: 0 },
    { id: 'hidden-2', neurons: 4, activation: 'relu', dropout: 0 },
  ],
  outputLayer: {
    neurons: 1,
    activation: 'sigmoid',
  },
  learningRate: 0.01,
  optimizer: 'adam',
  batchSize: 32,
};
