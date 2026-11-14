const BASE_URL = "https://photopro.vercel.app";

export const PAGE_SEO = {
  home: {
    title: "PhotoPro — Professional In-Browser Creative Studio",
    desc: "Create. Enhance. Transform. Professional browser-based creative platform combining Photoshop, Lightroom, Canva, and PDF Studio in one unified, 100% private workspace.",
    canonical: "/",
  },
  about: {
    title: "About Us — PhotoPro In-Browser Creative Studio",
    desc: "Learn about PhotoPro's mission to provide 100% client-side, privacy-focused, zero-AI photo editing and creative tools directly in the browser.",
    canonical: "/about",
  },
  contact: {
    title: "Contact Us — PhotoPro Creative Studio Support & Engineering",
    desc: "Get in touch with lead developer Chandan for technical support, feature requests, commercial inquiries, and creative tool feedback.",
    canonical: "/contact",
  },
  privacy: {
    title: "Privacy Policy — PhotoPro Data Protection & Google AdSense Policy",
    desc: "Official PhotoPro Privacy Policy detailing our 100% on-device client-side processing, zero server storage, Google AdSense cookie compliance, and GDPR/CCPA rights.",
    canonical: "/privacy-policy",
  },
  terms: {
    title: "Terms of Service — PhotoPro Creative Platform Licensing & Rights",
    desc: "Read the Terms of Service for PhotoPro. You retain 100% intellectual property ownership and commercial rights over all created and exported images.",
    canonical: "/terms",
  },
  disclaimer: {
    title: "Disclaimer & Technical Architecture — PhotoPro",
    desc: "Technical hardware requirements, client-side memory guidelines, and non-affiliation disclaimers for PhotoPro creative tools.",
    canonical: "/disclaimer",
  },
  editor: {
    title: "Photo Studio — Online Photo Editor with Layers & Curves | PhotoPro",
    desc: "Professional in-browser photo editing with non-destructive layers, curves, Lightroom-style color grading, blend modes, and export in 4K.",
    canonical: "/editor",
  },
  design: {
    title: "Design Studio — Social Media Graphics & Canva Alternative | PhotoPro",
    desc: "Create YouTube thumbnails, Instagram reels, posters, flyers, and banners with customizable vector templates and high-CTR typography.",
    canonical: "/design",
  },
  pdf: {
    title: "PDF Studio & E-Sign — In-Browser Document Toolkit | PhotoPro",
    desc: "Merge, split, compress, watermark, protect, and electronically sign PDF documents completely locally in your browser with zero file uploads.",
    canonical: "/pdf",
  },
  compressor: {
    title: "Smart Image Compressor — Lossless Online Image Optimizer | PhotoPro",
    desc: "Compress JPEG, PNG, and WebP images by up to 90% without visible quality loss, processed 100% locally on your machine.",
    canonical: "/compressor",
  },
  converter: {
    title: "Batch Image Converter — Convert PNG, JPG, WebP & TIFF | PhotoPro",
    desc: "Fast in-browser format conversion between PNG, JPEG, WebP, and TIFF. No upload limits, completely private and client-side.",
    canonical: "/converter",
  },
  resizer: {
    title: "Image Resizer — Exact Dimensions & Social Media Presets | PhotoPro",
    desc: "Resize images to custom width, height, aspect ratio locks, or standard YouTube, Instagram, and Facebook dimensions with zero quality degradation.",
    canonical: "/resizer",
  },
  "brand-kit": {
    title: "Brand Kit Manager — Color Palettes, Logos & Fonts | PhotoPro",
    desc: "Store and manage your brand colors, typography pairings, and logos locally in your browser to maintain visual consistency across all projects.",
    canonical: "/brand-kit",
  },
  background: {
    title: "Background Remover — Client-Side Cutout Tool | PhotoPro",
    desc: "Isolate subjects and remove backgrounds locally in your browser with transparent PNG download and manual brush refinement.",
    canonical: "/background",
  },
  enhancer: {
    title: "Image Enhancer — 4K Clarity & Contrast Optimization | PhotoPro",
    desc: "Enhance image clarity, sharpness, and dynamic range directly in your browser using optical sharpening and unsharp masking algorithms.",
    canonical: "/enhancer",
  },
  palette: {
    title: "Color Palette Extractor — Harmonic Palette Generator | PhotoPro",
    desc: "Extract 6-tone harmonic color palettes from any photo with hex codes and contrast ratios.",
    canonical: "/palette",
  },
  "404": {
    title: "404 Page Not Found — PhotoPro",
    desc: "The page or tool you are looking for does not exist. Explore Photo Studio, Design Studio, and PDF Studio.",
    canonical: "/404",
  },
};

export const ROUTE_MAP = {
  "/": "home",
  "/home": "home",
  "/about": "about",
  "/about-us": "about",
  "/contact": "contact",
  "/contact-us": "contact",
  "/privacy": "privacy",
  "/privacy-policy": "privacy",
  "/terms": "terms",
  "/terms-and-conditions": "terms",
  "/terms-of-service": "terms",
  "/disclaimer": "disclaimer",
  "/editor": "editor",
  "/design": "design",
  "/pdf": "pdf",
  "/compressor": "compressor",
  "/converter": "converter",
  "/resizer": "resizer",
  "/brand-kit": "brand-kit",
  "/background": "background",
  "/enhancer": "enhancer",
  "/palette": "palette",
  "/404": "404",
};

export function getPathForPage(pageId) {
  const item = PAGE_SEO[pageId];
  return item ? item.canonical : "/";
}

export function updatePageSEO(pageId) {
  const meta = PAGE_SEO[pageId] || PAGE_SEO["home"];

  // Update document title
  document.title = meta.title;

  // Update meta description
  let descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) {
    descMeta.setAttribute("content", meta.desc);
  }

  // Update Open Graph
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", meta.title);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute("content", meta.desc);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", `${BASE_URL}${meta.canonical}`);

  // Update Twitter
  let twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute("content", meta.title);

  let twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute("content", meta.desc);

  let twUrl = document.querySelector('meta[name="twitter:url"]');
  if (twUrl) twUrl.setAttribute("content", `${BASE_URL}${meta.canonical}`);

  // Update canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute("href", `${BASE_URL}${meta.canonical === "/" ? "/" : meta.canonical}`);
  }
}
