export const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be opened by your browser."));
    image.src = source;
  });

export const canvasBlob = (canvas, type = "image/png", quality = 0.92) =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error(`Your browser could not export this image as ${type}.`));
    }, type, quality);
  });

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const renderImage = (image, width, height, options = {}) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  if (options.background) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(image, 0, 0, width, height);
  if (options.sharpen) {
    const frame = context.getImageData(0, 0, width, height);
    const src = new Uint8ClampedArray(frame.data);
    const strength = options.sharpen;
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const i = (y * width + x) * 4;
        for (let c = 0; c < 3; c += 1) {
          const value =
            src[i + c] * (1 + 4 * strength) -
            strength *
              (src[i - 4 + c] +
                src[i + 4 + c] +
                src[i - width * 4 + c] +
                src[i + width * 4 + c]);
          frame.data[i + c] = Math.max(0, Math.min(255, value));
        }
      }
    }
    context.putImageData(frame, 0, 0);
  }
  return canvas;
};

/**
 * Extracts a harmonic color palette from an image using canvas sampling.
 */
export const extractPalette = (imageElement, colorCount = 6) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const sampleSize = 64;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(imageElement, 0, 0, sampleSize, sampleSize);

  const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  const colorBuckets = {};

  for (let i = 0; i < imgData.length; i += 16) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];
    if (a < 128) continue; // skip transparent

    // Quantize down to 32 steps per channel
    const qr = Math.round(r / 32) * 32;
    const qg = Math.round(g / 32) * 32;
    const qb = Math.round(b / 32) * 32;
    const key = `${qr},${qg},${qb}`;

    colorBuckets[key] = (colorBuckets[key] || 0) + 1;
  }

  const sorted = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, colorCount * 2);

  const rgbToHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((x) => Math.min(255, Math.max(0, x)).toString(16).padStart(2, "0"))
      .join("");

  const selected = [];
  for (const [key] of sorted) {
    const [r, g, b] = key.split(",").map(Number);
    const hex = rgbToHex(r, g, b);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const isDark = brightness < 128;

    // Check minimum Euclidean distance against already selected colors
    const isDistinct = selected.every((s) => {
      const [sr, sg, sb] = s.rgb;
      const dist = Math.sqrt((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2);
      return dist > 45;
    });

    if (isDistinct || selected.length === 0) {
      selected.push({
        hex,
        rgb: [r, g, b],
        rgbString: `rgb(${r}, ${g}, ${b})`,
        isDark,
      });
    }
    if (selected.length >= colorCount) break;
  }

  // Fallbacks if image is monochromatic
  if (selected.length === 0) {
    selected.push({ hex: "#22c55e", rgb: [34, 197, 94], rgbString: "rgb(34, 197, 94)", isDark: false });
  }
  return selected;
};

/**
 * Draws advanced geometric shapes onto a 2D canvas context.
 */
export const drawShape = (ctx, shapeType, x, y, width, height, options = {}) => {
  ctx.save();
  ctx.fillStyle = options.color || "#22c55e";
  ctx.strokeStyle = options.strokeColor || "#ffffff";
  ctx.lineWidth = options.strokeWidth || 0;

  ctx.beginPath();
  switch (shapeType) {
    case "circle": {
      const rx = width / 2;
      const ry = height / 2;
      ctx.ellipse(x + rx, y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
      break;
    }
    case "rounded": {
      const radius = Math.min(width, height) * 0.18;
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, width, height, radius);
      } else {
        ctx.rect(x, y, width, height);
      }
      break;
    }
    case "triangle": {
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      break;
    }
    case "star": {
      const spikes = 5;
      const cx = x + width / 2;
      const cy = y + height / 2;
      const outerR = Math.min(width, height) / 2;
      const innerR = outerR * 0.45;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        let sx = cx + Math.cos(rot) * outerR;
        let sy = cy + Math.sin(rot) * outerR;
        ctx.lineTo(sx, sy);
        rot += step;

        sx = cx + Math.cos(rot) * innerR;
        sy = cy + Math.sin(rot) * innerR;
        ctx.lineTo(sx, sy);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerR);
      ctx.closePath();
      break;
    }
    case "badge": {
      const points = 12;
      const cx = x + width / 2;
      const cy = y + height / 2;
      const outerR = Math.min(width, height) / 2;
      const innerR = outerR * 0.82;
      let rot = Math.PI / points;
      const step = Math.PI / points;

      ctx.moveTo(cx + Math.cos(0) * outerR, cy + Math.sin(0) * outerR);
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const px = cx + Math.cos(i * step) * r;
        const py = cy + Math.sin(i * step) * r;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case "arrow": {
      const stemH = height * 0.36;
      const headW = width * 0.38;
      ctx.moveTo(x, y + (height - stemH) / 2);
      ctx.lineTo(x + width - headW, y + (height - stemH) / 2);
      ctx.lineTo(x + width - headW, y);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x + width - headW, y + height);
      ctx.lineTo(x + width - headW, y + (height + stemH) / 2);
      ctx.lineTo(x, y + (height + stemH) / 2);
      ctx.closePath();
      break;
    }
    case "rectangle":
    default:
      ctx.rect(x, y, width, height);
      break;
  }

  ctx.fill();
  if (options.strokeWidth > 0) {
    ctx.stroke();
  }
  ctx.restore();
};

/**
 * Creates a beautiful demo image in memory so users can test immediately.
 */
export const createDemoSampleBlob = async (name = "demo-creatives.jpg") => {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, "#ff6b6b");
  sky.addColorStop(0.35, "#feca57");
  sky.addColorStop(0.7, "#48dbfb");
  sky.addColorStop(1, "#1dd1a1");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1280, 720);

  // Glowing Sun
  ctx.save();
  ctx.shadowColor = "#ff9f43";
  ctx.shadowBlur = 60;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(640, 260, 95, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Mountain silhouettes
  ctx.fillStyle = "rgba(16, 28, 44, 0.75)";
  ctx.beginPath();
  ctx.moveTo(0, 720);
  ctx.lineTo(0, 480);
  ctx.lineTo(340, 310);
  ctx.lineTo(680, 520);
  ctx.lineTo(1020, 270);
  ctx.lineTo(1280, 440);
  ctx.lineTo(1280, 720);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0c1724";
  ctx.beginPath();
  ctx.moveTo(0, 720);
  ctx.lineTo(0, 560);
  ctx.lineTo(240, 430);
  ctx.lineTo(520, 600);
  ctx.lineTo(840, 390);
  ctx.lineTo(1280, 580);
  ctx.lineTo(1280, 720);
  ctx.closePath();
  ctx.fill();

  // Modern typography
  ctx.font = "800 68px 'Manrope', 'DM Sans', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 20;
  ctx.fillText("EXPLORE THE UNSEEN", 80, 140);

  ctx.font = "600 24px 'DM Sans', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("PRO STUDIO • MAKEPHOTO READY", 85, 185);

  const blob = await canvasBlob(canvas, "image/jpeg", 0.94);
  return new File([blob], name, { type: "image/jpeg" });
};
