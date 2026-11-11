import { useState } from "react";
import { Aperture, Instagram, LockKeyhole, Mail, X } from "lucide-react";
import { APP_CONFIG } from "../../../data/presets.js";
import BrandLogo from "../../shared/BrandLogo/BrandLogo.jsx";
import "./Footer.css";

const CONTACT_EMAIL = "contactchandan0101@gmail.com";
const MAILTO_LINK = `mailto:${CONTACT_EMAIL}?subject=PhotoPro%20Studio%20Inquiry%20%26%20Feedback&body=Hi%20Chandan,%0D%0A%0D%0AI%20am%20reaching%20out%20regarding%20PhotoPro...`;
const INSTAGRAM_URL = "https://www.instagram.com/trigger_toofan?vrfl=N3JjMTFrZjVwempj";

function Footer({ navigate, onOpenLegalModal }) {
  const [legal, setLegal] = useState("");

  const showTemplates = () => {
    navigate("home");
    window.setTimeout(() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  const showAbout = () => {
    navigate("home");
    window.setTimeout(() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  const legalText =
    legal === "Privacy policy"
      ? "PhotoPro processes all image files directly in your browser without uploading to external cloud servers. All tools run 100% locally on your device via HTML5 Canvas and WebAssembly. Zero user files are ever stored on our servers."
      : "PhotoPro is a professional browser-based creative suite provided as-is. You retain full 100% intellectual property ownership of your exported designs and photos.";

  return (
    <>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-block">
            <button className="footer-brand-btn" onClick={() => navigate("home")} aria-label="PhotoPro Home">
              <BrandLogo size={34} />
            </button>
            <p>
              Photoshop, Lightroom, Canva, &amp; PDF in one unified studio.
            </p>
            <div className="footer-brand-actions">
              <span className="footer-privacy">
                <LockKeyhole size={14} /> 100% Private &amp; Client-Side
              </span>
              {/* Prominent Contact Us Button */}
              <a
                href={MAILTO_LINK}
                className="footer-contact-cta"
                title={`Send direct email to ${CONTACT_EMAIL}`}
              >
                <Mail size={15} />
                <span>Contact Us</span>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div>
              <b>STUDIO</b>
              <button onClick={() => navigate("editor")}>Photo Studio (Photoshop)</button>
              <button onClick={() => navigate("design")}>Canva Design Studio</button>
              <button onClick={() => navigate("pdf")}>PDF Maker &amp; Studio (60)</button>
              <button onClick={() => navigate("background")}>AI Background Remover</button>
            </div>
            <div>
              <b>PRO TOOLS</b>
              <button onClick={() => navigate("compressor")}>Smart Compressor</button>
              <button onClick={() => navigate("converter")}>Format Converter</button>
              <button onClick={() => navigate("resizer")}>Image Resizer</button>
              <button onClick={() => navigate("brand-kit")}>Brand Kit Manager</button>
              <button onClick={() => navigate("enhancer")}>AI Image Enhancer (4K)</button>
              <button onClick={() => navigate("palette")}>Color Palette Extractor</button>
              <button onClick={showTemplates}>Canvas Templates</button>
            </div>
            <div>
              <b>TRUST &amp; COMPLIANCE</b>
              <button onClick={showAbout}>About Studio</button>
              <button onClick={() => onOpenLegalModal ? onOpenLegalModal("privacy") : setLegal("Privacy policy")}>Privacy Policy</button>
              <button onClick={() => onOpenLegalModal ? onOpenLegalModal("terms") : setLegal("Terms & conditions")}>Terms of Service</button>
              <button onClick={() => onOpenLegalModal && onOpenLegalModal("security")}>Security &amp; Sandboxing</button>
              <button onClick={() => onOpenLegalModal && onOpenLegalModal("faq")}>Help &amp; FAQ</button>
              <button onClick={() => onOpenLegalModal && onOpenLegalModal("contact")}>Contact &amp; Support</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} PhotoPro AI Studio. All rights reserved.</span>

          {/* Center Developer Instagram Link */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-developer-instagram"
            title="Follow webdevchandan on Instagram (@trigger_toofan)"
          >
            <span className="insta-icon-wrapper">
              <Instagram size={14} />
            </span>
            <span className="insta-name">webdevchandan</span>
          </a>

          <div className="footer-bottom-links">
            <span>Zero Server Uploads &bull; 100 Photo + 60 PDF</span>
          </div>
        </div>
      </footer>

      {legal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLegal("");
          }}
        >
          <section className="export-modal legal-modal" role="dialog" aria-modal="true">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  <span className="eyebrow-line" /> PHOTOPRO
                </span>
                <h2>{legal}</h2>
              </div>
              <button className="icon-btn" aria-label="Close" onClick={() => setLegal("")}>
                <X size={18} />
              </button>
            </div>
            <p className="small-note">{legalText}</p>
            <button className="button button-outline full-width" onClick={() => setLegal("")}>
              Close
            </button>
          </section>
        </div>
      )}
    </>
  );
}

export default Footer;
