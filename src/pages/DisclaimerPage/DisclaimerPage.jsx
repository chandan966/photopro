import React from "react";
import {
  AlertTriangle,
  Cpu,
  ExternalLink,
  Info,
  Mail,
  ShieldAlert,
} from "lucide-react";
import "./DisclaimerPage.css";

const CONTACT_EMAIL = "contactchandan0101@gmail.com";

export default function DisclaimerPage() {
  return (
    <main className="disclaimer-page">
      {/* Header */}
      <section className="disclaimer-hero">
        <div className="disclaimer-hero-content">
          <div className="disclaimer-eyebrow">
            <span className="eyebrow-line" />
            TECHNICAL &amp; LEGAL NOTICE
          </div>
          <h1>Disclaimer</h1>
          <p className="disclaimer-meta">
            Effective Date: November 1, 2026 &bull; Last Revised: November 14, 2026
          </p>
        </div>
      </section>

      {/* Content Container */}
      <article className="disclaimer-container">
        <div className="disclaimer-alert-card">
          <AlertTriangle size={26} className="alert-icon" />
          <div>
            <strong>General Information &amp; Creative Utility Notice</strong>
            <p>
              PhotoPro provides free, client-side, browser-based creative tools. By using our website, you understand
              and agree to the technical and operational guidelines described below.
            </p>
          </div>
        </div>

        <section className="disclaimer-section">
          <h2>1. Client-Side Processing &amp; Hardware Limitations</h2>
          <p>
            All image editing, filtering, canvas rendering, layer compositing, and PDF manipulation on PhotoPro take place
            locally on your personal computer, tablet, or smartphone via your browser's execution engine (HTML5 Canvas 2D,
            WebGL, and WebAssembly).
          </p>
          <p>
            Consequently, performance, rendering speed, and maximum supported document dimensions (e.g. 4K rendering or
            handling 50+ simultaneous layers) are directly dependent upon your device's available hardware specifications
            (CPU processing power, GPU memory, and system RAM).
          </p>
          <div className="tech-tips-box">
            <Cpu size={20} className="tip-icon" />
            <div>
              <strong>Recommended Environment for Heavy Workflows:</strong>
              <p>
                For demanding multi-layer 4K image editing or complex PDF merging, we recommend using a modern 64-bit desktop
                browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari) with <strong>Hardware Acceleration</strong>{" "}
                enabled in browser settings.
              </p>
            </div>
          </div>
        </section>

        <section className="disclaimer-section">
          <h2>2. Data Loss &amp; Project Backup Notice</h2>
          <p>
            Because PhotoPro does not upload or retain your files on remote servers, your workspace state is maintained strictly
            in your browser's temporary volatile memory and local storage cache. If you refresh your browser, clear your cookies,
            or close your session without saving:
          </p>
          <ul>
            <li>Unsaved edits cannot be restored by PhotoPro developers or servers.</li>
            <li>
              We strongly advise all creators to regularly export their work and use the <strong>Save Project (.photopro)</strong>{" "}
              feature to maintain safe, portable local backups on their disk drive.
            </li>
          </ul>
        </section>

        <section className="disclaimer-section">
          <h2>3. Trademark &amp; Non-Affiliation Disclaimer</h2>
          <p>
            All product names, logos, brand trademarks, and registered trademarks mentioned on this website (including but not
            limited to <em>Photoshop&reg;</em>, <em>Lightroom&reg;</em>, and <em>Canva&reg;</em>) are the property of their respective
            holders.
          </p>
          <p>
            Reference to these software tools is made strictly for descriptive, educational, and functional comparison purposes to
            illustrate tool workflows familiar to creative professionals. PhotoPro is an independent, non-commercial web
            application and is <strong>not affiliated with, endorsed by, sponsored by, or associated with Adobe Inc., Canva Pty Ltd.,
            or any of their subsidiaries</strong>.
          </p>
        </section>

        <section className="disclaimer-section">
          <h2>4. External Links &amp; Third-Party Advertisements</h2>
          <p>
            PhotoPro may display third-party advertisements served by <strong>Google AdSense</strong> and may contain hyperlinks to
            external websites (such as the Google Ads Settings page or social media profiles).
          </p>
          <p>
            We have no control over the content, privacy policies, or practices of third-party websites and assume no
            responsibility or liability for any materials, services, or interactions conducted outside the PhotoPro domain.
          </p>
        </section>

        <section className="disclaimer-section">
          <h2>5. "As-Is" No-Warranty Provision</h2>
          <p>
            The software, features, tools, and documentation available on PhotoPro are provided strictly on an "AS IS" and "AS
            AVAILABLE" basis. PhotoPro makes no representations or warranties of any kind, express or implied, regarding the
            completeness, accuracy, reliability, suitability, or availability of the website or the information, products, or
            services contained herein.
          </p>
        </section>

        <section className="disclaimer-section">
          <h2>6. Contact Regarding Technical Concerns</h2>
          <p>
            If you encounter unexpected rendering behavior, performance anomalies, or browser compatibility bugs, please contact
            our development team directly:
          </p>
          <div className="disclaimer-contact-box">
            <Mail size={18} color="#0284c7" />
            <div>
              <strong>PhotoPro Technical Support &amp; Engineering</strong>
              <span>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></span>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
