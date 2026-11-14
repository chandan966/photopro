import "./ExportModal.css";
import { useState } from "react";
import { Download, X, FileText, Check } from "lucide-react";

function ExportModal({ type, setType, preview, onClose, onExport, width, height }) {
  const [size, setSize] = useState("original");
  const [quality, setQuality] = useState(95);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="export-modal animate-fadeIn">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-line" /> READY TO DOWNLOAD
            </span>
            <h2>Export Artwork</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close export dialog">
            <X size={18} />
          </button>
        </div>

        <div className="export-preview">
          <img className="export-image-preview" src={preview} alt="Final export preview" />
          <div>
            <strong style={{ display: "block", color: "#ffffff", fontSize: "12.5px" }}>
              Canvas Dimensions
            </strong>
            <span>
              {width} × {height} px • sRGB Color
            </span>
          </div>
        </div>

        <label className="field-label">
          File Format
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="image/png">PNG · Lossless with Alpha Transparency</option>
            <option value="image/jpeg">JPG · High-Speed Photographic Quality</option>
            <option value="image/webp">WebP · Next-Gen High-Compression Web</option>
            <option value="application/pdf">PDF · Scalable Single-Page Document</option>
          </select>
        </label>

        {(type === "image/jpeg" || type === "image/webp") && (
          <label className="field-label">
            Quality: {quality}%
            <input
              type="range"
              min="20"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#0ea5e9", marginTop: "6px" }}
            />
          </label>
        )}

        <label className="field-label">
          Export Resolution Scale
          <select value={size} onChange={(event) => setSize(event.target.value)}>
            <option value="original">Original Size · {width} × {height} px</option>
            <option value="hd">HD Scale · Fit within 1280 × 720 px</option>
            <option value="fullhd">Full HD Scale · Fit within 1920 × 1080 px</option>
            <option value="2k">2K QHD · Fit within 2560 × 1440 px</option>
            <option value="4k">4K UHD · Fit within 3840 × 2160 px</option>
          </select>
        </label>

        <p className="small-note">
          100% processed and compiled directly in your browser without external servers.
        </p>

        <button
          className="button button-primary full-width"
          onClick={() => onExport(size, quality / 100)}
        >
          <Download size={16} /> Download {type.includes("pdf") ? "PDF Document" : "Image"}
        </button>
      </div>
    </div>
  );
}

export default ExportModal;
