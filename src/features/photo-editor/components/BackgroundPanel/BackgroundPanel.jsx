import React, { useState } from "react";
import {
  Wand2,
  Paintbrush,
  Sparkles,
  Eraser,
  Palette,
  Layers,
  Sliders,
  Check,
  RefreshCw,
} from "lucide-react";
import "./BackgroundPanel.css";

const SOLID_PRESETS = [
  { label: "Transparent", value: "transparent" },
  { label: "Pure White", value: "#ffffff" },
  { label: "Ice Blue", value: "#f0f9ff" },
  { label: "Light Sky", value: "#e0f2fe" },
  { label: "Bright Azure", value: "#0ea5e9" },
  { label: "Deep Sapphire", value: "#0284c7" },
  { label: "Navy Slate", value: "#0c4a6e" },
  { label: "Midnight Sky", value: "#082f49" },
  { label: "Slate Gray", value: "#475569" },
  { label: "Soft Sand", value: "#fef3c7" },
  { label: "Mint Mist", value: "#d1fae5" },
  { label: "Ocean Breeze", value: "#bae6fd" },
];

const GRADIENT_OPTIONS = [
  {
    id: "sky-azure",
    name: "Sky Azure",
    css: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%)",
  },
  {
    id: "ocean-flow",
    name: "Ocean Flow",
    css: "linear-gradient(135deg, #0ea5e9 0%, #ffffff 100%)",
  },
  {
    id: "soft-ice",
    name: "Soft Ice Blue",
    css: "linear-gradient(135deg, #f0f9ff 0%, #bae6fd 100%)",
  },
  {
    id: "dark-azure",
    name: "Dark Azure",
    css: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)",
  },
  {
    id: "studio-pure",
    name: "Studio Light",
    css: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)",
  },
  {
    id: "neon-blue",
    name: "Neon Blue Glow",
    css: "linear-gradient(90deg, #0ea5e9 0%, #0284c7 50%, #0c4a6e 100%)",
  },
];

export default function BackgroundPanel({
  bgType = "color", // 'color', 'gradient', 'transparent'
  canvasColor = "#ffffff",
  onChangeBgColor,
  activeGradient = "",
  onChangeGradient,
  wandTolerance = 32,
  onChangeWandTolerance,
  isContiguous = true,
  onToggleContiguous,
  onActivateMagicWand,
  onActivateEraser,
  onEraseSelected,
  onInvertSelection,
  onClearSelection,
  hasSelection = false,
  onApplyBackgroundBlur,
}) {
  const [blurRadius, setBlurRadius] = useState(16);
  const [customHex, setCustomHex] = useState(canvasColor === "transparent" ? "#ffffff" : canvasColor);

  return (
    <div className="background-panel">
      <div className="bg-panel-header">
        <h3>Manual Background Suite</h3>
        <p>100% Client-Side Traditional Algorithms (Zero AI Models)</p>
      </div>

      {/* 1. SOLID BACKGROUND COLOR */}
      <div className="bg-section">
        <div className="bg-section-title">
          <Palette size={14} /> Solid Color Replacement
        </div>
        <div className="bg-swatches-grid">
          {SOLID_PRESETS.map((p) => {
            const isSelected = bgType === "color" && canvasColor === p.value;
            return (
              <button
                key={p.value}
                className={`bg-swatch-btn ${isSelected ? "selected" : ""}`}
                style={{
                  background:
                    p.value === "transparent"
                      ? "repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 10px 10px"
                      : p.value,
                }}
                onClick={() => {
                  onChangeBgColor?.(p.value);
                  if (p.value !== "transparent") setCustomHex(p.value);
                }}
                title={p.label}
              >
                {isSelected && (
                  <Check
                    size={14}
                    color={p.value === "#ffffff" || p.value === "transparent" ? "#0ea5e9" : "#ffffff"}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="custom-color-row">
          <span>Custom Hex:</span>
          <div className="hex-input-group">
            <input
              type="color"
              value={customHex}
              onChange={(e) => {
                setCustomHex(e.target.value);
                onChangeBgColor?.(e.target.value);
              }}
              className="color-picker-input"
            />
            <input
              type="text"
              value={customHex}
              onChange={(e) => {
                setCustomHex(e.target.value);
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                  onChangeBgColor?.(e.target.value);
                }
              }}
              className="hex-text-input"
              maxLength={7}
            />
          </div>
        </div>
      </div>

      {/* 2. GRADIENT BACKGROUNDS */}
      <div className="bg-section">
        <div className="bg-section-title">
          <Layers size={14} /> Gradient Backgrounds
        </div>
        <div className="gradient-presets-list">
          {GRADIENT_OPTIONS.map((grad) => {
            const isSelected = bgType === "gradient" && activeGradient === grad.css;
            return (
              <button
                key={grad.id}
                className={`gradient-card-btn ${isSelected ? "selected" : ""}`}
                style={{ background: grad.css }}
                onClick={() => onChangeGradient?.(grad.css)}
              >
                <span className="grad-label">{grad.name}</span>
                {isSelected && <Check size={14} color="#ffffff" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BACKGROUND BLUR */}
      <div className="bg-section">
        <div className="bg-section-title">
          <Sparkles size={14} /> Background Blur (Bokeh)
        </div>
        <div className="blur-control-box">
          <div className="slider-label-row">
            <span>Blur Radius</span>
            <span className="slider-val">{blurRadius}px</span>
          </div>
          <input
            type="range"
            min="2"
            max="40"
            value={blurRadius}
            onChange={(e) => setBlurRadius(Number(e.target.value))}
            className="panel-slider"
          />
          <button
            className="button button-primary button-small full-width"
            onClick={() => onApplyBackgroundBlur?.(blurRadius)}
            style={{ marginTop: "8px" }}
          >
            Apply Blur to Background Layer
          </button>
        </div>
      </div>

      {/* 4. MAGIC WAND COLOR REMOVAL */}
      <div className="bg-section">
        <div className="bg-section-title">
          <Wand2 size={14} /> Magic Wand Selection (Color Tolerance)
        </div>
        <p className="section-hint">
          Click any color region on canvas to select with Euclidean color distance matching.
        </p>

        <div className="slider-label-row">
          <span>Tolerance Threshold</span>
          <span className="slider-val">{wandTolerance}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={wandTolerance}
          onChange={(e) => onChangeWandTolerance?.(Number(e.target.value))}
          className="panel-slider"
        />

        <label className="toggle-row">
          <input
            type="checkbox"
            checked={isContiguous}
            onChange={(e) => onToggleContiguous?.(e.target.checked)}
          />
          <span>Contiguous Only (Adjacent pixels)</span>
        </label>

        <div className="wand-actions-grid">
          <button
            className="button button-outline button-small"
            onClick={onActivateMagicWand}
          >
            <Wand2 size={13} /> Select with Wand
          </button>
          <button
            className="button button-outline button-small"
            onClick={onActivateEraser}
          >
            <Eraser size={13} /> Manual Eraser
          </button>
          <button
            className="button button-primary button-small"
            onClick={onEraseSelected}
            disabled={!hasSelection}
          >
            Cutout / Delete Selection
          </button>
          <button
            className="button button-outline button-small"
            onClick={onInvertSelection}
            disabled={!hasSelection}
          >
            <RefreshCw size={13} /> Invert Mask
          </button>
        </div>
      </div>
    </div>
  );
}
