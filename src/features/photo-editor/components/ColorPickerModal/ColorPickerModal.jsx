import React, { useState } from "react";
import { Check, X } from "lucide-react";
import "./ColorPickerModal.css";

const PRESET_SWATCHES = [
  "#ffffff", "#f0f9ff", "#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8",
  "#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e", "#082f49",
  "#f8fafc", "#f1f5f9", "#e2e8f0", "#94a3b8", "#64748b", "#334155",
  "#1e293b", "#0f172a", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8",
];

export default function ColorPickerModal({
  title = "Choose Color",
  initialColor = "#0ea5e9",
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
              border: "1.5px solid #e0f2fe",
              borderRadius: "6px",
              cursor: "pointer",
              background: "transparent",
            }}
            value={currentColor.startsWith("#") && currentColor.length === 7 ? currentColor : "#0ea5e9"}
            onChange={(e) => setCurrentColor(e.target.value)}
          />
        </div>

        {/* Preset Color Swatches */}
        <div>
          <span style={{ fontSize: "10px", color: "#0369a1", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
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
            background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
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
