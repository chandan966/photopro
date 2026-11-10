import "./SocialLogos.css";
export const OFFICIAL_LOGOS = {
  youtube: {
    name: "YouTube",
    color: "#ff0000",
    glowColor: "rgba(255, 0, 0, 0.45)",
    bgGradient: "linear-gradient(135deg, rgba(255, 0, 0, 0.25) 0%, rgba(180, 0, 0, 0.08) 100%)",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
      <defs>
        <linearGradient id="ytGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff1a1a"/>
          <stop offset="100%" stop-color="#cc0000"/>
        </linearGradient>
        <filter id="ytGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#ff0000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <rect x="3" y="9" width="42" height="30" rx="9" fill="url(#ytGrad)" filter="url(#ytGlow)"/>
      <polygon points="19,16 33,24 19,32" fill="#ffffff"/>
    </svg>`
  },

  instagram: {
    name: "Instagram",
    color: "#e1306c",
    glowColor: "rgba(225, 48, 108, 0.5)",
    bgGradient: "linear-gradient(135deg, rgba(225, 48, 108, 0.28) 0%, rgba(131, 58, 180, 0.12) 100%)",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
      <defs>
        <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fdf497"/>
          <stop offset="12%" stop-color="#fdf497"/>
          <stop offset="35%" stop-color="#fd5949"/>
          <stop offset="60%" stop-color="#d6249f"/>
          <stop offset="100%" stop-color="#285aeb"/>
        </linearGradient>
        <filter id="igGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#d6249f" flood-opacity="0.55"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#igGrad)" filter="url(#igGlow)"/>
      <rect x="11" y="11" width="26" height="26" rx="8" stroke="#ffffff" stroke-width="2.6" fill="none"/>
      <circle cx="24" cy="24" r="6.5" stroke="#ffffff" stroke-width="2.6" fill="none"/>
      <circle cx="31.2" cy="16.8" r="1.6" fill="#ffffff"/>
    </svg>`
  },

  pinterest: {
    name: "Pinterest",
    color: "#e60023",
    glowColor: "rgba(230, 0, 35, 0.5)",
    bgGradient: "linear-gradient(135deg, rgba(230, 0, 35, 0.25) 0%, rgba(160, 0, 20, 0.1) 100%)",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
      <defs>
        <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff1a38"/>
          <stop offset="100%" stop-color="#bd001b"/>
        </linearGradient>
        <filter id="pinGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#e60023" flood-opacity="0.5"/>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#pinGrad)" filter="url(#pinGlow)"/>
      <path d="M24.03 10C16.28 10 10 16.28 10 24.03c0 5.94 3.7 11.02 8.92 13.06-.12-1.11-.23-2.81.05-4.02.25-1.1 1.64-6.97 1.64-6.97s-.42-.84-.42-2.08c0-1.95 1.13-3.4 2.54-3.4 1.2 0 1.77.9 1.77 1.98 0 1.2-.77 3-1.16 4.67-.33 1.4.7 2.54 2.08 2.54 2.5 0 4.41-2.63 4.41-6.43 0-3.36-2.41-5.71-5.86-5.71-3.99 0-6.34 2.99-6.34 6.09 0 1.21.46 2.5 1.04 3.2.11.14.13.26.1.4-.11.44-.34 1.4-.39 1.61-.07.28-.22.34-.51.21-1.89-.88-3.07-3.64-3.07-5.86 0-4.77 3.47-9.16 10-9.16 5.25 0 9.34 3.74 9.34 8.75 0 5.22-3.29 9.42-7.86 9.42-1.53 0-2.98-.8-3.47-1.74l-.95 3.61c-.34 1.31-1.27 2.95-1.89 3.96 1.34.41 2.75.64 4.22.64 7.75 0 14.03-6.28 14.03-14.03C38.06 16.28 31.78 10 24.03 10z" fill="#ffffff"/>
    </svg>`
  },

  tiktok: {
    name: "TikTok",
    color: "#25f4ee",
    glowColor: "rgba(37, 244, 238, 0.45)",
    bgGradient: "linear-gradient(135deg, rgba(37, 244, 238, 0.2) 0%, rgba(254, 44, 85, 0.15) 100%)",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
      <defs>
        <filter id="ttGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#25f4ee" flood-opacity="0.4"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#ff2020" stroke="#fecdd3" stroke-width="1.5" filter="url(#ttGlow)"/>
      <!-- Cyan Shadow -->
      <path d="M29.5 13.8c1.3 1.5 3 2.4 5 2.6v4.3c-1.8-.1-3.6-.7-5.1-1.7v10.5c0 4.9-4 8.9-8.9 8.9-3.7 0-6.9-2.3-8.2-5.6 1.4.3 2.9.1 4.2-.6 2.3-1.2 3.8-3.6 3.8-6.2v-17h4.8c.1 1.7.9 3.4 2.2 4.6l2.2.2z" fill="#25f4ee" opacity="0.9"/>
      <!-- Red Shadow -->
      <path d="M28.3 12.6c1.3 1.5 3 2.4 5 2.6v4.3c-1.8-.1-3.6-.7-5.1-1.7v10.5c0 4.9-4 8.9-8.9 8.9-3.7 0-6.9-2.3-8.2-5.6 1.4.3 2.9.1 4.2-.6 2.3-1.2 3.8-3.6 3.8-6.2v-17h4.8c.1 1.7.9 3.4 2.2 4.6l2.2.2z" fill="#fe2c55" opacity="0.9"/>
      <!-- White Core -->
      <path d="M28.9 13.2c1.3 1.5 3 2.4 5 2.6v4.3c-1.8-.1-3.6-.7-5.1-1.7v10.5c0 4.9-4 8.9-8.9 8.9-3.7 0-6.9-2.3-8.2-5.6 1.4.3 2.9.1 4.2-.6 2.3-1.2 3.8-3.6 3.8-6.2v-17h4.8c.1 1.7.9 3.4 2.2 4.6l2.2.2z" fill="#ffffff"/>
    </svg>`
  },

  facebook: {
    name: "Facebook",
    color: "#1877f2",
    glowColor: "rgba(24, 119, 242, 0.45)",
    bgGradient: "linear-gradient(135deg, rgba(24, 119, 242, 0.25) 0%, rgba(10, 70, 180, 0.1) 100%)",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
      <defs>
        <linearGradient id="fbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1877f2"/>
          <stop offset="100%" stop-color="#0e5ec4"/>
        </linearGradient>
        <filter id="fbGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1877f2" flood-opacity="0.45"/>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#fbGrad)" filter="url(#fbGlow)"/>
      <path d="M28.2 24.8l.8-5.3h-5.1v-3.4c0-1.4.7-2.8 3-2.8h2.3V8.8s-2.1-.4-4.1-.4c-4.2 0-6.9 2.5-6.9 7.1v3.9H13.6v5.3h4.6V38c.9.1 1.9.2 2.9.2s2-.1 2.9-.2V24.8h4.2z" fill="#ffffff"/>
    </svg>`
  },

  twitter: {
    name: "X / Twitter",
    color: "#ffffff",
    glowColor: "rgba(255, 255, 255, 0.35)",
    bgGradient: "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(50, 60, 75, 0.1) 100%)",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
      <defs>
        <filter id="xGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#ffffff" flood-opacity="0.25"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12" fill="#0c0e14" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" filter="url(#xGlow)"/>
      <path d="M29.9 14h3.7l-8.1 9.3 9.5 12.7h-7.4l-5.8-7.7-6.7 7.7H11.4l8.7-9.9L11 14h7.6l5.3 7 6-7zm-1.3 19.8h2l-13-17.6h-2.2l13.2 17.6z" fill="#ffffff"/>
    </svg>`
  },

  linkedin: {
    name: "LinkedIn",
    color: "#0a66c2",
    glowColor: "rgba(10, 102, 194, 0.45)",
    bgGradient: "linear-gradient(135deg, rgba(10, 102, 194, 0.25) 0%, rgba(6, 60, 120, 0.1) 100%)",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
      <defs>
        <linearGradient id="liGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a66c2"/>
          <stop offset="100%" stop-color="#084e96"/>
        </linearGradient>
        <filter id="liGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0a66c2" flood-opacity="0.45"/>
        </filter>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="url(#liGrad)" filter="url(#liGlow)"/>
      <path d="M16 19.2h-4.3v13.6H16V19.2zm-2.2-6.8c-1.4 0-2.4 1-2.4 2.2 0 1.2 1 2.2 2.3 2.2 1.4 0 2.4-1 2.4-2.2 0-1.2-1-2.2-2.3-2.2zm19.4 12.5c0-4.3-2.3-6.3-5.3-6.3-2.5 0-3.6 1.4-4.2 2.3v-2h-4.3c.1 1.2 0 13.6 0 13.6h4.3v-7.6c0-.4 0-.8.1-1.1.3-.8 1.1-1.7 2.3-1.7 1.6 0 2.3 1.2 2.3 3v7.4h4.3v-7.6z" fill="#ffffff"/>
    </svg>`
  },

  whatsapp: {
    name: "WhatsApp",
    color: "#25d366",
    glowColor: "rgba(37, 211, 102, 0.45)",
    bgGradient: "linear-gradient(135deg, rgba(37, 211, 102, 0.25) 0%, rgba(18, 140, 65, 0.1) 100%)",
    svg: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="34" height="34">
      <defs>
        <linearGradient id="waGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2fe671"/>
          <stop offset="100%" stop-color="#1ea84f"/>
        </linearGradient>
        <filter id="waGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#25d366" flood-opacity="0.45"/>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#waGrad)" filter="url(#waGlow)"/>
      <path d="M29.8 26.6c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1.1 1-1.1 2.5 1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4zM24 34.5c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.8 1 1-3.7-.2-.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.5 4.5-10 10-10s10 4.5 10 10c0 5.5-4.5 10-10 10z" fill="#ffffff"/>
    </svg>`
  }
};

export function SocialLogoIcon({ platform, size = 32, className = "" }) {
  const normKey = String(platform || "").toLowerCase();
  let key = "instagram";
  if (normKey.includes("youtube") || normKey.includes("yt")) key = "youtube";
  else if (normKey.includes("insta")) key = "instagram";
  else if (normKey.includes("tiktok")) key = "tiktok";
  else if (normKey.includes("pinterest") || normKey.includes("pin")) key = "pinterest";
  else if (normKey.includes("facebook") || normKey.includes("fb")) key = "facebook";
  else if (normKey.includes("twitter") || normKey === "x" || normKey.includes("x /")) key = "twitter";
  else if (normKey.includes("linkedin")) key = "linkedin";
  else if (normKey.includes("whatsapp")) key = "whatsapp";

  const item = OFFICIAL_LOGOS[key] || OFFICIAL_LOGOS.instagram;

  return (
    <div
      className={`social-logo-icon-wrap ${className}`}
      style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      dangerouslySetInnerHTML={{ __html: item.svg }}
      title={item.name}
    />
  );
}

export default SocialLogoIcon;
