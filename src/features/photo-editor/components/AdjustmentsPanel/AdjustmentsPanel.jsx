import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import CurvesEditor from "../CurvesEditor/CurvesEditor.jsx";
import LevelsEditor from "../LevelsEditor/LevelsEditor.jsx";
import "./AdjustmentsPanel.css";

const HSL_COLORS = [
  { id: "red", label: "Red", color: "#ef4444" },
  { id: "orange", label: "Orange", color: "#f97316" },
  { id: "yellow", label: "Yellow", color: "#eab308" },
  { id: "green", label: "Green", color: "#22c55e" },
  { id: "cyan", label: "Cyan", color: "#06b6d4" },
  { id: "blue", label: "Blue", color: "#3b82f6" },
  { id: "purple", label: "Purple", color: "#a855f7" },
  { id: "magenta", label: "Magenta", color: "#ec4899" },
];

export default function AdjustmentsPanel({
  lrSettings,
  onChangeLrSettings,
  hslMixer,
  onChangeHslMixer,
  curves,
  onChangeCurves,
  levels,
  onChangeLevels,
  colorBalance,
  onChangeColorBalance,
  histogram,
  onResetAll,
}) {
  const [tab, setTab] = useState("basic"); // 'basic', 'curves', 'levels', 'color-balance', 'hsl'
  const [selectedHslChannel, setSelectedHslChannel] = useState("red");
  const [balanceTone, setBalanceTone] = useState("midtones"); // 'shadows', 'midtones', 'highlights'

  const updateLr = (key, val) => {
    onChangeLrSettings?.({ ...lrSettings, [key]: Number(val) });
  };

  const updateHsl = (prop, val) => {
    const current = hslMixer[selectedHslChannel] || { h: 0, s: 0, l: 0 };
    onChangeHslMixer?.({
      ...hslMixer,
      [selectedHslChannel]: {
        ...current,
        [prop]: Number(val),
      },
    });
  };

  const updateBalance = (idx, val) => {
    const current = colorBalance[balanceTone] || [0, 0, 0];
    const updated = [...current];
    updated[idx] = Number(val);
    onChangeColorBalance?.({
      ...colorBalance,
      [balanceTone]: updated,
    });
  };

  const currentHsl = hslMixer?.[selectedHslChannel] || { h: 0, s: 0, l: 0 };
  const currentBalance = colorBalance?.[balanceTone] || [0, 0, 0];

  return (
    <div className="adjustments-panel">
      {/* Sub Tabs */}
      <div className="adjustments-tabs-nav">
        <button
          className={`adjustments-tab-item ${tab === "basic" ? "active" : ""}`}
          onClick={() => setTab("basic")}
        >
          Basic
        </button>
        <button
          className={`adjustments-tab-item ${tab === "curves" ? "active" : ""}`}
          onClick={() => setTab("curves")}
        >
          Curves
        </button>
        <button
          className={`adjustments-tab-item ${tab === "levels" ? "active" : ""}`}
          onClick={() => setTab("levels")}
        >
          Levels
        </button>
        <button
          className={`adjustments-tab-item ${tab === "color-balance" ? "active" : ""}`}
          onClick={() => setTab("color-balance")}
        >
          Color Balance
        </button>
        <button
          className={`adjustments-tab-item ${tab === "hsl" ? "active" : ""}`}
          onClick={() => setTab("hsl")}
        >
          HSL Color
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="adjustments-content">
        {/* Basic Tab */}
        {tab === "basic" && (
          <>
            {/* Histogram Display */}
            {histogram && (
              <div className="adj-histogram-row">
                <div className="adj-histogram-bar" style={{ height: `${Math.min(100, histogram.r / 255 * 100)}%`, background: '#ff4040' }} />
                <div className="adj-histogram-bar" style={{ height: `${Math.min(100, histogram.g / 255 * 100)}%`, background: '#22c55e' }} />
                <div className="adj-histogram-bar" style={{ height: `${Math.min(100, histogram.b / 255 * 100)}%`, background: '#3b82f6' }} />
              </div>
            )}

            <div className="adjustment-section-heading">Tone & Light</div>
            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Exposure</span>
                <span className="adjustment-val-text">{lrSettings.exposure ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.exposure ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("exposure", e.target.value)}
                onDoubleClick={() => updateLr("exposure", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Brightness</span>
                <span className="adjustment-val-text">{lrSettings.brightness ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.brightness ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("brightness", e.target.value)}
                onDoubleClick={() => updateLr("brightness", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Contrast</span>
                <span className="adjustment-val-text">{lrSettings.contrast ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.contrast ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("contrast", e.target.value)}
                onDoubleClick={() => updateLr("contrast", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Highlights</span>
                <span className="adjustment-val-text">{lrSettings.highlights ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.highlights ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("highlights", e.target.value)}
                onDoubleClick={() => updateLr("highlights", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Shadows</span>
                <span className="adjustment-val-text">{lrSettings.shadows ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.shadows ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("shadows", e.target.value)}
                onDoubleClick={() => updateLr("shadows", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Whites</span>
                <span className="adjustment-val-text">{lrSettings.whites ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.whites ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("whites", e.target.value)}
                onDoubleClick={() => updateLr("whites", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Blacks</span>
                <span className="adjustment-val-text">{lrSettings.blacks ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.blacks ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("blacks", e.target.value)}
                onDoubleClick={() => updateLr("blacks", 0)}
              />
            </div>

            <div className="adjustment-section-heading">White Balance & Color</div>
            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Temperature</span>
                <span className="adjustment-val-text">{lrSettings.temperature ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.temperature ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("temperature", e.target.value)}
                onDoubleClick={() => updateLr("temperature", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Tint</span>
                <span className="adjustment-val-text">{lrSettings.tint ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.tint ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("tint", e.target.value)}
                onDoubleClick={() => updateLr("tint", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Vibrance</span>
                <span className="adjustment-val-text">{lrSettings.vibrance ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.vibrance ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("vibrance", e.target.value)}
                onDoubleClick={() => updateLr("vibrance", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Saturation</span>
                <span className="adjustment-val-text">{lrSettings.saturation ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.saturation ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("saturation", e.target.value)}
                onDoubleClick={() => updateLr("saturation", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Hue Rotation</span>
                <span className="adjustment-val-text">{lrSettings.hue ?? 0}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={lrSettings.hue ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("hue", e.target.value)}
                onDoubleClick={() => updateLr("hue", 0)}
              />
            </div>

            <div className="adjustment-section-heading">Presence & Texture</div>
            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Texture</span>
                <span className="adjustment-val-text">{lrSettings.texture ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.texture ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("texture", e.target.value)}
                onDoubleClick={() => updateLr("texture", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Clarity</span>
                <span className="adjustment-val-text">{lrSettings.clarity ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.clarity ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("clarity", e.target.value)}
                onDoubleClick={() => updateLr("clarity", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Dehaze</span>
                <span className="adjustment-val-text">{lrSettings.dehaze ?? 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={lrSettings.dehaze ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("dehaze", e.target.value)}
                onDoubleClick={() => updateLr("dehaze", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Sharpness</span>
                <span className="adjustment-val-text">{lrSettings.sharpness ?? 0}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lrSettings.sharpness ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("sharpness", e.target.value)}
                onDoubleClick={() => updateLr("sharpness", 0)}
              />
            </div>

            <div className="adjustment-section-heading">Atmosphere & Effects</div>
            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Vignette</span>
                <span className="adjustment-val-text">{lrSettings.vignette ?? 0}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lrSettings.vignette ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("vignette", e.target.value)}
                onDoubleClick={() => updateLr("vignette", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Film Grain</span>
                <span className="adjustment-val-text">{lrSettings.filmGrain ?? 0}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lrSettings.filmGrain ?? 0}
                className="adjustment-slider"
                onChange={(e) => updateLr("filmGrain", e.target.value)}
                onDoubleClick={() => updateLr("filmGrain", 0)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Gamma</span>
                <span className="adjustment-val-text">{(lrSettings.gamma ?? 1.0).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.05"
                value={lrSettings.gamma ?? 1.0}
                className="adjustment-slider"
                onChange={(e) => updateLr("gamma", e.target.value)}
                onDoubleClick={() => updateLr("gamma", 1.0)}
              />
            </div>
          </>
        )}

        {/* Curves Tab */}
        {tab === "curves" && (
          <CurvesEditor curves={curves} onChange={onChangeCurves} histogram={histogram} />
        )}

        {/* Levels Tab */}
        {tab === "levels" && (
          <LevelsEditor levels={levels} onChange={onChangeLevels} />
        )}

        {/* Color Balance Tab */}
        {tab === "color-balance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {["shadows", "midtones", "highlights"].map((t) => (
                <button
                  key={t}
                  className={`adjustments-tab-item ${balanceTone === t ? "active" : ""}`}
                  style={{ textTransform: "capitalize", flex: 1 }}
                  onClick={() => setBalanceTone(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span style={{ color: "#ff2020" }}>Cyan / Red</span>
                <span className="adjustment-val-text">{currentBalance[0]}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={currentBalance[0]}
                className="adjustment-slider"
                onChange={(e) => updateBalance(0, e.target.value)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span style={{ color: "#ec4899" }}>Magenta / Green</span>
                <span className="adjustment-val-text">{currentBalance[1]}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={currentBalance[1]}
                className="adjustment-slider"
                onChange={(e) => updateBalance(1, e.target.value)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span style={{ color: "#facc15" }}>Yellow / Blue</span>
                <span className="adjustment-val-text">{currentBalance[2]}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={currentBalance[2]}
                className="adjustment-slider"
                onChange={(e) => updateBalance(2, e.target.value)}
              />
            </div>
          </div>
        )}

        {/* HSL Mixer Tab */}
        {tab === "hsl" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Color circles */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
              {HSL_COLORS.map((c) => (
                <button
                  key={c.id}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: c.color,
                    border: selectedHslChannel === c.id ? "2px solid #ffffff" : "2px solid transparent",
                    cursor: "pointer",
                    transform: selectedHslChannel === c.id ? "scale(1.15)" : "scale(1)",
                  }}
                  onClick={() => setSelectedHslChannel(c.id)}
                  title={c.label}
                />
              ))}
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Hue Shift</span>
                <span className="adjustment-val-text">{currentHsl.h}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={currentHsl.h}
                className="adjustment-slider"
                onChange={(e) => updateHsl("h", e.target.value)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Saturation</span>
                <span className="adjustment-val-text">{currentHsl.s}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={currentHsl.s}
                className="adjustment-slider"
                onChange={(e) => updateHsl("s", e.target.value)}
              />
            </div>

            <div className="adjustment-control-row">
              <div className="adjustment-label-row">
                <span>Luminance</span>
                <span className="adjustment-val-text">{currentHsl.l}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={currentHsl.l}
                className="adjustment-slider"
                onChange={(e) => updateHsl("l", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Reset */}
      <div className="adjustments-footer">
        <button className="adjustments-reset-btn" onClick={onResetAll}>
          <RotateCcw size={13} />
          <span>Reset All</span>
        </button>
      </div>
    </div>
  );
}
