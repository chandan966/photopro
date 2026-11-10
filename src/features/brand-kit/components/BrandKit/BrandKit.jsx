import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Palette,
  Plus,
  ShieldCheck,
  Trash2,
  Type,
  Upload,
  Zap,
} from "lucide-react";
import { downloadBlob } from "../../../../utils/imageTools.js";
import "./BrandKit.css";

const STORAGE_KEY = "photopro_brand_kit_v1";

const DEFAULT_BRAND_KIT = {
  brandName: "My Brand",
  logoUrl: null,
  colors: [
    { id: "primary", label: "Primary Brand Color", hex: "#e11d48" },
    { id: "secondary", label: "Secondary Accent", hex: "#f43f5e" },
    { id: "dark", label: "Dark Background", hex: "#090b0e" },
    { id: "surface", label: "Card Surface", hex: "#12151b" },
    { id: "text", label: "Main Text", hex: "#ffffff" },
    { id: "gold", label: "Gold Accent", hex: "#fbbf24" },
  ],
  fonts: {
    heading: "Montserrat",
    body: "Inter",
  },
};

export default function BrandKit({ notify, onExit, onApplyBrandToStudio }) {
  const [brandKit, setBrandKit] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_BRAND_KIT;
    } catch {
      return DEFAULT_BRAND_KIT;
    }
  });

  const [copiedHex, setCopiedHex] = useState(null);
  const logoInputRef = useRef(null);
  const jsonImportRef = useRef(null);

  // Save to LocalStorage whenever modified
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(brandKit));
    } catch {}
  }, [brandKit]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBrandKit((prev) => ({ ...prev, logoUrl: ev.target.result }));
      notify?.("Updated Brand Logo");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleColorChange = (idx, newHex) => {
    setBrandKit((prev) => {
      const nextColors = [...prev.colors];
      nextColors[idx] = { ...nextColors[idx], hex: newHex };
      return { ...prev, colors: nextColors };
    });
  };

  const handleCopyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    notify?.(`Copied ${hex} to clipboard!`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(brandKit, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    downloadBlob(blob, `${brandKit.brandName.toLowerCase().replace(/\s+/g, "-")}-brandkit.json`);
    notify?.("Exported Brand Kit JSON");
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.colors && Array.isArray(data.colors)) {
          setBrandKit(data);
          notify?.("Imported Brand Kit!");
        }
      } catch (err) {
        notify?.(`Invalid JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="brandkit-page">
      <header className="brandkit-header">
        <div className="brandkit-brand">
          <button className="brandkit-exit-btn" onClick={onExit} title="Back to Home">
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>
          <div className="brandkit-title-wrap">
            <h2>Brand Kit & Style Manager</h2>
            <span className="brandkit-badge">
              <ShieldCheck size={13} /> Saved in Browser LocalStorage
            </span>
          </div>
        </div>

        <div className="brandkit-top-actions">
          <button className="button button-outline" onClick={() => jsonImportRef.current?.click()}>
            <Upload size={14} /> Import Kit
          </button>
          <button className="button button-outline" onClick={handleExportJson}>
            <Download size={14} /> Export JSON
          </button>
          <button
            className="button button-primary"
            onClick={() => onApplyBrandToStudio?.(brandKit)}
          >
            <Zap size={14} /> Apply to Photo Studio
          </button>
        </div>
      </header>

      <div className="brandkit-workspace">
        {/* Brand Name Input */}
        <div className="brandkit-card">
          <span className="card-section-title">Brand Identity</span>
          <div className="brand-name-row">
            <input
              type="text"
              className="brand-name-input"
              value={brandKit.brandName}
              onChange={(e) => setBrandKit({ ...brandKit, brandName: e.target.value })}
              placeholder="Brand or Organization Name"
            />
          </div>
        </div>

        {/* Brand Logo Box */}
        <div className="brandkit-card">
          <span className="card-section-title">Brand Logo (PNG / SVG)</span>
          <div className="logo-upload-box">
            {brandKit.logoUrl ? (
              <div className="logo-preview-frame">
                <img src={brandKit.logoUrl} alt="Brand Logo" className="logo-img" />
                <button
                  className="remove-logo-btn"
                  onClick={() => setBrandKit({ ...brandKit, logoUrl: null })}
                  title="Remove logo"
                >
                  <Trash2 size={14} /> Remove Logo
                </button>
              </div>
            ) : (
              <div
                className="logo-placeholder-drop"
                onClick={() => logoInputRef.current?.click()}
              >
                <Upload size={24} />
                <span>Upload Brand Logo (Transparent PNG or SVG)</span>
              </div>
            )}
          </div>
        </div>

        {/* Brand Color Palette */}
        <div className="brandkit-card">
          <span className="card-section-title">Brand Color Palette</span>
          <div className="brand-swatches-grid">
            {brandKit.colors.map((colorItem, idx) => (
              <div key={colorItem.id} className="swatch-card">
                <div
                  className="swatch-color-box"
                  style={{ backgroundColor: colorItem.hex }}
                >
                  <input
                    type="color"
                    className="swatch-native-picker"
                    value={colorItem.hex}
                    onChange={(e) => handleColorChange(idx, e.target.value)}
                  />
                </div>
                <div className="swatch-meta">
                  <span className="swatch-label">{colorItem.label}</span>
                  <div className="swatch-hex-row">
                    <span className="swatch-hex">{colorItem.hex}</span>
                    <button
                      className="swatch-copy-btn"
                      onClick={() => handleCopyHex(colorItem.hex)}
                      title="Copy HEX"
                    >
                      {copiedHex === colorItem.hex ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Typography */}
        <div className="brandkit-card">
          <span className="card-section-title">Brand Typography Pairing</span>
          <div className="fonts-pair-row">
            <div className="font-pair-item">
              <span className="font-role">Primary Heading Font</span>
              <select
                className="font-select"
                value={brandKit.fonts?.heading || "Montserrat"}
                onChange={(e) =>
                  setBrandKit({
                    ...brandKit,
                    fonts: { ...brandKit.fonts, heading: e.target.value },
                  })
                }
              >
                <option value="Montserrat">Montserrat (Impact Modern)</option>
                <option value="Bebas Neue">Bebas Neue (YouTube Headline)</option>
                <option value="Inter">Inter (Clean UI)</option>
                <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                <option value="Space Grotesk">Space Grotesk (Tech Modern)</option>
              </select>
            </div>

            <div className="font-pair-item">
              <span className="font-role">Secondary Body Font</span>
              <select
                className="font-select"
                value={brandKit.fonts?.body || "Inter"}
                onChange={(e) =>
                  setBrandKit({
                    ...brandKit,
                    fonts: { ...brandKit.fonts, body: e.target.value },
                  })
                }
              >
                <option value="Inter">Inter (High Legibility)</option>
                <option value="DM Sans">DM Sans (Editorial)</option>
                <option value="Roboto">Roboto (Google Standard)</option>
                <option value="Poppins">Poppins (Friendly Geometric)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleLogoUpload}
      />
      <input
        ref={jsonImportRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleImportJson}
      />
    </div>
  );
}
