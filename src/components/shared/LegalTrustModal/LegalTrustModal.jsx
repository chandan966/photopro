import React, { useState } from "react";
import {
  FileText,
  HelpCircle,
  LockKeyhole,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import "./LegalTrustModal.css";

const TABS = [
  { id: "privacy", label: "Privacy Policy", icon: LockKeyhole },
  { id: "terms", label: "Terms of Service", icon: FileText },
  { id: "cookies", label: "Cookie Policy", icon: Shield },
  { id: "security", label: "Security & Sandboxing", icon: ShieldCheck },
  { id: "disclaimer", label: "Disclaimer", icon: ShieldAlert },
  { id: "faq", label: "Help & FAQ", icon: HelpCircle },
  { id: "contact", label: "Contact Us", icon: Mail },
];

export default function LegalTrustModal({ initialTab = "privacy", onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div
      className="legal-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="legal-modal-dialog">
        {/* Left Nav Tabs */}
        <aside className="legal-sidebar">
          <div className="legal-sidebar-header">
            <ShieldCheck size={20} className="legal-shield-icon" />
            <span>Trust & Compliance</span>
          </div>

          <nav className="legal-tabs-list">
            {TABS.map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`legal-tab-item ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <IconComp size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="legal-content-main">
          <div className="legal-content-header">
            <h3>{TABS.find((t) => t.id === activeTab)?.label}</h3>
            <button className="legal-close-btn" onClick={onClose} aria-label="Close dialog">
              <X size={18} />
            </button>
          </div>

          <div className="legal-body-scroll">
            {activeTab === "privacy" && (
              <div className="legal-text-block">
                <h4>1. Client-Side Processing Architecture</h4>
                <p>
                  PhotoPro is engineered on a strict <strong>frontend-first privacy architecture</strong>.
                  All photo adjustments, Canvas 2D layer compositing, graphic design templates,
                  PDF operations, and file compressions are executed 100% locally on your machine using
                  HTML5 Canvas, Web Workers, and WebAssembly.
                </p>

                <h4>2. Zero Server Storage & Zero File Retention</h4>
                <p>
                  We do not operate backend ingestion pipelines or cloud storage databases that upload,
                  inspect, or store your photos or documents. Your files never leave your
                  device or local browser sandbox.
                </p>

                <h4>3. Local Storage & Data Persistence</h4>
                <p>
                  When you save projects locally (such as <code>.photopro</code> workspace states or
                  Brand Kit configurations), data is persisted exclusively in your browser’s
                  <code>LocalStorage</code> and <code>IndexedDB</code> caches. You can clear this data
                  at any time via your browser settings.
                </p>

                <h4>4. Third-Party CDN Resources</h4>
                <p>
                  Standard web font stylesheets (e.g. Google Fonts) and client-side vector libraries
                  are delivered over encrypted HTTPS CDNs. No user images or identifying creative metadata are
                  transmitted in connection with these resource requests.
                </p>

                <h4>5. Google AdSense & Third-Party Advertising</h4>
                <p>
                  We use Google AdSense and third-party advertising partners to display advertisements
                  when you visit PhotoPro. Google, as a third-party vendor, uses cookies to serve ads on
                  our site based on your prior visits to PhotoPro or other sites on the Internet:
                </p>
                <ul>
                  <li>
                    Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our sites and/or other sites on the Internet.
                  </li>
                  <li>
                    You may opt out of personalized advertising at any time by visiting the{" "}
                    <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "underline" }}>
                      Google Ads Settings page
                    </a>.
                  </li>
                  <li>
                    Alternatively, you can opt out of third-party vendors' use of cookies for personalized advertising by visiting{" "}
                    <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "underline" }}>
                      www.aboutads.info
                    </a>.
                  </li>
                </ul>

                <h4>6. GDPR & CCPA Compliance</h4>
                <p>
                  Under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA),
                  users have the right to request information about data collection and to opt out of personalized
                  cookie tracking. Because PhotoPro does not maintain accounts or collect personal identities, your
                  creative work is inherently protected from profiling.
                </p>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="legal-text-block">
                <h4>1. Intellectual Property Ownership</h4>
                <p>
                  You retain <strong>100% intellectual property ownership</strong> and copyright of all
                  artwork, graphics, PDFs, and documents created, imported, or exported
                  through PhotoPro. PhotoPro claims no proprietary rights or license over user creations.
                </p>

                <h4>2. Permitted Usage</h4>
                <p>
                  PhotoPro is provided free of charge for personal, commercial, and professional creative
                  workflows. You may use our export outputs for commercial advertising, social media
                  distribution, client deliverables, and print publications.
                </p>

                <h4>3. Software License</h4>
                <p>
                  PhotoPro is licensed as-is without express warranties of uninterrupted uptime or
                  lossless hardware encoding under extreme browser memory thresholds.
                </p>
              </div>
            )}

            {activeTab === "cookies" && (
              <div className="legal-text-block">
                <h4>1. What Cookies & Storage Do We Use?</h4>
                <p>
                  PhotoPro utilizes local storage and advertising cookies to operate the service:
                </p>
                <ul>
                  <li>
                    <strong>Essential Local Storage:</strong> <code>LocalStorage</code> and <code>IndexedDB</code> store
                    your recent project states, Brand Kit palettes, and workspace UI preferences locally on your device.
                  </li>
                  <li>
                    <strong>Session Storage:</strong> <code>SessionStorage</code> temporarily caches active canvas
                    state while navigating between studios.
                  </li>
                  <li>
                    <strong>Advertising Cookies (Google AdSense):</strong> Google and its advertising partners
                    may place and read cookies on your browser, or use web beacons, to collect non-personal device
                    information for ad serving, frequency capping, and fraud prevention.
                  </li>
                </ul>

                <h4>2. Managing Your Cookie Preferences</h4>
                <p>
                  You can configure your browser to refuse all cookies or notify you when a cookie is sent.
                  To manage or opt out of Google's advertising cookies, visit{" "}
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "underline" }}>
                    Google Ad Settings
                  </a>.
                </p>
              </div>
            )}

            {activeTab === "security" && (
              <div className="legal-text-block">
                <h4>1. Browser Sandboxing & Execution Isolation</h4>
                <p>
                  All graphic manipulations occur within the secure isolation boundary of your
                  browser's JavaScript virtual machine and WebAssembly runtime.
                </p>

                <h4>2. Strict MIME Type & Memory Protection</h4>
                <p>
                  File inputs undergo strict MIME type verification and dimensional boundary checking
                  to prevent buffer overruns or malicious payload execution. Uploaded SVG documents
                  and image metadata are sanitized against XSS injection before rasterization.
                </p>
              </div>
            )}

            {activeTab === "disclaimer" && (
              <div className="legal-text-block">
                <h4>1. Hardware & Memory Thresholds</h4>
                <p>
                  Because all processing takes place locally in your web browser, memory limits (RAM)
                  depend on your device hardware and operating system. For high-resolution 4K canvas
                  rendering or multi-layer RAW image compositing, we recommend modern desktop
                  browsers (Chrome, Edge, Firefox, Safari) with hardware acceleration enabled.
                </p>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="legal-text-block">
                <h4>Q: Is PhotoPro really free to use?</h4>
                <p>
                  A: Yes! All photo editing, graphic design templates, PDF creation, and compression
                  tools run locally in your browser with zero subscription fees or watermarks.
                </p>

                <h4>Q: How does PhotoPro export 4K images?</h4>
                <p>
                  A: Our rendering pipeline uses native Canvas 2D and WebGL contexts capable of
                  rasterizing at pixel-perfect multi-scale resolutions up to 3840×2160 pixels.
                </p>

                <h4>Q: Can I open .photopro project files on another computer?</h4>
                <p>
                  A: Yes! Use the <strong>Save Project (.photopro)</strong> button in the Photo Studio
                  menu to export a portable JSON file, and open it on any device via <strong>File → Open Project</strong>.
                </p>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="legal-text-block">
                <h4>Contact PhotoPro Engineering & Creator Support</h4>
                <p>
                  Have feedback, feature requests, or business inquiries? We would love to hear from you.
                </p>
                <div className="contact-info-cards">
                  <div className="contact-card">
                    <Mail size={16} color="#0284c7" />
                    <div>
                      <strong>Official Developer Email</strong>
                      <span>contactchandan0101@gmail.com</span>
                    </div>
                  </div>
                  <div className="contact-card">
                    <ShieldCheck size={16} color="#10b981" />
                    <div>
                      <strong>Lead Engineer</strong>
                      <span>Chandan (webdevchandan)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
