/**
 * PhotoPro Master Canvas Tools Engine
 * Real interactive tools: Brush, Eraser, Clone Stamp, Healing, Magic Wand, Overlays
 */

export class CanvasToolManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext("2d", { willReadFrequently: true });
    this.cloneSourcePoint = null;
    this.isDrawing = false;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext("2d", { willReadFrequently: true });
  }

  // Set clone stamp source anchor
  setCloneSource(x, y) {
    this.cloneSourcePoint = { x, y };
  }

  // Paint with Clone Stamp
  paintClone(destX, destY, brushSize = 25) {
    if (!this.cloneSourcePoint || !this.ctx) return;
    const offsetX = destX - this.cloneSourcePoint.x;
    const offsetY = destY - this.cloneSourcePoint.y;

    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = this.canvas.width;
    sourceCanvas.height = this.canvas.height;
    const sCtx = sourceCanvas.getContext("2d");
    sCtx.drawImage(this.canvas, 0, 0);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(destX, destY, brushSize / 2, 0, Math.PI * 2);
    this.ctx.clip();
    this.ctx.drawImage(sourceCanvas, offsetX, offsetY);
    this.ctx.restore();
  }

  // Healing Brush (Spot Inpaint / Blemish Removal)
  healSpot(x, y, radius = 18) {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const startX = Math.max(0, Math.round(x - radius));
    const startY = Math.max(0, Math.round(y - radius));
    const size = Math.round(radius * 2);

    const imgData = this.ctx.getImageData(startX, startY, size, size);
    const d = imgData.data;

    // Collect surround boundary pixels
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const dist = Math.sqrt((px - radius) ** 2 + (py - radius) ** 2);
        if (dist >= radius - 2 && dist <= radius) {
          const idx = (py * size + px) * 4;
          rSum += d[idx];
          gSum += d[idx + 1];
          bSum += d[idx + 2];
          count++;
        }
      }
    }

    if (count > 0) {
      const avgR = rSum / count;
      const avgG = gSum / count;
      const avgB = bSum / count;

      for (let py = 0; py < size; py++) {
        for (let px = 0; px < size; px++) {
          const dist = Math.sqrt((px - radius) ** 2 + (py - radius) ** 2);
          if (dist < radius) {
            const idx = (py * size + px) * 4;
            const factor = 1 - (dist / radius) ** 2; // soft center feather
            d[idx] = Math.round(d[idx] * (1 - factor) + avgR * factor);
            d[idx + 1] = Math.round(d[idx + 1] * (1 - factor) + avgG * factor);
            d[idx + 2] = Math.round(d[idx + 2] * (1 - factor) + avgB * factor);
          }
        }
      }
      this.ctx.putImageData(imgData, startX, startY);
    }
  }

  // Draw Brush Stroke
  drawBrushStroke(fromX, fromY, toX, toY, color = "#0ea5e9", size = 12, opacity = 1) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.globalAlpha = opacity;
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
    this.ctx.restore();
  }

  // Eraser Stroke (destination-out)
  eraseStroke(fromX, fromY, toX, toY, size = 20) {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.lineWidth = size;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();
    this.ctx.restore();
  }

  // Render Lens Flare Overlay
  renderLensFlare(x, y, radius = 120, color = "#38bdf8") {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalCompositeOperation = "screen";

    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.2, color);
    grad.addColorStop(0.6, "rgba(244, 63, 94, 0.2)");
    grad.addColorStop(1, "transparent");

    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Secondary lens flare circles
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const dx = cx - x;
    const dy = cy - y;

    const flare2X = cx + dx * 0.4;
    const flare2Y = cy + dy * 0.4;
    const grad2 = this.ctx.createRadialGradient(flare2X, flare2Y, 0, flare2X, flare2Y, radius * 0.4);
    grad2.addColorStop(0, "rgba(251, 113, 133, 0.7)");
    grad2.addColorStop(1, "transparent");
    this.ctx.fillStyle = grad2;
    this.ctx.beginPath();
    this.ctx.arc(flare2X, flare2Y, radius * 0.4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // Render Vintage Light Leak Overlay
  renderLightLeak(type = "crimson-sun") {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.globalCompositeOperation = "screen";

    const w = this.canvas.width;
    const h = this.canvas.height;
    const grad = this.ctx.createLinearGradient(0, 0, w * 0.6, h);
    grad.addColorStop(0, "rgba(244, 63, 94, 0.65)");
    grad.addColorStop(0.35, "rgba(251, 146, 60, 0.4)");
    grad.addColorStop(0.7, "rgba(253, 224, 71, 0.15)");
    grad.addColorStop(1, "transparent");

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.restore();
  }

  // Dodge Tool (Lighten pixels under brush)
  dodge(x, y, radius = 25, exposure = 0.25) {
    if (!this.ctx) return;
    const startX = Math.max(0, Math.round(x - radius));
    const startY = Math.max(0, Math.round(y - radius));
    const size = Math.round(radius * 2);

    const imgData = this.ctx.getImageData(startX, startY, size, size);
    const d = imgData.data;

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const dist = Math.sqrt((px - radius) ** 2 + (py - radius) ** 2);
        if (dist <= radius) {
          const factor = (1 - dist / radius) * exposure;
          const idx = (py * size + px) * 4;
          d[idx] = Math.min(255, d[idx] + 255 * factor);
          d[idx + 1] = Math.min(255, d[idx + 1] + 255 * factor);
          d[idx + 2] = Math.min(255, d[idx + 2] + 255 * factor);
        }
      }
    }
    this.ctx.putImageData(imgData, startX, startY);
  }

  // Burn Tool (Darken pixels under brush)
  burn(x, y, radius = 25, exposure = 0.25) {
    if (!this.ctx) return;
    const startX = Math.max(0, Math.round(x - radius));
    const startY = Math.max(0, Math.round(y - radius));
    const size = Math.round(radius * 2);

    const imgData = this.ctx.getImageData(startX, startY, size, size);
    const d = imgData.data;

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const dist = Math.sqrt((px - radius) ** 2 + (py - radius) ** 2);
        if (dist <= radius) {
          const factor = 1 - (1 - dist / radius) * exposure;
          const idx = (py * size + px) * 4;
          d[idx] = Math.max(0, d[idx] * factor);
          d[idx + 1] = Math.max(0, d[idx + 1] * factor);
          d[idx + 2] = Math.max(0, d[idx + 2] * factor);
        }
      }
    }
    this.ctx.putImageData(imgData, startX, startY);
  }

  // Sponge Tool (Saturate or Desaturate)
  sponge(x, y, radius = 25, desaturate = true, intensity = 0.3) {
    if (!this.ctx) return;
    const startX = Math.max(0, Math.round(x - radius));
    const startY = Math.max(0, Math.round(y - radius));
    const size = Math.round(radius * 2);

    const imgData = this.ctx.getImageData(startX, startY, size, size);
    const d = imgData.data;

    for (let py = 0; py < size; py++) {
      for (let px = 0; px < size; px++) {
        const dist = Math.sqrt((px - radius) ** 2 + (py - radius) ** 2);
        if (dist <= radius) {
          const idx = (py * size + px) * 4;
          const gray = 0.299 * d[idx] + 0.587 * d[idx + 1] + 0.114 * d[idx + 2];
          const factor = (1 - dist / radius) * intensity;

          if (desaturate) {
            d[idx] = d[idx] * (1 - factor) + gray * factor;
            d[idx + 1] = d[idx + 1] * (1 - factor) + gray * factor;
            d[idx + 2] = d[idx + 2] * (1 - factor) + gray * factor;
          } else {
            d[idx] = Math.max(0, Math.min(255, d[idx] + (d[idx] - gray) * factor));
            d[idx + 1] = Math.max(0, Math.min(255, d[idx + 1] + (d[idx + 1] - gray) * factor));
            d[idx + 2] = Math.max(0, Math.min(255, d[idx + 2] + (d[idx + 2] - gray) * factor));
          }
        }
      }
    }
    this.ctx.putImageData(imgData, startX, startY);
  }

  // Eyedropper Pixel Sampler
  sampleColor(x, y) {
    if (!this.ctx) return null;
    const p = this.ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
    const r = p[0], g = p[1], b = p[2], a = p[3] / 255;
    const toHex = (n) => n.toString(16).padStart(2, "0");
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return { r, g, b, a, hex };
  }
}
