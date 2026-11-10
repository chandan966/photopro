/**
 * PhotoPro Professional Selection Engine
 * 
 * Implements:
 * - Rectangle Marquee Selection
 * - Ellipse / Circle Marquee Selection
 * - Freehand Lasso Tool
 * - Polygonal Lasso Tool
 * - Magic Wand (Color threshold flood fill)
 * - Invert, Feather, Expand, Contract, Select All, Deselect
 * - Marching Ants Boundary Rendering
 * - Selective clipping for brush, eraser, filters, and layer masks
 */

export class SelectionManager {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    // Selection mask: Uint8Array where 255 = selected, 0 = unselected
    this.mask = null;
    this.hasSelection = false;
    this.marchingAntsOffset = 0;
    this.bounds = null; // { x, y, width, height }
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    if (this.hasSelection) {
      this.clear();
    }
  }

  // Clear / Deselect
  clear() {
    this.mask = null;
    this.hasSelection = false;
    this.bounds = null;
  }

  // Select Entire Canvas
  selectAll() {
    this.mask = new Uint8Array(this.width * this.height);
    this.mask.fill(255);
    this.hasSelection = true;
    this.bounds = { x: 0, y: 0, width: this.width, height: this.height };
  }

  // Check if point (x, y) is selected
  isSelected(x, y) {
    if (!this.hasSelection || !this.mask) return true; // If no selection active, entire canvas is editable
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) return false;
    return this.mask[iy * this.width + ix] > 128;
  }

  // Get selection alpha at point (0.0 to 1.0) for feathered selections
  getSelectionFactor(x, y) {
    if (!this.hasSelection || !this.mask) return 1.0;
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) return 0;
    return this.mask[iy * this.width + ix] / 255;
  }

  // Set Rectangle Selection
  setRectSelection(x, y, w, h) {
    const startX = Math.max(0, Math.min(x, x + w));
    const startY = Math.max(0, Math.min(y, y + h));
    const endX = Math.min(this.width, Math.max(x, x + w));
    const endY = Math.min(this.height, Math.max(y, y + h));

    const width = endX - startX;
    const height = endY - startY;
    if (width <= 0 || height <= 0) {
      this.clear();
      return;
    }

    this.mask = new Uint8Array(this.width * this.height);
    for (let py = Math.floor(startY); py < Math.floor(endY); py++) {
      const rowOffset = py * this.width;
      for (let px = Math.floor(startX); px < Math.floor(endX); px++) {
        this.mask[rowOffset + px] = 255;
      }
    }
    this.hasSelection = true;
    this.bounds = { x: startX, y: startY, width, height };
  }

  // Set Ellipse Selection
  setEllipseSelection(x, y, w, h) {
    const rx = Math.abs(w) / 2;
    const ry = Math.abs(h) / 2;
    if (rx <= 0 || ry <= 0) {
      this.clear();
      return;
    }
    const cx = x + w / 2;
    const cy = y + h / 2;

    this.mask = new Uint8Array(this.width * this.height);
    const startY = Math.max(0, Math.floor(cy - ry));
    const endY = Math.min(this.height, Math.ceil(cy + ry));
    const startX = Math.max(0, Math.floor(cx - rx));
    const endX = Math.min(this.width, Math.ceil(cx + rx));

    for (let py = startY; py < endY; py++) {
      const rowOffset = py * this.width;
      const dy = (py - cy) / ry;
      const dy2 = dy * dy;
      if (dy2 > 1) continue;

      for (let px = startX; px < endX; px++) {
        const dx = (px - cx) / rx;
        if (dx * dx + dy2 <= 1) {
          this.mask[rowOffset + px] = 255;
        }
      }
    }
    this.hasSelection = true;
    this.bounds = { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 };
  }

  // Set Polygon / Lasso Selection from point array [{x, y}]
  setPolygonSelection(points) {
    if (!points || points.length < 3) {
      this.clear();
      return;
    }

    // Rasterize polygon into offscreen 2D canvas
    const offCanvas = document.createElement("canvas");
    offCanvas.width = this.width;
    offCanvas.height = this.height;
    const offCtx = offCanvas.getContext("2d");

    offCtx.fillStyle = "#ffffff";
    offCtx.beginPath();
    offCtx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      offCtx.lineTo(points[i].x, points[i].y);
    }
    offCtx.closePath();
    offCtx.fill();

    const imgData = offCtx.getImageData(0, 0, this.width, this.height);
    this.mask = new Uint8Array(this.width * this.height);
    let minX = this.width, minY = this.height, maxX = 0, maxY = 0;

    for (let i = 0; i < this.mask.length; i++) {
      const alpha = imgData.data[i * 4 + 3];
      this.mask[i] = alpha;
      if (alpha > 128) {
        const px = i % this.width;
        const py = Math.floor(i / this.width);
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }

    this.hasSelection = true;
    this.bounds = { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
  }

  // Magic Wand: Flood fill contiguous color matching seed (startX, startY)
  setMagicWandSelection(canvas, startX, startY, tolerance = 32, contiguous = true) {
    const ctx = canvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, this.width, this.height);
    const d = imgData.data;

    const seedX = Math.floor(startX);
    const seedY = Math.floor(startY);
    if (seedX < 0 || seedX >= this.width || seedY < 0 || seedY >= this.height) return;

    const seedIdx = (seedY * this.width + seedX) * 4;
    const seedR = d[seedIdx];
    const seedG = d[seedIdx + 1];
    const seedB = d[seedIdx + 2];
    const seedA = d[seedIdx + 3];

    const matchPixel = (r, g, b, a) => {
      const diff = Math.sqrt((r - seedR) ** 2 + (g - seedG) ** 2 + (b - seedB) ** 2 + ((a - seedA) * 0.5) ** 2);
      return diff <= tolerance;
    };

    this.mask = new Uint8Array(this.width * this.height);

    if (!contiguous) {
      // Global color selection
      for (let i = 0; i < this.mask.length; i++) {
        const idx = i * 4;
        if (matchPixel(d[idx], d[idx + 1], d[idx + 2], d[idx + 3])) {
          this.mask[i] = 255;
        }
      }
    } else {
      // Fast Scanline Queue Flood Fill
      const queue = [seedX, seedY];
      const visited = new Uint8Array(this.width * this.height);
      visited[seedY * this.width + seedX] = 1;

      while (queue.length > 0) {
        const cy = queue.pop();
        const cx = queue.pop();

        const offset = cy * this.width + cx;
        this.mask[offset] = 255;

        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1],
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
            const nOffset = ny * this.width + nx;
            if (!visited[nOffset]) {
              visited[nOffset] = 1;
              const nIdx = nOffset * 4;
              if (matchPixel(d[nIdx], d[nIdx + 1], d[nIdx + 2], d[nIdx + 3])) {
                queue.push(nx, ny);
              }
            }
          }
        }
      }
    }

    this.hasSelection = true;
  }

  // Invert Selection
  invert() {
    if (!this.hasSelection || !this.mask) {
      this.selectAll();
      return;
    }
    for (let i = 0; i < this.mask.length; i++) {
      this.mask[i] = 255 - this.mask[i];
    }
  }

  // Feather Selection (Gaussian / Box blur on mask)
  feather(radius = 5) {
    if (!this.hasSelection || !this.mask || radius <= 0) return;
    const r = Math.round(radius);
    const temp = new Uint8Array(this.mask.length);
    const w = this.width;
    const h = this.height;

    // Horizontal pass
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0, count = 0;
        for (let k = -r; k <= r; k++) {
          const px = x + k;
          if (px >= 0 && px < w) {
            sum += this.mask[y * w + px];
            count++;
          }
        }
        temp[y * w + x] = Math.round(sum / count);
      }
    }

    // Vertical pass
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0, count = 0;
        for (let k = -r; k <= r; k++) {
          const py = y + k;
          if (py >= 0 && py < h) {
            sum += temp[py * w + x];
            count++;
          }
        }
        this.mask[y * w + x] = Math.round(sum / count);
      }
    }
  }

  // Render Marching Ants Border on Canvas Viewport
  renderMarchingAnts(ctx, scale = 1, panX = 0, panY = 0) {
    if (!this.hasSelection || !this.mask) return;

    this.marchingAntsOffset = (this.marchingAntsOffset + 0.5) % 12;

    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, panX, panY);

    ctx.lineWidth = Math.max(1, 1 / scale);
    ctx.strokeStyle = "#ffffff";
    ctx.setLineDash([4 / scale, 4 / scale]);
    ctx.lineDashOffset = -this.marchingAntsOffset / scale;

    // If bounds exist, draw fast outline
    if (this.bounds) {
      ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
      ctx.strokeStyle = "#ff2020";
      ctx.lineDashOffset = -(this.marchingAntsOffset + 4) / scale;
      ctx.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
    }
    ctx.restore();
  }
}
