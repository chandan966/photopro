import "./EffectsPanel.css";
import { useRef } from "react";
import {
  Brush,
  Camera,
  Film,
  Flame,
  Grid,
  Layers,
  Palette,
  Sparkles,
  Sun,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";

function EffectsPanel({ onApplyEffect, activeEffect, isProcessing, onImportLUT }) {
  const lutInputRef = useRef(null);

  const effects = [
    {
      id: "cartoon",
      label: "Cartoon Effect",
      desc: "Sobel edge outlines & color quantization",
      icon: Wand2,
    },
    {
      id: "sketch",
      label: "Pencil Sketch",
      desc: "Grayscale, invert & color-dodge blend",
      icon: Brush,
    },
    {
      id: "oil",
      label: "Oil Painting",
      desc: "Kuwahara variance brush clustering",
      icon: Palette,
    },
    {
      id: "hdr",
      label: "HDR Tone Mapping",
      desc: "Expanded dynamic range & micro-contrast",
      icon: Flame,
    },
    {
      id: "sepia",
      label: "Vintage Sepia",
      desc: "Warm nostalgic monochrome patina",
      icon: Camera,
    },
    {
      id: "duotone",
      label: "Duotone Gradient",
      desc: "Ruby Crimson & Obsidian two-tone map",
      icon: Layers,
    },
    {
      id: "glitch",
      label: "Glitch RGB Split",
      desc: "Chromatic aberration & slice jitter",
      icon: Zap,
    },
    {
      id: "pixelate",
      label: "Pixelate Mosaic",
      desc: "Retro 8-bit block pixelation",
      icon: Grid,
    },
    {
      id: "emboss",
      label: "Emboss Relief",
      desc: "3D directional lighting emboss kernel",
      icon: Film,
    },
    {
      id: "lightleak",
      label: "Vintage Light Leak",
      desc: "Warm crimson & gold optical leak",
      icon: Sun,
    },
    {
      id: "lensflare",
      label: "Lens Flare",
      desc: "Radiant optical bloom & secondary rings",
      icon: Sparkles,
    },
  ];

  const handleLutFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onImportLUT?.(event.target.result, file.name);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="effects-panel-wrap">
      <div className="effects-panel-header">
        <h4><Film size={14} /> Creative Photoshop Effects</h4>
        <p>1-Click real procedural canvas transformations & LUT grading</p>
      </div>

      {/* LUT Import Button */}
      <div className="lut-import-box">
        <button
          className="button button-outline full-width lut-btn"
          onClick={() => lutInputRef.current?.click()}
          disabled={isProcessing}
        >
          <Upload size={14} /> Import 3D LUT (.cube)
        </button>
        <input
          ref={lutInputRef}
          type="file"
          accept=".cube,.lut,text/plain"
          hidden
          onChange={handleLutFile}
        />
        <small className="lut-hint">Supports industry-standard 3D .cube LUT profiles</small>
      </div>

      <div className="effects-action-grid">
        {effects.map((fx) => {
          const Icon = fx.icon;
          return (
            <button
              key={fx.id}
              className={`effect-action-card ${activeEffect === fx.id ? "active" : ""}`}
              onClick={() => onApplyEffect(fx.id)}
              disabled={isProcessing}
            >
              <div className="effect-card-icon">
                <Icon size={18} />
              </div>
              <div className="effect-card-info">
                <strong>{fx.label}</strong>
                <small>{fx.desc}</small>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EffectsPanel;
