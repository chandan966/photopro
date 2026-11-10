import { useState } from "react";
import { Check, Search, Sparkles, X, Zap } from "lucide-react";
import { PHOTO_150_FEATURES } from "../../../data/presets.js";
import "./FeaturesModal.css";

const CATEGORIES = [
  "All 150 Features",
  "Basic",
  "Color",
  "Effects",
  "Layers",
  "Selection",
  "Retouch",
  "Drawing",
  "Text",
  "Graphics",
  "Export",
];

function FeaturesModal({ onClose, onLaunchStudio }) {
  const [activeCategory, setActiveCategory] = useState("All 150 Features");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = PHOTO_150_FEATURES
    .filter((item) => activeCategory === "All 150 Features" || item.cat === activeCategory)
    .filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cat.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="features-catalog-modal">
        <div className="features-modal-top">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> COMPLETE DIRECTORY</div>
            <h2>150 Professional Photo Editing Features</h2>
            <p>Every tool, adjustment, and algorithmic engine built into PhotoPro — 100% client-side.</p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="features-search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search 150 features (e.g., Whites, Blacks, Dehaze, LUT, Dodge, Burn, Skin Smoothing, Crop)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="icon-btn mini" onClick={() => setSearchQuery("")}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="features-category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="features-grid-scroll">
          {filtered.map((item) => (
            <div key={item.num} className="feature-item-card">
              <span className="feature-num">#{item.num < 10 ? `0${item.num}` : item.num}</span>
              <div className="feature-card-texts">
                <span className="feature-name">{item.name}</span>
                <small className="feature-cat-tag">{item.cat}</small>
              </div>
              <span className="feature-check"><Check size={14} /></span>
            </div>
          ))}
        </div>

        <div className="features-modal-footer">
          <span>Showing {filtered.length} of 150 features • All client-side & 100% free</span>
          <button
            className="button button-primary"
            onClick={() => {
              onClose();
              onLaunchStudio();
            }}
          >
            <Zap size={15} /> Open Studio With 150 Features
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeaturesModal;
