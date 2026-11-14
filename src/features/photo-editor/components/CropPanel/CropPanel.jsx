import React from "react";
import {
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import "./CropPanel.css";

const CROP_RATIOS = [
  { id: "free", label: "Freeform", ratio: null },
  { id: "1-1", label: "1:1 Square", ratio: 1 / 1 },
  { id: "4-5", label: "4:5 Portrait", ratio: 4 / 5 },
  { id: "3-4", label: "3:4 Classic", ratio: 3 / 4 },
  { id: "4-3", label: "4:3 Standard", ratio: 4 / 3 },
  { id: "16-9", label: "16:9 YouTube", ratio: 16 / 9 },
  { id: "9-16", label: "9:16 Story", ratio: 9 / 16 },
  { id: "3-2", label: "3:2 Photo", ratio: 3 / 2 },
  { id: "2-3", label: "2:3 Poster", ratio: 2 / 3 },
];

export default function CropPanel({
  selectedRatio = "free",
  onSelectRatio,
  straightenAngle = 0,
  onChangeStraighten,
  onRotateCW,
  onRotateCCW,
  onFlipH,
  onFlipV,
  onApplyCrop,
  onCancelCrop,
}) {
  return (
    <div className="crop-panel">
      <div className="crop-panel-title">Crop & Straighten</div>

      {/* Aspect Ratio Presets */}
      <div>
        <div className="crop-section-label">Aspect Ratios</div>
        <div className="crop-ratios-grid">
          {CROP_RATIOS.map((item) => (
            <button
              key={item.id}
              className={`crop-ratio-btn ${selectedRatio === item.id ? "active" : ""}`}
              onClick={() => onSelectRatio?.(item.id, item.ratio)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Straighten Angle */}
      <div className="crop-straighten-row">
        <div className="crop-straighten-header">
          <span>Straighten Angle</span>
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#0284c7" }}>
            {straightenAngle}°
          </span>
        </div>
        <input
          type="range"
          min="-45"
          max="45"
          value={straightenAngle}
          className="crop-slider"
          onChange={(e) => onChangeStraighten?.(Number(e.target.value))}
        />
      </div>

      {/* Rotate & Flip */}
      <div>
        <div className="crop-section-label">Rotate & Flip</div>
        <div className="crop-transforms-row">
          <button className="crop-transform-btn" onClick={onRotateCCW} title="Rotate 90° CCW">
            <RotateCcw size={14} />
            <span>90° CCW</span>
          </button>
          <button className="crop-transform-btn" onClick={onRotateCW} title="Rotate 90° CW">
            <RotateCw size={14} />
            <span>90° CW</span>
          </button>
        </div>
        <div className="crop-transforms-row" style={{ marginTop: "6px" }}>
          <button className="crop-transform-btn" onClick={onFlipH} title="Flip Horizontal">
            <FlipHorizontal2 size={14} />
            <span>Flip H</span>
          </button>
          <button className="crop-transform-btn" onClick={onFlipV} title="Flip Vertical">
            <FlipVertical2 size={14} />
            <span>Flip V</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="crop-actions-row">
        <button className="crop-apply-btn" onClick={onApplyCrop}>
          Apply Crop
        </button>
        <button className="crop-cancel-btn" onClick={onCancelCrop}>
          Cancel
        </button>
      </div>
    </div>
  );
}
