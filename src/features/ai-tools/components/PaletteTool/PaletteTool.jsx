import { useState } from "react";
import { Check, Copy, Download, Image as ImageIcon, Palette, Sparkles, Upload } from "lucide-react";
import { canvasBlob, createDemoSampleBlob, downloadBlob, extractPalette, loadImage } from "../../../../utils/imageTools.js";
import { ToolPage, UploadDropzone } from "../../../../components/shared/ToolPage/ToolPage.jsx";
import { MAX_UPLOAD_BYTES } from "../../../../constants/presets.js";
import "./PaletteTool.css";

function PaletteTool({ notify }) {
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [palette, setPalette] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.size > MAX_UPLOAD_BYTES) {
      setError("File exceeds 50 MB limit. Please select a smaller photo.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const url = URL.createObjectURL(selectedFile);
      const img = await loadImage(url);
      setFile(selectedFile);
      setImageSrc(url);
      const extracted = extractPalette(img, 6);
      setPalette(extracted);
      notify("Palette generated successfully!");
    } catch (err) {
      setError(err.message || "Failed to extract colors from image.");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    notify(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyCssVars = () => {
    if (!palette.length) return;
    const css = palette.map((p, i) => `  --color-${i + 1}: ${p.hex};`).join("\n");
    const full = `:root {\n${css}\n}`;
    navigator.clipboard.writeText(full);
    notify("Copied CSS Variables to clipboard!");
  };

  const loadDemo = async () => {
    setLoading(true);
    try {
      const sample = await createDemoSampleBlob("nature-sample.jpg");
      await handleFile(sample);
    } finally {
      setLoading(false);
    }
  };

  const downloadPaletteCard = async () => {
    if (!palette.length) return;
    const card = document.createElement("canvas");
    card.width = 1200;
    card.height = 630;
    const ctx = card.getContext("2d");

    // Background
    ctx.fillStyle = "#0c130f";
    ctx.fillRect(0, 0, 1200, 630);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 36px 'DM Sans', sans-serif";
    ctx.fillText("COLOR PALETTE", 60, 80);

    ctx.fillStyle = "#22c55e";
    ctx.font = "600 18px 'DM Sans', sans-serif";
    ctx.fillText("EXTRACTED WITH MAKEPHOTO", 60, 115);

    // Swatches
    const swatchWidth = (1200 - 120 - (palette.length - 1) * 20) / palette.length;
    palette.forEach((color, i) => {
      const x = 60 + i * (swatchWidth + 20);
      const y = 160;
      const h = 340;

      // Card box
      ctx.fillStyle = color.hex;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, swatchWidth, h, 14);
      } else {
        ctx.rect(x, y, swatchWidth, h);
      }
      ctx.fill();

      // Hex label
      ctx.fillStyle = color.isDark ? "#ffffff" : "#09100a";
      ctx.font = "700 20px 'DM Sans', monospace";
      ctx.textAlign = "center";
      ctx.fillText(color.hex.toUpperCase(), x + swatchWidth / 2, y + h - 35);
    });

    const blob = await canvasBlob(card, "image/png");
    downloadBlob(blob, "makephoto-palette-card.png");
    notify("Palette card downloaded!");
  };

  return (
    <ToolPage
      title="Color Palette Extractor"
      subtitle="Extract dominant, harmonic color schemes directly from any photo. Copy HEX codes, CSS variables, or export a palette card."
      icon={Palette}
    >
      <div className="palette-container">
        {!imageSrc ? (
          <div className="palette-empty-box">
            <UploadDropzone
              onFiles={(files) => {
                const img = [...files].find((f) => f.type.startsWith("image/"));
                if (img) handleFile(img);
              }}
              label="Drop an image to extract its color palette"
              hint="JPG, PNG, WebP supported · Runs entirely in browser"
            />
            <div className="palette-or">or</div>
            <button className="button button-outline palette-demo-btn" onClick={loadDemo} disabled={loading}>
              <Sparkles size={16} /> Try with demo image
            </button>
          </div>
        ) : (
          <div className="palette-workspace">
            <div className="palette-preview-panel">
              <div className="image-frame">
                <img src={imageSrc} alt="Uploaded for color palette" />
                <button
                  className="button button-quiet button-replace"
                  onClick={() => {
                    setFile(null);
                    setImageSrc("");
                    setPalette([]);
                  }}
                >
                  <Upload size={14} /> New photo
                </button>
              </div>
              <div className="palette-info-meta">
                <span>{file?.name}</span>
                <span className="dot">•</span>
                <span>{palette.length} colors extracted</span>
              </div>
            </div>

            <div className="palette-results-panel">
              <div className="results-header">
                <div>
                  <h3>Harmonic Palette</h3>
                  <p>Click any color chip to copy its HEX code.</p>
                </div>
                <div className="palette-actions">
                  <button className="button button-outline" onClick={copyCssVars}>
                    <Copy size={15} /> Copy CSS
                  </button>
                  <button className="button button-primary" onClick={downloadPaletteCard}>
                    <Download size={15} /> Export Card
                  </button>
                </div>
              </div>

              <div className="palette-swatches-grid">
                {palette.map((color, index) => (
                  <div
                    key={color.hex + index}
                    className="palette-swatch-card"
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyCode(color.hex, index)}
                    title="Click to copy HEX code"
                  >
                    <div className={`swatch-content ${color.isDark ? "theme-light" : "theme-dark"}`}>
                      <span className="swatch-number">0{index + 1}</span>
                      <div className="swatch-details">
                        <strong className="swatch-hex">{color.hex.toUpperCase()}</strong>
                        <small className="swatch-rgb">{color.rgbString}</small>
                      </div>
                      <div className="copy-indicator">
                        {copiedIndex === index ? <Check size={16} /> : <Copy size={15} />}
                        <span>{copiedIndex === index ? "Copied" : "Copy"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <div className="palette-error">{error}</div>}
      </div>
    </ToolPage>
  );
}

export default PaletteTool;
