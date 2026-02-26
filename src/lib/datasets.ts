// Dataset Generators for Neural Network Visualization
// Generates training data for various classification problems

import { DataPoint } from './neural-engine';

// XOR Dataset - Classic non-linearly separable problem
export function generateXOR(numSamples: number = 100): DataPoint[] {
  const data: DataPoint[] = [];
  const samplesPerQuadrant = Math.floor(numSamples / 4);
  
  const quadrants = [
    { input: [0, 0], target: [0] },
    { input: [0, 1], target: [1] },
    { input: [1, 0], target: [1] },
    { input: [1, 1], target: [0] },
  ];
  
  for (const q of quadrants) {
    for (let i = 0; i < samplesPerQuadrant; i++) {
      // Add noise around each quadrant
      const noise = 0.1;
      data.push({
        input: [
          q.input[0] + (Math.random() - 0.5) * noise,
          q.input[1] + (Math.random() - 0.5) * noise,
        ],
        target: [...q.target],
      });
    }
  }
  
  return data;
}

// Spiral Dataset - Two interleaved spirals
export function generateSpiral(numSamples: number = 200): DataPoint[] {
  const data: DataPoint[] = [];
  const samplesPerClass = Math.floor(numSamples / 2);
  
  for (let i = 0; i < samplesPerClass; i++) {
    // First spiral (class 0)
    const t1 = i / samplesPerClass * 2 * Math.PI;
    const r1 = t1 / (2 * Math.PI) * 0.8;
    const noise1 = 0.1;
    data.push({
      input: [
        r1 * Math.cos(t1) + (Math.random() - 0.5) * noise1,
        r1 * Math.sin(t1) + (Math.random() - 0.5) * noise1,
      ],
      target: [0],
    });
    
    // Second spiral (class 1)
    const t2 = i / samplesPerClass * 2 * Math.PI + Math.PI;
    const r2 = t2 / (2 * Math.PI + Math.PI) * 0.8;
    const noise2 = 0.1;
    data.push({
      input: [
        r2 * Math.cos(t2) + (Math.random() - 0.5) * noise2,
        r2 * Math.sin(t2) + (Math.random() - 0.5) * noise2,
      ],
      target: [1],
    });
  }
  
  return data;
}

// Circle Dataset - Points inside/outside circle
export function generateCircle(numSamples: number = 200): DataPoint[] {
  const data: DataPoint[] = [];
  const samplesPerClass = Math.floor(numSamples / 2);
  
  // Inner circle (class 0)
  for (let i = 0; i < samplesPerClass; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const r = Math.random() * 0.3;
    data.push({
      input: [r * Math.cos(theta), r * Math.sin(theta)],
      target: [0],
    });
  }
  
  // Outer ring (class 1)
  for (let i = 0; i < samplesPerClass; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const r = 0.5 + Math.random() * 0.3;
    data.push({
      input: [r * Math.cos(theta), r * Math.sin(theta)],
      target: [1],
    });
  }
  
  return data;
}

// Moons Dataset - Two interleaved half moons
export function generateMoons(numSamples: number = 200): DataPoint[] {
  const data: DataPoint[] = [];
  const samplesPerClass = Math.floor(numSamples / 2);
  
  // First moon (class 0)
  for (let i = 0; i < samplesPerClass; i++) {
    const t = i / samplesPerClass * Math.PI;
    const noise = 0.1;
    data.push({
      input: [
        Math.cos(t) + (Math.random() - 0.5) * noise,
        Math.sin(t) + (Math.random() - 0.5) * noise,
      ],
      target: [0],
    });
  }
  
  // Second moon (class 1)
  for (let i = 0; i < samplesPerClass; i++) {
    const t = i / samplesPerClass * Math.PI;
    const noise = 0.1;
    data.push({
      input: [
        1 - Math.cos(t) + (Math.random() - 0.5) * noise,
        0.5 - Math.sin(t) + (Math.random() - 0.5) * noise,
      ],
      target: [1],
    });
  }
  
  return data;
}

// Generate dataset by type
export function generateDataset(
  type: 'xor' | 'spiral' | 'circle' | 'moons',
  numSamples: number = 200
): DataPoint[] {
  switch (type) {
    case 'xor':
      return generateXOR(numSamples);
    case 'spiral':
      return generateSpiral(numSamples);
    case 'circle':
      return generateCircle(numSamples);
    case 'moons':
      return generateMoons(numSamples);
    default:
      return generateXOR(numSamples);
  }
}

// Get dataset bounds for visualization
export function getDatasetBounds(data: DataPoint[]): { min: number[]; max: number[] } {
  const min = [Infinity, Infinity];
  const max = [-Infinity, -Infinity];
  
  for (const point of data) {
    min[0] = Math.min(min[0], point.input[0]);
    min[1] = Math.min(min[1], point.input[1]);
    max[0] = Math.max(max[0], point.input[0]);
    max[1] = Math.max(max[1], point.input[1]);
  }
  
  // Add padding
  const padding = 0.2;
  min[0] -= padding;
  min[1] -= padding;
  max[0] += padding;
  max[1] += padding;
  
  return { min, max };
}

// Normalize dataset
export function normalizeDataset(data: DataPoint[]): DataPoint[] {
  const { min, max } = getDatasetBounds(data);
  
  return data.map(point => ({
    input: [
      (point.input[0] - min[0]) / (max[0] - min[0]) * 2 - 1,
      (point.input[1] - min[1]) / (max[1] - min[1]) * 2 - 1,
    ],
    target: point.target,
  }));
}
