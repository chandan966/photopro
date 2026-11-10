# PhotoPro System Architecture

## 1. Architectural Philosophy
PhotoPro is engineered as a **100% Client-Side, Privacy-First, Zero-Server Creative Suite**. 
All image rasterization, video frame rendering, neural model inference, and PDF manipulations execute locally inside the user's browser via WebAssembly (WASM), Web Audio API, Canvas 2D API, and HTML5 video primitives.

## 2. Core Design Principles

### Single Responsibility & Component Co-location
Every UI component is encapsulated in a dedicated directory containing:
- `[Component].jsx`: View logic, hooks, event handling.
- `[Component].css`: Scoped stylesheet enforcing the obsidian/crimson design tokens.
- `README.md`: Component API, props, and contract.

### High Cohesion, Low Coupling
- **Services are Pure:** `filters.js` and `pdfEngine.js` are decoupled from React state. They accept inputs (ImageData, TypedArrays, Blobs) and return outputs, enabling deterministic behavior and easy unit testing.
- **State Machine Tools:** `CanvasToolManager` in `tools.js` handles interactive canvas strokes (brush, clone stamp, eraser, healing) independently of React render cycles to maintain 60 FPS performance.

### Defense-in-Depth Security
- Binary magic byte validation blocks MIME spoofing.
- Pixel geometry limits prevent memory exhaustion from decompression bombs.
- SVG sanitization eliminates active scripting and Stored XSS vectors.
- Filename sanitization neutralizes directory traversal attacks on client downloads.

## 3. Data Flow Diagram

```
[User File Upload]
       │
       ▼
[fileValidation.js]  (Magic bytes, dimension cap, size check)
       │
       ├─────────────────────────┬─────────────────────────┐
       ▼                         ▼                         ▼
[Photo Editor]            [Video Studio]             [PDF Studio]
  - Layer Composite         - Timeline Multi-Track    - pdf-lib & jspdf
  - 8-Channel HSL           - Web Audio Synthesis     - Page Transforms
  - 3D LUT Parser           - Chroma Key Compositor   - E-Sign & AES Protection
  - CanvasToolManager       - MediaRecorder 4K        - Template Renderers
       │                         │                         │
       └─────────────────────────┼─────────────────────────┘
                                 ▼
                         [Export & Download]
```
