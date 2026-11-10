/**
 * PhotoPro Professional Brush Engine
 * 
 * Supports:
 * - Round soft/hard brush strokes with linear interpolation (no gaps on fast strokes)
 * - Size, Hardness (radial gradient falloff), Opacity, Flow
 * - Painting on Image layers, Transparent layers, or Layer Masks
 * - Eraser with alpha transparency preservation
 * - Dodge tool (Highlights, Midtones, Shadows)
 * - Burn tool (Darken tones)
 * - Sponge tool (Desaturate / Saturate)
 * - Selection clipping (only modifies pixels inside active selection mask)
 */

export class BrushEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext("2d", { willReadFrequently: true });
    this.lastX = null;
    this.lastY = null;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext("2d", { willReadFrequently: true });
  }

  reset() {
    this.lastX = null;
    this.lastY = null;
  }

  /**
   * Paint a continuous stroke from (fromX, fromY) to (toX, toY)
   * Interpolates points according to spacing to ensure smooth strokes
   */
  paintStroke(fromX, fromY, toX, toY, options = {}, selectionManager = null) {
    if (!this.ctx) return;
    const {
      size = 20,
      hardness = 0.5, // 0 = soft airbrush, 1 = razor hard round
      color = "#e11d48",
      opacity = 1.0,
      flow = 1.0,
      isEraser = false,
      isMaskPainting = false, // When painting on layer mask (white=reveal, black=hide)
    } = options;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const spacing = Math.max(1, size * 0.15); // 15% spacing step
    const steps = Math.max(1, Math.ceil(distance / spacing));

    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 1 : i / steps;
      const px = fromX + dx * t;
      const py = fromY + dy * t;

      // Selection clipping check
      if (selectionManager && !selectionManager.isSelected(px, py)) {
        continue;
      }

      this.paintDab(px, py, size, hardness, color, opacity * flow, isEraser, isMaskPainting);
    }

    this.lastX = toX;
    this.lastY = toY;
  }

  /**
   * Single radial dab stamp
   */
  paintDab(x, y, size, hardness, color, alpha, isEraser, isMaskPainting) {
    const ctx = this.ctx;
    const radius = size / 2;

    ctx.save();
    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    if (hardness >= 0.95) {
      // Hard round brush
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Soft feathered brush using radial gradient
      const grad = ctx.createRadialGradient(x, y, radius * hardness, x, y, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Dodge tool: Lighten pixels under stroke
   */
  dodgeStroke(fromX, fromY, toX, toY, size = 30, exposure = 0.2, range = "midtones", selectionManager = null) {
    if (!this.ctx) return;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(dist / (size * 0.25)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = fromX + dx * t;
      const py = fromY + dy * t;
      if (selectionManager && !selectionManager.isSelected(px, py)) continue;
      this.applyTonalAdjust(px, py, size / 2, exposure, "dodge", range);
    }
  }

  /**
   * Burn tool: Darken pixels under stroke
   */
  burnStroke(fromX, fromY, toX, toY, size = 30, exposure = 0.2, range = "midtones", selectionManager = null) {
    if (!this.ctx) return;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(dist / (size * 0.25)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = fromX + dx * t;
      const py = fromY + dy * t;
      if (selectionManager && !selectionManager.isSelected(px, py)) continue;
      this.applyTonalAdjust(px, py, size / 2, exposure, "burn", range);
    }
  }

  /**
   * Sponge tool: Desaturate or Saturate pixels under stroke
   */
  spongeStroke(fromX, fromY, toX, toY, size = 30, intensity = 0.25, desaturate = true, selectionManager = null) {
    if (!this.ctx) return;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.ceil(dist / (size * 0.25)));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = fromX + dx * t;
      const py = fromY + dy * t;
      if (selectionManager && !selectionManager.isSelected(px, py)) continue;
      this.applySponge(px, py, size / 2, intensity, desaturate);
    }
  }

  applyTonalAdjust(cx, cy, radius, factor, mode = "dodge", range = "midtones") {
    const ctx = this.ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const sx = Math.max(0, Math.floor(cx - radius));
    const sy = Math.max(0, Math.floor(cy - radius));
    const sw = Math.min(w - sx, Math.ceil(radius * 2));
    const sh = Math.min(h - sy, Math.ceil(radius * 2));
    if (sw <= 0 || sh <= 0) return;

    const imgData = ctx.getImageData(sx, sy, sw, sh);
    const d = imgData.data;

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const dist = Math.sqrt((sx + x - cx) ** 2 + (sy + y - cy) ** 2);
        if (dist > radius) continue;

        const idx = (y * sw + x) * 4;
        const r = d[idx];
        const g = d[idx + 1];
        const b = d[idx + 2];
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Tonal range weighting
        let weight = 1;
        if (range === "shadows") weight = Math.max(0, 1 - lum * 2);
        else if (range === "highlights") weight = Math.max(0, (lum - 0.5) * 2);
        else weight = 1 - Math.abs(lum - 0.5) * 2; // midtones

        const falloff = (1 - dist / radius) * factor * weight;

        if (mode === "dodge") {
          d[idx] = Math.min(255, r + (255 - r) * falloff);
          d[idx + 1] = Math.min(255, g + (255 - g) * falloff);
          d[idx + 2] = Math.min(255, b + (255 - b) * falloff);
        } else {
          d[idx] = Math.max(0, r - r * falloff);
          d[idx + 1] = Math.max(0, g - g * falloff);
          d[idx + 2] = Math.max(0, b - b * falloff);
        }
      }
    }
    ctx.putImageData(imgData, sx, sy);
  }

  applySponge(cx, cy, radius, intensity, desaturate) {
    const ctx = this.ctx;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const sx = Math.max(0, Math.floor(cx - radius));
    const sy = Math.max(0, Math.floor(cy - radius));
    const sw = Math.min(w - sx, Math.ceil(radius * 2));
    const sh = Math.min(h - sy, Math.ceil(radius * 2));
    if (sw <= 0 || sh <= 0) return;

    const imgData = ctx.getImageData(sx, sy, sw, sh);
    const d = imgData.data;

    for (let y = 0; y < sh; y++) {
      for (let x = 0; x < sw; x++) {
        const dist = Math.sqrt((sx + x - cx) ** 2 + (sy + y - cy) ** 2);
        if (dist > radius) continue;

        const idx = (y * sw + x) * 4;
        const r = d[idx];
        const g = d[idx + 1];
        const b = d[idx + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const falloff = (1 - dist / radius) * intensity;

        if (desaturate) {
          d[idx] = r * (1 - falloff) + gray * falloff;
          d[idx + 1] = g * (1 - falloff) + gray * falloff;
          d[idx + 2] = b * (1 - falloff) + gray * falloff;
        } else {
          d[idx] = Math.max(0, Math.min(255, r + (r - gray) * falloff));
          d[idx + 1] = Math.max(0, Math.min(255, g + (g - gray) * falloff));
          d[idx + 2] = Math.max(0, Math.min(255, b + (b - gray) * falloff));
        }
      }
    }
    ctx.putImageData(imgData, sx, sy);
  }
}
