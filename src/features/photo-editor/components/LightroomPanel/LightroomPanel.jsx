import "./LightroomPanel.css";
import { useState } from "react";
import { Sliders, Sun, Thermometer, Palette, RotateCcw } from "lucide-react";

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

function LightroomPanel({ settings, onChange, hslMixer, onHslChange, onReset }) {
  const [selectedHslColor, setSelectedHslColor] = useState("red");

  const currentHsl = hslMixer[selectedHslColor] || { h: 0, s: 0, l: 0 };

  const updateSlider = (key, value) => {
    onChange({ ...settings, [key]: Number(value) });
  };

  const updateHsl = (channel, value) => {
    onHslChange({
      ...hslMixer,
      [selectedHslColor]: {
        ...currentHsl,
        [channel]: Number(value),
      },
    });
  };

  return (
    <div className="lightroom-panel-wrap">
      <div className="lr-header-row">
        <h4><Sliders size={14} /> Lightroom Tone & Color</h4>
        <button className="icon-btn mini" onClick={onReset} title="Reset all adjustments">
          <RotateCcw size={13} />
        </button>
      </div>

      {/* BASIC TONE SLIDERS */}
      <div className="lr-sliders-group">
        <label className="slider-control">
          <div className="slider-label-row">
            <span>Exposure</span>
            <output>{settings.exposure > 0 ? `+${settings.exposure}` : settings.exposure} EV</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.exposure}
            onChange={(e) => updateSlider("exposure", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Contrast</span>
            <output>{settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.contrast}
            onChange={(e) => updateSlider("contrast", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Highlights</span>
            <output>{settings.highlights > 0 ? `+${settings.highlights}` : settings.highlights}</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.highlights}
            onChange={(e) => updateSlider("highlights", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Shadows</span>
            <output>{settings.shadows > 0 ? `+${settings.shadows}` : settings.shadows}</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.shadows}
            onChange={(e) => updateSlider("shadows", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Whites</span>
            <output>{(settings.whites || 0) > 0 ? `+${settings.whites}` : (settings.whites || 0)}</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.whites || 0}
            onChange={(e) => updateSlider("whites", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Blacks</span>
            <output>{(settings.blacks || 0) > 0 ? `+${settings.blacks}` : (settings.blacks || 0)}</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.blacks || 0}
            onChange={(e) => updateSlider("blacks", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Temperature (Warm / Cool)</span>
            <output>{settings.temperature > 0 ? `+${settings.temperature}K` : `${settings.temperature}K`}</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.temperature}
            onChange={(e) => updateSlider("temperature", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Tint (Green / Magenta)</span>
            <output>{settings.tint > 0 ? `+${settings.tint}` : settings.tint}</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.tint}
            onChange={(e) => updateSlider("tint", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Vibrance</span>
            <output>{settings.vibrance > 0 ? `+${settings.vibrance}` : settings.vibrance}%</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.vibrance}
            onChange={(e) => updateSlider("vibrance", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Dehaze</span>
            <output>{(settings.dehaze || 0) > 0 ? `+${settings.dehaze}` : (settings.dehaze || 0)}</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={settings.dehaze || 0}
            onChange={(e) => updateSlider("dehaze", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Fade (Film Matte)</span>
            <output>{settings.fade || 0}%</output>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.fade || 0}
            onChange={(e) => updateSlider("fade", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Vignette</span>
            <output>{settings.vignette}%</output>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.vignette}
            onChange={(e) => updateSlider("vignette", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>Film Grain</span>
            <output>{settings.filmGrain}%</output>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.filmGrain}
            onChange={(e) => updateSlider("filmGrain", e.target.value)}
          />
        </label>
      </div>

      {/* HSL COLOR MIXER */}
      <div className="sidebar-separator" />
      <div className="lr-hsl-header">
        <h4><Palette size={14} /> HSL Color Mixer</h4>
        <span className="hsl-note">Selective Color Shift</span>
      </div>

      <div className="hsl-color-chips">
        {HSL_COLORS.map((c) => (
          <button
            key={c.id}
            className={`hsl-chip ${selectedHslColor === c.id ? "active" : ""}`}
            style={{ backgroundColor: c.color }}
            onClick={() => setSelectedHslColor(c.id)}
            title={c.label}
          />
        ))}
      </div>

      <div className="hsl-active-controls">
        <label className="slider-control">
          <div className="slider-label-row">
            <span>{selectedHslColor.toUpperCase()} Hue</span>
            <output>{currentHsl.h > 0 ? `+${currentHsl.h}` : currentHsl.h}°</output>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            value={currentHsl.h}
            onChange={(e) => updateHsl("h", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>{selectedHslColor.toUpperCase()} Saturation</span>
            <output>{currentHsl.s > 0 ? `+${currentHsl.s}` : currentHsl.s}%</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={currentHsl.s}
            onChange={(e) => updateHsl("s", e.target.value)}
          />
        </label>

        <label className="slider-control">
          <div className="slider-label-row">
            <span>{selectedHslColor.toUpperCase()} Lightness</span>
            <output>{currentHsl.l > 0 ? `+${currentHsl.l}` : currentHsl.l}%</output>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={currentHsl.l}
            onChange={(e) => updateHsl("l", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

export default LightroomPanel;
