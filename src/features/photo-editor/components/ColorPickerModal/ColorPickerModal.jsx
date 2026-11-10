import React, { useState } from "react";
import { Check, X } from "lucide-react";
import "./ColorPickerModal.css";

const PRESET_SWATCHES = [
  "#ffffff", "#fff5f5", "#ffe4e6", "#fecdd3", "#fda4af", "#fb7185",
  "#ff4040", "#ff2020", "#e60000", "#cc0000", "#b30000", "#800000",
  "#fff1f2", "#ffe4e6", "#f43f5e", "#e11d48", "#be123c", "#9f1239",
  "#ff6666", "#ff5555", "#ff3333", "#ff1a1a", "#d90429", "#4d0000",
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
              border: "1.5px solid #fee2e2",
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
          <span style={{ fontSize: "10px", color: "#b30000", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
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
