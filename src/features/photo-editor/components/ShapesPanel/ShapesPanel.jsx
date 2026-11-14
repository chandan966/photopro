import React from "react";
import {
  Circle,
  Hexagon,
  Minus,
  Plus,
  Square,
  Star,
  Triangle,
} from "lucide-react";
import "./ShapesPanel.css";

const SHAPES = [
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "rounded", label: "Rounded", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "triangle", label: "Triangle", icon: Triangle },
  { id: "polygon", label: "Polygon", icon: Hexagon },
  { id: "star", label: "Star", icon: Star },
  { id: "line", label: "Line", icon: Minus },
];

export default function ShapesPanel({
  selectedLayer,
  onAddShape,
  onUpdateShape,
}) {
  const isShapeLayer = selectedLayer && selectedLayer.type === "shape";

  return (
    <div className="shapes-panel">
      <div className="shapes-panel-title">Vector Shapes</div>

      {/* Shapes Picker */}
      <div className="shapes-grid">
        {SHAPES.map((s) => {
          const IconComp = s.icon;
          return (
            <button
              key={s.id}
              className="shape-picker-btn"
              onClick={() => onAddShape?.(s.id)}
              title={`Add ${s.label}`}
            >
              <IconComp size={18} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Shape Layer Controls */}
      {isShapeLayer && (
        <>
          <div className="shape-prop-row" style={{ marginTop: "8px" }}>
            <div className="shape-prop-label-row">
              <span>Fill Color</span>
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
              value={selectedLayer.color || "#0ea5e9"}
              onChange={(e) => onUpdateShape?.({ color: e.target.value })}
            />
          </div>

          <div className="shape-prop-row">
            <div className="shape-prop-label-row">
              <span>Stroke Outline Color</span>
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
              value={selectedLayer.strokeColor || "#ffffff"}
              onChange={(e) => onUpdateShape?.({ strokeColor: e.target.value })}
            />
          </div>

          <div className="shape-prop-row">
            <div className="shape-prop-label-row">
              <span>Stroke Width</span>
              <span style={{ fontFamily: "monospace", color: "#0284c7" }}>
                {selectedLayer.strokeWidth || 0}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={selectedLayer.strokeWidth || 0}
              className="shape-slider"
              onChange={(e) => onUpdateShape?.({ strokeWidth: Number(e.target.value) })}
            />
          </div>

          {selectedLayer.shapeType === "rounded" && (
            <div className="shape-prop-row">
              <div className="shape-prop-label-row">
                <span>Corner Radius</span>
                <span style={{ fontFamily: "monospace", color: "#0284c7" }}>
                  {selectedLayer.cornerRadius || 16}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={selectedLayer.cornerRadius || 16}
                className="shape-slider"
                onChange={(e) => onUpdateShape?.({ cornerRadius: Number(e.target.value) })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
