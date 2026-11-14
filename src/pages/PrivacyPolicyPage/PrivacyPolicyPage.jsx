import React from "react";
import {
  Cookie,
  ExternalLink,
  Globe,
  LockKeyhole,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import "./PrivacyPolicyPage.css";

const CONTACT_EMAIL = "contactchandan0101@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <main className="policy-page">
      {/* Header */}
      <section className="policy-hero">
        <div className="policy-hero-content">
          <div className="policy-eyebrow">
            <span className="eyebrow-line" />
            TRANSPARENCY &amp; LEGAL COMPLIANCE
          </div>
          <h1>Privacy Policy</h1>
          <p className="policy-meta">
            Effective Date: November 1, 2026 &bull; Last Revised: November 14, 2026
          </p>
        </div>
      </section>

      {/* Main Content Body */}
      <article className="policy-container">
        <div className="policy-highlight-banner">
          <LockKeyhole size={28} className="banner-icon" />
          <div>
            <strong>100% On-Device Client-Side Processing Guarantee</strong>
            <p>
              PhotoPro does not upload, transmit, scan, inspect, or store your photos, graphic designs, or PDF documents
              on remote servers. All image modifications occur strictly within your device's browser memory (HTML5 Canvas 2D,
              WebGL, and WebAssembly).
            </p>
          </div>
        </div>

        <section className="policy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to <strong>PhotoPro</strong> ("we", "our", "us", or "the Platform"), accessible at{" "}
            <code>https://photopro.vercel.app/</code>. We are committed to protecting your privacy and upholding the highest
            standards of transparency regarding data collection, processing, and advertising.
          </p>
          <p>
            This Privacy Policy explains the types of information we may collect when you visit our website, how that data is
            utilized, our advertising practices under Google AdSense policies, and your legal rights under applicable privacy
            frameworks, including the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA).
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Files and Creative Assets: Zero Cloud Storage</h2>
          <p>
            Unlike traditional photo editors that operate cloud backends:
          </p>
          <ul>
            <li>
              <strong>No Server Uploads:</strong> When you open an image, apply a filter, layer text, or edit a PDF,
              the file is read exclusively into your local web browser sandbox using the browser’s standard <code>FileReader</code>{" "}
              and <code>Blob</code> APIs.
            </li>
            <li>
              <strong>No Telemetry on Creative Content:</strong> We do not log, retain, analyze, or fingerprint pixel data,
              embedded EXIF camera metadata, or exported documents.
            </li>
            <li>
              <strong>Full Intellectual Property Retention:</strong> You retain complete, unencumbered intellectual property
              ownership of all images and designs processed through PhotoPro.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>3. Google AdSense &amp; Third-Party Advertising Disclosures</h2>
          <p>
            PhotoPro may display advertisements served by <strong>Google AdSense</strong> (Publisher ID:{" "}
            <code>pub-6527373182140065</code>) and third-party ad networks to keep our creative tools 100% free for users
            worldwide. In compliance with Google Publisher Policies, we disclose the following:
          </p>
          <div className="adsense-compliance-card">
            <Cookie size={24} className="card-icon" />
            <div>
              <h3>Google Advertising Cookie Notice</h3>
              <ul>
                <li>
                  Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website
                  or other websites on the Internet.
                </li>
                <li>
                  Google's use of advertising cookies enables it and its partners to serve personalized ads to our users based
                  on their visit to PhotoPro and/or other websites.
                </li>
                <li>
                  Users may opt out of personalized advertising at any time by visiting the{" "}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="legal-link"
                  >
                    Google Ads Settings page <ExternalLink size={12} />
                  </a>.
                </li>
                <li>
                  Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting{" "}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="legal-link"
                  >
                    www.aboutads.info/choices <ExternalLink size={12} />
                  </a>.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="policy-section">
          <h2>4. Cookies, Local Storage &amp; Web Beacons</h2>
          <p>
            A cookie is a small data string stored on your device by your browser. PhotoPro distinguishes between technical
            storage and third-party advertising cookies:
          </p>
          <ul>
            <li>
              <strong>Local Storage &amp; IndexedDB (Essential):</strong> We use browser <code>LocalStorage</code> and{" "}
              <code>IndexedDB</code> solely to persist user workspace states locally (such as unsaved <code>.photopro</code> project
              drafts and custom Brand Kit palettes). This data resides entirely on your device and can be cleared via your
              browser settings.
            </li>
            <li>
              <strong>Third-Party Advertising Cookies:</strong> Google and authorized ad networks may place and read cookies on
              your browser, or use web beacons and IP addresses, to measure ad effectiveness and prevent fraud.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>5. Your Rights Under GDPR (European Union Users)</h2>
          <p>
            If you are a resident of the European Economic Area (EEA), you have specific data protection rights under the General
            Data Protection Regulation (GDPR):
          </p>
          <ul>
            <li><strong>Right of Access:</strong> You may inquire what personal data (if any) is held about you.</li>
            <li><strong>Right to Erasure:</strong> You can request deletion of any communication records.</li>
            <li><strong>Right to Object &amp; Restrict Processing:</strong> You have the right to object to tracking and personalized profiling.</li>
            <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent for cookie-based advertising via browser settings at any time.</li>
          </ul>
          <p>
            Because PhotoPro does not require account registration or store personal user accounts, we do not build user behavioral
            profiles.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. Your Rights Under CCPA &amp; CPRA (California Residents)</h2>
          <p>
            Under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
          </p>
          <ul>
            <li>
              <strong>We Do Not Sell Personal Information:</strong> PhotoPro has never sold, rented, or traded personal user data
              to third parties for monetary consideration, and will not do so.
            </li>
            <li>
              <strong>Right to Know &amp; Delete:</strong> California consumers have the right to request disclosure of personal
              information collected and request deletion.
            </li>
            <li>
              <strong>Non-Discrimination:</strong> We provide the same high-performance creative tools regardless of your privacy
              choices.
            </li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>7. Technical Security &amp; Data Sandboxing</h2>
          <p>
            PhotoPro implements robust, defense-in-depth technical safeguards:
          </p>
          <ul>
            <li><strong>Strict Content Security Policy (CSP):</strong> Prevents unauthorized script execution and cross-site scripting (XSS).</li>
            <li><strong>Encrypted Transport:</strong> Enforced HTTPS with TLS 1.3 encryption across all website assets.</li>
            <li><strong>Memory-Safe Runtimes:</strong> Canvas operations are isolated in JavaScript sandboxes without native binary execution risks.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>8. Children's Privacy (COPPA Compliance)</h2>
          <p>
            PhotoPro does not knowingly collect personal identifiable information from children under the age of 13.
            If a parent or guardian discovers that a child has contacted us with personal details, please notify us,
            and we will promptly delete the communication.
          </p>
        </section>

        <section className="policy-section">
          <h2>9. Contacting Our Data Privacy Officer</h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy or our compliance practices,
            please contact our developer directly:
          </p>
          <div className="contact-officer-box">
            <Mail size={18} color="#0284c7" />
            <div>
              <strong>Lead Software Engineer &amp; Data Privacy Inquiries</strong>
              <span>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></span>
              <span>Website: <a href="https://photopro.vercel.app/">https://photopro.vercel.app/</a></span>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
