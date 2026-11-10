import React from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Plus,
  Type,
  Underline,
} from "lucide-react";
import "./TextPanel.css";

const FONTS = [
  "Inter",
  "Montserrat",
  "Playfair Display",
  "Oswald",
  "Roboto",
  "Dancing Script",
  "Pacifico",
  "Poppins",
  "Courier New",
];

export default function TextPanel({
  selectedLayer,
  onAddText,
  onUpdateText,
}) {
  const isTextLayer = selectedLayer && selectedLayer.type === "text";

  return (
    <div className="text-panel">
      <div className="text-panel-title">Typography & Text</div>

      {/* Quick Add Presets */}
      <div className="text-quick-add-group">
        <button className="text-add-btn" onClick={() => onAddText?.("heading")}>
          <Plus size={14} />
          <span>Add Heading</span>
        </button>
        <button className="text-add-btn" onClick={() => onAddText?.("subheading")}>
          <Plus size={14} />
          <span>Add Subheading</span>
        </button>
        <button className="text-add-btn" onClick={() => onAddText?.("body")}>
          <Plus size={14} />
          <span>Add Body Text</span>
        </button>
      </div>

      {/* Selected Text Layer Properties */}
      {isTextLayer && (
        <>
          <div className="text-prop-row" style={{ marginTop: "8px" }}>
            <div className="text-prop-label-row">
              <span>Text Content</span>
            </div>
            <textarea
              rows={2}
              style={{
                width: "100%",
                background: "#090b0e",
                border: "1px solid #2d3748",
                color: "#ffffff",
                fontSize: "12px",
                padding: "6px",
                borderRadius: "4px",
                outline: "none",
                resize: "none",
              }}
              value={selectedLayer.text || ""}
              onChange={(e) => onUpdateText?.({ text: e.target.value })}
            />
          </div>

          <div className="text-prop-row">
            <div className="text-prop-label-row">
              <span>Font Family</span>
            </div>
            <select
              className="text-font-select"
              value={selectedLayer.fontFamily || "Inter"}
              onChange={(e) => onUpdateText?.({ fontFamily: e.target.value })}
            >
              {FONTS.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div className="text-prop-row">
            <div className="text-prop-label-row">
              <span>Font Size</span>
              <span style={{ fontFamily: "monospace", color: "#f43f5e" }}>
                {selectedLayer.fontSize || 36}px
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="200"
              value={selectedLayer.fontSize || 36}
              className="text-slider"
              onChange={(e) => onUpdateText?.({ fontSize: Number(e.target.value) })}
            />
          </div>

          {/* Styles & Alignment Row */}
          <div className="text-styles-row">
            <button
              className={`text-style-toggle-btn ${selectedLayer.bold ? "active" : ""}`}
              onClick={() => onUpdateText?.({ bold: !selectedLayer.bold })}
              title="Bold"
            >
              <Bold size={13} />
            </button>
            <button
              className={`text-style-toggle-btn ${selectedLayer.italic ? "active" : ""}`}
              onClick={() => onUpdateText?.({ italic: !selectedLayer.italic })}
              title="Italic"
            >
              <Italic size={13} />
            </button>
            <button
              className={`text-style-toggle-btn ${selectedLayer.align === "left" ? "active" : ""}`}
              onClick={() => onUpdateText?.({ align: "left" })}
              title="Align Left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              className={`text-style-toggle-btn ${selectedLayer.align === "center" ? "active" : ""}`}
              onClick={() => onUpdateText?.({ align: "center" })}
              title="Align Center"
            >
              <AlignCenter size={13} />
            </button>
            <button
              className={`text-style-toggle-btn ${selectedLayer.align === "right" ? "active" : ""}`}
              onClick={() => onUpdateText?.({ align: "right" })}
              title="Align Right"
            >
              <AlignRight size={13} />
            </button>
          </div>

          {/* Text Color Swatch */}
          <div className="text-prop-row">
            <div className="text-prop-label-row">
              <span>Text Color</span>
            </div>
            <input
              type="color"
              style={{
                width: "100%",
                height: "32px",
                border: "1px solid #2d3748",
                borderRadius: "4px",
                cursor: "pointer",
                background: "transparent",
              }}
              value={selectedLayer.color || "#ffffff"}
              onChange={(e) => onUpdateText?.({ color: e.target.value })}
            />
          </div>

          {/* Text Stroke Width */}
          <div className="text-prop-row">
            <div className="text-prop-label-row">
              <span>Stroke Outline Width</span>
              <span style={{ fontFamily: "monospace", color: "#f43f5e" }}>
                {selectedLayer.strokeWidth || 0}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={selectedLayer.strokeWidth || 0}
              className="text-slider"
              onChange={(e) => onUpdateText?.({ strokeWidth: Number(e.target.value) })}
            />
          </div>
        </>
      )}
    </div>
  );
}
