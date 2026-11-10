import "./RetouchPanel.css";
import { useState } from "react";
import { Eye, Heart, Sparkles, Wand2, Paintbrush, ShieldCheck } from "lucide-react";

function RetouchPanel({ onApplyRetouch, activeTool, setActiveTool, isProcessing }) {
  const [smoothIntensity, setSmoothIntensity] = useState(60);

  return (
    <div className="retouch-panel-wrap">
      <div className="retouch-header">
        <h4><Sparkles size={14} /> Portrait & Beauty Retouch</h4>
        <p>Algorithmic skin smoothing, facial retouching & tone grading</p>
      </div>

      <div className="retouch-section">
        <h5>Skin & Face Retouching</h5>
        <div className="retouch-control-box">
          <label className="slider-control">
            <div className="slider-label-row">
              <span>Skin Smoothing</span>
              <output>{smoothIntensity}%</output>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={smoothIntensity}
              onChange={(e) => setSmoothIntensity(Number(e.target.value))}
            />
          </label>
          <button
            className="button button-outline full-width"
            onClick={() => onApplyRetouch("skin-smooth", { intensity: smoothIntensity / 100 })}
            disabled={isProcessing}
          >
            <Sparkles size={14} /> Apply Skin Smoothing
          </button>
        </div>

        <button
          className="button button-outline full-width retouch-single-btn"
          onClick={() => onApplyRetouch("teeth-whiten")}
          disabled={isProcessing}
        >
          <SmileIcon size={14} /> Teeth Whitening & Eye Brightening
        </button>
      </div>

      <div className="sidebar-separator" />

      <div className="retouch-section">
        <h5>Vintage Colorization & Tonal Split</h5>
        <button
          className="button button-primary full-width"
          onClick={() => onApplyRetouch("colorize")}
          disabled={isProcessing}
        >
          <Wand2 size={14} /> Apply Vintage Split-Tone Colorization
        </button>
        <small className="section-hint">Algorithmic luminance tone mapping for vintage portraits and monochrome photos.</small>
      </div>

      <div className="sidebar-separator" />

      <div className="retouch-section">
        <h5>Interactive Canvas Retouch Tools</h5>
        <div className="interactive-tool-toggle-row">
          <button
            className={`tool-pill ${activeTool === "healing" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "healing" ? "move" : "healing")}
          >
            <Sparkles size={13} /> Healing Brush
          </button>
          <button
            className={`tool-pill ${activeTool === "clone" ? "active" : ""}`}
            onClick={() => setActiveTool(activeTool === "clone" ? "move" : "clone")}
          >
            <Paintbrush size={13} /> Clone Stamp
          </button>
        </div>
        <small className="section-hint">
          {activeTool === "healing" && "Click or drag over any blemish to automatically sample & blend neighborhood skin texture."}
          {activeTool === "clone" && "Hold Alt + Click on the canvas to set clone sample point, then paint over destination."}
          {activeTool !== "healing" && activeTool !== "clone" && "Select a tool above to retouch directly on the canvas."}
        </small>
      </div>
    </div>
  );
}

function SmileIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

export default RetouchPanel;
