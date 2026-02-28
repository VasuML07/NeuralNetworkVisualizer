export type ActivationFunction = 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'softmax' | 'linear' | 'gelu' | 'swish';
export type LayerType = 'dense' | 'conv2d' | 'maxpool2d' | 'avgpool2d' | 'dropout' | 'batchnorm' | 'flatten' | 'lstm' | 'gru' | 'embedding' | 'attention' | 'input' | 'output';

export interface NeuralLayer {
  id: string;
  type: LayerType;
  name: string;
  units: number;
  activation: ActivationFunction;
  dropout?: number;
  kernelSize?: [number, number];
  stride?: [number, number];
  padding?: 'valid' | 'same';
  filters?: number;
  inputShape?: number[];
  initializer?: 'he_normal' | 'he_uniform' | 'glorot_normal' | 'glorot_uniform' | 'random_normal' | 'zeros';
  useBias?: boolean;
}

export interface NetworkConfig {
  id: string;
  name: string;
  layers: NeuralLayer[];
  inputShape: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NetworkPreset {
  id: string;
  name: string;
  description: string;
  category: 'mlp' | 'cnn' | 'rnn' | 'transformer' | 'autoencoder';
  layers: NeuralLayer[];
  inputShape: number[];
}

export interface Connection {
  fromLayer: number;
  toLayer: number;
  weight: number;
}

export interface NeuronPosition {
  x: number;
  y: number;
  layerIndex: number;
  neuronIndex: number;
}

export interface AnimationState {
  isPlaying: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
}

export type Framework = 'pytorch' | 'tensorflow' | 'jax' | 'keras';

export interface CodeGenerationOptions {
  framework: Framework;
  includeTraining: boolean;
  includeComments: boolean;
  className: string;
}

export type ViewMode = 'beginner' | 'advanced';

export type Optimizer = 'adam' | 'sgd' | 'rmsprop' | 'adamw' | 'adagrad';
export type LossFunction = 'cross_entropy' | 'mse' | 'mae' | 'binary_crossentropy';

export interface TrainingConfig {
  learningRate: number;
  epochs: number;
  batchSize: number;
  optimizer: Optimizer;
  lossFunction: LossFunction;
}

export interface TrainingState {
  isTraining: boolean;
  currentEpoch: number;
  currentLoss: number;
  currentAccuracy: number;
  lossHistory: number[];
  accuracyHistory: number[];
}

export interface VisualizationSettings {
  showWeights: boolean;
  showActivations: boolean;
  showGradients: boolean;
  animateTraining: boolean;
}

export const OPTIMIZERS: { value: Optimizer; label: string }[] = [
  { value: 'adam', label: 'Adam' },
  { value: 'adamw', label: 'AdamW' },
  { value: 'sgd', label: 'SGD' },
  { value: 'rmsprop', label: 'RMSprop' },
  { value: 'adagrad', label: 'Adagrad' },
];

export const LOSS_FUNCTIONS: { value: LossFunction; label: string }[] = [
  { value: 'cross_entropy', label: 'Cross Entropy' },
  { value: 'mse', label: 'Mean Squared Error' },
  { value: 'mae', label: 'Mean Absolute Error' },
  { value: 'binary_crossentropy', label: 'Binary Cross Entropy' },
];

export const ACTIVATION_COLORS: Record<ActivationFunction, string> = {
  relu: '#22c55e',
  sigmoid: '#3b82f6',
  tanh: '#f59e0b',
  leaky_relu: '#10b981',
  softmax: '#8b5cf6',
  linear: '#6b7280',
  gelu: '#ec4899',
  swish: '#06b6d4',
};

export const LAYER_COLORS: Record<LayerType, string> = {
  input: '#3b82f6',
  dense: '#8b5cf6',
  conv2d: '#f59e0b',
  maxpool2d: '#10b981',
  avgpool2d: '#14b8a6',
  dropout: '#ef4444',
  batchnorm: '#06b6d4',
  flatten: '#6b7280',
  lstm: '#ec4899',
  gru: '#f97316',
  embedding: '#84cc16',
  attention: '#a855f7',
  output: '#22c55e',
};

export const LAYER_ICONS: Record<LayerType, string> = {
  input: 'I',
  dense: 'D',
  conv2d: 'C',
  maxpool2d: 'M',
  avgpool2d: 'A',
  dropout: 'X',
  batchnorm: 'B',
  flatten: 'F',
  lstm: 'L',
  gru: 'G',
  embedding: 'E',
  attention: '@',
  output: 'O',
};
