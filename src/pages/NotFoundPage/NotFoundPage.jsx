import React from "react";
import {
  Aperture,
  Compass,
  FileText,
  Home,
  Layout,
  Mail,
  Search,
} from "lucide-react";
import BrandLogo from "../../components/shared/BrandLogo/BrandLogo.jsx";
import "./NotFoundPage.css";

export default function NotFoundPage({ navigate, openEditor }) {
  return (
    <main className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-badge">
          <Compass size={14} />
          <span>ERROR 404 &bull; PAGE NOT FOUND</span>
        </div>

        <h1 className="not-found-title">404</h1>
        <h2>Oops! The page you're looking for cannot be found.</h2>
        <p className="not-found-desc">
          The link you followed may be broken, mistyped, or the creative tool might have been moved.
          Explore our primary studios below or return to the home dashboard.
        </p>

        <div className="not-found-actions">
          <button className="button button-primary button-large" onClick={() => navigate?.("home")}>
            <Home size={16} /> Return to Home Dashboard
          </button>
          <button className="button button-outline button-large" onClick={() => openEditor?.()}>
            <Aperture size={16} /> Open Photo Studio
          </button>
        </div>

        <div className="not-found-quicklinks-card">
          <h3>Quick Creative Destinations</h3>
          <div className="quicklinks-grid">
            <button className="quicklink-item" onClick={() => navigate?.("design")}>
              <Layout size={18} />
              <div>
                <strong>Design Studio</strong>
                <span>Canva-style social media templates</span>
              </div>
            </button>

            <button className="quicklink-item" onClick={() => navigate?.("pdf")}>
              <FileText size={18} />
              <div>
                <strong>PDF Studio &amp; E-Sign</strong>
                <span>Merge, split &amp; sign documents locally</span>
              </div>
            </button>

            <button className="quicklink-item" onClick={() => navigate?.("compressor")}>
              <Aperture size={18} />
              <div>
                <strong>Image Compressor</strong>
                <span>Lossless image size optimizer</span>
              </div>
            </button>

            <button className="quicklink-item" onClick={() => navigate?.("contact")}>
              <Mail size={18} />
              <div>
                <strong>Contact Support</strong>
                <span>Report broken links or get help</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
