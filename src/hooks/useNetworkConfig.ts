'use client';

import { useState, useCallback } from 'react';
import { 
  NetworkConfig, 
  LayerConfig, 
  ActivationFunction,
  OptimizerType,
  DEFAULT_CONFIG 
} from '@/lib/neural-network-types';

export function useNetworkConfig() {
  const [config, setConfig] = useState<NetworkConfig>(DEFAULT_CONFIG);

  // Input layer
  const updateInputNeurons = useCallback((neurons: number) => {
    setConfig(prev => ({
      ...prev,
      inputLayer: { neurons: Math.max(1, Math.min(50, neurons)) }
    }));
  }, []);

  // Output layer
  const updateOutputNeurons = useCallback((neurons: number) => {
    setConfig(prev => ({
      ...prev,
      outputLayer: { 
        ...prev.outputLayer, 
        neurons: Math.max(1, Math.min(20, neurons)) 
      }
    }));
  }, []);

  const updateOutputActivation = useCallback((activation: ActivationFunction) => {
    setConfig(prev => ({
      ...prev,
      outputLayer: { ...prev.outputLayer, activation }
    }));
  }, []);

  // Hidden layers
  const addHiddenLayer = useCallback(() => {
    setConfig(prev => {
      if (prev.hiddenLayers.length >= 6) return prev;
      const newLayer: LayerConfig = {
        id: `hidden-${Date.now()}`,
        neurons: 4,
        activation: 'relu',
        dropout: 0,
      };
      return {
        ...prev,
        hiddenLayers: [...prev.hiddenLayers, newLayer]
      };
    });
  }, []);

  const removeHiddenLayer = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      hiddenLayers: prev.hiddenLayers.filter((_, i) => i !== index)
    }));
  }, []);

  const updateHiddenLayer = useCallback((index: number, updates: Partial<LayerConfig>) => {
    setConfig(prev => ({
      ...prev,
      hiddenLayers: prev.hiddenLayers.map((layer, i) => 
        i === index ? { ...layer, ...updates } : layer
      )
    }));
  }, []);

  // Training config
  const updateLearningRate = useCallback((learningRate: number) => {
    setConfig(prev => ({
      ...prev,
      learningRate: Math.max(0.0001, Math.min(1, learningRate))
    }));
  }, []);

  const updateOptimizer = useCallback((optimizer: OptimizerType) => {
    setConfig(prev => ({ ...prev, optimizer }));
  }, []);

  const updateBatchSize = useCallback((batchSize: number) => {
    setConfig(prev => ({ ...prev, batchSize }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  return {
    config,
    setConfig,
    // Layer operations
    updateInputNeurons,
    updateOutputNeurons,
    updateOutputActivation,
    addHiddenLayer,
    removeHiddenLayer,
    updateHiddenLayer,
    // Training config
    updateLearningRate,
    updateOptimizer,
    updateBatchSize,
    resetConfig,
  };
}
