import React from "react";
import {
  Aperture,
  ArrowRight,
  CheckCircle,
  Cpu,
  FileText,
  Heart,
  Layers,
  LockKeyhole,
  Mail,
  Palette,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import BrandLogo from "../../components/shared/BrandLogo/BrandLogo.jsx";
import "./AboutPage.css";

export default function AboutPage({ navigate, openEditor }) {
  return (
    <main className="about-page">
      {/* Hero Banner */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-eyebrow">
            <span className="eyebrow-line" />
            ABOUT PHOTOPRO CREATIVE STUDIO
          </div>
          <h1>
            Democratizing Professional Creative Tools{" "}
            <span className="gradient-text">Directly in Your Browser</span>
          </h1>
          <p className="about-hero-lead">
            PhotoPro was built on a bold premise: professional-grade photo editing, Canva-style graphic design,
            and comprehensive PDF manipulation should be 100% free, private, and accessible to anyone with a web browser
            — with zero software installations, zero account paywalls, and zero cloud uploads.
          </p>

          <div className="about-hero-stats">
            <div className="stat-card">
              <strong className="stat-number">150+</strong>
              <span className="stat-label">Photo Editing Features</span>
            </div>
            <div className="stat-card">
              <strong className="stat-number">60+</strong>
              <span className="stat-label">PDF Studio Tools</span>
            </div>
            <div className="stat-card">
              <strong className="stat-number">100%</strong>
              <span className="stat-label">Client-Side Private</span>
            </div>
            <div className="stat-card">
              <strong className="stat-number">0</strong>
              <span className="stat-label">Cloud Uploads Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="section-header-centered">
          <h2>Our Core Mission &amp; Philosophy</h2>
          <p>Why we engineered PhotoPro from the ground up without subscription paywalls.</p>
        </div>

        <div className="about-pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <LockKeyhole size={24} />
            </div>
            <h3>100% Client-Side Privacy</h3>
            <p>
              Unlike conventional photo editing websites that upload your personal photographs and confidential documents
              to remote cloud servers, PhotoPro processes every pixel directly on your machine. Using modern HTML5 Canvas 2D,
              WebGL acceleration, and WebAssembly, your media never leaves your device's memory.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Zap size={24} />
            </div>
            <h3>Zero AI Hype, Pure Engineering</h3>
            <p>
              We prioritize true, deterministic image-processing algorithms over unpredictable generative AI APIs.
              From cubic-spline curve adjustments and 8-channel HSL color balancing to Sobel edge detection and Lanczos
              resampling, PhotoPro gives you exact, repeatable mathematical precision.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <ShieldCheck size={24} />
            </div>
            <h3>No Accounts, No Friction</h3>
            <p>
              Creativity should never be gated behind credit cards, mandatory registrations, or subscription renewals.
              PhotoPro opens instantly in any modern web browser across Windows, macOS, Linux, ChromeOS, and mobile devices
              with zero barriers to entry.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Architecture Section */}
      <section className="about-section alt-bg">
        <div className="section-header-centered">
          <h2>The Technology Behind PhotoPro</h2>
          <p>Desktop-grade performance powered by modern browser standards.</p>
        </div>

        <div className="tech-stack-showcase">
          <div className="tech-item">
            <div className="tech-icon"><Cpu size={22} /></div>
            <div>
              <strong>HTML5 Canvas 2D &amp; WebGL 2.0</strong>
              <span>Hardware-accelerated pixel shaders for real-time adjustments, blend modes, and color grading at 60 FPS.</span>
            </div>
          </div>

          <div className="tech-item">
            <div className="tech-icon"><Layers size={22} /></div>
            <div>
              <strong>Multi-Layer Compositing Engine</strong>
              <span>Full Photoshop-grade layer stack with non-destructive opacity, visibility toggles, blend modes, and reordering.</span>
            </div>
          </div>

          <div className="tech-item">
            <div className="tech-icon"><FileText size={22} /></div>
            <div>
              <strong>WebAssembly (WASM) &amp; Web Workers</strong>
              <span>Heavy computation — including batch PDF compilation and lossy/lossless image compression — runs in background threads without freezing UI.</span>
            </div>
          </div>

          <div className="tech-item">
            <div className="tech-icon"><Palette size={22} /></div>
            <div>
              <strong>Local Persistence via IndexedDB</strong>
              <span>Save your full workspace state locally as portable <code>.photopro</code> project files and reopen them anytime on any computer.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Developer Section */}
      <section className="about-section">
        <div className="creator-profile-card">
          <div className="creator-avatar-wrap">
            <BrandLogo size={64} />
          </div>
          <div className="creator-details">
            <div className="creator-badge">CREATOR &amp; LEAD SOFTWARE ENGINEER</div>
            <h2>Built with Passion by Chandan</h2>
            <p>
              PhotoPro is designed, developed, and maintained by <strong>Chandan</strong>, a senior full-stack developer
              and digital artist dedicated to creating high-performance web applications that respect user autonomy and privacy.
            </p>
            <p>
              Frustrated by increasingly expensive creative software subscriptions and invasive cloud data practices, Chandan
              built PhotoPro to prove that the open web platform is capable of powering desktop-class creative suites without
              compromising user rights.
            </p>
            <div className="creator-contact-links">
              <a href="mailto:contactchandan0101@gmail.com" className="creator-link-pill">
                <Mail size={15} /> contactchandan0101@gmail.com
              </a>
              <span className="creator-link-pill static">
                <Heart size={14} color="#0ea5e9" /> 100% Free for Creators Everywhere
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <h2>Start Creating Today with PhotoPro</h2>
        <p>No downloads, no sign-ups, and no limits. Experience the power of client-side creative tools now.</p>
        <div className="about-cta-buttons">
          <button className="button button-primary button-large" onClick={() => openEditor?.()}>
            <Aperture size={18} /> Open Photo Studio <ArrowRight size={18} />
          </button>
          <button className="button button-outline button-large" onClick={() => navigate?.("contact")}>
            <Mail size={16} /> Contact Engineering
          </button>
        </div>
      </section>
    </main>
  );
}
