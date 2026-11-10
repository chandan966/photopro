import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Crown,
  Eye,
  Filter,
  Flame,
  Layout,
  Palette,
  Search,
  Share2,
  Sparkles,
  Type,
  Youtube,
  Zap,
} from "lucide-react";
import "./DesignStudio.css";

const PLATFORMS = [
  { id: "all", label: "All Templates" },
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "Twitter / X" },
  { id: "business", label: "Business & Ads" },
];

const TEMPLATES = [
  {
    id: "yt-gaming",
    title: "Pro Gaming Livestream",
    platform: "youtube",
    category: "YouTube Thumbnail",
    width: 1280,
    height: 720,
    bgColor: "#090b0e",
    gradient: { stops: ["#e11d48", "#1e1b4b"] },
    tag: "High CTR",
    headline: "RANK #1 GAMEPLAY",
    subhead: "Unbeatable Meta Secrets Revealed",
    badge: "EPIC 4K",
  },
  {
    id: "yt-tech",
    title: "Tech Review & Unboxing",
    platform: "youtube",
    category: "YouTube Thumbnail",
    width: 1280,
    height: 720,
    bgColor: "#030712",
    gradient: { stops: ["#0284c7", "#0f172a"] },
    tag: "Trending",
    headline: "DO NOT BUY THIS!",
    subhead: "The Honest 30-Day Truth",
    badge: "VIRAL",
  },
  {
    id: "yt-banner",
    title: "Channel Header Banner",
    platform: "youtube",
    category: "YouTube Banner",
    width: 2560,
    height: 1440,
    bgColor: "#090b0e",
    gradient: { stops: ["#be123c", "#0f172a"] },
    tag: "Channel Art",
    headline: "CHANDAN CREATIVE",
    subhead: "New Videos Every Tuesday & Friday",
    badge: "SUBSCRIBE",
  },
  {
    id: "insta-sale",
    title: "Flash Mega Sale 50% Off",
    platform: "instagram",
    category: "Instagram Post (1:1)",
    width: 1080,
    height: 1080,
    bgColor: "#18181b",
    gradient: { stops: ["#e11d48", "#f43f5e"] },
    tag: "E-Commerce",
    headline: "MID-SEASON SALE",
    subhead: "Use Code PRO50 at Checkout",
    badge: "-50% OFF",
  },
  {
    id: "insta-story",
    title: "Podcast Episode Drop",
    platform: "instagram",
    category: "Instagram Story (9:16)",
    width: 1080,
    height: 1920,
    bgColor: "#090b0e",
    gradient: { stops: ["#7c3aed", "#1e1b4b"] },
    tag: "Story / Reel",
    headline: "NEW EPISODE OUT",
    subhead: "Swipe Up to Listen on Spotify",
    badge: "EPISODE 42",
  },
  {
    id: "tiktok-trend",
    title: "Viral TikTok Sound Challenge",
    platform: "tiktok",
    category: "TikTok Video (9:16)",
    width: 1080,
    height: 1920,
    bgColor: "#030712",
    gradient: { stops: ["#06b6d4", "#e11d48"] },
    tag: "Trending",
    headline: "TRY THIS SOUND",
    subhead: "The trend taking over the feed",
    badge: "#VIRAL",
  },
  {
    id: "fb-cover",
    title: "Brand Official Community Cover",
    platform: "facebook",
    category: "Facebook Cover",
    width: 1640,
    height: 924,
    bgColor: "#090b0e",
    gradient: { stops: ["#1d4ed8", "#0f172a"] },
    tag: "Community",
    headline: "GLOBAL CREATORS CLUB",
    subhead: "Connect, Learn and Collaborate Daily",
    badge: "JOIN FREE",
  },
  {
    id: "linkedin-banner",
    title: "Executive Modern Banner",
    platform: "linkedin",
    category: "LinkedIn Banner",
    width: 1584,
    height: 396,
    bgColor: "#0a0a0a",
    gradient: { stops: ["#0369a1", "#0284c7"] },
    tag: "Professional",
    headline: "FULL-STACK ARCHITECT",
    subhead: "Building High-Scale Cloud & AI Platforms",
    badge: "OPEN TO WORK",
  },
  {
    id: "biz-webinar",
    title: "Live Masterclass & Webinar",
    platform: "business",
    category: "Business Banner",
    width: 1200,
    height: 628,
    bgColor: "#090b0e",
    gradient: { stops: ["#f59e0b", "#b45309"] },
    tag: "Masterclass",
    headline: "AI DESIGN WORKSHOP",
    subhead: "Learn Industry Workflows in 90 Minutes",
    badge: "FREE REGISTRATION",
  },
];

export default function DesignStudio({ onExit, onOpenInEditor }) {
  const [activePlatform, setActivePlatform] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchPlatform = activePlatform === "all" || t.platform === activePlatform;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPlatform && matchSearch;
  });

  const handleLaunchTemplate = (template) => {
    // Generate pre-populated editable layer state
    const preset = {
      id: template.id,
      name: template.category,
      width: template.width,
      height: template.height,
    };

    // Pre-populate with Canvas Layers (Background, Headline, Subhead, Badge)
    const initialLayers = [
      {
        id: crypto.randomUUID(),
        type: "shape",
        shapeType: "rounded",
        name: "Accent Card",
        x: Math.round(template.width * 0.08),
        y: Math.round(template.height * 0.15),
        width: Math.round(template.width * 0.84),
        height: Math.round(template.height * 0.7),
        color: "rgba(255, 255, 255, 0.04)",
        strokeColor: "rgba(255, 255, 255, 0.1)",
        strokeWidth: 2,
        cornerRadius: 16,
        opacity: 1,
        blendMode: "normal",
        visible: true,
        locked: false,
      },
      {
        id: crypto.randomUUID(),
        type: "text",
        name: "Headline Text",
        text: template.headline,
        x: Math.round(template.width * 0.12),
        y: Math.round(template.height * 0.35),
        fontSize: Math.round(template.width * 0.055),
        fontFamily: "Montserrat",
        color: "#ffffff",
        bold: true,
        italic: false,
        align: "left",
        opacity: 1,
        blendMode: "normal",
        visible: true,
        locked: false,
      },
      {
        id: crypto.randomUUID(),
        type: "text",
        name: "Subheading Text",
        text: template.subhead,
        x: Math.round(template.width * 0.12),
        y: Math.round(template.height * 0.52),
        fontSize: Math.round(template.width * 0.026),
        fontFamily: "Inter",
        color: "#cbd5e1",
        bold: false,
        italic: false,
        align: "left",
        opacity: 1,
        blendMode: "normal",
        visible: true,
        locked: false,
      },
      {
        id: crypto.randomUUID(),
        type: "sticker",
        name: "Callout Badge",
        badgeText: template.badge,
        x: Math.round(template.width * 0.12),
        y: Math.round(template.height * 0.22),
        width: Math.round(template.width * 0.18),
        height: Math.round(template.height * 0.075),
        color: "#e11d48",
        opacity: 1,
        blendMode: "normal",
        visible: true,
        locked: false,
      },
    ];

    onOpenInEditor?.(preset, initialLayers, template.gradient);
  };

  return (
    <div className="design-studio-page">
      {/* Top Header */}
      <header className="design-header">
        <div className="design-brand">
          <button className="design-exit-btn" onClick={onExit} title="Back to Home">
            <ArrowLeft size={16} />
            <span>Home</span>
          </button>
          <div className="design-title-wrap">
            <h2>Canva & Social Media Design Studio</h2>
            <span className="design-badge">
              <Sparkles size={12} /> Ready-to-Edit Templates & Presets
            </span>
          </div>
        </div>

        <div className="design-search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search templates (e.g. Gaming, YouTube, Sale)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="design-content-container">
        {/* Platform Categories Pill Bar */}
        <div className="platform-nav-strip">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              className={`platform-pill ${activePlatform === p.id ? "active" : ""}`}
              onClick={() => setActivePlatform(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="templates-showcase-grid">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => handleLaunchTemplate(template)}
            >
              {/* Visual Simulated Canvas Preview */}
              <div
                className="template-canvas-preview"
                style={{
                  background: `linear-gradient(135deg, ${template.gradient.stops[0]} 0%, ${template.gradient.stops[1]} 100%)`,
                  aspectRatio: `${template.width} / ${template.height}`,
                }}
              >
                <span className="template-card-tag">{template.tag}</span>

                <div className="preview-mockup-content">
                  <div className="mockup-badge">{template.badge}</div>
                  <div className="mockup-title">{template.headline}</div>
                  <div className="mockup-sub">{template.subhead}</div>
                </div>

                <div className="template-hover-overlay">
                  <button className="edit-btn">
                    <Zap size={14} /> Open in Photo Studio
                  </button>
                </div>
              </div>

              {/* Template Card Meta */}
              <div className="template-card-footer">
                <div>
                  <strong className="template-card-name">{template.title}</strong>
                  <span className="template-card-dim">
                    {template.category} • {template.width} × {template.height}
                  </span>
                </div>
                <button
                  className="card-launch-icon"
                  title="Edit template in Photo Studio"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunchTemplate(template);
                  }}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
