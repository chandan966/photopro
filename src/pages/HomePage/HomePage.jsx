import { useRef, useState } from "react";
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  Check,
  Cpu,
  Download,
  FileImage,
  Film,
  Layers,
  LockKeyhole,
  Palette,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Smile,
  Sparkles,
  SplitSquareVertical,
  Upload,
  Wand2,
  WandSparkles,
  Zap,
} from "lucide-react";
import {
  APP_CONFIG,
  PRESETS,
  TOOLS,
  SOCIAL_PLATFORMS,
  PHOTO_150_FEATURES,
  VIDEO_100_FEATURES,
} from "../../data/presets.js";
import { createDemoSampleBlob } from "../../imageTools.js";
import { SocialLogoIcon } from "../../components/shared/SocialLogos/SocialLogos.jsx";
import "./HomePage.css";

function HomePage({ navigate, openEditor, onUpload, notify, onOpenFeaturesModal }) {
  const uploadInputRef = useRef(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLaunch = async () => {
    setDemoLoading(true);
    try {
      const demoBlob = await createDemoSampleBlob("photopro-demo.jpg");
      openEditor(PRESETS[0], demoBlob);
      notify?.("Loaded demo artwork into PhotoPro Studio!");
    } catch {
      openEditor(PRESETS[0]);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <main className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            PROFESSIONAL IN-BROWSER CREATIVE STUDIO
          </div>
          <h1>
            Create. Enhance.
            <br />
            <span className="gradient-text">Transform.</span>
          </h1>
          <p>
            Experience the precision of <strong>Lightroom</strong>, the multi-layer depth of{" "}
            <strong>Photoshop</strong>, and the ease of <strong>Canva</strong>. Over <strong>150 photo editing
            features</strong>, a <strong>60-feature PDF Studio</strong>, and a <strong>100-feature Video Editor</strong> — 100% private, free, and client-side.
          </p>

          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={() => openEditor(PRESETS[0])}>
              <Zap size={18} /> Launch Photo Studio <ArrowRight size={18} />
            </button>
            <button className="button button-outline button-large" onClick={() => navigate("video")}>
              <Film size={18} /> Video Studio (100)
            </button>
            <button className="button button-quiet button-large feat-badge-btn" onClick={onOpenFeaturesModal}>
              <Layers size={16} /> 150 Photo Features
            </button>
          </div>

          <div className="hero-proof">
            <span><Check size={15} /> 100% Free Forever</span>
            <span><LockKeyhole size={15} /> Zero Cloud Uploads</span>
            <span><Cpu size={15} /> Local GPU & WebAssembly</span>
            <span><ShieldCheck size={15} /> No Sign-Up Required</span>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className="hero-visual">
          <div className="hero-ambient-glow" />
          <div className="hero-studio-card">
            <div className="studio-card-header">
              <div className="window-dots">
                <span className="w-dot red" />
                <span className="w-dot yellow" />
                <span className="w-dot green" />
              </div>
              <span className="studio-card-title">PhotoPro Master Studio • 4K UHD</span>
              <span className="studio-live-badge"><span className="pulse-mini" /> 60 FPS</span>
            </div>

            <div className="studio-card-preview">
              <div className="mock-canvas-art">
                <div className="mock-sun" />
                <div className="mock-mountain m-back" />
                <div className="mock-mountain m-front" />
                <div className="mock-badge-tag">🔥 150 PRO FEATURES</div>
                <div className="mock-headline">
                  PHOTOPRO<br />
                  <span>STUDIO PRO</span>
                </div>
              </div>
            </div>

            {/* Floating UI Elements */}
            <div className="floating-bubble bubble-tools">
              <div className="bubble-icon-wrap"><Sliders size={16} /></div>
              <div>
                <strong>Lightroom Tone Engine</strong>
                <small>Whites, Blacks, HSL Mixer & LUTs</small>
              </div>
            </div>

            <div className="floating-bubble bubble-export">
              <div className="bubble-icon-wrap check-red"><Check size={16} /></div>
              <div>
                <strong>Photoshop Layers & Blend</strong>
                <small>13 Blend modes • Lossless 4K Export</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DRAG & DROP BANNER */}
      <section
        className="upload-banner"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length) onUpload([...e.dataTransfer.files]);
        }}
      >
        <div className="upload-icon-pulse">
          <Upload size={22} />
        </div>
        <div className="upload-copy">
          <strong>Drag & drop any photo or design here</strong>
          <span>Supports PNG, JPG, WebP, SVG • Maximum file size 50 MB • Never touches external servers</span>
        </div>
        <div className="upload-cta-group">
          <button className="button button-outline" onClick={() => uploadInputRef.current?.click()}>
            Browse files <ArrowUpRight size={15} />
          </button>
          <button className="button button-quiet" onClick={handleDemoLaunch}>
            <Sparkles size={14} /> Try demo
          </button>
        </div>
        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            if (e.target.files.length) onUpload([...e.target.files]);
            e.target.value = "";
          }}
        />
      </section>

      {/* THREE BANNER HIGHLIGHT: 150 PHOTO + 60 PDF + 100 VIDEO */}
      <section className="features-dual-banners">
        <div className="features-highlight-banner">
          <div className="fh-content">
            <div>
              <span className="fh-tag">150 PHOTO FEATURES</span>
              <h2>Photoshop, Lightroom & Canva in One Place</h2>
              <p>Whites, Blacks, 3D LUTs, Dodge/Burn, selective HSL mixers, beauty retouching, and 4K exports.</p>
            </div>
            <button className="button button-primary" onClick={onOpenFeaturesModal}>
              <Sparkles size={16} /> 150 Features List
            </button>
          </div>
        </div>

        <div className="features-highlight-banner pdf-highlight-banner">
          <div className="fh-content">
            <div>
              <span className="fh-tag pdf-tag">60 PDF FEATURES</span>
              <h2>Professional PDF Studio & Maker</h2>
              <p>Merge, Split, E-Sign, Watermark, Convert Images to PDF, and make Invoices & Resumes.</p>
            </div>
            <button className="button button-primary pdf-btn" onClick={() => navigate("pdf")}>
              <Zap size={16} /> Launch PDF Studio (60)
            </button>
          </div>
        </div>

        <div className="features-highlight-banner video-highlight-banner">
          <div className="fh-content">
            <div>
              <span className="fh-tag video-tag">100 VIDEO FEATURES</span>
              <h2>Complete In-Browser Video Studio</h2>
              <p>Multi-track timeline, chroma key green screen, color wheels, audio mixing, speed curves, and 4K export.</p>
            </div>
            <button className="button button-primary video-btn" onClick={() => navigate("video")}>
              <Film size={16} /> Launch Video Studio (100)
            </button>
          </div>
        </div>
      </section>

      {/* PRO TOOLKIT GRID */}
      <section className="tools-section section-wrap">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> COMPLETE PRO SUITE
            </div>
            <h2>
              Designed for creators, <span className="gradient-text">built for performance.</span>
            </h2>
          </div>
          <p>Supercharged creative utilities running completely client-side for zero latency.</p>
        </div>

        <div className="tool-cards-grid">
          {TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <button
                className="pro-tool-card"
                key={tool.id}
                onClick={() => (tool.id === "editor" ? openEditor(PRESETS[0]) : navigate(tool.id))}
              >
                <div className="tool-card-top">
                  <span className={`tool-icon-wrapper tool-theme-${index % 6}`}>
                    <Icon size={22} />
                  </span>
                  <span className="tool-tag">{tool.tag}</span>
                </div>
                <div className="tool-card-body">
                  <h3>{tool.label}</h3>
                  <p>{tool.desc}</p>
                </div>
                <div className="tool-card-footer">
                  <span>Launch Tool</span>
                  <ArrowUpRight size={16} className="card-arrow" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SOCIAL MEDIA CREATOR HUB */}
      <section className="social-media-section section-wrap" id="social-media">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> SOCIAL MEDIA CREATOR HUB
            </div>
            <h2>
              Ready-made canvases with <span className="gradient-text">all official social logos.</span>
            </h2>
          </div>
          <p>1-Click instant templates for YouTube, Instagram, TikTok, X/Twitter, Facebook, LinkedIn, Pinterest & WhatsApp.</p>
        </div>

        <div className="social-platform-grid">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div
              key={platform.id}
              className="social-platform-card"
              style={{
                borderColor: platform.borderColor,
                background: `linear-gradient(180deg, ${platform.bgColor} 0%, rgba(17, 21, 28, 0.95) 45%)`,
              }}
            >
              <div className="platform-card-header">
                <div
                  className="platform-logo-box"
                  dangerouslySetInnerHTML={{ __html: platform.logoSvg }}
                />
                <div>
                  <h3 className="platform-name">{platform.name}</h3>
                  <span className="platform-tagline">{platform.tagline}</span>
                </div>
              </div>

              <div className="platform-presets-list">
                {platform.presets.map((p) => (
                  <button
                    key={p.name}
                    className="platform-preset-pill"
                    onClick={() => openEditor({ name: `${platform.name} ${p.name}`, width: p.width, height: p.height, category: platform.name, color: "#141820" })}
                  >
                    <span>{p.name}</span>
                    <small>{p.label}</small>
                  </button>
                ))}
              </div>

              <button
                className="button button-outline full-width social-launch-btn"
                onClick={() => openEditor({ name: `${platform.name} Canvas`, width: platform.presets[0].width, height: platform.presets[0].height, category: platform.name, color: "#141820" })}
              >
                Create For {platform.name} <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CANVAS SIZES / TEMPLATES */}
      <section className="templates-section section-wrap" id="templates">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> CANVASES & SOCIAL SIZES
            </div>
            <h2>
              Start with the <span className="gradient-text">ideal canvas.</span>
            </h2>
          </div>
          <button className="button button-outline" onClick={() => openEditor(PRESETS[0])}>
            Blank Canvas <ArrowRight size={16} />
          </button>
        </div>

        <div className="template-grid">
          {PRESETS.slice(0, 8).map((item, index) => {
            const platformKey = item.platform || item.name.toLowerCase();
            return (
              <button className="template-card" key={item.name} onClick={() => openEditor(item)}>
                <div className={`template-art preset-art-${index}`} style={{ backgroundColor: item.color }}>
                  {/* Glowing Official Brand Logo Graphic */}
                  <div className="template-art-brand-backdrop">
                    <SocialLogoIcon platform={platformKey} size={64} className="template-art-floating-logo" />
                  </div>
                  <div className="template-card-overlay">
                    <div className="template-card-badge-row">
                      <SocialLogoIcon platform={platformKey} size={18} />
                      <span className="overlay-category">{item.category}</span>
                    </div>
                    <strong className="overlay-title">{item.name}</strong>
                    <span className="overlay-dim">{item.width} × {item.height} px</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* PILLARS */}
      <section className="pillars-section section-wrap" id="about">
        <div className="pillar-card">
          <div className="pillar-icon"><LockKeyhole size={24} /></div>
          <h3>100% Private & Local</h3>
          <p>Your photos and videos never leave your device. All neural background removal, filters, and rendering run in your browser memory.</p>
        </div>
        <div className="pillar-card">
          <div className="pillar-icon"><Zap size={24} /></div>
          <h3>Lightroom & Photoshop Depth</h3>
          <p>Adjust exposure, whites, blacks, dehaze, selective HSL channels, import 3D LUTs, and apply Kuwahara oil painting or glitch shaders.</p>
        </div>
        <div className="pillar-card">
          <div className="pillar-icon"><Download size={24} /></div>
          <h3>Full Resolution 4K Export</h3>
          <p>Export in original quality, HD, Full HD, 2K, or 4K UHD with PNG transparency, WebP, or JPG compression.</p>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bottom-cta section-wrap">
        <div className="cta-box">
          <div className="eyebrow">
            <span className="eyebrow-line" /> START CREATING
          </div>
          <h2>
            Create. Enhance. <span className="gradient-text">Transform.</span>
          </h2>
          <p>Launch the studio right now without installing any software or signing up.</p>
          <div className="cta-actions">
            <button className="button button-primary button-large" onClick={() => openEditor(PRESETS[0])}>
              <Zap size={18} /> Launch Free Studio <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
