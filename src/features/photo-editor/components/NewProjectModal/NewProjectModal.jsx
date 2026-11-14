import React, { useState } from "react";
import { X, Layers, Image, Sparkles, Check } from "lucide-react";
import "./NewProjectModal.css";

const PRESET_GROUPS = [
  {
    category: "Social Media",
    items: [
      { name: "Instagram Post", width: 1080, height: 1080, desc: "1:1 Square" },
      { name: "Instagram Story", width: 1080, height: 1920, desc: "9:16 Vertical" },
      { name: "YouTube Thumbnail", width: 1280, height: 720, desc: "16:9 HD" },
      { name: "YouTube Banner", width: 2560, height: 1440, desc: "Channel Art" },
      { name: "Facebook Post", width: 1200, height: 630, desc: "News Feed" },
      { name: "Twitter/X Header", width: 1500, height: 500, desc: "Header Banner" },
    ],
  },
  {
    category: "Screen & Displays",
    items: [
      { name: "Full HD", width: 1920, height: 1080, desc: "1080p Standard" },
      { name: "4K UHD", width: 3840, height: 2160, desc: "Ultra High Def" },
      { name: "720p HD", width: 1280, height: 720, desc: "Standard Web" },
      { name: "MacBook Display", width: 2880, height: 1800, desc: "Retina 16:10" },
    ],
  },
  {
    category: "Print",
    items: [
      { name: "A4 Document", width: 2480, height: 3508, desc: "300 DPI Print" },
      { name: "A5 Flyer", width: 1748, height: 2480, desc: "Half Page Flyer" },
      { name: "Business Card", width: 1050, height: 600, desc: "3.5 x 2 in" },
      { name: "Poster", width: 3600, height: 5400, desc: "12 x 18 in" },
    ],
  },
];

export default function NewProjectModal({ onClose, onCreateProject }) {
  const [docName, setDocName] = useState("Untitled-1");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [dpi, setDpi] = useState(72);
  const [bgType, setBgType] = useState("white"); // 'white', 'transparent', 'black', 'custom'
  const [customBgColor, setCustomBgColor] = useState("#242424");
  const [activeCategory, setActiveCategory] = useState("Social Media");

  const handleSelectPreset = (item) => {
    setWidth(item.width);
    setHeight(item.height);
    setDocName(item.name);
  };

  const handleCreate = () => {
    const finalBg =
      bgType === "transparent"
        ? "transparent"
        : bgType === "black"
        ? "#000000"
        : bgType === "custom"
        ? customBgColor
        : "#ffffff";

    onCreateProject?.({
      name: docName.trim() || "Untitled-1",
      width: Math.max(10, Math.min(8000, Number(width) || 1920)),
      height: Math.max(10, Math.min(8000, Number(height) || 1080)),
      dpi: Number(dpi) || 72,
      background: finalBg,
    });
    onClose();
  };

  return (
    <div className="new-project-backdrop" onClick={onClose}>
      <div className="new-project-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="new-project-header">
          <div className="new-project-title-row">
            <span className="photopea-badge">NEW PROJECT</span>
            <h3>Create a New Document</h3>
          </div>
          <button className="new-project-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="new-project-body">
          {/* Left: Document Parameters Form */}
          <div className="new-project-form-col">
            <div className="form-row">
              <label>Name:</label>
              <input
                type="text"
                className="form-input"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Untitled-1"
              />
            </div>

            <div className="form-row-split">
              <div className="form-field">
                <label>Width (px):</label>
                <input
                  type="number"
                  className="form-input"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  min="10"
                  max="8000"
                />
              </div>
              <div className="form-field">
                <label>Height (px):</label>
                <input
                  type="number"
                  className="form-input"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="10"
                  max="8000"
                />
              </div>
            </div>

            <div className="form-row-split">
              <div className="form-field">
                <label>DPI / Resolution:</label>
                <select
                  className="form-input"
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                >
                  <option value={72}>72 DPI (Web/Screen)</option>
                  <option value={150}>150 DPI (Draft Print)</option>
                  <option value={300}>300 DPI (High-Res Print)</option>
                </select>
              </div>

              <div className="form-field">
                <label>Background:</label>
                <select
                  className="form-input"
                  value={bgType}
                  onChange={(e) => setBgType(e.target.value)}
                >
                  <option value="white">White</option>
                  <option value="transparent">Transparent</option>
                  <option value="black">Black</option>
                  <option value="custom">Custom Color</option>
                </select>
              </div>
            </div>

            {bgType === "custom" && (
              <div className="form-row">
                <label>Custom Color:</label>
                <input
                  type="color"
                  className="form-color-picker"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                />
              </div>
            )}

            <div className="form-summary-card">
              <span>Canvas Aspect: {(width / height).toFixed(2)}:1</span>
              <span>Total Pixels: {(width * height).toLocaleString()} px</span>
            </div>

            <div className="form-actions-row">
              <button className="button-cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="button-create" onClick={handleCreate}>
                Create Document
              </button>
            </div>
          </div>

          {/* Right: Presets Library */}
          <div className="new-project-presets-col">
            <div className="presets-nav-tabs">
              {PRESET_GROUPS.map((g) => (
                <button
                  key={g.category}
                  className={`preset-tab-btn ${activeCategory === g.category ? "active" : ""}`}
                  onClick={() => setActiveCategory(g.category)}
                >
                  {g.category}
                </button>
              ))}
            </div>

            <div className="presets-grid">
              {PRESET_GROUPS.find((g) => g.category === activeCategory)?.items.map((item) => (
                <div
                  key={item.name}
                  className={`preset-item-card ${width === item.width && height === item.height ? "selected" : ""}`}
                  onClick={() => handleSelectPreset(item)}
                >
                  <div className="preset-card-preview">
                    <div
                      className="preset-preview-ratio"
                      style={{
                        aspectRatio: `${item.width} / ${item.height}`,
                        maxHeight: "44px",
                        maxWidth: "60px",
                      }}
                    />
                  </div>
                  <div className="preset-card-body">
                    <strong>{item.name}</strong>
                    <span>
                      {item.width} × {item.height}
                    </span>
                    <small>{item.desc}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
