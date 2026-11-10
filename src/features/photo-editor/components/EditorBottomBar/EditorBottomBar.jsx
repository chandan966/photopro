import React from "react";
import { Minus, Plus } from "lucide-react";
import "./EditorBottomBar.css";

export default function EditorBottomBar({
  width = 1280,
  height = 720,
  zoom = 100,
  onZoomChange,
  onFitScreen,
  onActualSize,
  cursorPos = { x: 0, y: 0 },
  activeTool = "move",
  hasSelection = false,
}) {
  const getToolHint = () => {
    switch (activeTool) {
      case "move":
        return "Move: Drag layer to reposition. Drag handles to transform.";
      case "marquee":
        return "Marquee: Click & drag to make a rectangular selection.";
      case "lasso":
        return "Lasso: Click & drag freehand to draw selection boundary.";
      case "wand":
        return "Magic Wand: Click to select contiguous color region.";
      case "crop":
        return "Crop: Adjust crop handles or choose an aspect ratio.";
      case "brush":
        return "Brush: Paint on layer. Adjust size/hardness in properties.";
      case "eraser":
        return "Eraser: Erase layer pixels to transparency.";
      case "clone":
        return "Clone Stamp: Alt+Click to set source anchor, then paint.";
      case "healing":
        return "Spot Healing: Click on blemishes to blend away.";
      case "dodge":
        return "Dodge/Burn/Sponge: Paint over pixels to adjust tones.";
      case "text":
        return "Type Tool: Click on canvas to insert editable typography.";
      case "shape":
        return "Shape Tool: Click on canvas to place vector shapes.";
      case "eyedropper":
        return "Eyedropper: Click anywhere to sample pixel color.";
      case "pan":
        return "Hand Tool: Drag to pan canvas view. (Shortcut: Hold Space).";
      case "zoom":
        return "Zoom Tool: Click to zoom in. Alt+Click to zoom out.";
      default:
        return "Ready";
    }
  };

  return (
    <footer className="editor-bottombar">
      <div className="bottombar-left">
        <div className="bottombar-info-item">
          <span className="bottombar-info-label">Doc:</span>
          <span className="bottombar-info-val">{width} × {height} px</span>
        </div>
        <div className="bottombar-info-item">
          <span className="bottombar-info-label">Cursor:</span>
          <span className="bottombar-info-val">X: {Math.round(cursorPos.x)} Y: {Math.round(cursorPos.y)}</span>
        </div>
        {hasSelection && (
          <div className="bottombar-info-item">
            <span className="bottombar-tool-hint">Selection Active</span>
          </div>
        )}
      </div>

      <div className="bottombar-center">
        <span className="bottombar-tool-hint">{getToolHint()}</span>
      </div>

      <div className="bottombar-right">
        <div className="bottombar-zoom-ctrls">
          <button
            className="bottombar-btn"
            onClick={() => onZoomChange?.(Math.max(10, Math.round(zoom - 10)))}
            title="Zoom Out (Ctrl+-)"
          >
            <Minus size={12} />
          </button>
          <span className="bottombar-zoom-text">{Math.round(zoom)}%</span>
          <button
            className="bottombar-btn"
            onClick={() => onZoomChange?.(Math.min(500, Math.round(zoom + 10)))}
            title="Zoom In (Ctrl++)"
          >
            <Plus size={12} />
          </button>
          <button className="bottombar-btn" onClick={onFitScreen} title="Fit Screen (Ctrl+0)">
            Fit
          </button>
          <button className="bottombar-btn" onClick={onActualSize} title="100% Size (Ctrl+1)">
            100%
          </button>
        </div>
      </div>
    </footer>
  );
}
