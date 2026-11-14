import React, { useState } from "react";
import {
  LayoutTemplate,
  Maximize2,
  Lock,
  Unlock,
  Check,
  Sparkles,
  Smartphone,
  Tv,
  FileText,
  CreditCard,
  Image as ImageIcon,
} from "lucide-react";
import "./TemplatesPanel.css";

const PRESET_CANVAS_SIZES = [
  {
    id: "ig-post",
    name: "Instagram Post",
    cat: "Social",
    width: 1080,
    height: 1080,
    ratio: "1:1 Square",
    icon: Smartphone,
  },
  {
    id: "ig-story",
    name: "Instagram Story / Reel",
    cat: "Social",
    width: 1080,
    height: 1920,
    ratio: "9:16 Vertical",
    icon: Smartphone,
  },
  {
    id: "yt-thumb",
    name: "YouTube Thumbnail",
    cat: "Social",
    width: 1280,
    height: 720,
    ratio: "16:9 Widescreen",
    icon: Tv,
  },
  {
    id: "yt-banner",
    name: "YouTube Channel Banner",
    cat: "Social",
    width: 2560,
    height: 1440,
    ratio: "16:9 Ultra HD",
    icon: Tv,
  },
  {
    id: "fb-post",
    name: "Facebook Post",
    cat: "Social",
    width: 1200,
    height: 630,
    ratio: "1.91:1 Landscape",
    icon: Smartphone,
  },
  {
    id: "poster-a4",
    name: "A4 Print Poster",
    cat: "Print",
    width: 1240,
    height: 1754,
    ratio: "A4 Portrait",
    icon: FileText,
  },
  {
    id: "flyer",
    name: "Event Flyer",
    cat: "Print",
    width: 816,
    height: 1056,
    ratio: "US Letter",
    icon: FileText,
  },
  {
    id: "biz-card",
    name: "Business Card",
    cat: "Print",
    width: 1050,
    height: 600,
    ratio: "3.5 × 2.0 in",
    icon: CreditCard,
  },
];

const EDITABLE_TEMPLATES = [
  {
    id: "yt-tech",
    title: "YouTube Tech Thumbnail",
    desc: "Bold contrast heading with badge and gradient overlay",
    width: 1280,
    height: 720,
    badge: "16:9",
    layers: [
      {
        type: "shape",
        name: "Accent Glow Pill",
        shapeType: "rect",
        x: 80,
        y: 110,
        width: 280,
        height: 48,
        fillColor: "#0ea5e9",
        strokeColor: "transparent",
        strokeWidth: 0,
        opacity: 0.95,
        visible: true,
      },
      {
        type: "text",
        name: "Category Badge",
        text: "⚡ NEW TUTORIAL",
        x: 105,
        y: 124,
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
        visible: true,
      },
      {
        type: "text",
        name: "Main Title",
        text: "MASTER PHOTO EDITING",
        x: 80,
        y: 190,
        fontFamily: "Montserrat, sans-serif",
        fontSize: 68,
        fontWeight: "900",
        color: "#ffffff",
        shadow: { color: "rgba(0,0,0,0.8)", blur: 12, offsetX: 0, offsetY: 4 },
        visible: true,
      },
      {
        type: "text",
        name: "Subtitle Callout",
        text: "PRO TECHNIQUES • ZERO AI • 100% CLIENT-SIDE",
        x: 85,
        y: 390,
        fontFamily: "Inter, sans-serif",
        fontSize: 26,
        fontWeight: "700",
        color: "#38bdf8",
        visible: true,
      },
    ],
    bgType: "gradient",
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0369a1 100%)",
  },
  {
    id: "ig-quote",
    title: "Instagram Quote Card",
    desc: "Minimalist serif typography with elegant borders",
    width: 1080,
    height: 1080,
    badge: "1:1",
    layers: [
      {
        type: "shape",
        name: "Card Border Frame",
        shapeType: "rect",
        x: 60,
        y: 60,
        width: 960,
        height: 960,
        fillColor: "transparent",
        strokeColor: "#0ea5e9",
        strokeWidth: 4,
        opacity: 0.6,
        visible: true,
      },
      {
        type: "text",
        name: "Quote Symbol",
        text: "“",
        x: 120,
        y: 180,
        fontFamily: "Playfair Display, serif",
        fontSize: 140,
        fontWeight: "bold",
        color: "#0ea5e9",
        visible: true,
      },
      {
        type: "text",
        name: "Quote Body",
        text: "Creativity takes courage.\nEvery artist was first an amateur.",
        x: 120,
        y: 380,
        fontFamily: "Playfair Display, serif",
        fontSize: 48,
        fontWeight: "600",
        color: "#0c4a6e",
        visible: true,
      },
      {
        type: "text",
        name: "Author Tag",
        text: "— HENRI MATISSE",
        x: 120,
        y: 720,
        fontFamily: "Inter, sans-serif",
        fontSize: 22,
        fontWeight: "800",
        color: "#0284c7",
        visible: true,
      },
    ],
    bgType: "color",
    bgColor: "#f0f9ff",
  },
  {
    id: "biz-card-tpl",
    title: "Executive Business Card",
    desc: "Professional modern stationery template",
    width: 1050,
    height: 600,
    badge: "Card",
    layers: [
      {
        type: "shape",
        name: "Azure Accent Bar",
        shapeType: "rect",
        x: 0,
        y: 0,
        width: 24,
        height: 600,
        fillColor: "#0ea5e9",
        strokeColor: "transparent",
        strokeWidth: 0,
        visible: true,
      },
      {
        type: "text",
        name: "Full Name",
        text: "ALEX MORGAN",
        x: 90,
        y: 140,
        fontFamily: "Montserrat, sans-serif",
        fontSize: 46,
        fontWeight: "900",
        color: "#0c4a6e",
        visible: true,
      },
      {
        type: "text",
        name: "Job Title",
        text: "Creative Director & Lead Software Engineer",
        x: 92,
        y: 225,
        fontFamily: "Inter, sans-serif",
        fontSize: 20,
        fontWeight: "600",
        color: "#0ea5e9",
        visible: true,
      },
      {
        type: "shape",
        name: "Divider Line",
        shapeType: "rect",
        x: 90,
        y: 275,
        width: 320,
        height: 3,
        fillColor: "#e0f2fe",
        strokeColor: "transparent",
        strokeWidth: 0,
        visible: true,
      },
      {
        type: "text",
        name: "Contact Details",
        text: "✉ hello@photopro.app   •   ☎ +1 (555) 019-2834\n🌐 https://photopro.vercel.app",
        x: 92,
        y: 330,
        fontFamily: "DM Sans, sans-serif",
        fontSize: 18,
        fontWeight: "500",
        color: "#0c4a6e",
        visible: true,
      },
    ],
    bgType: "color",
    bgColor: "#ffffff",
  },
  {
    id: "flyer-event",
    title: "Music Festival Event Flyer",
    desc: "High-impact visual event poster",
    width: 816,
    height: 1056,
    badge: "Flyer",
    layers: [
      {
        type: "text",
        name: "Date Line",
        text: "SATURDAY • NOV 28 • 8:00 PM",
        x: 80,
        y: 120,
        fontFamily: "Space Grotesk, sans-serif",
        fontSize: 22,
        fontWeight: "700",
        color: "#38bdf8",
        visible: true,
      },
      {
        type: "text",
        name: "Event Title",
        text: "LIVE MUSIC\nFESTIVAL",
        x: 75,
        y: 180,
        fontFamily: "Bebas Neue, sans-serif",
        fontSize: 110,
        fontWeight: "bold",
        color: "#ffffff",
        visible: true,
      },
      {
        type: "shape",
        name: "CTA Button Shape",
        shapeType: "rect",
        x: 80,
        y: 720,
        width: 260,
        height: 60,
        fillColor: "#0ea5e9",
        strokeColor: "transparent",
        strokeWidth: 0,
        visible: true,
      },
      {
        type: "text",
        name: "CTA Text",
        text: "GET TICKETS NOW",
        x: 105,
        y: 742,
        fontFamily: "Inter, sans-serif",
        fontSize: 18,
        fontWeight: "800",
        color: "#ffffff",
        visible: true,
      },
    ],
    bgType: "gradient",
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0ea5e9 100%)",
  },
];

export default function TemplatesPanel({
  canvasWidth,
  canvasHeight,
  onResizeCanvas,
  onLoadTemplate,
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [customW, setCustomW] = useState(canvasWidth || 1280);
  const [customH, setCustomH] = useState(canvasHeight || 720);
  const [lockAspect, setLockAspect] = useState(true);

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (customW > 0 && customH > 0) {
      onResizeCanvas?.(Number(customW), Number(customH));
    }
  };

  const handleWidthChange = (val) => {
    const newW = Number(val);
    setCustomW(newW);
    if (lockAspect && canvasWidth > 0) {
      setCustomH(Math.round(newW * (canvasHeight / canvasWidth)));
    }
  };

  const handleHeightChange = (val) => {
    const newH = Number(val);
    setCustomH(newH);
    if (lockAspect && canvasHeight > 0) {
      setCustomW(Math.round(newH * (canvasWidth / canvasHeight)));
    }
  };

  return (
    <div className="templates-panel">
      <div className="tpl-header">
        <h3>Design Presets & Templates</h3>
        <p>Canva-style social formats and 1-click editable multi-layer designs.</p>
      </div>

      {/* 1. EDITABLE MULTI-LAYER TEMPLATES */}
      <div className="tpl-section">
        <div className="tpl-section-title">
          <Sparkles size={14} /> 1-Click Editable Templates
        </div>
        <div className="editable-templates-grid">
          {EDITABLE_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="template-card" onClick={() => onLoadTemplate?.(tpl)}>
              <div
                className="template-card-preview"
                style={{
                  background: tpl.bgGradient || tpl.bgColor,
                  aspectRatio: `${tpl.width} / ${tpl.height}`,
                }}
              >
                <span className="tpl-badge">{tpl.badge}</span>
                <span className="tpl-title-preview">{tpl.title}</span>
              </div>
              <div className="template-card-info">
                <strong>{tpl.title}</strong>
                <span>{tpl.desc}</span>
                <small>{tpl.width} × {tpl.height} px</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SOCIAL & PRINT CANVAS SIZES */}
      <div className="tpl-section">
        <div className="tpl-section-title">
          <LayoutTemplate size={14} /> Canvas Size Presets
        </div>
        <div className="presets-sizes-list">
          {PRESET_CANVAS_SIZES.map((preset) => {
            const Icon = preset.icon;
            const isCurrent = canvasWidth === preset.width && canvasHeight === preset.height;
            return (
              <button
                key={preset.id}
                className={`preset-size-row ${isCurrent ? "current" : ""}`}
                onClick={() => onResizeCanvas?.(preset.width, preset.height)}
              >
                <div className="preset-left">
                  <Icon size={16} className="preset-icon" />
                  <div>
                    <strong>{preset.name}</strong>
                    <span>{preset.width} × {preset.height} px • {preset.ratio}</span>
                  </div>
                </div>
                {isCurrent && <Check size={14} className="check-icon" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CUSTOM CANVAS SIZE */}
      <div className="tpl-section">
        <div className="tpl-section-title">
          <Maximize2 size={14} /> Custom Canvas Dimensions
        </div>
        <form onSubmit={handleApplyCustom} className="custom-size-form">
          <div className="size-inputs-row">
            <label className="dimension-field">
              <span>Width (px)</span>
              <input
                type="number"
                min="64"
                max="8192"
                value={customW}
                onChange={(e) => handleWidthChange(e.target.value)}
              />
            </label>

            <button
              type="button"
              className={`aspect-lock-btn ${lockAspect ? "locked" : ""}`}
              onClick={() => setLockAspect(!lockAspect)}
              title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
            >
              {lockAspect ? <Lock size={14} /> : <Unlock size={14} />}
            </button>

            <label className="dimension-field">
              <span>Height (px)</span>
              <input
                type="number"
                min="64"
                max="8192"
                value={customH}
                onChange={(e) => handleHeightChange(e.target.value)}
              />
            </label>
          </div>

          <button type="submit" className="button button-primary button-small full-width">
            Apply Custom Canvas Size
          </button>
        </form>
      </div>
    </div>
  );
}
