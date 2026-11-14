import { useState, useEffect, useRef } from "react";
import {
  Aperture,
  ArrowUpRight,
  ChevronDown,
  FileCheck,
  FileImage,
  FileText,
  Layers,
  Layout,
  Scale,
  Menu,
  Palette,
  Share2,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
  X,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { APP_CONFIG, PRESETS } from "../../../data/presets.js";
import BrandLogo from "../../shared/BrandLogo/BrandLogo.jsx";
import "./Header.css";

function Header({ page, navigate, openEditor, onOpenLegalModal }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showTemplates = () => {
    if (page !== "home") navigate("home");
    window.setTimeout(() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" }), 60);
    setMenuOpen(false);
  };

  const showSocialMedia = () => {
    if (page !== "home") navigate("home");
    window.setTimeout(() => document.getElementById("social-media")?.scrollIntoView({ behavior: "smooth" }), 60);
    setMenuOpen(false);
  };

  const go = (destination) => {
    navigate(destination);
    setMenuOpen(false);
  };

  return (
    <header className={`site-header-wrapper ${scrolled ? "scrolled" : ""}`}>
      {/* Top ruby accent edge glow */}
      <div className="header-top-glow" />

      <div className="site-header-container">
        {/* BRAND & LOGO */}
        <div className="header-brand-block">
          <button className="brand-button" onClick={() => go("home")} aria-label="PhotoPro Home">
            <BrandLogo size={38} />
          </button>
        </div>

        {/* DESKTOP NAVIGATION DOCK */}
        <nav className="desktop-nav-dock" aria-label="Main navigation">
          {/* Studio Switcher Dock */}
          <div className="studio-switcher-dock">
            <button
              className={`studio-tab-btn ${page === "home" ? "active" : ""}`}
              onClick={() => go("home")}
              title="Overview & Templates"
            >
              <span>Home</span>
            </button>

            <button
              className={`studio-tab-btn photo-tab ${page === "editor" ? "active" : ""}`}
              onClick={() => go("editor")}
              title="Launch Photoshop & Lightroom Master Photo Editor"
            >
              <Aperture size={13} className="tab-icon ruby-icon" />
              <span>Photo Studio</span>
            </button>

            <button
              className={`studio-tab-btn design-tab ${page === "design" ? "active" : ""}`}
              onClick={() => go("design")}
              title="Open Canva & Social Media Design Studio"
            >
              <Layout size={13} className="tab-icon gold-icon" />
              <span>Design Studio</span>
            </button>

            <button
              className={`studio-tab-btn pdf-tab ${page === "pdf" ? "active" : ""}`}
              onClick={() => go("pdf")}
              title="Open PDF Studio & Document Maker"
            >
              <FileText size={13} className="tab-icon ruby-icon" />
              <span>PDF Studio</span>
            </button>
          </div>

          <div className="nav-divider-separator" />

          {/* Quick Discover & Tools */}
          <div className="nav-links-cluster">
            <button
              className="nav-action-pill social-nav-pill"
              onClick={showSocialMedia}
              title="YouTube, Instagram, TikTok, Twitter & Meta Presets"
            >
              <Share2 size={13} className="nav-pill-icon" />
              <span>Social Media</span>
            </button>
          </div>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="header-actions-group">
          {/* Launch Studio Master Button */}
          <button
            className="launch-studio-master-btn"
            onClick={() => openEditor(PRESETS[0])}
            title="Launch Photo Studio Workspace"
          >
            <span className="launch-btn-shimmer" />
            <Zap size={14} className="launch-zap-icon" />
            <span className="launch-btn-text">Launch Studio</span>
            <ArrowUpRight size={14} className="launch-arrow-icon" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED DRAWER */}
      {menuOpen && (
        <div className="mobile-drawer-overlay animate-fadeIn">
          <div className="mobile-drawer-content">
            {/* Studio Navigation Cards */}
            <div className="mobile-section-heading">CREATIVE SUITES</div>
            <div className="mobile-studios-grid">
              <button
                className={`mobile-studio-card ${page === "editor" ? "active" : ""}`}
                onClick={() => go("editor")}
              >
                <div className="mobile-card-icon ruby">
                  <Aperture size={18} />
                </div>
                <div className="mobile-card-info">
                  <strong>Photo Studio</strong>
                  <small>Photoshop & Lightroom Suite</small>
                </div>
              </button>

              <button
                className={`mobile-studio-card ${page === "design" ? "active" : ""}`}
                onClick={() => go("design")}
              >
                <div className="mobile-card-icon gold">
                  <Layout size={18} />
                </div>
                <div className="mobile-card-info">
                  <strong>Design Studio</strong>
                  <small>Canva & Social Media Templates</small>
                </div>
              </button>

              <button
                className={`mobile-studio-card ${page === "pdf" ? "active" : ""}`}
                onClick={() => go("pdf")}
              >
                <div className="mobile-card-icon ruby">
                  <FileText size={18} />
                </div>
                <div className="mobile-card-info">
                  <strong>PDF Maker & Studio</strong>
                  <small>PDF Document Suite</small>
                </div>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mobile-section-heading">EXPLORE &amp; TRUST</div>
            <div className="mobile-nav-links-list">
              <button className="mobile-link-row" onClick={() => go("home")}>
                <span>Home Dashboard</span>
              </button>

              <button className="mobile-link-row" onClick={() => go("about")}>
                <span>About PhotoPro</span>
              </button>

              <button className="mobile-link-row" onClick={() => go("contact")}>
                <span>Contact Support</span>
              </button>

              <button className="mobile-link-row" onClick={() => go("privacy")}>
                <span>Privacy Policy</span>
              </button>

              <button className="mobile-link-row" onClick={showSocialMedia}>
                <Share2 size={15} />
                <span>Social Media Creator Hub</span>
              </button>
            </div>

            {/* Pro Tools Grid */}
            <div className="mobile-section-heading">AI & UTILITY TOOLS</div>
            <div className="mobile-tools-mini-grid">
              <button onClick={() => go("background")}>
                <WandSparkles size={14} />
                <span>BG Remover</span>
              </button>
              <button onClick={() => go("enhancer")}>
                <Sparkles size={14} />
                <span>AI Enhancer</span>
              </button>
              <button onClick={() => go("compressor")}>
                <SlidersHorizontal size={14} />
                <span>Compressor</span>
              </button>
              <button onClick={() => go("converter")}>
                <FileImage size={14} />
                <span>Converter</span>
              </button>
              <button onClick={() => go("palette")}>
                <Palette size={14} />
                <span>Palette</span>
              </button>
            </div>

            {/* Mobile Launch CTA */}
            <div className="mobile-bottom-actions">
              <button
                className="mobile-launch-cta"
                onClick={() => {
                  setMenuOpen(false);
                  openEditor(PRESETS[0]);
                }}
              >
                <Zap size={16} />
                <span>Launch Studio Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
