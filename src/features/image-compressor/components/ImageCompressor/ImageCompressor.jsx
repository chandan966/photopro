import React, { useState, useRef, useEffect, useMemo } from "react";
import JSZip from "jszip";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  FileArchive,
  FileCheck,
  FileImage,
  Layers,
  LockKeyhole,
  Maximize2,
  RefreshCw,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { formatBytes, loadImage, canvasBlob, downloadBlob } from "../../../../utils/imageTools.js";
import "./ImageCompressor.css";

const PRESET_MODES = [
  { id: "best", label: "Best Quality", quality: 90, desc: "Near-lossless visual fidelity" },
  { id: "balanced", label: "Balanced", quality: 75, desc: "Optimal quality to size ratio" },
  { id: "small", label: "Small File", quality: 50, desc: "Noticeable file size reduction" },
  { id: "max", label: "Maximum", quality: 25, desc: "Aggressive compression for slow networks" },
];

const TARGET_SIZES = [
  { id: "none", label: "No Target (Quality Based)", bytes: 0 },
  { id: "10mb", label: "Under 10 MB", bytes: 10 * 1024 * 1024 },
  { id: "5mb", label: "Under 5 MB", bytes: 5 * 1024 * 1024 },
  { id: "2mb", label: "Under 2 MB", bytes: 2 * 1024 * 1024 },
  { id: "1mb", label: "Under 1 MB", bytes: 1 * 1024 * 1024 },
  { id: "500kb", label: "Under 500 KB", bytes: 500 * 1024 },
  { id: "200kb", label: "Under 200 KB", bytes: 200 * 1024 },
];

export default function ImageCompressor({ notify, onExit }) {
  const [files, setFiles] = useState([]); // [{ id, file, url, img, name, originalSize, compressedBlob, compressedUrl, compressedSize, width, height, progress, status }]
  const [activeFileId, setActiveFileId] = useState(null);
  const [compressionMode, setCompressionMode] = useState("balanced");
  const [quality, setQuality] = useState(75);
  const [targetSizePreset, setTargetSizePreset] = useState("none");
  const [outputFormat, setOutputFormat] = useState("image/jpeg"); // image/jpeg, image/webp, image/png
  const [stripMetadata, setStripMetadata] = useState(true);
  const [resizeMode, setResizeMode] = useState("original"); // original, 75, 50, 25, custom
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [comparisonSliderPos, setComparisonSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState("slider"); // slider, side-by-side

  const fileInputRef = useRef(null);
  const sliderContainerRef = useRef(null);

  // Active Selected File for Inspector
  const activeItem = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || files[0] || null;
  }, [files, activeFileId]);

  // Handle User File Uploads
  const handleUploadFiles = async (uploadedFiles) => {
    const valid = Array.from(uploadedFiles).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) {
      notify?.("Please select supported image files (JPG, PNG, WebP, BMP, TIFF).");
      return;
    }

    const newItems = await Promise.all(
      valid.map(async (file) => {
        const url = URL.createObjectURL(file);
        let img = null;
        try {
          img = await loadImage(url);
        } catch {
          // Fallback
        }
        return {
          id: crypto.randomUUID(),
          file,
          url,
          img,
          name: file.name,
          originalSize: file.size,
          compressedBlob: null,
          compressedUrl: null,
          compressedSize: 0,
          width: img ? img.naturalWidth : 1280,
          height: img ? img.naturalHeight : 720,
          aspectRatio: img ? img.naturalWidth / img.naturalHeight : 1.77,
          progress: 0,
          status: "pending", // pending, processing, done, error
        };
      })
    );

    setFiles((prev) => [...prev, ...newItems]);
    if (!activeFileId && newItems.length > 0) {
      setActiveFileId(newItems[0].id);
      if (newItems[0].img) {
        setCustomWidth(newItems[0].img.naturalWidth);
        setCustomHeight(newItems[0].img.naturalHeight);
      }
    }
    notify?.(`Added ${newItems.length} image${newItems.length > 1 ? "s" : ""} to compressor`);
  };

  // Perform Client-Side Compression
  const compressSingleItem = async (item, targetQuality, targetFormat, targetBytesLimit) => {
    if (!item.img) return item;

    // 1. Calculate Target Dimensions
    let w = item.width;
    let h = item.height;
    if (resizeMode === "75") {
      w = Math.round(item.width * 0.75);
      h = Math.round(item.height * 0.75);
    } else if (resizeMode === "50") {
      w = Math.round(item.width * 0.5);
      h = Math.round(item.height * 0.5);
    } else if (resizeMode === "25") {
      w = Math.round(item.width * 0.25);
      h = Math.round(item.height * 0.25);
    } else if (resizeMode === "custom") {
      w = customWidth;
      h = customHeight;
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    // White background for JPG if transparent
    if (targetFormat === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }

    ctx.drawImage(item.img, 0, 0, w, h);

    // 2. Quality & Target Size Iteration
    let q = targetQuality / 100;
    let blob = await canvasBlob(canvas, targetFormat, q);

    // If Target Size is requested and target bytes limit is set, iterate binary search
    if (targetBytesLimit > 0 && blob.size > targetBytesLimit && targetFormat !== "image/png") {
      let minQ = 0.05;
      let maxQ = q;
      for (let iter = 0; iter < 5; iter++) {
        const midQ = (minQ + maxQ) / 2;
        const testBlob = await canvasBlob(canvas, targetFormat, midQ);
        if (testBlob.size <= targetBytesLimit) {
          blob = testBlob;
          minQ = midQ;
        } else {
          maxQ = midQ;
        }
      }
    }

    const compressedUrl = URL.createObjectURL(blob);
    return {
      ...item,
      compressedBlob: blob,
      compressedUrl,
      compressedSize: blob.size,
      status: "done",
      progress: 100,
    };
  };

  // Run Compression on Current or All
  const handleCompressAll = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const targetBytes = TARGET_SIZES.find((t) => t.id === targetSizePreset)?.bytes || 0;
    const updated = [];

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      const res = await compressSingleItem(item, quality, outputFormat, targetBytes);
      updated.push(res);
    }

    setFiles(updated);
    setIsProcessing(false);
    notify?.(`Successfully compressed ${updated.length} image${updated.length > 1 ? "s" : ""}!`);
  };

  // Download Single File
  const handleDownloadItem = (item) => {
    if (!item.compressedBlob) return;
    const ext = outputFormat.split("/")[1].replace("jpeg", "jpg");
    const baseName = item.name.replace(/\.[^.]+$/, "");
    downloadBlob(item.compressedBlob, `${baseName}-compressed.${ext}`);
    notify?.(`Downloaded ${baseName}-compressed.${ext}`);
  };

  // Download All as ZIP
  const handleDownloadZip = async () => {
    const readyItems = files.filter((f) => f.compressedBlob);
    if (readyItems.length === 0) {
      notify?.("No compressed images ready to download. Click 'Compress All' first.");
      return;
    }

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const ext = outputFormat.split("/")[1].replace("jpeg", "jpg");

      readyItems.forEach((item) => {
        const baseName = item.name.replace(/\.[^.]+$/, "");
        zip.file(`${baseName}-compressed.${ext}`, item.compressedBlob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `photopro-compressed-batch-${Date.now()}.zip`);
      notify?.("Downloaded batch ZIP archive!");
    } catch (err) {
      notify?.(`ZIP error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (activeFileId === id) {
      const remaining = files.filter((f) => f.id !== id);
      setActiveFileId(remaining[0]?.id || null);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setActiveFileId(null);
  };

  return (
    <div className="image-compressor-page">
      {/* Top Header */}
      <header className="compressor-header">
        <div className="compressor-brand">
          <button className="compressor-exit-btn" onClick={onExit} title="Back to Home">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="compressor-title-wrap">
            <h2>Smart Image Compressor</h2>
            <span className="compressor-badge">
              <ShieldCheck size={13} /> 100% Client-Side Privacy
            </span>
          </div>
        </div>

        <div className="compressor-top-actions">
          {files.length > 0 && (
            <>
              <button className="button button-outline" onClick={handleClearAll} disabled={isProcessing}>
                <Trash2 size={14} /> Clear All
              </button>
              <button
                className="button button-outline"
                onClick={handleDownloadZip}
                disabled={isProcessing || !files.some((f) => f.compressedBlob)}
                title="Download all processed files as a ZIP archive"
              >
                <FileArchive size={14} /> Download ZIP
              </button>
              <button
                className="button button-primary"
                onClick={handleCompressAll}
                disabled={isProcessing}
              >
                {isProcessing ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
                <span>{isProcessing ? "Compressing..." : "Compress All Images"}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="compressor-layout">
        {files.length === 0 ? (
          /* Empty Upload Dropzone */
          <div
            className="compressor-empty-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
            }}
          >
            <div className="dropzone-icon-circle">
              <Upload size={32} />
            </div>
            <h3>Drag & Drop Images to Compress</h3>
            <p>Supports JPG, PNG, WebP, GIF, BMP, and TIFF files up to 50MB</p>
            <button className="button button-primary" onClick={() => fileInputRef.current?.click()}>
              <FileImage size={15} /> Select Images from Device
            </button>
            <div className="dropzone-features-row">
              <span>✓ Quality & Target Size Control</span>
              <span>✓ Interactive Before/After Split Comparison</span>
              <span>✓ Batch ZIP Download</span>
              <span>✓ Zero Server Uploads</span>
            </div>
          </div>
        ) : (
          /* Dual Column Studio Layout */
          <div className="compressor-active-workspace">
            {/* Left: Files Queue & Interactive Preview */}
            <div className="compressor-preview-column">
              {/* Horizontal File Queue Strip */}
              <div className="compressor-file-strip">
                <div className="file-strip-scroll">
                  {files.map((item) => {
                    const isActive = item.id === activeItem?.id;
                    const savedPct = item.compressedSize
                      ? Math.max(0, Math.round((1 - item.compressedSize / item.originalSize) * 100))
                      : 0;

                    return (
                      <div
                        key={item.id}
                        className={`file-queue-card ${isActive ? "active" : ""}`}
                        onClick={() => setActiveFileId(item.id)}
                      >
                        <img src={item.url} alt={item.name} className="queue-thumb" />
                        <div className="queue-meta">
                          <span className="queue-name" title={item.name}>
                            {item.name}
                          </span>
                          <span className="queue-size">
                            {formatBytes(item.originalSize)}
                            {item.compressedSize > 0 && (
                              <b className="queue-saved"> → -{savedPct}%</b>
                            )}
                          </span>
                        </div>
                        <button
                          className="queue-remove-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item.id);
                          }}
                          title="Remove item"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="add-more-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Add more photos"
                >
                  + Add
                </button>
              </div>

              {/* Central Comparison Stage */}
              {activeItem && (
                <div className="compressor-stage-container">
                  {/* View Mode Tabs (Split Slider / Side-by-Side) */}
                  <div className="stage-toolbar">
                    <div className="stage-toolbar-left">
                      <span className="stage-file-title">{activeItem.name}</span>
                      <span className="stage-dim-badge">
                        {activeItem.width} × {activeItem.height} px
                      </span>
                    </div>

                    <div className="view-mode-pills">
                      <button
                        className={`mode-pill ${viewMode === "slider" ? "active" : ""}`}
                        onClick={() => setViewMode("slider")}
                      >
                        Split Slider
                      </button>
                      <button
                        className={`mode-pill ${viewMode === "side" ? "active" : ""}`}
                        onClick={() => setViewMode("side")}
                      >
                        Side by Side
                      </button>
                    </div>
                  </div>

                  {/* Stage Body */}
                  <div className="stage-canvas-wrapper">
                    {viewMode === "slider" ? (
                      /* Interactive Before/After Split Slider */
                      <div
                        className="split-comparison-container"
                        ref={sliderContainerRef}
                        onMouseMove={(e) => {
                          if (e.buttons === 1 && sliderContainerRef.current) {
                            const rect = sliderContainerRef.current.getBoundingClientRect();
                            const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                            setComparisonSliderPos(Math.round((x / rect.width) * 100));
                          }
                        }}
                      >
                        {/* Before: Original (Underneath) */}
                        <img src={activeItem.url} alt="Original Before" className="split-img before" />

                        {/* After: Processed (Clipped Overlay) */}
                        <div
                          className="split-after-clip"
                          style={{
                            clipPath: `polygon(${comparisonSliderPos}% 0, 100% 0, 100% 100%, ${comparisonSliderPos}% 100%)`,
                          }}
                        >
                          <img
                            src={activeItem.compressedUrl || activeItem.url}
                            alt="Compressed After"
                            className="split-img after"
                          />
                        </div>

                        {/* Slider Handle Divider */}
                        <div
                          className="split-handle-line"
                          style={{ left: `${comparisonSliderPos}%` }}
                        >
                          <div className="split-handle-knob">⇄</div>
                        </div>

                        <span className="split-label before-tag">ORIGINAL</span>
                        <span className="split-label after-tag">
                          {activeItem.compressedUrl ? "COMPRESSED" : "PREVIEW"}
                        </span>
                      </div>
                    ) : (
                      /* Side-by-Side View */
                      <div className="side-by-side-grid">
                        <div className="side-card">
                          <span className="side-tag">BEFORE ({formatBytes(activeItem.originalSize)})</span>
                          <img src={activeItem.url} alt="Original" className="side-img" />
                        </div>
                        <div className="side-card">
                          <span className="side-tag">
                            AFTER (
                            {activeItem.compressedSize > 0
                              ? formatBytes(activeItem.compressedSize)
                              : "Not Compressed Yet"}
                            )
                          </span>
                          <img
                            src={activeItem.compressedUrl || activeItem.url}
                            alt="Compressed"
                            className="side-img"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Compression Statistics Bar */}
                  {activeItem && (
                    <div className="compression-stats-bar">
                      <div className="stat-item">
                        <span className="stat-label">Original File Size</span>
                        <span className="stat-val">{formatBytes(activeItem.originalSize)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Compressed Size</span>
                        <span className="stat-val highlight">
                          {activeItem.compressedSize > 0
                            ? formatBytes(activeItem.compressedSize)
                            : "—"}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Saved Storage</span>
                        <span className="stat-val green">
                          {activeItem.compressedSize > 0
                            ? `-${Math.max(
                                0,
                                Math.round(
                                  (1 - activeItem.compressedSize / activeItem.originalSize) * 100
                                )
                              )}% (${formatBytes(
                                Math.max(0, activeItem.originalSize - activeItem.compressedSize)
                              )})`
                            : "—"}
                        </span>
                      </div>
                      <div className="stat-item actions">
                        <button
                          className="button button-primary"
                          onClick={() => handleDownloadItem(activeItem)}
                          disabled={!activeItem.compressedBlob}
                        >
                          <Download size={14} /> Download Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right: Compression Controls Sidebar */}
            <aside className="compressor-controls-sidebar">
              <div className="sidebar-section">
                <span className="section-title">Compression Mode</span>
                <div className="presets-grid">
                  {PRESET_MODES.map((p) => (
                    <button
                      key={p.id}
                      className={`preset-card ${compressionMode === p.id ? "active" : ""}`}
                      onClick={() => {
                        setCompressionMode(p.id);
                        setQuality(p.quality);
                      }}
                    >
                      <strong>{p.label}</strong>
                      <small>{p.desc}</small>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              <div className="sidebar-section">
                <div className="slider-header-row">
                  <span className="section-title">Quality Level</span>
                  <span className="slider-val-badge">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={quality}
                  className="compressor-range-slider"
                  onChange={(e) => {
                    setQuality(Number(e.target.value));
                    setCompressionMode("custom");
                  }}
                />
              </div>

              {/* Target File Size */}
              <div className="sidebar-section">
                <span className="section-title">Target Max File Size</span>
                <select
                  className="compressor-select"
                  value={targetSizePreset}
                  onChange={(e) => setTargetSizePreset(e.target.value)}
                >
                  {TARGET_SIZES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <small className="control-hint">
                  Iteratively determines compression parameters to meet size constraint.
                </small>
              </div>

              {/* Output Format */}
              <div className="sidebar-section">
                <span className="section-title">Output Format</span>
                <select
                  className="compressor-select"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                >
                  <option value="image/jpeg">JPG · High photographic compression</option>
                  <option value="image/webp">WebP · Next-Gen maximum efficiency</option>
                  <option value="image/png">PNG · Lossless with transparency</option>
                </select>
              </div>

              {/* Resize Options */}
              <div className="sidebar-section">
                <span className="section-title">Image Resolution Scaling</span>
                <select
                  className="compressor-select"
                  value={resizeMode}
                  onChange={(e) => setResizeMode(e.target.value)}
                >
                  <option value="original">Original Dimensions</option>
                  <option value="75">Scale to 75% Resolution</option>
                  <option value="50">Scale to 50% Resolution (2× smaller)</option>
                  <option value="25">Scale to 25% Resolution (4× smaller)</option>
                </select>
              </div>

              {/* Metadata Privacy */}
              <div className="sidebar-section">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={stripMetadata}
                    onChange={(e) => setStripMetadata(e.target.checked)}
                  />
                  <span>Strip EXIF, GPS & Camera Metadata (Privacy)</span>
                </label>
              </div>

              {/* Apply Button */}
              <div className="sidebar-bottom-action">
                <button
                  className="button button-primary full-width"
                  onClick={handleCompressAll}
                  disabled={isProcessing}
                >
                  {isProcessing ? <RefreshCw size={15} className="spin" /> : <Zap size={15} />}
                  <span>{isProcessing ? "Compressing..." : "Compress All Images"}</span>
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Hidden file input */}
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
