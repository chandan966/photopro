import React from "react";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Lock,
  Mail,
  Scale,
  Shield,
} from "lucide-react";
import "./TermsPage.css";

const CONTACT_EMAIL = "contactchandan0101@gmail.com";

export default function TermsPage() {
  return (
    <main className="terms-page">
      {/* Header */}
      <section className="terms-hero">
        <div className="terms-hero-content">
          <div className="terms-eyebrow">
            <span className="eyebrow-line" />
            TERMS OF USE &amp; USER AGREEMENT
          </div>
          <h1>Terms of Service</h1>
          <p className="terms-meta">
            Effective Date: November 1, 2026 &bull; Last Revised: November 14, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="terms-container">
        <div className="terms-highlight-card">
          <Scale size={26} className="card-icon" />
          <div>
            <strong>Summary: You Own 100% of Your Creations</strong>
            <p>
              PhotoPro provides free, in-browser creative tools. You retain full intellectual property ownership, copyright,
              and commercial rights over all images, designs, and documents you process or export on our platform.
            </p>
          </div>
        </div>

        <section className="terms-section">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using <strong>PhotoPro</strong> ("the Service", "the Platform", accessible at{" "}
            <code>https://photopro.vercel.app/</code>), you agree to be bound by these Terms of Service ("Terms").
            If you do not agree to these Terms, please do not use the Platform.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. License to Use the Service</h2>
          <p>
            We grant you a personal, worldwide, royalty-free, non-assignable, and non-exclusive license to use PhotoPro
            for both personal and commercial creative purposes directly within your web browser, subject to these Terms.
          </p>
          <ul>
            <li>No account registration, subscription fee, or sign-up is required to access our core editing features.</li>
            <li>You may export and commercially distribute any image, poster, thumbnail, or PDF created using our tools.</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>3. Intellectual Property Rights &amp; User Content</h2>
          <p>
            <strong>Your Content Remains Yours:</strong> PhotoPro does not claim any ownership, copyright, or licensing
            rights to the images, graphics, audio, or PDF documents you load, edit, or export. Because all rendering occurs
            locally in your browser sandbox, your files are never transmitted to our servers or used to train proprietary
            datasets.
          </p>
          <p>
            <strong>Platform IP:</strong> The PhotoPro brand name, logo, custom algorithms, user interface code, CSS design
            system, and website documentation are protected by applicable intellectual property and copyright laws.
          </p>
        </section>

        <section className="terms-section">
          <h2>4. Acceptable Use Policy</h2>
          <p>When using PhotoPro, you agree not to:</p>
          <ul>
            <li>Violate any local, state, national, or international law, regulation, or copyright statute.</li>
            <li>Use the service to process or distribute defamatory, unlawful, obscene, or infringing material.</li>
            <li>Attempt to probe, reverse-engineer, exploit, or disrupt our web application or client-side sandbox.</li>
            <li>Use automated scripts, scrapers, or bots in a manner that degrades service availability for other users.</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>5. Disclaimers &amp; "As-Is" Provision</h2>
          <p>
            PhotoPro is provided on an <strong>"AS IS"</strong> and <strong>"AS AVAILABLE"</strong> basis without warranties of
            any kind, whether express, implied, statutory, or otherwise, including but not limited to implied warranties of
            merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p>
            Because PhotoPro operates client-side using device hardware (CPU, GPU, and RAM), performance may vary depending on
            your machine specifications and browser configuration. We strongly recommend saving your work locally as{" "}
            <code>.photopro</code> project files frequently.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, in no event shall PhotoPro, its creator Chandan, or its affiliates
            be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue,
            data, or goodwill arising out of or related to your use of or inability to use the Platform.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Advertising &amp; Third-Party Services</h2>
          <p>
            PhotoPro displays advertising served by <strong>Google AdSense</strong>. Third-party advertisers may set cookies
            and serve ads in accordance with their respective privacy policies. Please review our{" "}
            <a href="/privacy-policy" className="terms-link">Privacy Policy</a> for full details on ad cookies and opt-out
            options.
          </p>
        </section>

        <section className="terms-section">
          <h2>8. Governing Law &amp; Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict
            of law provisions. Any dispute arising out of or relating to these Terms shall be subject to amicable mutual
            consultation and resolution.
          </p>
        </section>

        <section className="terms-section">
          <h2>9. Contact Information</h2>
          <p>
            For questions, legal notices, or feedback regarding these Terms of Service, please reach out directly:
          </p>
          <div className="terms-contact-card">
            <Mail size={18} color="#0284c7" />
            <div>
              <strong>Legal &amp; Engineering Inquiries</strong>
              <span>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></span>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
