// Neural Network Engine - Pure TypeScript Implementation
// Implements forward/backward propagation for visualization purposes

export type ActivationType = 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu' | 'linear';
export type OptimizerType = 'sgd' | 'adam' | 'rmsprop';
export type LossFunctionType = 'mse' | 'cross_entropy';
export type DatasetType = 'xor' | 'spiral' | 'circle' | 'moons';

// Activation functions and their derivatives
export const activations = {
  relu: {
    fn: (x: number) => Math.max(0, x),
    derivative: (x: number) => x > 0 ? 1 : 0,
  },
  sigmoid: {
    fn: (x: number) => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
    derivative: (x: number) => {
      const s = 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
      return s * (1 - s);
    },
  },
  tanh: {
    fn: (x: number) => Math.tanh(x),
    derivative: (x: number) => 1 - Math.tanh(x) ** 2,
  },
  leaky_relu: {
    fn: (x: number) => x > 0 ? x : 0.01 * x,
    derivative: (x: number) => x > 0 ? 1 : 0.01,
  },
  linear: {
    fn: (x: number) => x,
    derivative: () => 1,
  },
};

// Matrix operations
export const mat = {
  create: (rows: number, cols: number, fill = 0): number[][] => 
    Array(rows).fill(null).map(() => Array(cols).fill(fill)),
  
  random: (rows: number, cols: number, scale = 1): number[][] =>
    Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => (Math.random() * 2 - 1) * scale)
    ),
  
  zeros: (rows: number, cols: number): number[][] => 
    mat.create(rows, cols, 0),
  
  multiply: (a: number[][], b: number[][]): number[][] => {
    const result = mat.zeros(a.length, b[0].length);
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < b.length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    return result;
  },
  
  add: (a: number[][], b: number[][]): number[][] =>
    a.map((row, i) => row.map((val, j) => val + b[i][j])),
  
  transpose: (a: number[][]): number[][] =>
    a[0].map((_, i) => a.map(row => row[i])),
  
  scale: (a: number[][], s: number): number[][] =>
    a.map(row => row.map(val => val * s)),
  
  hadamard: (a: number[][], b: number[][]): number[][] =>
    a.map((row, i) => row.map((val, j) => val * b[i][j])),
  
  sum: (a: number[][]): number =>
    a.reduce((sum, row) => sum + row.reduce((s, v) => s + v, 0), 0),
  
  mean: (a: number[][]): number => mat.sum(a) / (a.length * a[0].length),
};

// Vector operations
export const vec = {
  create: (len: number, fill = 0): number[] => Array(len).fill(fill),
  random: (len: number, scale = 1): number[] =>
    Array(len).fill(null).map(() => (Math.random() * 2 - 1) * scale),
  zeros: (len: number): number[] => vec.create(len, 0),
  add: (a: number[], b: number[]): number[] => a.map((v, i) => v + b[i]),
  scale: (a: number[], s: number): number[] => a.map(v => v * s),
};

// Layer interface
export interface Layer {
  weights: number[][];
  biases: number[];
  activation: ActivationType;
  // Cached values for backprop
  input?: number[];
  z?: number[];  // Pre-activation
  output?: number[];
  // Gradients
  weightGradients?: number[][];
  biasGradients?: number[];
  inputGradients?: number[];
  // Adam optimizer state
  m_weights?: number[][];
  v_weights?: number[][];
  m_biases?: number[];
  v_biases?: number[];
}

// Network state
export interface NetworkState {
  layers: Layer[];
  loss: number;
  epoch: number;
  gradients: {
    layer: number;
    meanMagnitude: number;
    maxMagnitude: number;
  }[];
  predictions: { input: number[]; output: number[]; target: number[] }[];
}

// Training config
export interface TrainingConfig {
  learningRate: number;
  optimizer: OptimizerType;
  batchSize: number;
  epochs: number;
  lossFunction: LossFunctionType;
}

// Dataset point
export interface DataPoint {
  input: number[];
  target: number[];
}

// Create a layer
export function createLayer(
  inputSize: number,
  outputSize: number,
  activation: ActivationType
): Layer {
  const scale = Math.sqrt(2 / inputSize); // Xavier initialization
  return {
    weights: mat.random(inputSize, outputSize, scale),
    biases: vec.random(outputSize, 0.01),
    activation,
    m_weights: mat.zeros(inputSize, outputSize),
    v_weights: mat.zeros(inputSize, outputSize),
    m_biases: vec.zeros(outputSize),
    v_biases: vec.zeros(outputSize),
  };
}

// Create network from config
export function createNetwork(
  inputSize: number,
  layerSizes: number[],
  activations: ActivationType[]
): Layer[] {
  const layers: Layer[] = [];
  let prevSize = inputSize;
  
  for (let i = 0; i < layerSizes.length; i++) {
    layers.push(createLayer(prevSize, layerSizes[i], activations[i]));
    prevSize = layerSizes[i];
  }
  
  return layers;
}

// Forward pass through a single layer
export function forwardLayer(layer: Layer, input: number[]): number[] {
  layer.input = input;
  
  // Calculate z = W * x + b
  const z: number[] = layer.biases.map((b, i) => {
    let sum = b;
    for (let j = 0; j < input.length; j++) {
      sum += input[j] * layer.weights[j][i];
    }
    return sum;
  });
  
  layer.z = z;
  
  // Apply activation
  const activationFn = activations[layer.activation];
  layer.output = z.map(x => activationFn.fn(x));
  
  return layer.output;
}

// Forward pass through entire network
export function forward(layers: Layer[], input: number[]): number[] {
  let output = input;
  for (const layer of layers) {
    output = forwardLayer(layer, output);
  }
  return output;
}

// Calculate loss
export function calculateLoss(
  predictions: number[][],
  targets: number[][],
  lossFn: LossFunctionType
): number {
  if (lossFn === 'mse') {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      for (let j = 0; j < predictions[i].length; j++) {
        const diff = predictions[i][j] - targets[i][j];
        sum += diff * diff;
      }
    }
    return sum / predictions.length;
  } else {
    // Cross-entropy (simplified)
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      for (let j = 0; j < predictions[i].length; j++) {
        const p = Math.max(1e-10, Math.min(1 - 1e-10, predictions[i][j]));
        sum -= targets[i][j] * Math.log(p);
      }
    }
    return sum / predictions.length;
  }
}

// Backward pass through a single layer
export function backwardLayer(
  layer: Layer,
  outputGradient: number[]
): number[] {
  const inputSize = layer.input!.length;
  const outputSize = outputGradient.length;
  
  // Initialize gradients
  layer.weightGradients = mat.zeros(inputSize, outputSize);
  layer.biasGradients = vec.zeros(outputSize);
  layer.inputGradients = vec.zeros(inputSize);
  
  // Calculate activation derivative
  const activationFn = activations[layer.activation];
  const activationDerivative = layer.z!.map(z => activationFn.derivative(z));
  
  // Delta = output_gradient * activation_derivative
  const delta = outputGradient.map((g, i) => g * activationDerivative[i]);
  
  // Calculate weight gradients
  for (let i = 0; i < inputSize; i++) {
    for (let j = 0; j < outputSize; j++) {
      layer.weightGradients[i][j] = layer.input![i] * delta[j];
    }
  }
  
  // Bias gradients = delta
  layer.biasGradients = [...delta];
  
  // Input gradients for next layer
  for (let i = 0; i < inputSize; i++) {
    let sum = 0;
    for (let j = 0; j < outputSize; j++) {
      sum += layer.weights[i][j] * delta[j];
    }
    layer.inputGradients[i] = sum;
  }
  
  return layer.inputGradients;
}

// Backward pass through entire network
export function backward(
  layers: Layer[],
  target: number[],
  lossFn: LossFunctionType
): void {
  const lastLayer = layers[layers.length - 1];
  const output = lastLayer.output!;
  
  // Calculate initial gradient from loss function
  let gradient: number[];
  if (lossFn === 'mse') {
    gradient = output.map((o, i) => 2 * (o - target[i]));
  } else {
    // Cross-entropy gradient
    gradient = output.map((o, i) => o - target[i]);
  }
  
  // Backpropagate through layers in reverse
  for (let i = layers.length - 1; i >= 0; i--) {
    gradient = backwardLayer(layers[i], gradient);
  }
}

// Update weights using optimizer
export function updateWeights(
  layers: Layer[],
  learningRate: number,
  optimizer: OptimizerType,
  epoch: number
): void {
  const beta1 = 0.9;
  const beta2 = 0.999;
  const epsilon = 1e-8;
  
  for (const layer of layers) {
    if (!layer.weightGradients) continue;
    
    for (let i = 0; i < layer.weights.length; i++) {
      for (let j = 0; j < layer.weights[i].length; j++) {
        const grad = layer.weightGradients[i][j];
        
        if (optimizer === 'sgd') {
          layer.weights[i][j] -= learningRate * grad;
        } else if (optimizer === 'adam') {
          // Adam optimizer
          const t = epoch + 1;
          layer.m_weights![i][j] = beta1 * layer.m_weights![i][j] + (1 - beta1) * grad;
          layer.v_weights![i][j] = beta2 * layer.v_weights![i][j] + (1 - beta2) * grad * grad;
          
          const mHat = layer.m_weights![i][j] / (1 - Math.pow(beta1, t));
          const vHat = layer.v_weights![i][j] / (1 - Math.pow(beta2, t));
          
          layer.weights[i][j] -= learningRate * mHat / (Math.sqrt(vHat) + epsilon);
        } else if (optimizer === 'rmsprop') {
          const decay = 0.9;
          layer.v_weights![i][j] = decay * layer.v_weights![i][j] + (1 - decay) * grad * grad;
          layer.weights[i][j] -= learningRate * grad / (Math.sqrt(layer.v_weights![i][j]) + epsilon);
        }
      }
    }
    
    // Update biases
    for (let i = 0; i < layer.biases.length; i++) {
      const grad = layer.biasGradients![i];
      
      if (optimizer === 'sgd') {
        layer.biases[i] -= learningRate * grad;
      } else if (optimizer === 'adam') {
        const t = epoch + 1;
        layer.m_biases![i] = beta1 * layer.m_biases![i] + (1 - beta1) * grad;
        layer.v_biases![i] = beta2 * layer.v_biases![i] + (1 - beta2) * grad * grad;
        
        const mHat = layer.m_biases![i] / (1 - Math.pow(beta1, t));
        const vHat = layer.v_biases![i] / (1 - Math.pow(beta2, t));
        
        layer.biases[i] -= learningRate * mHat / (Math.sqrt(vHat) + epsilon);
      } else if (optimizer === 'rmsprop') {
        const decay = 0.9;
        layer.v_biases![i] = decay * layer.v_biases![i] + (1 - decay) * grad * grad;
        layer.biases[i] -= learningRate * grad / (Math.sqrt(layer.v_biases![i]) + epsilon);
      }
    }
  }
}

// Calculate gradient statistics per layer
export function getGradientStats(layers: Layer[]): NetworkState['gradients'] {
  return layers.map((layer, index) => {
    if (!layer.weightGradients) {
      return { layer: index, meanMagnitude: 0, maxMagnitude: 0 };
    }
    
    let sum = 0;
    let max = 0;
    let count = 0;
    
    for (const row of layer.weightGradients) {
      for (const grad of row) {
        const abs = Math.abs(grad);
        sum += abs;
        max = Math.max(max, abs);
        count++;
      }
    }
    
    return {
      layer: index,
      meanMagnitude: sum / count,
      maxMagnitude: max,
    };
  });
}

// Get weight statistics for visualization
export function getWeightStats(layer: Layer): { mean: number; max: number; min: number } {
  let sum = 0;
  let max = -Infinity;
  let min = Infinity;
  let count = 0;
  
  for (const row of layer.weights) {
    for (const w of row) {
      sum += w;
      max = Math.max(max, w);
      min = Math.min(min, w);
      count++;
    }
  }
  
  return { mean: sum / count, max, min };
}
