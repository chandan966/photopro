import React, { useState } from "react";
import { Check, X } from "lucide-react";
import "./ColorPickerModal.css";

const PRESET_SWATCHES = [
  "#ffffff", "#f8fafc", "#94a3b8", "#475569", "#1e293b", "#000000",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#e11d48",
];

export default function ColorPickerModal({
  title = "Choose Color",
  initialColor = "#e11d48",
  onSelectColor,
  onClose,
}) {
  const [currentColor, setCurrentColor] = useState(initialColor);

  const handleApply = () => {
    onSelectColor?.(currentColor);
    onClose?.();
  };

  return (
    <div
      className="color-picker-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="color-picker-dialog">
        <div className="color-picker-header">
          <span className="color-picker-title">{title}</span>
          <button className="color-picker-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <div className="color-picker-preview-row">
          <div className="color-preview-box" style={{ backgroundColor: currentColor }} />
          <div className="color-hex-input-group">
            <span className="color-hex-label">HEX Code</span>
            <input
              type="text"
              className="color-hex-field"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
            />
          </div>
        </div>

        {/* Native Native Color Input */}
        <div>
          <input
            type="color"
            style={{
              width: "100%",
              height: "40px",
              border: "1px solid #2d3748",
              borderRadius: "6px",
              cursor: "pointer",
              background: "transparent",
            }}
            value={currentColor.startsWith("#") && currentColor.length === 7 ? currentColor : "#e11d48"}
            onChange={(e) => setCurrentColor(e.target.value)}
          />
        </div>

        {/* Preset Color Swatches */}
        <div>
          <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            Palette Swatches
          </span>
          <div className="color-swatches-grid">
            {PRESET_SWATCHES.map((hex) => (
              <div
                key={hex}
                className="color-swatch-item"
                style={{ backgroundColor: hex }}
                onClick={() => setCurrentColor(hex)}
                title={hex}
              />
            ))}
          </div>
        </div>

        <button
          style={{
            background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
            color: "#ffffff",
            border: "none",
            fontSize: "12px",
            fontWeight: 600,
            padding: "8px",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "4px",
          }}
          onClick={handleApply}
        >
          Select Color
        </button>
      </div>
    </div>
  );
}
