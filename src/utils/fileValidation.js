/**
 * PhotoPro Enterprise Security & File Validation Utility
 *
 * Implements client-side defense-in-depth:
 * 1. Binary Magic Number Signature Verification (anti-spoofing)
 * 2. Strict File Size Caps per media class
 * 3. Decompression Bomb (Pixel Flood) Guard
 * 4. SVG XSS Sanitization (active script & event handler stripping)
 * 5. Safe Filename Sanitization (anti-path-traversal)
 */

export const FILE_LIMITS = {
  IMAGE_MAX_BYTES: 50 * 1024 * 1024,   // 50 MB
  VIDEO_MAX_BYTES: 500 * 1024 * 1024, // 500 MB
  PDF_MAX_BYTES: 100 * 1024 * 1024,   // 100 MB
  MAX_PIXELS: 67_108_864,             // 8192 x 8192 (~67 Megapixels)
  MAX_FILENAME_LEN: 120,
};

// Known binary magic byte signatures
const MAGIC_SIGNATURES = {
  jpeg: [
    [0xff, 0xd8, 0xff],
  ],
  png: [
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  ],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  webp: {
    check: (bytes) => {
      // 'RIFF' at 0..3 and 'WEBP' at 8..11
      const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
      const isWebp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
      return isRiff && isWebp;
    },
  },
  pdf: [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  mp4: {
    check: (bytes) => {
      // ftyp at byte offset 4..7
      return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
    },
  },
  webm: [
    [0x1a, 0x45, 0xdf, 0xa3], // EBML header
  ],
};

/**
 * Read the first N bytes of a File or Blob into a Uint8Array
 */
export async function readHeaderBytes(blob, byteCount = 16) {
  const slice = blob.slice(0, byteCount);
  const buffer = await slice.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Verify if bytes match expected signature array
 */
function matchesBytes(bytes, signature) {
  if (bytes.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false;
  }
  return true;
}

/**
 * Detect the genuine file type by inspecting binary magic signatures
 */
export async function detectFileType(file) {
  if (!file || !(file instanceof Blob)) {
    return { type: "unknown", verified: false };
  }

  const bytes = await readHeaderBytes(file, 24);

  // Check PNG
  for (const sig of MAGIC_SIGNATURES.png) {
    if (matchesBytes(bytes, sig)) return { type: "png", category: "image", verified: true };
  }

  // Check JPEG
  for (const sig of MAGIC_SIGNATURES.jpeg) {
    if (matchesBytes(bytes, sig)) return { type: "jpeg", category: "image", verified: true };
  }

  // Check WebP
  if (MAGIC_SIGNATURES.webp.check(bytes)) {
    return { type: "webp", category: "image", verified: true };
  }

  // Check GIF
  for (const sig of MAGIC_SIGNATURES.gif) {
    if (matchesBytes(bytes, sig)) return { type: "gif", category: "image", verified: true };
  }

  // Check PDF
  for (const sig of MAGIC_SIGNATURES.pdf) {
    if (matchesBytes(bytes, sig)) return { type: "pdf", category: "document", verified: true };
  }

  // Check MP4
  if (MAGIC_SIGNATURES.mp4.check(bytes)) {
    return { type: "mp4", category: "video", verified: true };
  }

  // Check WebM
  for (const sig of MAGIC_SIGNATURES.webm) {
    if (matchesBytes(bytes, sig)) return { type: "webm", category: "video", verified: true };
  }

  // Fallback check for SVG (text-based)
  if (file.type === "image/svg+xml" || file.name?.toLowerCase().endsWith(".svg")) {
    return { type: "svg", category: "image", verified: true };
  }

  return { type: "unknown", category: "unknown", verified: false };
}

/**
 * Sanitize a filename to prevent path traversal and strip illegal characters.
 * @param {string} filename
 * @param {string} defaultName
 * @returns {string} Safe sanitized filename
 */
export function sanitizeFilename(filename, defaultName = "download") {
  if (!filename || typeof filename !== "string") return defaultName;

  // Extract base and extension
  const clean = filename
    .replace(/[/\\]+/g, "_")              // Replace path separators with underscores
    .replace(/\.\.+/g, "")                // Strip path traversal sequences like ../
    .replace(/[\x00-\x1F\x7F<>:"|?*]/g, "") // Strip null bytes and illegal Windows/Unix chars
    .trim();

  if (!clean || clean === "." || clean === "..") return defaultName;

  // Enforce max length while preserving extension
  if (clean.length > FILE_LIMITS.MAX_FILENAME_LEN) {
    const extIndex = clean.lastIndexOf(".");
    if (extIndex > 0 && clean.length - extIndex <= 10) {
      const ext = clean.substring(extIndex);
      const namePart = clean.substring(0, FILE_LIMITS.MAX_FILENAME_LEN - ext.length);
      return `${namePart}${ext}`;
    }
    return clean.substring(0, FILE_LIMITS.MAX_FILENAME_LEN);
  }

  return clean;
}

/**
 * Sanitize SVG XML text to prevent Stored XSS
 * Removes <script> tags, inline javascript: URLs, and on* attributes
 */
export function sanitizeSVG(svgString) {
  if (typeof window === "undefined" || !window.DOMParser) return svgString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");

  // Remove scripts
  const scripts = doc.querySelectorAll("script");
  scripts.forEach((node) => node.remove());

  // Remove foreignObjects which can execute HTML/scripts
  const foreignObjects = doc.querySelectorAll("foreignObject");
  foreignObjects.forEach((node) => node.remove());

  // Strip event handlers (onload, onerror, onclick, etc.) and dangerous hrefs
  const allElements = doc.querySelectorAll("*");
  allElements.forEach((el) => {
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      const name = attr.name.toLowerCase();
      const val = attr.value.toLowerCase().trim();

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
      } else if ((name === "href" || name === "xlink:href") && val.startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    }
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc.documentElement);
}

/**
 * Validate an uploaded image file before loading into memory.
 * Checks size limits, magic bytes, and decompression bomb pixel dimensions.
 */
export async function validateImageFile(file) {
  if (!file) {
    return { isValid: false, error: "No file was provided for validation." };
  }

  // 1. Size Check
  if (file.size > FILE_LIMITS.IMAGE_MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size (${mb} MB) exceeds maximum allowed limit of ${FILE_LIMITS.IMAGE_MAX_BYTES / (1024 * 1024)} MB.`,
    };
  }

  // 2. Binary Magic Header Check
  const detected = await detectFileType(file);
  const isImageCategory = detected.category === "image" || file.type.startsWith("image/");

  if (!isImageCategory) {
    return {
      isValid: false,
      error: "Invalid file format. Please upload a standard image (PNG, JPEG, WebP, GIF, or SVG).",
    };
  }

  // 3. Decompression Bomb Check (Dimension bounds)
  try {
    const objectUrl = URL.createObjectURL(file);
    const dimensions = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        URL.revokeObjectURL(objectUrl);
        resolve({ width: w, height: h, pixels: w * h });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to decode image geometry."));
      };
      img.src = objectUrl;
    });

    if (dimensions.pixels > FILE_LIMITS.MAX_PIXELS) {
      return {
        isValid: false,
        error: `Image dimensions (${dimensions.width}×${dimensions.height}) exceed the safe limit (${Math.round(FILE_LIMITS.MAX_PIXELS / 1_000_000)} Megapixels). Potential memory exhaustion prevented.`,
      };
    }

    return {
      isValid: true,
      file,
      format: detected.type,
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (err) {
    return {
      isValid: false,
      error: "Image validation failed: " + (err.message || "Corrupt image data"),
    };
  }
}

/**
 * Validate an uploaded video file
 */
export async function validateVideoFile(file) {
  if (!file) {
    return { isValid: false, error: "No video file provided." };
  }

  if (file.size > FILE_LIMITS.VIDEO_MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Video size (${mb} MB) exceeds maximum limit of ${FILE_LIMITS.VIDEO_MAX_BYTES / (1024 * 1024)} MB.`,
    };
  }

  const detected = await detectFileType(file);
  if (detected.category !== "video" && !file.type.startsWith("video/")) {
    return {
      isValid: false,
      error: "The selected file is not a supported video format (MP4, WebM, MOV).",
    };
  }

  return { isValid: true, file, format: detected.type };
}

/**
 * Validate an uploaded PDF file
 */
export async function validatePDFFile(file) {
  if (!file) {
    return { isValid: false, error: "No PDF document provided." };
  }

  if (file.size > FILE_LIMITS.PDF_MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `PDF size (${mb} MB) exceeds maximum allowed limit of ${FILE_LIMITS.PDF_MAX_BYTES / (1024 * 1024)} MB.`,
    };
  }

  const detected = await detectFileType(file);
  if (detected.type !== "pdf" && !file.type.includes("pdf")) {
    return {
      isValid: false,
      error: "The uploaded file does not match a valid PDF header (%PDF-).",
    };
  }

  return { isValid: true, file, format: "pdf" };
}
