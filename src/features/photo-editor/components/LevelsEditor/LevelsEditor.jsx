import React from "react";
import { RotateCcw } from "lucide-react";
import "./LevelsEditor.css";

const DEFAULT_LEVELS = {
  inBlack: 0,
  inGamma: 1.0,
  inWhite: 255,
  outBlack: 0,
  outWhite: 255,
};

export default function LevelsEditor({ levels = DEFAULT_LEVELS, onChange }) {
  const update = (key, val) => {
    onChange?.({ ...levels, [key]: Number(val) });
  };

  const handleReset = () => {
    onChange?.({ ...DEFAULT_LEVELS });
  };

  return (
    <div className="levels-editor">
      <div className="levels-header">
        <span className="levels-title">Levels Adjustment</span>
        <button className="levels-reset-btn" onClick={handleReset} title="Reset Levels">
          <RotateCcw size={12} />
        </button>
      </div>

      {/* Input Levels */}
      <div>
        <div className="levels-section-label">Input Levels</div>
        <div className="levels-inputs-row">
          <div className="levels-input-box">
            <span>Black</span>
            <input
              type="number"
              min="0"
              max="250"
              className="levels-num-input"
              value={levels.inBlack ?? 0}
              onChange={(e) => update("inBlack", e.target.value)}
            />
          </div>
          <div className="levels-input-box">
            <span>Midtone (γ)</span>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="5.0"
              className="levels-num-input"
              value={levels.inGamma ?? 1.0}
              onChange={(e) => update("inGamma", e.target.value)}
            />
          </div>
          <div className="levels-input-box">
            <span>White</span>
            <input
              type="number"
              min="5"
              max="255"
              className="levels-num-input"
              value={levels.inWhite ?? 255}
              onChange={(e) => update("inWhite", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Output Levels */}
      <div>
        <div className="levels-section-label">Output Levels</div>
        <div className="levels-inputs-row">
          <div className="levels-input-box">
            <span>Black Output</span>
            <input
              type="number"
              min="0"
              max="255"
              className="levels-num-input"
              value={levels.outBlack ?? 0}
              onChange={(e) => update("outBlack", e.target.value)}
            />
          </div>
          <div className="levels-input-box">
            <span>White Output</span>
            <input
              type="number"
              min="0"
              max="255"
              className="levels-num-input"
              value={levels.outWhite ?? 255}
              onChange={(e) => update("outWhite", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
