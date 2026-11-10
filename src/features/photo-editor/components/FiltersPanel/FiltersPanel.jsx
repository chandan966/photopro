import React, { useState } from "react";
import { Sparkles, SlidersHorizontal, Sun, Zap, Palette, Film } from "lucide-react";
import "./FiltersPanel.css";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "basic", label: "Basic" },
  { id: "color", label: "Color" },
  { id: "cinematic", label: "Cinematic" },
  { id: "portrait", label: "Portrait" },
  { id: "vintage", label: "Vintage" },
  { id: "blur", label: "Blur & Sharpen" },
];

const PRESET_FILTERS = [
  // Basic
  { id: "none", name: "Normal", category: "basic", css: "none" },
  { id: "vivid", name: "Vivid Pop", category: "basic", css: "saturate(1.4) contrast(1.15)" },
  { id: "matte", name: "Matte Black", category: "basic", css: "contrast(0.9) brightness(1.05) sepia(0.1)" },
  { id: "high-contrast", name: "High Contrast", category: "basic", css: "contrast(1.35) brightness(0.95)" },

  // Color
  { id: "warm", name: "Warm Amber", category: "color", css: "sepia(0.3) saturate(1.3) hue-rotate(-10deg)" },
  { id: "cool", name: "Cool Glacier", category: "color", css: "hue-rotate(20deg) saturate(1.15) brightness(1.05)" },
  { id: "golden", name: "Golden Hour", category: "color", css: "sepia(0.4) saturate(1.4) brightness(1.05)" },
  { id: "sunset", name: "Crimson Sunset", category: "color", css: "hue-rotate(-20deg) saturate(1.5) contrast(1.1)" },
  { id: "bw", name: "Noir B&W", category: "color", css: "grayscale(1) contrast(1.3)" },
  { id: "sepia", name: "Sepia Heritage", category: "color", css: "sepia(0.85) contrast(1.05)" },

  // Cinematic
  { id: "teal-orange", name: "Teal & Orange", category: "cinematic", css: "contrast(1.25) saturate(1.35) hue-rotate(25deg)" },
  { id: "dark-cinema", name: "Dark Cinema", category: "cinematic", css: "brightness(0.9) contrast(1.3) saturate(0.9) sepia(0.15)" },
  { id: "moody-film", name: "Moody 35mm", category: "cinematic", css: "contrast(1.15) brightness(0.95) saturate(1.1) sepia(0.2)" },
  { id: "cyberpunk", name: "Cyberpunk Neon", category: "cinematic", css: "hue-rotate(180deg) saturate(1.8) contrast(1.2)" },

  // Portrait
  { id: "soft-portrait", name: "Soft Glow", category: "portrait", css: "brightness(1.06) contrast(0.95) saturate(1.1)" },
  { id: "clean-skin", name: "Clean Natural", category: "portrait", css: "contrast(1.05) saturate(1.08) brightness(1.02)" },
  { id: "warm-portrait", name: "Warm Glow", category: "portrait", css: "sepia(0.25) saturate(1.2) brightness(1.04)" },

  // Vintage
  { id: "retro-70s", name: "70s Retro", category: "vintage", css: "sepia(0.5) contrast(1.1) brightness(0.95) hue-rotate(-10deg)" },
  { id: "polaroid", name: "Polaroid Instant", category: "vintage", css: "contrast(1.1) brightness(1.08) sepia(0.25) saturate(1.1)" },
  { id: "faded-photo", name: "Faded Memory", category: "vintage", css: "contrast(0.85) brightness(1.12) sepia(0.3) saturate(0.8)" },
];

export default function FiltersPanel({
  activeFilter = "none",
  filterIntensity = 100,
  onChangeFilter,
  onChangeIntensity,
  onApplySpecialEffect, // 'motion-blur', 'zoom-blur', 'unsharp', etc.
}) {
  const [selectedCat, setSelectedCat] = useState("all");

  const displayedFilters = PRESET_FILTERS.filter(
    (f) => selectedCat === "all" || f.category === selectedCat
  );

  return (
    <div className="filters-panel">
      {/* Category Tabs */}
      <div className="filters-category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`filter-cat-btn ${selectedCat === cat.id ? "active" : ""}`}
            onClick={() => setSelectedCat(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="filters-content">
        {/* Filter Intensity Slider */}
        <div className="filter-intensity-box">
          <div className="filter-intensity-label">
            <span>Filter Intensity</span>
            <span style={{ fontFamily: "monospace", color: "#f43f5e" }}>
              {filterIntensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filterIntensity}
            className="filter-slider"
            onChange={(e) => onChangeIntensity?.(Number(e.target.value))}
          />
        </div>

        {/* Preset Filters Grid */}
        <div className="filters-grid">
          {displayedFilters.map((f) => (
            <button
              key={f.id}
              className={`filter-card-btn ${activeFilter === f.id ? "active" : ""}`}
              onClick={() => onChangeFilter?.(f.id, f.css)}
            >
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        {/* Special Optical Blurs & Sharpening Actions */}
        {(selectedCat === "all" || selectedCat === "blur") && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#b30000", textTransform: "uppercase" }}>
              Optical Blurs & Sharpen
            </span>
            <button
              className="filter-card-btn"
              style={{ padding: "8px" }}
              onClick={() => onApplySpecialEffect?.("motion-blur")}
            >
              Apply Motion Blur (15px)
            </button>
            <button
              className="filter-card-btn"
              style={{ padding: "8px" }}
              onClick={() => onApplySpecialEffect?.("zoom-blur")}
            >
              Apply Zoom Radial Blur
            </button>
            <button
              className="filter-card-btn"
              style={{ padding: "8px" }}
              onClick={() => onApplySpecialEffect?.("unsharp")}
            >
              Apply Unsharp Mask Sharpening
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
