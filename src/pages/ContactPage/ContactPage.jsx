import React, { useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  HelpCircle,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import "./ContactPage.css";

const CONTACT_EMAIL = "contactchandan0101@gmail.com";

export default function ContactPage({ notify }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Please enter your name.";
    if (!formData.email.trim()) {
      errs.email = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.subject.trim()) errs.subject = "Please enter a subject.";
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = "Please enter a detailed message (at least 10 characters).";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build mailto fallback link for seamless zero-backend transmission
    const mailtoSubject = encodeURIComponent(`[PhotoPro ${formData.category.toUpperCase()}] ${formData.subject}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCategory: ${formData.category}\n\nMessage:\n${formData.message}`
    );
    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`;

    setSubmitted(true);
    notify?.("Your message draft has been prepared! Opening your mail client...");

    // Trigger user mail client
    window.location.href = mailtoUrl;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    notify?.("Copied developer email to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <main className="contact-page">
      {/* Header Banner */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <div className="contact-eyebrow">
            <span className="eyebrow-line" />
            DIRECT CREATOR &amp; ENGINEERING SUPPORT
          </div>
          <h1>Get in Touch with PhotoPro</h1>
          <p className="contact-hero-lead">
            Have feedback, questions about our client-side canvas engine, a feature request, or a technical inquiry?
            We read every inquiry and typically respond within 24 to 48 business hours.
          </p>
        </div>
      </section>

      {/* Main Grid: Form + Info Cards */}
      <section className="contact-main-section">
        <div className="contact-layout-grid">
          {/* Left Column: Interactive Form */}
          <div className="contact-form-card">
            <h2>Send a Direct Message</h2>
            <p className="form-subtext">
              Fill out the details below to contact lead engineer Chandan directly.
            </p>

            {submitted ? (
              <div className="contact-success-box">
                <CheckCircle2 size={44} className="success-icon" />
                <h3>Thank You for Reaching Out!</h3>
                <p>
                  Your message has been formatted. If your email application did not launch automatically,
                  you can send your note directly to:
                </p>
                <div className="email-display-pill" onClick={handleCopyEmail}>
                  <span>{CONTACT_EMAIL}</span>
                  <Copy size={14} />
                </div>
                <button
                  className="button button-outline"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", category: "general", subject: "", message: "" });
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-actual-form" noValidate>
                <div className="form-row-duo">
                  <div className="form-field">
                    <label htmlFor="name">Your Name <span className="req">*</span></label>
                    <input
                      id="name"
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? "error" : ""}
                    />
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>

                  <div className="form-field">
                    <label htmlFor="email">Your Email Address <span className="req">*</span></label>
                    <input
                      id="email"
                      type="email"
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="category">Inquiry Topic</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="general">General Feedback &amp; Questions</option>
                    <option value="feature">Feature Request or Tool Suggestion</option>
                    <option value="bug">Bug Report &amp; Technical Support</option>
                    <option value="privacy">Privacy, GDPR &amp; Cookie Inquiries</option>
                    <option value="business">Commercial &amp; Partnership Inquiries</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="subject">Subject <span className="req">*</span></label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="Brief summary of your note"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={errors.subject ? "error" : ""}
                  />
                  {errors.subject && <span className="field-error">{errors.subject}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="message">Detailed Message <span className="req">*</span></label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Describe your inquiry, browser version, or suggestion..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={errors.message ? "error" : ""}
                  />
                  {errors.message && <span className="field-error">{errors.message}</span>}
                </div>

                <button type="submit" className="button button-primary submit-btn">
                  <Send size={16} /> Send Message to Developer
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Channels & FAQ */}
          <div className="contact-sidebar-info">
            <div className="info-card primary-channel">
              <div className="info-header">
                <div className="info-icon"><Mail size={20} /></div>
                <div>
                  <strong>Official Developer Email</strong>
                  <span>Direct inbox access</span>
                </div>
              </div>
              <p className="info-desc">
                For prompt replies, you can email lead developer Chandan directly from your preferred email client.
              </p>
              <div className="email-copy-bar">
                <code>{CONTACT_EMAIL}</code>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopyEmail}
                  title="Copy email to clipboard"
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="info-card">
              <div className="info-header">
                <div className="info-icon"><ShieldCheck size={20} /></div>
                <div>
                  <strong>Privacy &amp; Security Note</strong>
                  <span>Your communications are protected</span>
                </div>
              </div>
              <p className="info-desc">
                We never share your email address with third-party marketing brokers or advertising networks.
                Inquiries are used solely to assist you with your creative workflow.
              </p>
            </div>

            <div className="info-card">
              <div className="info-header">
                <div className="info-icon"><HelpCircle size={20} /></div>
                <div>
                  <strong>Quick Assistance Guidelines</strong>
                  <span>Speeding up technical resolutions</span>
                </div>
              </div>
              <ul className="info-list">
                <li>Mention your operating system (Windows, macOS, Linux, Android, iOS).</li>
                <li>Include your browser and version (Chrome 120+, Safari 17+, Firefox, Edge).</li>
                <li>For canvas performance notes, specify your screen resolution (1080p, 4K, retina).</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
