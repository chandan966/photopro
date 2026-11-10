# PhotoPro Developer Guide

## Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

## Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Create production bundle
npm run build

# 4. Preview production build locally
npm run preview
```

## Adding a New Component
When adding a new component to PhotoPro, follow the mandatory directory convention:

1. Create a dedicated folder: `src/components/[category]/[ComponentName]/` or `src/features/[feature]/components/[ComponentName]/`.
2. Add the three required files:
   - `[ComponentName].jsx`
   - `[ComponentName].css`
   - `README.md`
3. Import the stylesheet at the top of the component:
   ```jsx
   import "./[ComponentName].css";
   ```
4. Re-export cleanly if exposing across features.

## Styling Rules
- Use CSS Custom Properties defined in `src/styles/global.css`:
  - Obsidian Dark: `--bg-primary: #090b0e`, `--bg-secondary: #0f1218`, `--bg-elevated: #161b22`
  - Crimson Accents: `--accent-primary: #e11d48`, `--accent-hover: #ff204e`
  - Borders: `--border-subtle: #1e2430`, `--border-accent: rgba(225, 29, 72, 0.4)`
