# 🧠 Neural Network Visualizer

**Design • Visualize • Understand Neural Networks through an interactive web interface.**

A modern, interactive web application that helps developers, students, and researchers design and understand neural network architectures visually. Built with Next.js 16, TypeScript, and Canvas API for high-quality visualizations.

![Neural Network Visualizer](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## ✨ Features

### 🎨 High-Quality Visualization

- **Canvas-Based Rendering** - Smooth, anti-aliased graphics using HTML5 Canvas API with high-DPI support
- **Animated Data Flow** - Visualize data flowing through the network with animated connections
- **Interactive Navigation** - Zoom in/out, pan across the canvas, and click neurons to select layers
- **Real-time Updates** - See changes instantly as you modify network architecture

### 🔧 Layer Configuration

- **10+ Layer Types** - Dense, Conv2D, MaxPool2D, AvgPool2D, Dropout, BatchNorm, LSTM, GRU, Flatten, and more
- **Full Parameter Control** - Configure units, filters, kernel size, stride, padding, activation functions
- **Weight Initialization** - He Normal, He Uniform, Glorot Normal, Glorot Uniform, Random Normal, Zeros
- **Activation Functions** - ReLU, Leaky ReLU, Sigmoid, Tanh, Softmax, GELU, Swish, Linear

### 📚 Preset Templates

Start quickly with pre-built architectures:

| Template | Description | Use Case |
|----------|-------------|----------|
| **Basic MLP** | Simple feedforward network | Classification tasks |
| **Deep MLP** | 5 hidden layers with BatchNorm | Complex classification |
| **CNN for MNIST** | Convolutional network | Image classification |
| **VGG-style CNN** | Deep convolutional architecture | Image recognition |
| **LSTM Sentiment** | Recurrent network | Sequence classification |
| **Autoencoder** | Encoder-decoder architecture | Dimensionality reduction |

### 💻 Code Generation

Export your architecture to production-ready code:

- **PyTorch** - Full implementation with training loop
- **TensorFlow/Keras** - Model class with compile-ready code
- **JAX/Flax** - Modern JAX implementation

Options include:
- Training boilerplate code
- Detailed comments
- Custom class naming

### 🎯 Interactive UI

- **Resizable Panels** - Customize your workspace layout
- **Layer List** - Drag to reorder, quick add/remove layers
- **Configuration Panel** - Intuitive sliders and dropdowns
- **Tooltips** - Hover for detailed layer information

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/VasuML07/NeuralNetworkVisualizer.git

# Navigate to project directory
cd NeuralNetworkVisualizer

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev
```

Open [https://neural-network-visualizer-iota.vercel.app/](https://neural-network-visualizer-iota.vercel.app/) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
NeuralNetworkVisualizer/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and animations
│   │   ├── layout.tsx           # Root layout with theme
│   │   └── page.tsx             # Main application page
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   └── neural-network/
│   │       ├── network-canvas.tsx         # Canvas visualization
│   │       ├── layer-config-panel.tsx     # Layer settings
│   │       ├── layer-list.tsx             # Layer sidebar
│   │       ├── presets-panel.tsx          # Template presets
│   │       ├── code-generation-panel.tsx  # Code export
│   │       └── animation-controls.tsx     # Animation controls
│   │
│   ├── store/
│   │   └── neural-network-store.ts        # Zustand state management
│   │
│   ├── types/
│   │   └── neural-network.ts              # TypeScript definitions
│   │
│   ├── hooks/                   # Custom React hooks
│   └── lib/                     # Utility functions
│
├── prisma/
│   └── schema.prisma            # Database schema (if needed)
│
├── public/                      # Static assets
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

---

## 🎮 How to Use

### 1. Create Architecture

- Click **Presets** tab to load a template, or
- Start from scratch with the default network

### 2. Build Your Network

- **Add Layers**: Click "+ Dense Layer" or use config panel
- **Configure**: Select a layer and adjust parameters
- **Reorder**: Use arrow buttons to move layers up/down
- **Remove**: Click trash icon on unwanted layers

### 3. Visualize

- **Select**: Click on neurons to select a layer
- **Zoom**: Scroll wheel to zoom in/out
- **Pan**: Click and drag on empty space
- **Animate**: Press play to see data flow animation

### 4. Export Code

- Switch to **Code** tab in right panel
- Select framework (PyTorch, TensorFlow, JAX)
- Toggle training code and comments
- Copy or download the generated code

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui (Radix UI) |
| **State Management** | Zustand |
| **Visualization** | HTML5 Canvas API |
| **Icons** | Lucide React |
| **Notifications** | Sonner |

---

## 🎨 Layer Types Reference

### Dense Layer
Fully connected neural network layer.

| Parameter | Type | Description |
|-----------|------|-------------|
| Units | number | Number of neurons |
| Activation | string | Activation function |
| Use Bias | boolean | Whether to use bias |
| Initializer | string | Weight initialization |

### Conv2D Layer
2D convolutional layer for processing images.

| Parameter | Type | Description |
|-----------|------|-------------|
| Filters | number | Number of output filters |
| Kernel Size | [number, number] | Size of convolution kernel |
| Stride | [number, number] | Stride of convolution |
| Padding | 'valid' \| 'same' | Padding mode |
| Activation | string | Activation function |

### Pooling Layers (MaxPool2D, AvgPool2D)
Downsampling layers for reducing spatial dimensions.

| Parameter | Type | Description |
|-----------|------|-------------|
| Kernel Size | [number, number] | Size of pooling window |
| Stride | [number, number] | Stride of pooling |

### Dropout Layer
Regularization layer to prevent overfitting.

| Parameter | Type | Description |
|-----------|------|-------------|
| Rate | number | Fraction of inputs to drop (0-0.9) |

### BatchNorm Layer
Batch normalization for stabilizing training.

### LSTM / GRU Layers
Recurrent layers for sequence processing.

| Parameter | Type | Description |
|-----------|------|-------------|
| Units | number | Number of hidden units |
| Activation | string | Activation function |

### Flatten Layer
Flattens multi-dimensional input to 1D.

---

## 📊 Activation Functions

| Function | Color | Best For |
|----------|-------|----------|
| ReLU | 🟢 Green | Hidden layers, fast training |
| Leaky ReLU | 🟢 Teal | Avoiding dead neurons |
| Sigmoid | 🔵 Blue | Binary classification output |
| Tanh | 🟡 Amber | Hidden layers, bounded output |
| Softmax | 🟣 Purple | Multi-class classification output |
| GELU | 🩷 Pink | Transformer architectures |
| Swish | 🔵 Cyan | Deep networks |
| Linear | ⚫ Gray | Regression output |

---

## 🔌 API Reference

### State Management (Zustand)

```typescript
// Access the store
import { useNeuralNetworkStore } from '@/store/neural-network-store';

// Available actions
const {
  network,           // Current network configuration
  selectedLayerId,   // Currently selected layer
  animation,         // Animation state
  zoom,              // Canvas zoom level
  pan,               // Canvas pan offset
  
  // Actions
  addLayer,          // Add new layer
  removeLayer,       // Remove layer by ID
  updateLayer,       // Update layer properties
  reorderLayers,     // Change layer order
  selectLayer,       // Select a layer
  loadPreset,        // Load preset template
  resetNetwork,      // Reset to default
  setAnimation,      // Control animation
  setZoom,           // Set zoom level
  setPan,            // Set pan offset
} = useNeuralNetworkStore();
```

### Layer Interface

```typescript
interface NeuralLayer {
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
  initializer?: string;
  useBias?: boolean;
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
   ```bash
   git checkout -b feat/feature-name
   ```
3. Commit your changes
   ```bash
   git commit -m "feat: add feature description"
   ```
4. Push to the branch
   ```bash
   git push origin feat/feature-name
   ```
5. Open a Pull Request

### Contribution Guidelines

- Follow Conventional Commits
- Maintain TypeScript strict mode
- Update documentation for UI changes
- Test on multiple screen sizes

---

## 🗺️ Roadmap

| Version | Features |
|---------|----------|
| **v0.2** | ResNet/Inception templates, layer visualization |
| **v0.3** | Training simulation with loss/accuracy charts |
| **v0.4** | Collaborative editing, save/load networks |
| **v0.5** | Custom layer creation, attention visualization |
| **v1.0** | ONNX export, Hugging Face integration |

---

## 📄 License

MIT License © 2024 VasuML07

---

## 📬 Contact

- **GitHub**: [@VasuML07](https://github.com/VasuML07)
- **Repository**: [NeuralNetworkVisualizer](https://github.com/VasuML07/NeuralNetworkVisualizer)

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Lucide](https://lucide.dev/) - Open-source icons
- [Zustand](https://zustand-demo.pmnd.rs/) - Simple state management
- [Next.js](https://nextjs.org/) - The React framework

---

**If this project helps you, consider giving it a ⭐ star!**
