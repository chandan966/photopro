import React, { useState } from "react";
import { Sparkles, SlidersHorizontal, Sun, Zap, Palette, Film } from "lucide-react";
import "./FiltersPanel.css";

const CATEGORIES = [
  { id: "all", label: "All Filters" },
  { id: "mood", label: "Mood & Style" },
  { id: "color", label: "Color Tone" },
  { id: "nature", label: "Atmosphere" },
  { id: "vintage", label: "Vintage & Retro" },
];

const PRESET_FILTERS = [
  { id: "none", name: "Normal", category: "all", css: "none" },
  { id: "vintage", name: "Vintage", category: "vintage", css: "sepia(0.55) contrast(1.15) brightness(0.95) saturate(0.85) hue-rotate(-10deg)" },
  { id: "cinematic", name: "Cinematic", category: "mood", css: "contrast(1.25) saturate(1.3) hue-rotate(20deg) brightness(0.96)" },
  { id: "retro", name: "Retro", category: "vintage", css: "sepia(0.4) contrast(1.2) brightness(1.05) saturate(1.15) hue-rotate(-15deg)" },
  { id: "bw", name: "Black & White", category: "mood", css: "grayscale(1) contrast(1.35) brightness(1.02)" },
  { id: "sepia", name: "Sepia", category: "vintage", css: "sepia(0.85) contrast(1.08) brightness(0.98)" },
  { id: "warm", name: "Warm", category: "color", css: "sepia(0.28) saturate(1.35) hue-rotate(-8deg) brightness(1.03)" },
  { id: "cool", name: "Cool", category: "color", css: "hue-rotate(24deg) saturate(1.15) brightness(1.05) contrast(1.08)" },
  { id: "dramatic", name: "Dramatic", category: "mood", css: "contrast(1.45) brightness(0.9) saturate(0.85)" },
  { id: "moody", name: "Moody", category: "mood", css: "contrast(1.2) brightness(0.92) saturate(1.1) sepia(0.18)" },
  { id: "film", name: "Film", category: "vintage", css: "contrast(1.1) brightness(1.02) saturate(0.95) sepia(0.15)" },
  { id: "hdr", name: "HDR-Style Effect", category: "mood", css: "contrast(1.3) saturate(1.45) brightness(1.06)" },
  { id: "golden-hour", name: "Golden Hour", category: "nature", css: "sepia(0.42) saturate(1.45) brightness(1.08) hue-rotate(-5deg)" },
  { id: "summer", name: "Summer", category: "nature", css: "saturate(1.5) brightness(1.1) contrast(1.12) hue-rotate(-4deg)" },
  { id: "winter", name: "Winter", category: "nature", css: "hue-rotate(18deg) saturate(0.8) brightness(1.08) contrast(1.15)" },
  { id: "portrait", name: "Portrait", category: "color", css: "brightness(1.06) contrast(0.96) saturate(1.12) sepia(0.12)" },
  { id: "landscape", name: "Landscape", category: "nature", css: "contrast(1.22) saturate(1.42) brightness(1.02)" },
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
            <span style={{ fontFamily: "monospace", color: "#0284c7" }}>
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
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#0369a1", textTransform: "uppercase" }}>
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
