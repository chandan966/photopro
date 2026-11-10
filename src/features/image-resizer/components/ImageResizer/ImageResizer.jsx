import React, { useState, useRef } from "react";
import JSZip from "jszip";
import {
  ArrowLeft,
  Check,
  Download,
  FileArchive,
  FileImage,
  Lock,
  RefreshCw,
  Scale,
  ShieldCheck,
  Trash2,
  Unlock,
  Upload,
  Zap,
} from "lucide-react";
import { formatBytes, loadImage, canvasBlob, downloadBlob } from "../../../../utils/imageTools.js";
import "./ImageResizer.css";

const PRESET_CATEGORIES = [
  {
    category: "Social Media",
    items: [
      { label: "Instagram Square", width: 1080, height: 1080 },
      { label: "Instagram Story / Reel", width: 1080, height: 1920 },
      { label: "Facebook Post", width: 1200, height: 630 },
      { label: "Twitter / X Header", width: 1500, height: 500 },
    ],
  },
  {
    category: "YouTube",
    items: [
      { label: "YouTube Thumbnail", width: 1280, height: 720 },
      { label: "YouTube Channel Banner", width: 2560, height: 1440 },
    ],
  },
  {
    category: "Display & Web",
    items: [
      { label: "HD 720p", width: 1280, height: 720 },
      { label: "Full HD 1080p", width: 1920, height: 1080 },
      { label: "2K QHD", width: 2560, height: 1440 },
      { label: "4K UHD Wallpaper", width: 3840, height: 2160 },
    ],
  },
  {
    category: "E-Commerce",
    items: [
      { label: "Product Square", width: 1000, height: 1000 },
      { label: "Catalog Standard", width: 800, height: 800 },
    ],
  },
];

export default function ImageResizer({ notify, onExit }) {
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [targetWidth, setTargetWidth] = useState(1920);
  const [targetHeight, setTargetHeight] = useState(1080);
  const [lockAspect, setLockAspect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const activeItem = files.find((f) => f.id === activeFileId) || files[0] || null;

  const handleUploadFiles = async (uploadedFiles) => {
    const valid = Array.from(uploadedFiles).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) return;

    const items = await Promise.all(
      valid.map(async (file) => {
        const url = URL.createObjectURL(file);
        let img = null;
        try {
          img = await loadImage(url);
        } catch {}
        return {
          id: crypto.randomUUID(),
          file,
          url,
          img,
          name: file.name,
          originalSize: file.size,
          width: img ? img.naturalWidth : 1280,
          height: img ? img.naturalHeight : 720,
          aspect: img ? img.naturalWidth / img.naturalHeight : 1.77,
          resizedBlob: null,
          resizedSize: 0,
          status: "ready",
        };
      })
    );

    setFiles((prev) => [...prev, ...items]);
    if (!activeFileId && items.length > 0) {
      setActiveFileId(items[0].id);
      setTargetWidth(items[0].width);
      setTargetHeight(items[0].height);
    }
    notify?.(`Added ${items.length} images to resizer`);
  };

  const handleWidthChange = (val) => {
    const w = Number(val);
    setTargetWidth(w);
    if (lockAspect && activeItem && activeItem.aspect) {
      setTargetHeight(Math.round(w / activeItem.aspect));
    }
  };

  const handleHeightChange = (val) => {
    const h = Number(val);
    setTargetHeight(h);
    if (lockAspect && activeItem && activeItem.aspect) {
      setTargetWidth(Math.round(h * activeItem.aspect));
    }
  };

  const handleApplyPreset = (w, h) => {
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleScalePercent = (pct) => {
    if (!activeItem) return;
    const w = Math.round(activeItem.width * (pct / 100));
    const h = Math.round(activeItem.height * (pct / 100));
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const resizeSingle = async (item, w, h) => {
    if (!item.img) return item;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(item.img, 0, 0, w, h);

    const blob = await canvasBlob(canvas, item.file.type || "image/jpeg", 0.92);
    return {
      ...item,
      resizedBlob: blob,
      resizedSize: blob.size,
      resizedW: w,
      resizedH: h,
      status: "done",
    };
  };

  const handleResizeAll = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const updated = [];
    for (const item of files) {
      let w = targetWidth;
      let h = targetHeight;
      if (lockAspect && item.aspect) {
        // preserve individual item aspect ratio if multiple
        h = Math.round(w / item.aspect);
      }
      const res = await resizeSingle(item, w, h);
      updated.push(res);
    }

    setFiles(updated);
    setIsProcessing(false);
    notify?.(`Resized ${updated.length} files successfully!`);
  };

  const handleDownloadSingle = (item) => {
    if (!item.resizedBlob) return;
    const ext = item.file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const base = item.name.replace(/\.[^.]+$/, "");
    downloadBlob(item.resizedBlob, `${base}-${item.resizedW}x${item.resizedH}.${ext}`);
  };

  const handleDownloadZip = async () => {
    const ready = files.filter((f) => f.resizedBlob);
    if (ready.length === 0) return;

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      ready.forEach((item) => {
        const ext = item.file.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        const base = item.name.replace(/\.[^.]+$/, "");
        zip.file(`${base}-${item.resizedW}x${item.resizedH}.${ext}`, item.resizedBlob);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `photopro-resized-batch.zip`);
      notify?.("Downloaded batch ZIP!");
    } catch (err) {
      notify?.(`Error creating ZIP: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="resizer-page">
      <header className="resizer-header">
        <div className="resizer-brand">
          <button className="resizer-exit-btn" onClick={onExit} title="Back to Home">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="resizer-title-wrap">
            <h2>Batch Image Resizer</h2>
            <span className="resizer-badge">
              <ShieldCheck size={13} /> 100% Client-Side Privacy
            </span>
          </div>
        </div>

        <div className="resizer-top-actions">
          {files.length > 0 && (
            <>
              <button className="button button-outline" onClick={() => setFiles([])} disabled={isProcessing}>
                <Trash2 size={14} /> Clear All
              </button>
              <button
                className="button button-outline"
                onClick={handleDownloadZip}
                disabled={isProcessing || !files.some((f) => f.resizedBlob)}
              >
                <FileArchive size={14} /> Download ZIP
              </button>
              <button className="button button-primary" onClick={handleResizeAll} disabled={isProcessing}>
                {isProcessing ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
                <span>Resize All ({files.length})</span>
              </button>
            </>
          )}
        </div>
      </header>

      <div className="resizer-layout">
        {files.length === 0 ? (
          <div
            className="resizer-empty-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
            }}
          >
            <div className="dropzone-icon-circle">
              <Upload size={32} />
            </div>
            <h3>Drag & Drop Images to Resize</h3>
            <p>Resize images by exact pixels, percentage, or social media presets with aspect ratio lock</p>
            <button className="button button-primary" onClick={() => fileInputRef.current?.click()}>
              <FileImage size={15} /> Select Images from Device
            </button>
          </div>
        ) : (
          <div className="resizer-workspace">
            {/* Center Preview */}
            <div className="resizer-preview-col">
              <div className="resizer-canvas-box">
                {activeItem && (
                  <div className="resizer-image-frame">
                    <img src={activeItem.url} alt="" className="resizer-preview-img" />
                    <div className="resizer-preview-meta">
                      <span>Original: {activeItem.width} × {activeItem.height} px ({formatBytes(activeItem.originalSize)})</span>
                      <span>Target: {targetWidth} × {targetHeight} px</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Files Carousel */}
              <div className="resizer-strip">
                {files.map((item) => (
                  <div
                    key={item.id}
                    className={`strip-card ${item.id === activeItem?.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveFileId(item.id);
                      setTargetWidth(item.width);
                      setTargetHeight(item.height);
                    }}
                  >
                    <img src={item.url} alt="" className="strip-thumb" />
                    <div className="strip-info">
                      <span className="strip-name">{item.name}</span>
                      <span className="strip-dim">{item.width} × {item.height}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Controls Sidebar */}
            <aside className="resizer-controls-sidebar">
              <div className="sidebar-section">
                <span className="section-title">Exact Dimensions (px)</span>
                <div className="dim-input-row">
                  <div className="dim-field">
                    <span className="dim-label">Width</span>
                    <input
                      type="number"
                      className="dim-input"
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(e.target.value)}
                    />
                  </div>

                  <button
                    className={`aspect-toggle-btn ${lockAspect ? "active" : ""}`}
                    onClick={() => setLockAspect(!lockAspect)}
                    title={lockAspect ? "Lock Aspect Ratio" : "Unlock Aspect Ratio"}
                  >
                    {lockAspect ? <Lock size={15} /> : <Unlock size={15} />}
                  </button>

                  <div className="dim-field">
                    <span className="dim-label">Height</span>
                    <input
                      type="number"
                      className="dim-input"
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Percentage Scaling */}
              <div className="sidebar-section">
                <span className="section-title">Scale by Percentage</span>
                <div className="pct-buttons-row">
                  {[25, 50, 75, 100, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      className="pct-btn"
                      onClick={() => handleScalePercent(pct)}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Media & Display Presets */}
              <div className="sidebar-section">
                <span className="section-title">Standard Presets</span>
                <div className="presets-accordion">
                  {PRESET_CATEGORIES.map((cat) => (
                    <div key={cat.category} className="preset-cat-group">
                      <span className="preset-cat-title">{cat.category}</span>
                      <div className="preset-cat-items">
                        {cat.items.map((item) => (
                          <button
                            key={item.label}
                            className="preset-pill-btn"
                            onClick={() => handleApplyPreset(item.width, item.height)}
                          >
                            <span>{item.label}</span>
                            <small>{item.width} × {item.height}</small>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-bottom-action">
                <button
                  className="button button-primary full-width"
                  onClick={handleResizeAll}
                  disabled={isProcessing}
                >
                  {isProcessing ? <RefreshCw size={15} className="spin" /> : <Zap size={15} />}
                  <span>Resize All ({files.length})</span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files) handleUploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
