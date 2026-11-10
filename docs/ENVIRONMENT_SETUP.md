# PhotoPro Environment Setup

## System Requirements
- **Operating Systems:** Windows 10/11, macOS 12+, Ubuntu 20.04+
- **Browser:** Chrome 100+, Edge 100+, Firefox 105+, Safari 16+ (WebAssembly and Canvas 2D support required)
- **Node.js:** v18.17.0 or higher
- **Package Manager:** npm v9+

## Installation
```bash
git clone <repository-url>
cd MAKEPHOTO
npm install
```

## Running the Application
```bash
# Launch development server with HMR at http://localhost:5173
npm run dev
```

## Building for Production
```bash
# Compile and optimize assets into dist/
npm run build

# Preview production build locally
npm run preview
```

## Verification
Run `npm run build` to verify all components, CSS modules, and services compile without errors.
