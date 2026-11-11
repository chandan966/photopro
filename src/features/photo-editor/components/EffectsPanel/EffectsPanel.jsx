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
      id: "gaussian",
      label: "Gaussian Blur",
      desc: "Soft lens defocus & creamy bokeh blur",
      icon: Sparkles,
    },
    {
      id: "motion",
      label: "Motion Blur",
      desc: "Linear dynamic speed streaking",
      icon: Zap,
    },
    {
      id: "pixelate",
      label: "Pixelation",
      desc: "Retro 8-bit mosaic tile quantization",
      icon: Grid,
    },
    {
      id: "glitch",
      label: "Glitch Effect",
      desc: "Cyberpunk slice jitter & RGB channel displacement",
      icon: Zap,
    },
    {
      id: "duotone",
      label: "Duotone",
      desc: "Two-tone gradient mapping (Ruby & Obsidian)",
      icon: Layers,
    },
    {
      id: "colorsplash",
      label: "Color Splash",
      desc: "Isolate vibrant red tones, turn background B&W",
      icon: Palette,
    },
    {
      id: "posterize",
      label: "Posterize",
      desc: "Step tonal compression into graphic color bands",
      icon: Layers,
    },
    {
      id: "sketch",
      label: "Pencil Sketch",
      desc: "Invert & color-dodge graphite sketch",
      icon: Brush,
    },
    {
      id: "cartoon",
      label: "Cartoon Effect",
      desc: "Sobel edge outlines & color quantization",
      icon: Wand2,
    },
    {
      id: "oil",
      label: "Oil Painting Effect",
      desc: "Kuwahara variance brush clustering",
      icon: Palette,
    },
    {
      id: "neon",
      label: "Neon",
      desc: "Vibrant high-voltage edge contour glow",
      icon: Flame,
    },
    {
      id: "glow",
      label: "Glow & Bloom",
      desc: "High-pass luminance highlight bloom",
      icon: Sun,
    },
    {
      id: "rgbsplit",
      label: "RGB Split",
      desc: "3-channel chromatic aberration offset",
      icon: Camera,
    },
    {
      id: "doubleexposure",
      label: "Double Exposure",
      desc: "Screen blend artistic dual overlay",
      icon: Film,
    },
    {
      id: "hdr",
      label: "HDR Tone Mapping",
      desc: "Expanded dynamic range & micro-contrast",
      icon: Flame,
    },
    {
      id: "emboss",
      label: "Emboss Relief",
      desc: "3D directional lighting emboss kernel",
      icon: Film,
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
