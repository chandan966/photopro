# PhotoPro Directory Structure Reference

```
MAKEPHOTO/
├── .env.example                          # Environment variable template
├── index.html                            # HTML entry point with CSP and security meta tags
├── package.json                          # Dependencies and build scripts
├── vite.config.js                        # Vite bundler configuration
│
├── docs/                                 # Engineering and security documentation
│   ├── ARCHITECTURE.md                   # System design, SOLID/DRY principles
│   ├── DEVELOPMENT_GUIDE.md              # Setup, conventions, workflow
│   ├── FEATURE_GUIDE.md                  # Comprehensive guide to each editing module
│   ├── ENVIRONMENT_SETUP.md              # Installation and development prereqs
│   ├── API_DOCUMENTATION.md              # Service functions and utility API docs
│   ├── PROJECT_STRUCTURE.md              # Directory map and guidelines
│   └── security/
│       ├── SECURITY.md                   # Application security policies & defenses
│       ├── SECURITY_CHECKLIST.md         # Production verification checklist
│       └── THREAT_MODEL.md               # STRIDE threat model analysis
│
├── src/
│   ├── main.jsx                          # React application entry point
│   ├── App.jsx                           # Root application shell & router
│   ├── styles/
│   │   └── global.css                    # Design tokens and base utility styles
│   │
│   ├── constants/
│   │   └── presets.js                    # Design presets, filter constants, tool definitions
│   │
│   ├── utils/
│   │   ├── imageTools.js                 # Canvas utilities, blob management, downloads
│   │   └── fileValidation.js             # Magic numbers, size validation, SVG sanitization
│   │
│   ├── security/
│   │   └── securityAudit.js              # URL validator, HTML escaper, storage monitor
│   │
│   ├── components/                       # Shared & layout components
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Header.css
│   │   │   │   └── README.md
│   │   │   └── Footer/
│   │   │       ├── Footer.jsx
│   │   │       ├── Footer.css
│   │   │       └── README.md
│   │   └── shared/
│   │       ├── BrandLogo/
│   │       │   ├── BrandLogo.jsx
│   │   │       ├── BrandLogo.css
│   │   │       └── README.md
│   │       ├── SocialLogos/
│   │       │   ├── SocialLogos.jsx
│   │   │       ├── SocialLogos.css
│   │   │       └── README.md
│   │       ├── FeaturesModal/
│   │       │   ├── FeaturesModal.jsx
│   │   │       ├── FeaturesModal.css
│   │   │       └── README.md
│   │       └── ToolPage/
│   │           ├── ToolPage.jsx
│   │           ├── ToolPage.css
│   │           └── README.md
│   │
│   ├── features/                         # Modular domain features
│   │   ├── photo-editor/
│   │   │   ├── README.md
│   │   │   ├── components/
│   │   │   │   ├── EditorPage/
│   │   │   │   │   ├── EditorPage.jsx
│   │   │   │   │   ├── EditorPage.css
│   │   │   │   │   └── README.md
│   │   │   │   ├── ExportModal/
│   │   │   │   │   ├── ExportModal.jsx
│   │   │   │   │   ├── ExportModal.css
│   │   │   │   │   └── README.md
│   │   │   │   ├── LightroomPanel/
│   │   │   │   │   ├── LightroomPanel.jsx
│   │   │   │   │   ├── LightroomPanel.css
│   │   │   │   │   └── README.md
│   │   │   │   ├── RetouchPanel/
│   │   │   │   │   ├── RetouchPanel.jsx
│   │   │   │   │   ├── RetouchPanel.css
│   │   │   │   │   └── README.md
│   │   │   │   ├── EffectsPanel/
│   │   │   │   │   ├── EffectsPanel.jsx
│   │   │   │   │   ├── EffectsPanel.css
│   │   │   │   │   └── README.md
│   │   │   │   └── BeforeAfterSlider/
│   │   │   │       ├── BeforeAfterSlider.jsx
│   │   │   │       ├── BeforeAfterSlider.css
│   │   │   │       └── README.md
│   │   │   └── services/
│   │   │       ├── filters.js
│   │   │       ├── tools.js
│   │   │       └── projectStore.js
│   │   │
│   │   ├── video-editor/
│   │   │   ├── README.md
│   │   │   └── components/
│   │   │       └── VideoStudio/
│   │   │           ├── VideoStudio.jsx
│   │   │           ├── VideoStudio.css
│   │   │           └── README.md
│   │   │
│   │   ├── pdf-studio/
│   │   │   ├── README.md
│   │   │   ├── components/
│   │   │   │   └── PDFStudio/
│   │   │   │       ├── PDFStudio.jsx
│   │   │   │       ├── PDFStudio.css
│   │   │   │       └── README.md
│   │   │   └── services/
│   │   │       └── pdfEngine.js
│   │   │
│   │   └── ai-tools/
│   │       ├── README.md
│   │       └── components/
│   │           ├── BackgroundTool/
│   │           │   ├── BackgroundTool.jsx
│   │           │   ├── BackgroundTool.css
│   │           │   └── README.md
│   │           ├── ImageTool/
│   │           │   ├── ImageTool.jsx
│   │           │   ├── ImageTool.css
│   │           │   └── README.md
│   │           └── PaletteTool/
│   │               ├── PaletteTool.jsx
│   │               ├── PaletteTool.css
│   │               └── README.md
│   │
│   └── pages/
│       └── HomePage/
│           ├── HomePage.jsx
│           ├── HomePage.css
│           └── README.md
```

## Architectural Guidelines
1. **Side-by-Side Co-location:** Every React component lives in its own named folder alongside its styling stylesheet (`Component.css`) and documentation (`README.md`).
2. **Feature Isolation:** Feature folders group related components, services, and hooks. Shared utilities live in `src/utils/` and shared UI components live in `src/components/shared/`.
3. **Zero Secrets in Frontend:** The application is entirely client-side; no sensitive API keys or tokens are stored in the bundle.
