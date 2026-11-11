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
  { label: "Light Rose", value: "#fff5f5" },
  { label: "Soft Pink", value: "#fee2e2" },
  { label: "Ruby Red", value: "#ff2020" },
  { label: "Deep Crimson", value: "#800000" },
  { label: "Dark Obsidian", value: "#121316" },
  { label: "Studio Charcoal", value: "#1f222e" },
  { label: "Slate Gray", value: "#475569" },
  { label: "Soft Sand", value: "#fef3c7" },
  { label: "Mint Mist", value: "#d1fae5" },
  { label: "Ocean Breeze", value: "#e0f2fe" },
];

const GRADIENT_OPTIONS = [
  {
    id: "ruby-sunset",
    name: "Ruby Sunset",
    css: "linear-gradient(135deg, #ff4040 0%, #ff2020 50%, #800000 100%)",
  },
  {
    id: "crimson-flow",
    name: "Crimson Flow",
    css: "linear-gradient(135deg, #ff2020 0%, #ffffff 100%)",
  },
  {
    id: "soft-rose",
    name: "Soft Rose Pearl",
    css: "linear-gradient(135deg, #fff5f5 0%, #fecdd3 100%)",
  },
  {
    id: "dark-radiance",
    name: "Dark Radiance",
    css: "linear-gradient(135deg, #1f222e 0%, #ff2020 100%)",
  },
  {
    id: "studio-pure",
    name: "Studio Light",
    css: "linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)",
  },
  {
    id: "neon-crimson",
    name: "Neon Glow",
    css: "linear-gradient(90deg, #ff2020 0%, #b30000 50%, #121316 100%)",
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
                    color={p.value === "#ffffff" || p.value === "transparent" ? "#ff2020" : "#ffffff"}
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
