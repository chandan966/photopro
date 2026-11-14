import React, { useState } from "react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Crop as CropIcon,
  Eraser,
  Eye,
  FlipHorizontal,
  FlipVertical,
  Grid,
  Italic,
  Maximize2,
  Minimize2,
  Move,
  Paintbrush,
  Pipette,
  RotateCcw,
  RotateCw,
  Scissors,
  Square,
  Type,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import "./ToolOptionsBar.css";

const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
];

const FONT_FAMILIES = [
  "Inter",
  "Roboto",
  "Arial",
  "Helvetica",
  "Montserrat",
  "Poppins",
  "Georgia",
  "Times New Roman",
  "Impact",
  "Courier New",
  "Pacifico",
  "Playfair Display",
  "Bebas Neue",
];

const CROP_RATIOS = [
  { id: "free", label: "Free Ratio", ratio: null },
  { id: "original", label: "Original", ratio: "original" },
  { id: "1:1", label: "1:1 Square", ratio: 1 },
  { id: "16:9", label: "16:9 Landscape", ratio: 16 / 9 },
  { id: "9:16", label: "9:16 Story/Reel", ratio: 9 / 16 },
  { id: "4:3", label: "4:3 Classic", ratio: 4 / 3 },
  { id: "3:2", label: "3:2 Photo", ratio: 3 / 2 },
  { id: "2:3", label: "2:3 Portrait", ratio: 2 / 3 },
];

const SHAPE_TYPES = [
  { id: "rectangle", label: "Rectangle" },
  { id: "rounded-rect", label: "Rounded Rect" },
  { id: "circle", label: "Ellipse / Circle" },
  { id: "triangle", label: "Triangle" },
  { id: "star", label: "5-Point Star" },
  { id: "polygon", label: "Hexagon" },
  { id: "line", label: "Line" },
  { id: "arrow", label: "Arrow" },
];

export default function ToolOptionsBar({
  activeTool = "move",
  // Brush
  brushSize = 35,
  onChangeBrushSize,
  brushHardness = 100,
  onChangeBrushHardness,
  brushOpacity = 100,
  onChangeBrushOpacity,
  brushFlow = 100,
  onChangeBrushFlow,
  brushBlendMode = "normal",
  onChangeBrushBlendMode,
  // Eraser
  eraserSize = 35,
  onChangeEraserSize,
  eraserOpacity = 100,
  onChangeEraserOpacity,
  // Wand / Selection
  wandTolerance = 32,
  onChangeWandTolerance,
  isContiguous = true,
  onToggleContiguous,
  onEraseSelected,
  onSelectAll,
  onDeselect,
  onInvertSelection,
  hasSelection = false,
  // Crop
  cropRatio = "free",
  onChangeCropRatio,
  onApplyCrop,
  onCancelCrop,
  // Text
  selectedLayer,
  onUpdateLayer,
  // Shape
  shapeType = "rectangle",
  onChangeShapeType,
  shapeFill = "#0ea5e9",
  onChangeShapeFill,
  shapeStroke = "#ffffff",
  onChangeShapeStroke,
  shapeStrokeWidth = 2,
  onChangeShapeStrokeWidth,
  // Transform / Move
  showTransformControls = true,
  onToggleTransformControls,
  onAlignLayer,
  // Zoom
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onActualSize,
  // Colors
  foregroundColor = "#0ea5e9",
  onOpenColorPicker,
}) {
  const [brushDropdownOpen, setBrushDropdownOpen] = useState(false);

  return (
    <div className="tool-options-bar" role="toolbar" aria-label="Tool Options">
      {/* 1. MOVE TOOL OPTIONS */}
      {activeTool === "move" && (
        <div className="options-group">
          <span className="options-tool-title">Move Tool:</span>
          <label className="options-checkbox-label" title="Show Bounding Box Handles (Ctrl+T)">
            <input
              type="checkbox"
              checked={showTransformControls}
              onChange={(e) => onToggleTransformControls?.(e.target.checked)}
            />
            <span>Transform Controls</span>
          </label>

          <div className="options-divider" />

          <span className="options-label">Align:</span>
          <div className="options-align-btns">
            <button
              className="options-btn-icon"
              onClick={() => onAlignLayer?.("left")}
              title="Align Left Edges"
            >
              <AlignStartHorizontal size={14} />
            </button>
            <button
              className="options-btn-icon"
              onClick={() => onAlignLayer?.("h-center")}
              title="Align Horizontal Centers"
            >
              <AlignCenterHorizontal size={14} />
            </button>
            <button
              className="options-btn-icon"
              onClick={() => onAlignLayer?.("right")}
              title="Align Right Edges"
            >
              <AlignEndHorizontal size={14} />
            </button>
            <button
              className="options-btn-icon"
              onClick={() => onAlignLayer?.("top")}
              title="Align Top Edges"
            >
              <AlignStartVertical size={14} />
            </button>
            <button
              className="options-btn-icon"
              onClick={() => onAlignLayer?.("v-center")}
              title="Align Vertical Centers"
            >
              <AlignCenterVertical size={14} />
            </button>
            <button
              className="options-btn-icon"
              onClick={() => onAlignLayer?.("bottom")}
              title="Align Bottom Edges"
            >
              <AlignEndVertical size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 2. BRUSH TOOL OPTIONS */}
      {activeTool === "brush" && (
        <div className="options-group">
          <span className="options-tool-title">Brush:</span>

          {/* Size Popover Toggle */}
          <div className="options-brush-size-box">
            <button
              className="options-brush-picker-btn"
              onClick={() => setBrushDropdownOpen((v) => !v)}
              title="Brush Preset Picker"
            >
              <span
                className="brush-circle-preview"
                style={{
                  width: Math.min(20, Math.max(4, brushSize / 4)),
                  height: Math.min(20, Math.max(4, brushSize / 4)),
                }}
              />
              <span className="brush-size-val">{brushSize}px</span>
              <ChevronDown size={11} />
            </button>

            {brushDropdownOpen && (
              <div className="brush-dropdown-card">
                <div className="brush-dropdown-row">
                  <span>Size:</span>
                  <input
                    type="range"
                    min="1"
                    max="300"
                    value={brushSize}
                    onChange={(e) => onChangeBrushSize?.(Number(e.target.value))}
                  />
                  <b>{brushSize}px</b>
                </div>
                <div className="brush-dropdown-row">
                  <span>Hardness:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={brushHardness}
                    onChange={(e) => onChangeBrushHardness?.(Number(e.target.value))}
                  />
                  <b>{brushHardness}%</b>
                </div>
                <button
                  className="brush-dropdown-close"
                  onClick={() => setBrushDropdownOpen(false)}
                >
                  Done
                </button>
              </div>
            )}
          </div>

          <div className="options-divider" />

          {/* Mode */}
          <div className="options-field">
            <span className="options-label">Mode:</span>
            <select
              className="options-select"
              value={brushBlendMode}
              onChange={(e) => onChangeBrushBlendMode?.(e.target.value)}
            >
              {BLEND_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1).replace("-", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Opacity */}
          <div className="options-field">
            <span className="options-label">Opacity:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={brushOpacity}
              onChange={(e) => onChangeBrushOpacity?.(Number(e.target.value))}
              className="options-mini-slider"
            />
            <span className="options-slider-num">{brushOpacity}%</span>
          </div>

          {/* Flow */}
          <div className="options-field">
            <span className="options-label">Flow:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={brushFlow}
              onChange={(e) => onChangeBrushFlow?.(Number(e.target.value))}
              className="options-mini-slider"
            />
            <span className="options-slider-num">{brushFlow}%</span>
          </div>

          {/* Color swatch */}
          <div
            className="options-color-swatch"
            style={{ backgroundColor: foregroundColor }}
            onClick={() => onOpenColorPicker?.("foreground")}
            title="Brush Color (Click to change)"
          />
        </div>
      )}

      {/* 3. ERASER TOOL OPTIONS */}
      {activeTool === "eraser" && (
        <div className="options-group">
          <span className="options-tool-title">Eraser:</span>

          <div className="options-field">
            <span className="options-label">Size:</span>
            <input
              type="range"
              min="1"
              max="300"
              value={eraserSize}
              onChange={(e) => onChangeEraserSize?.(Number(e.target.value))}
              className="options-mini-slider"
            />
            <span className="options-slider-num">{eraserSize}px</span>
          </div>

          <div className="options-field">
            <span className="options-label">Opacity:</span>
            <input
              type="range"
              min="1"
              max="100"
              value={eraserOpacity}
              onChange={(e) => onChangeEraserOpacity?.(Number(e.target.value))}
              className="options-mini-slider"
            />
            <span className="options-slider-num">{eraserOpacity}%</span>
          </div>
        </div>
      )}

      {/* 4. MAGIC WAND & SELECTIONS OPTIONS */}
      {(activeTool === "wand" || activeTool === "marquee" || activeTool === "lasso") && (
        <div className="options-group">
          <span className="options-tool-title">
            {activeTool === "wand" ? "Magic Wand:" : activeTool === "marquee" ? "Marquee:" : "Lasso:"}
          </span>

          {activeTool === "wand" && (
            <>
              <div className="options-field">
                <span className="options-label">Tolerance:</span>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={wandTolerance}
                  onChange={(e) => onChangeWandTolerance?.(Number(e.target.value))}
                  className="options-mini-slider"
                />
                <span className="options-slider-num">{wandTolerance}</span>
              </div>

              <label className="options-checkbox-label" title="Select only touching pixels of matching color">
                <input
                  type="checkbox"
                  checked={isContiguous}
                  onChange={(e) => onToggleContiguous?.(e.target.checked)}
                />
                <span>Contiguous</span>
              </label>

              <div className="options-divider" />
            </>
          )}

          {/* Quick Selection Actions */}
          <button
            className={`options-pill-btn ${hasSelection ? "active" : ""}`}
            onClick={onInvertSelection}
            title="Invert Selection (Ctrl+Shift+I)"
          >
            Invert
          </button>
          <button
            className="options-pill-btn"
            onClick={onDeselect}
            title="Deselect All (Ctrl+D)"
          >
            Deselect
          </button>
          {hasSelection && (
            <button
              className="options-pill-btn danger"
              onClick={onEraseSelected}
              title="Delete Selected Pixels (Del)"
            >
              Erase Selected
            </button>
          )}
        </div>
      )}

      {/* 5. CROP TOOL OPTIONS */}
      {activeTool === "crop" && (
        <div className="options-group">
          <span className="options-tool-title">Crop:</span>
          <select
            className="options-select"
            value={cropRatio}
            onChange={(e) => onChangeCropRatio?.(e.target.value)}
          >
            {CROP_RATIOS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          <div className="options-divider" />

          <button
            className="options-pill-btn success"
            onClick={onApplyCrop}
            title="Commit Crop (Enter)"
          >
            <Check size={13} style={{ marginRight: 3 }} /> Commit
          </button>
          <button
            className="options-pill-btn"
            onClick={onCancelCrop}
            title="Cancel Crop (Esc)"
          >
            <X size={13} style={{ marginRight: 3 }} /> Cancel
          </button>
        </div>
      )}

      {/* 6. TYPE / TEXT TOOL OPTIONS */}
      {activeTool === "text" && (
        <div className="options-group">
          <span className="options-tool-title">Type Tool:</span>

          {/* Font Family */}
          <select
            className="options-select"
            value={selectedLayer?.fontFamily || "Inter"}
            onChange={(e) => onUpdateLayer?.(selectedLayer?.id, { fontFamily: e.target.value })}
            style={{ width: 120 }}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <div className="options-field">
            <span className="options-label">Size:</span>
            <input
              type="number"
              min="8"
              max="288"
              value={selectedLayer?.fontSize || 42}
              onChange={(e) => onUpdateLayer?.(selectedLayer?.id, { fontSize: Number(e.target.value) })}
              className="options-num-input"
            />
            <span className="options-unit">pt</span>
          </div>

          {/* Font Style Toggles */}
          <div className="options-style-btns">
            <button
              className={`options-btn-icon ${selectedLayer?.fontWeight === "bold" ? "active" : ""}`}
              onClick={() =>
                onUpdateLayer?.(selectedLayer?.id, {
                  fontWeight: selectedLayer?.fontWeight === "bold" ? "normal" : "bold",
                })
              }
              title="Bold (Ctrl+B)"
            >
              <Bold size={13} />
            </button>
            <button
              className={`options-btn-icon ${selectedLayer?.fontStyle === "italic" ? "active" : ""}`}
              onClick={() =>
                onUpdateLayer?.(selectedLayer?.id, {
                  fontStyle: selectedLayer?.fontStyle === "italic" ? "normal" : "italic",
                })
              }
              title="Italic (Ctrl+I)"
            >
              <Italic size={13} />
            </button>
          </div>

          {/* Alignment */}
          <div className="options-align-btns">
            <button
              className={`options-btn-icon ${(!selectedLayer?.textAlign || selectedLayer?.textAlign === "left") ? "active" : ""}`}
              onClick={() => onUpdateLayer?.(selectedLayer?.id, { textAlign: "left" })}
              title="Align Left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              className={`options-btn-icon ${selectedLayer?.textAlign === "center" ? "active" : ""}`}
              onClick={() => onUpdateLayer?.(selectedLayer?.id, { textAlign: "center" })}
              title="Align Center"
            >
              <AlignCenter size={13} />
            </button>
            <button
              className={`options-btn-icon ${selectedLayer?.textAlign === "right" ? "active" : ""}`}
              onClick={() => onUpdateLayer?.(selectedLayer?.id, { textAlign: "right" })}
              title="Align Right"
            >
              <AlignRight size={13} />
            </button>
          </div>

          {/* Text Color Swatch */}
          <div
            className="options-color-swatch"
            style={{ backgroundColor: selectedLayer?.color || "#ffffff" }}
            onClick={() => onOpenColorPicker?.("layer")}
            title="Set Text Color"
          />
        </div>
      )}

      {/* 7. VECTOR SHAPES OPTIONS */}
      {activeTool === "shape" && (
        <div className="options-group">
          <span className="options-tool-title">Shape:</span>

          <select
            className="options-select"
            value={shapeType}
            onChange={(e) => onChangeShapeType?.(e.target.value)}
          >
            {SHAPE_TYPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="options-divider" />

          {/* Fill Color */}
          <span className="options-label">Fill:</span>
          <div
            className="options-color-swatch"
            style={{ backgroundColor: shapeFill }}
            onClick={() => onOpenColorPicker?.("shape-fill")}
            title="Shape Fill Color"
          />

          {/* Stroke Color */}
          <span className="options-label" style={{ marginLeft: 6 }}>Stroke:</span>
          <div
            className="options-color-swatch"
            style={{ backgroundColor: shapeStroke }}
            onClick={() => onOpenColorPicker?.("shape-stroke")}
            title="Shape Stroke Color"
          />

          <div className="options-field">
            <span className="options-label">Width:</span>
            <input
              type="number"
              min="0"
              max="50"
              value={shapeStrokeWidth}
              onChange={(e) => onChangeShapeStrokeWidth?.(Number(e.target.value))}
              className="options-num-input"
            />
            <span className="options-unit">px</span>
          </div>
        </div>
      )}

      {/* 8. ZOOM & PAN OPTIONS */}
      {(activeTool === "zoom" || activeTool === "pan") && (
        <div className="options-group">
          <span className="options-tool-title">{activeTool === "zoom" ? "Zoom:" : "Hand / Pan:"}</span>

          <button className="options-pill-btn" onClick={onZoomIn} title="Zoom In (Ctrl++)">
            <ZoomIn size={13} style={{ marginRight: 3 }} /> Zoom In
          </button>
          <button className="options-pill-btn" onClick={onZoomOut} title="Zoom Out (Ctrl+-">
            <ZoomOut size={13} style={{ marginRight: 3 }} /> Zoom Out
          </button>
          <button className="options-pill-btn" onClick={onFitScreen} title="Fit Screen (Ctrl+0)">
            Fit Screen
          </button>
          <button className="options-pill-btn" onClick={onActualSize} title="100% Actual Pixels (Ctrl+1)">
            100%
          </button>
        </div>
      )}

      {/* 9. EYEDROPPER OPTIONS */}
      {activeTool === "eyedropper" && (
        <div className="options-group">
          <span className="options-tool-title">Eyedropper:</span>
          <span className="options-label">Click canvas to sample color into Foreground Swatch</span>
          <div
            className="options-color-swatch"
            style={{ backgroundColor: foregroundColor, marginLeft: 8 }}
            title={`Sampled Color: ${foregroundColor}`}
          />
        </div>
      )}

      {/* RIGHT SIDE GLOBAL HUD BADGES */}
      <div className="options-right-hud">
        <span className="hud-badge zoom-indicator">{Math.round(zoom)}%</span>
        <span className="hud-badge mode-indicator">RGB/8bit</span>
      </div>
    </div>
  );
}
