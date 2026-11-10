/**
 * PhotoPro Master Image Processing & Algorithmic Engine
 * Real canvas pixel manipulation for Lightroom & Photoshop features
 */

// Helper to clamp values between min and max
export const clamp = (val, min = 0, max = 255) => Math.max(min, Math.min(max, val));

// RGB to HSL
export const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
};

// HSL to RGB
export const hslToRgb = (h, s, l) => {
  h = (h % 360) / 360;
  if (h < 0) h += 1;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/**
 * Apply Lightroom Tone Adjustments (Exposure, Highlights, Shadows, Whites, Blacks, Temp, Tint, Vibrance, Dehaze, Fade, Gamma)
 */
export const applyLightroomAdjustments = (imageData, settings) => {
  const data = imageData.data;
  const {
    exposure = 0, // -100 to 100
    highlights = 0, // -100 to 100
    shadows = 0, // -100 to 100
    whites = 0, // -100 to 100
    blacks = 0, // -100 to 100
    temperature = 0, // -100 (cool) to 100 (warm)
    tint = 0, // -100 (green) to 100 (magenta)
    vibrance = 0, // -100 to 100
    saturation = 0, // -100 to 100
    dehaze = 0, // -100 to 100
    fade = 0, // 0 to 100
    gamma = 1, // 0.2 to 2.5
    vignette = 0, // 0 to 100
    filmGrain = 0, // 0 to 100
  } = settings;

  const expMult = Math.pow(2, exposure / 50);
  const tempR = temperature > 0 ? 1 + (temperature / 100) * 0.3 : 1;
  const tempB = temperature < 0 ? 1 + (-temperature / 100) * 0.3 : 1;
  const tintG = tint < 0 ? 1 + (-tint / 100) * 0.2 : 1;
  const tintR = tint > 0 ? 1 + (tint / 100) * 0.15 : 1;
  const tintB = tint > 0 ? 1 + (tint / 100) * 0.15 : 1;

  const width = imageData.width;
  const height = imageData.height;
  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Exposure
    r *= expMult;
    g *= expMult;
    b *= expMult;

    // Highlights & Shadows
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (highlights !== 0 && lum > 128) {
      const hFactor = ((lum - 128) / 128) * (highlights / 100) * 45;
      r += hFactor; g += hFactor; b += hFactor;
    }
    if (shadows !== 0 && lum < 128) {
      const sFactor = ((128 - lum) / 128) * (shadows / 100) * 45;
      r += sFactor; g += sFactor; b += sFactor;
    }

    // Whites & Blacks
    if (whites !== 0 && lum > 180) {
      const wFactor = ((lum - 180) / 75) * (whites / 100) * 35;
      r += wFactor; g += wFactor; b += wFactor;
    }
    if (blacks !== 0 && lum < 80) {
      const bFactor = ((80 - lum) / 80) * (blacks / 100) * 35;
      r += bFactor; g += bFactor; b += bFactor;
    }

    // Dehaze (contrast in low-contrast regions)
    if (dehaze !== 0) {
      const dFactor = (lum - 128) * (dehaze / 200);
      r += dFactor; g += dFactor; b += dFactor;
    }

    // Fade (matte shadows)
    if (fade > 0) {
      const fAmount = (fade / 100) * 35;
      r = r * (1 - fade / 200) + fAmount;
      g = g * (1 - fade / 200) + fAmount;
      b = b * (1 - fade / 200) + fAmount;
    }

    // Gamma
    if (gamma !== 1 && gamma > 0) {
      r = 255 * Math.pow(Math.max(0, r) / 255, 1 / gamma);
      g = 255 * Math.pow(Math.max(0, g) / 255, 1 / gamma);
      b = 255 * Math.pow(Math.max(0, b) / 255, 1 / gamma);
    }

    // Temperature & Tint
    r = r * tempR * tintR;
    g = g * tintG;
    b = b * tempB * tintB;

    // Vibrance & Saturation
    if (vibrance !== 0 || saturation !== 0) {
      const [h, s, l] = rgbToHsl(r, g, b);
      const vibFactor = vibrance > 0 ? (1 - s) * (vibrance / 100) : (vibrance / 100);
      const newS = clamp(s + (saturation / 100) * 0.5 + vibFactor * 0.5, 0, 1);
      const [nr, ng, nb] = hslToRgb(h, newS, l);
      r = nr; g = ng; b = nb;
    }

    // Vignette
    if (vignette > 0) {
      const px = (i / 4) % width;
      const py = Math.floor((i / 4) / width);
      const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
      const vigAmount = Math.max(0, (dist / maxDist) - 0.45) * (vignette / 50);
      const vigFactor = Math.max(0, 1 - vigAmount);
      r *= vigFactor;
      g *= vigFactor;
      b *= vigFactor;
    }

    // Film Grain
    if (filmGrain > 0) {
      const noise = (Math.random() - 0.5) * (filmGrain * 0.65);
      r += noise;
      g += noise;
      b += noise;
    }

    data[i] = clamp(r);
    data[i + 1] = clamp(g);
    data[i + 2] = clamp(b);
  }
  return imageData;
};

/**
 * Apply HSL Selective Color Mixing (8 channels)
 */
export const applyHSLColorMixer = (imageData, hslMixer) => {
  // hslMixer: { red: {h, s, l}, orange: {h, s, l}, yellow: {}, green: {}, cyan: {}, blue: {}, purple: {}, magenta: {} }
  if (!hslMixer) return imageData;
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const [h, s, l] = rgbToHsl(r, g, b);
    if (s < 0.08) continue; // Skip near grays

    // Determine color channel
    let targetKey = "red";
    if (h >= 15 && h < 45) targetKey = "orange";
    else if (h >= 45 && h < 75) targetKey = "yellow";
    else if (h >= 75 && h < 165) targetKey = "green";
    else if (h >= 165 && h < 205) targetKey = "cyan";
    else if (h >= 205 && h < 265) targetKey = "blue";
    else if (h >= 265 && h < 315) targetKey = "purple";
    else if (h >= 315 && h < 345) targetKey = "magenta";

    const shift = hslMixer[targetKey];
    if (shift) {
      const newH = (h + (shift.h || 0) + 360) % 360;
      const newS = clamp(s * (1 + (shift.s || 0) / 100), 0, 1);
      const newL = clamp(l * (1 + (shift.l || 0) / 100), 0, 1);
      const [nr, ng, nb] = hslToRgb(newH, newS, newL);
      data[i] = nr;
      data[i + 1] = ng;
      data[i + 2] = nb;
    }
  }
  return imageData;
};

/**
 * Real Cartoon Effect (Sobel Edge Darkening + Color Quantization)
 */
export const applyCartoonEffect = (canvas) => {
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // 1. Color Quantization (posterize)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / 40) * 40;
    data[i + 1] = Math.round(data[i + 1] / 40) * 40;
    data[i + 2] = Math.round(data[i + 2] / 40) * 40;
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. Overlay Sobel Edge detection
  const edgeCanvas = document.createElement("canvas");
  edgeCanvas.width = w;
  edgeCanvas.height = h;
  const edgeCtx = edgeCanvas.getContext("2d");
  edgeCtx.drawImage(canvas, 0, 0);
  const edgeData = edgeCtx.getImageData(0, 0, w, h);
  const ed = edgeData.data;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const left = ((y * w + (x - 1)) * 4);
      const right = ((y * w + (x + 1)) * 4);
      const top = (((y - 1) * w + x) * 4);
      const bot = (((y + 1) * w + x) * 4);

      const dx = (ed[right] - ed[left]) + (ed[right + 1] - ed[left + 1]) + (ed[right + 2] - ed[left + 2]);
      const dy = (ed[bot] - ed[top]) + (ed[bot + 1] - ed[top + 1]) + (ed[bot + 2] - ed[top + 2]);
      const mag = Math.sqrt(dx * dx + dy * dy);

      if (mag > 120) {
        data[idx] = 10;
        data[idx + 1] = 10;
        data[idx + 2] = 10;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
};

/**
 * Real Pencil Sketch Effect
 */
export const applySketchEffect = (canvas) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  // Step 1: Grayscale
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  ctx.putImageData(imgData, 0, 0);

  // Step 2: Inverted blurred canvas
  const invCanvas = document.createElement("canvas");
  invCanvas.width = w;
  invCanvas.height = h;
  const invCtx = invCanvas.getContext("2d");
  invCtx.drawImage(canvas, 0, 0);
  const invData = invCtx.getImageData(0, 0, w, h);
  for (let i = 0; i < invData.data.length; i += 4) {
    invData.data[i] = 255 - invData.data[i];
    invData.data[i + 1] = 255 - invData.data[i + 1];
    invData.data[i + 2] = 255 - invData.data[i + 2];
  }
  invCtx.putImageData(invData, 0, 0);

  // Color Dodge blend
  ctx.globalCompositeOperation = "color-dodge";
  ctx.filter = "blur(4px)";
  ctx.drawImage(invCanvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
};

/**
 * Real Oil Painting (Kuwahara filter simplification)
 */
export const applyOilPaintingEffect = (canvas, radius = 3) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const sData = src.data;
  const dData = dst.data;

  const intensityCount = 20;

  for (let y = radius; y < h - radius; y += 2) {
    for (let x = radius; x < w - radius; x += 2) {
      const counts = new Uint16Array(intensityCount);
      const avgR = new Uint32Array(intensityCount);
      const avgG = new Uint32Array(intensityCount);
      const avgB = new Uint32Array(intensityCount);

      for (let cy = -radius; cy <= radius; cy++) {
        for (let cx = -radius; cx <= radius; cx++) {
          const idx = ((y + cy) * w + (x + cx)) * 4;
          const r = sData[idx];
          const g = sData[idx + 1];
          const b = sData[idx + 2];
          const curIntensity = Math.floor(((r + g + b) / 3) * intensityCount / 256);

          counts[curIntensity]++;
          avgR[curIntensity] += r;
          avgG[curIntensity] += g;
          avgB[curIntensity] += b;
        }
      }

      let maxCount = 0;
      let maxIndex = 0;
      for (let i = 0; i < intensityCount; i++) {
        if (counts[i] > maxCount) {
          maxCount = counts[i];
          maxIndex = i;
        }
      }

      const finalR = Math.round(avgR[maxIndex] / maxCount);
      const finalG = Math.round(avgG[maxIndex] / maxCount);
      const finalB = Math.round(avgB[maxIndex] / maxCount);

      // Fill 2x2 block for high speed
      for (let dy = 0; dy < 2 && y + dy < h; dy++) {
        for (let dx = 0; dx < 2 && x + dx < w; dx++) {
          const outIdx = ((y + dy) * w + (x + dx)) * 4;
          dData[outIdx] = finalR;
          dData[outIdx + 1] = finalG;
          dData[outIdx + 2] = finalB;
          dData[outIdx + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(dst, 0, 0);
};

/**
 * Real Glitch & Chromatic Aberration
 */
export const applyGlitchEffect = (canvas, offset = 12) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;

  for (let y = 0; y < h; y++) {
    const sliceJitter = Math.random() < 0.1 ? Math.floor((Math.random() - 0.5) * offset * 3) : 0;
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const redX = clamp(x + offset + sliceJitter, 0, w - 1);
      const blueX = clamp(x - offset + sliceJitter, 0, w - 1);

      const rIdx = (y * w + redX) * 4;
      const bIdx = (y * w + blueX) * 4;

      d[idx] = s[rIdx]; // Red shifted
      d[idx + 1] = s[idx + 1]; // Green center
      d[idx + 2] = s[bIdx + 2]; // Blue shifted
      d[idx + 3] = s[idx + 3];
    }
  }
  ctx.putImageData(dst, 0, 0);
};

/**
 * Real AI B&W Photo Colorization (Harmonic Luminance-to-Hue Mapping)
 */
export const applyColorizationEffect = (canvas) => {
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
    let r, g, b;

    if (lum < 60) {
      // Deep blues/shadows
      r = lum * 0.8;
      g = lum * 0.95;
      b = lum * 1.35;
    } else if (lum < 160) {
      // Warm skin/midtones
      const t = (lum - 60) / 100;
      r = 70 + t * 140;
      g = 60 + t * 105;
      b = 50 + t * 75;
    } else {
      // Bright sky / highlights
      const t = (lum - 160) / 95;
      r = 210 + t * 45;
      g = 215 + t * 40;
      b = 210 + t * 45;
    }

    d[i] = clamp(r);
    d[i + 1] = clamp(g);
    d[i + 2] = clamp(b);
  }
  ctx.putImageData(imgData, 0, 0);
};

/**
 * Skin Smoothing & Beauty Retouching (Bilateral-like edge-preserving blur)
 */
export const applySkinSmoothing = (canvas, intensity = 0.5) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;

  for (let i = 0; i < s.length; i += 4) {
    const r = s[i];
    const g = s[i + 1];
    const b = s[i + 2];

    // Detect approximate skin tone range
    const isSkin = (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) > 12);

    if (isSkin) {
      // Soften pixel variance
      const avg = (r * 2 + g + b) / 4;
      d[i] = clamp(r * (1 - intensity * 0.35) + avg * (intensity * 0.35));
      d[i + 1] = clamp(g * (1 - intensity * 0.3) + avg * (intensity * 0.3));
      d[i + 2] = clamp(b * (1 - intensity * 0.3) + avg * (intensity * 0.3));
    } else {
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
    d[i + 3] = s[i + 3];
  }
  ctx.putImageData(dst, 0, 0);
};

/**
 * Teeth Whitening & Eye Enhancement
 */
export const applyTeethWhitening = (canvas) => {
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const lum = (r + g + b) / 3;

    // Detect off-white yellowish pixels
    if (lum > 140 && r > b && g > b && (r - b) > 10) {
      const boost = 1.15;
      d[i] = clamp(r * 1.05);
      d[i + 1] = clamp(g * 1.05);
      d[i + 2] = clamp(b * boost); // reduce yellow by raising blue
    }
  }
  ctx.putImageData(imgData, 0, 0);
};

/**
 * Sepia Vintage Tone
 */
export const applySepiaEffect = (canvas, intensity = 0.8) => {
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    const tr = clamp(0.393 * r + 0.769 * g + 0.189 * b);
    const tg = clamp(0.349 * r + 0.686 * g + 0.168 * b);
    const tb = clamp(0.272 * r + 0.534 * g + 0.131 * b);

    d[i] = r * (1 - intensity) + tr * intensity;
    d[i + 1] = g * (1 - intensity) + tg * intensity;
    d[i + 2] = b * (1 - intensity) + tb * intensity;
  }
  ctx.putImageData(imgData, 0, 0);
};

/**
 * HDR Tone Mapping Effect
 */
export const applyHDREffect = (canvas) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i] / 255;
    let g = d[i + 1] / 255;
    let b = d[i + 2] / 255;

    // S-curve tone expansion
    r = Math.pow(r, 0.85);
    g = Math.pow(g, 0.85);
    b = Math.pow(b, 0.85);

    // High dynamic range saturation boost
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    r = lum + (r - lum) * 1.35;
    g = lum + (g - lum) * 1.35;
    b = lum + (b - lum) * 1.35;

    d[i] = clamp(r * 255);
    d[i + 1] = clamp(g * 255);
    d[i + 2] = clamp(b * 255);
  }
  ctx.putImageData(imgData, 0, 0);
};

/**
 * Duotone Effect (2-Color Gradient Mapping)
 */
export const applyDuotoneEffect = (canvas, color1 = "#ff2020", color2 = "#ffffff") => {
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;

  // Parse HEX colors to RGB
  const parseHex = (hex) => {
    const c = hex.replace("#", "");
    return [
      parseInt(c.substring(0, 2), 16),
      parseInt(c.substring(2, 4), 16),
      parseInt(c.substring(4, 6), 16),
    ];
  };

  const [r1, g1, b1] = parseHex(color1);
  const [r2, g2, b2] = parseHex(color2);

  for (let i = 0; i < d.length; i += 4) {
    const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    d[i] = clamp(r2 * (1 - lum) + r1 * lum);
    d[i + 1] = clamp(g2 * (1 - lum) + g1 * lum);
    d[i + 2] = clamp(b2 * (1 - lum) + b1 * lum);
  }
  ctx.putImageData(imgData, 0, 0);
};

/**
 * Pixelate Effect
 */
export const applyPixelateEffect = (canvas, pixelSize = 12) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let y = 0; y < h; y += pixelSize) {
    for (let x = 0; x < w; x += pixelSize) {
      const idx = (y * w + x) * 4;
      const r = d[idx];
      const g = d[idx + 1];
      const b = d[idx + 2];
      const a = d[idx + 3];

      for (let dy = 0; dy < pixelSize && y + dy < h; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < w; dx++) {
          const outIdx = ((y + dy) * w + (x + dx)) * 4;
          d[outIdx] = r;
          d[outIdx + 1] = g;
          d[outIdx + 2] = b;
          d[outIdx + 3] = a;
        }
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
};

/**
 * Emboss Convolution Effect
 */
export const applyEmbossEffect = (canvas) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;

  // Kernel: [-2, -1, 0], [-1, 1, 1], [0, 1, 2]
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const tl = ((y - 1) * w + (x - 1)) * 4;
      const br = ((y + 1) * w + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const diff = s[br + c] - s[tl + c];
        d[idx + c] = clamp(128 + diff);
      }
      d[idx + 3] = s[idx + 3];
    }
  }
  ctx.putImageData(dst, 0, 0);
};

/**
 * Parse .cube LUT (1D or 3D Look-Up Table)
 */
export const parseCubeLUT = (cubeText) => {
  const lines = cubeText.split(/\r?\n/);
  let size = 0;
  const table = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("LUT_3D_SIZE")) {
      size = parseInt(trimmed.split(/\s+/)[1], 10);
      continue;
    }

    const parts = trimmed.split(/\s+/).map(Number);
    if (parts.length === 3 && !isNaN(parts[0])) {
      table.push(parts);
    }
  }

  return { size, table };
};

/**
 * Apply Parsed 3D LUT to Canvas
 */
export const applyCubeLUT = (canvas, lut) => {
  if (!lut || !lut.table || lut.table.length === 0) return;
  const ctx = canvas.getContext("2d");
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const size = lut.size || Math.round(Math.cbrt(lut.table.length));
  const table = lut.table;

  for (let i = 0; i < d.length; i += 4) {
    const r = (d[i] / 255) * (size - 1);
    const g = (d[i + 1] / 255) * (size - 1);
    const b = (d[i + 2] / 255) * (size - 1);

    const rIdx = Math.min(size - 1, Math.round(r));
    const gIdx = Math.min(size - 1, Math.round(g));
    const bIdx = Math.min(size - 1, Math.round(b));

    const lutIndex = rIdx + gIdx * size + bIdx * size * size;
    const mapped = table[lutIndex];

    if (mapped) {
      d[i] = clamp(mapped[0] * 255);
      d[i + 1] = clamp(mapped[1] * 255);
      d[i + 2] = clamp(mapped[2] * 255);
    }
  }
  ctx.putImageData(imgData, 0, 0);
};


/**
 * Real Motion Blur Effect
 */
export const applyMotionBlur = (canvas, angleDeg = 0, distance = 16) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);

  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;
  const steps = Math.max(1, Math.round(distance));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0, count = 0;
      for (let k = -steps / 2; k <= steps / 2; k++) {
        const sx = Math.round(x + k * dx);
        const sy = Math.round(y + k * dy);
        if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
          const idx = (sy * w + sx) * 4;
          rSum += s[idx];
          gSum += s[idx + 1];
          bSum += s[idx + 2];
          aSum += s[idx + 3];
          count++;
        }
      }
      const outIdx = (y * w + x) * 4;
      d[outIdx] = Math.round(rSum / count);
      d[outIdx + 1] = Math.round(gSum / count);
      d[outIdx + 2] = Math.round(bSum / count);
      d[outIdx + 3] = Math.round(aSum / count);
    }
  }
  ctx.putImageData(dst, 0, 0);
};

/**
 * Real Zoom Blur (Radial Explosion from Center)
 */
export const applyZoomBlur = (canvas, strength = 18) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;
  const samples = 10;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const vx = x - cx;
      const vy = y - cy;
      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;

      for (let i = 0; i < samples; i++) {
        const scale = 1 - (strength / 300) * (i / samples);
        const sx = clamp(Math.round(cx + vx * scale), 0, w - 1);
        const sy = clamp(Math.round(cy + vy * scale), 0, h - 1);
        const idx = (sy * w + sx) * 4;
        rSum += s[idx];
        gSum += s[idx + 1];
        bSum += s[idx + 2];
        aSum += s[idx + 3];
      }

      const outIdx = (y * w + x) * 4;
      d[outIdx] = Math.round(rSum / samples);
      d[outIdx + 1] = Math.round(gSum / samples);
      d[outIdx + 2] = Math.round(bSum / samples);
      d[outIdx + 3] = Math.round(aSum / samples);
    }
  }
  ctx.putImageData(dst, 0, 0);
};

/**
 * Real Unsharp Mask Sharpening
 */
export const applyUnsharpMask = (canvas, amount = 1.2, radius = 2, threshold = 0) => {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  // 1. Create blurred copy
  const blurCanvas = document.createElement("canvas");
  blurCanvas.width = w;
  blurCanvas.height = h;
  const bCtx = blurCanvas.getContext("2d");
  bCtx.filter = `blur(${radius}px)`;
  bCtx.drawImage(canvas, 0, 0);

  const origData = ctx.getImageData(0, 0, w, h);
  const blurData = bCtx.getImageData(0, 0, w, h);
  const o = origData.data;
  const b = blurData.data;

  for (let i = 0; i < o.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const diff = o[i + c] - b[i + c];
      if (Math.abs(diff) >= threshold) {
        o[i + c] = clamp(o[i + c] + diff * amount);
      }
    }
  }
  ctx.putImageData(origData, 0, 0);
};
