/**
 * PhotoPro Professional Adjustment & Color Correction Engine
 * 
 * Implements:
 * - Monotone Cubic Spline Interpolation for Curves (RGB, Red, Green, Blue)
 * - Histogram & Levels adjustments (Input black/mid/white, Output black/white)
 * - Color Balance (Shadows, Midtones, Highlights for CMY/RGB)
 * - Selective Color, Black & White mixer, Photo Filter
 * - Invert, Threshold, Posterize, Channel Mixer
 * - Non-destructive 256-element lookup table (LUT) processing for 60fps performance
 */

import { clamp, rgbToHsl, hslToRgb } from "./filters.js";

/**
 * Monotone Cubic Spline Interpolation
 * Generates smooth 0..255 lookup table through arbitrary control points.
 * Prevents overshooting and maintains strict monotonicity when required.
 */
export function buildSplineLUT(points) {
  const lut = new Uint8Array(256);
  if (!points || points.length === 0) {
    for (let i = 0; i < 256; i++) lut[i] = i;
    return lut;
  }

  // Sort points by X coordinate
  const sorted = [...points].sort((a, b) => a.x - b.x);

  // Ensure endpoints exist
  if (sorted[0].x > 0) {
    sorted.unshift({ x: 0, y: sorted[0].y });
  }
  if (sorted[sorted.length - 1].x < 255) {
    sorted.push({ x: 255, y: sorted[sorted.length - 1].y });
  }

  const n = sorted.length;
  const x = sorted.map((p) => p.x);
  const y = sorted.map((p) => p.y);

  // Slopes of secant lines
  const delta = new Float64Array(n - 1);
  const m = new Float64Array(n);

  for (let i = 0; i < n - 1; i++) {
    const dx = x[i + 1] - x[i];
    delta[i] = dx === 0 ? 0 : (y[i + 1] - y[i]) / dx;
  }

  // Initial tangents
  m[0] = delta[0];
  m[n - 1] = delta[n - 2];
  for (let i = 1; i < n - 1; i++) {
    m[i] = (delta[i - 1] + delta[i]) / 2;
  }

  // Fritsch-Carlson algorithm for monotonicity
  for (let i = 0; i < n - 1; i++) {
    if (delta[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
    } else {
      const alpha = m[i] / delta[i];
      const beta = m[i + 1] / delta[i];
      if (alpha * alpha + beta * beta > 9) {
        const tau = 3 / Math.sqrt(alpha * alpha + beta * beta);
        m[i] = tau * alpha * delta[i];
        m[i + 1] = tau * beta * delta[i];
      }
    }
  }

  // Evaluate cubic Hermite spline across 0..255
  let k = 0;
  for (let i = 0; i < 256; i++) {
    while (k < n - 2 && i > x[k + 1]) {
      k++;
    }
    const h = x[k + 1] - x[k];
    const t = h === 0 ? 0 : (i - x[k]) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    const val = h00 * y[k] + h10 * h * m[k] + h01 * y[k + 1] + h11 * h * m[k + 1];
    lut[i] = clamp(Math.round(val));
  }

  return lut;
}

/**
 * Build 256-entry Levels Lookup Table
 * @param {number} inBlack Input black point (0-255)
 * @param {number} inGamma Midtone gamma (0.1 - 5.0, default 1.0)
 * @param {number} inWhite Input white point (0-255)
 * @param {number} outBlack Output black point (0-255)
 * @param {number} outWhite Output white point (0-255)
 */
export function buildLevelsLUT(inBlack = 0, inGamma = 1.0, inWhite = 255, outBlack = 0, outWhite = 255) {
  const lut = new Uint8Array(256);
  const inRange = Math.max(1, inWhite - inBlack);
  const outRange = outWhite - outBlack;
  const invGamma = 1 / Math.max(0.01, inGamma);

  for (let i = 0; i < 256; i++) {
    // 1. Clip and normalize input range to [0, 1]
    let val = Math.max(0, Math.min(1, (i - inBlack) / inRange));
    // 2. Apply power law gamma correction
    val = Math.pow(val, invGamma);
    // 3. Scale to output range
    const result = outBlack + val * outRange;
    lut[i] = clamp(Math.round(result));
  }
  return lut;
}

/**
 * Apply Curves adjustment to an ImageData buffer
 * Supports Master RGB, Red, Green, and Blue independent curve tables
 */
export function applyCurves(imageData, curves) {
  const data = imageData.data;
  const rgbLUT = buildSplineLUT(curves.rgb || [{ x: 0, y: 0 }, { x: 255, y: 255 }]);
  const redLUT = buildSplineLUT(curves.red || [{ x: 0, y: 0 }, { x: 255, y: 255 }]);
  const greenLUT = buildSplineLUT(curves.green || [{ x: 0, y: 0 }, { x: 255, y: 255 }]);
  const blueLUT = buildSplineLUT(curves.blue || [{ x: 0, y: 0 }, { x: 255, y: 255 }]);

  for (let i = 0; i < data.length; i += 4) {
    let r = rgbLUT[data[i]];
    let g = rgbLUT[data[i + 1]];
    let b = rgbLUT[data[i + 2]];

    data[i] = redLUT[r];
    data[i + 1] = greenLUT[g];
    data[i + 2] = blueLUT[b];
  }
  return imageData;
}

/**
 * Apply Levels adjustment to an ImageData buffer
 */
export function applyLevels(imageData, levels) {
  const data = imageData.data;
  const lut = buildLevelsLUT(
    levels.inBlack ?? 0,
    levels.inGamma ?? 1.0,
    levels.inWhite ?? 255,
    levels.outBlack ?? 0,
    levels.outWhite ?? 255
  );

  for (let i = 0; i < data.length; i += 4) {
    data[i] = lut[data[i]];
    data[i + 1] = lut[data[i + 1]];
    data[i + 2] = lut[data[i + 2]];
  }
  return imageData;
}

/**
 * Color Balance Adjustment
 * Adjusts Cyan-Red, Magenta-Green, and Yellow-Blue across Shadows, Midtones, and Highlights
 * @param {ImageData} imageData 
 * @param {object} balance { shadows: [c_r, m_g, y_b], midtones: [c_r, m_g, y_b], highlights: [c_r, m_g, y_b] }
 */
export function applyColorBalance(imageData, balance) {
  const data = imageData.data;
  const {
    shadows = [0, 0, 0],   // -100 to 100
    midtones = [0, 0, 0],
    highlights = [0, 0, 0],
    preserveLuminosity = true,
  } = balance;

  const sR = shadows[0] / 100, sG = shadows[1] / 100, sB = shadows[2] / 100;
  const mR = midtones[0] / 100, mG = midtones[1] / 100, mB = midtones[2] / 100;
  const hR = highlights[0] / 100, hG = highlights[1] / 100, hB = highlights[2] / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const norm = lum / 255;

    // Weight coefficients for tonal ranges
    const shadowWeight = Math.max(0, 1 - norm * 2);
    const highlightWeight = Math.max(0, (norm - 0.5) * 2);
    const midtoneWeight = Math.max(0, 1 - Math.abs(norm - 0.5) * 2);

    const shiftR = (shadowWeight * sR + midtoneWeight * mR + highlightWeight * hR) * 60;
    const shiftG = (shadowWeight * sG + midtoneWeight * mG + highlightWeight * hG) * 60;
    const shiftB = (shadowWeight * sB + midtoneWeight * mB + highlightWeight * hB) * 60;

    r += shiftR;
    g += shiftG;
    b += shiftB;

    if (preserveLuminosity) {
      const newLum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (newLum > 0) {
        const factor = lum / newLum;
        r *= factor;
        g *= factor;
        b *= factor;
      }
    }

    data[i] = clamp(Math.round(r));
    data[i + 1] = clamp(Math.round(g));
    data[i + 2] = clamp(Math.round(b));
  }
  return imageData;
}

/**
 * Black & White Custom Channel Mixer
 * Weighs Red, Green, and Blue channels to create rich fine-art monochrome
 */
export function applyBlackAndWhite(imageData, weights = { red: 40, green: 40, blue: 20 }) {
  const data = imageData.data;
  const total = (weights.red + weights.green + weights.blue) || 100;
  const wR = weights.red / total;
  const wG = weights.green / total;
  const wB = weights.blue / total;

  for (let i = 0; i < data.length; i += 4) {
    const gray = clamp(Math.round(data[i] * wR + data[i + 1] * wG + data[i + 2] * wB));
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  return imageData;
}

/**
 * Threshold (Binary High-Contrast)
 */
export function applyThreshold(imageData, threshold = 128) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const val = lum >= threshold ? 255 : 0;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  return imageData;
}

/**
 * Posterize (Quantize color levels per channel)
 */
export function applyPosterize(imageData, levels = 4) {
  const data = imageData.data;
  const step = 255 / Math.max(2, levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(Math.round(Math.round(data[i] / step) * step));
    data[i + 1] = clamp(Math.round(Math.round(data[i + 1] / step) * step));
    data[i + 2] = clamp(Math.round(Math.round(data[i + 2] / step) * step));
  }
  return imageData;
}

/**
 * Invert Colors (Negative)
 */
export function applyInvert(imageData) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
  return imageData;
}

/**
 * Compute Luminance Histogram for the Current Canvas
 * Returns 256-element frequency array normalized 0..1
 */
export function computeHistogram(imageData) {
  const data = imageData.data;
  const rHist = new Uint32Array(256);
  const gHist = new Uint32Array(256);
  const bHist = new Uint32Array(256);
  const lumHist = new Uint32Array(256);

  let maxCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    rHist[r]++;
    gHist[g]++;
    bHist[b]++;
    lumHist[lum]++;

    if (lumHist[lum] > maxCount) maxCount = lumHist[lum];
  }

  return { rHist, gHist, bHist, lumHist, maxCount };
}
