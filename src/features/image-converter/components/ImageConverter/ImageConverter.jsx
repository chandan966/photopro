import React, { useState, useRef, useMemo } from "react";
import JSZip from "jszip";
import {
  ArrowLeft,
  Check,
  Download,
  FileArchive,
  FileImage,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { formatBytes, loadImage, canvasBlob, downloadBlob } from "../../../../utils/imageTools.js";
import "./ImageConverter.css";

const FORMAT_OPTIONS = [
  { id: "image/webp", label: "WebP · High Efficiency Modern Web", ext: "webp" },
  { id: "image/png", label: "PNG · Lossless with Alpha Transparency", ext: "png" },
  { id: "image/jpeg", label: "JPG · High Speed Photographic Quality", ext: "jpg" },
];

export default function ImageConverter({ notify, onExit }) {
  const [files, setFiles] = useState([]); // [{ id, file, url, img, name, originalSize, convertedBlob, convertedSize, width, height, status }]
  const [targetFormat, setTargetFormat] = useState("image/webp");
  const [quality, setQuality] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadFiles = async (uploadedFiles) => {
    const valid = Array.from(uploadedFiles).filter((f) => f.type.startsWith("image/"));
    if (valid.length === 0) {
      notify?.("Please select supported image files.");
      return;
    }

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
          originalType: file.type || "image/unknown",
          originalSize: file.size,
          convertedBlob: null,
          convertedSize: 0,
          width: img ? img.naturalWidth : 1280,
          height: img ? img.naturalHeight : 720,
          status: "ready", // ready, converting, done, error
        };
      })
    );

    setFiles((prev) => [...prev, ...items]);
    notify?.(`Added ${items.length} file${items.length > 1 ? "s" : ""} to converter`);
  };

  const convertSingle = async (item, format, q) => {
    if (!item.img) return item;
    const canvas = document.createElement("canvas");
    canvas.width = item.width;
    canvas.height = item.height;
    const ctx = canvas.getContext("2d");

    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, item.width, item.height);
    }
    ctx.drawImage(item.img, 0, 0, item.width, item.height);

    const blob = await canvasBlob(canvas, format, q / 100);
    return {
      ...item,
      convertedBlob: blob,
      convertedSize: blob.size,
      status: "done",
    };
  };

  const handleConvertAll = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const updated = [];
    for (let i = 0; i < files.length; i++) {
      const res = await convertSingle(files[i], targetFormat, quality);
      updated.push(res);
    }

    setFiles(updated);
    setIsProcessing(false);
    notify?.(`Converted ${updated.length} files to ${targetFormat.split("/")[1].toUpperCase()}!`);
  };

  const handleDownloadSingle = (item) => {
    if (!item.convertedBlob) return;
    const ext = targetFormat.split("/")[1].replace("jpeg", "jpg");
    const baseName = item.name.replace(/\.[^.]+$/, "");
    downloadBlob(item.convertedBlob, `${baseName}-converted.${ext}`);
  };

  const handleDownloadAllZip = async () => {
    const ready = files.filter((f) => f.convertedBlob);
    if (ready.length === 0) {
      notify?.("Please convert files first before downloading ZIP.");
      return;
    }

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const ext = targetFormat.split("/")[1].replace("jpeg", "jpg");

      ready.forEach((item) => {
        const base = item.name.replace(/\.[^.]+$/, "");
        zip.file(`${base}.${ext}`, item.convertedBlob);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `photopro-converted-${ext}-batch.zip`);
      notify?.("Downloaded converted ZIP archive!");
    } catch (err) {
      notify?.(`Error creating ZIP: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="converter-page">
      {/* Top Header */}
      <header className="converter-header">
        <div className="converter-brand">
          <button className="converter-exit-btn" onClick={onExit} title="Back to Home">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="converter-title-wrap">
            <h2>Batch Image Format Converter</h2>
            <span className="converter-badge">
              <ShieldCheck size={13} /> 100% Client-Side Privacy
            </span>
          </div>
        </div>

        <div className="converter-top-actions">
          {files.length > 0 && (
            <>
              <button className="button button-outline" onClick={() => setFiles([])} disabled={isProcessing}>
                <Trash2 size={14} /> Clear All
              </button>
              <button
                className="button button-outline"
                onClick={handleDownloadAllZip}
                disabled={isProcessing || !files.some((f) => f.convertedBlob)}
              >
                <FileArchive size={14} /> Download ZIP
              </button>
              <button className="button button-primary" onClick={handleConvertAll} disabled={isProcessing}>
                {isProcessing ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
                <span>{isProcessing ? "Converting..." : "Convert All Files"}</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="converter-layout">
        {files.length === 0 ? (
          <div
            className="converter-empty-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
            }}
          >
            <div className="dropzone-icon-circle">
              <Upload size={32} />
            </div>
            <h3>Drag & Drop Files to Convert Format</h3>
            <p>Convert batch images between JPG, PNG, WebP, BMP, and TIFF instantaneously</p>
            <button className="button button-primary" onClick={() => fileInputRef.current?.click()}>
              <FileImage size={15} /> Select Images from Device
            </button>
          </div>
        ) : (
          <div className="converter-workspace">
            {/* Conversion Controls Strip */}
            <div className="converter-controls-bar">
              <div className="control-item">
                <span className="control-label">Convert To:</span>
                <select
                  className="converter-select"
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                >
                  {FORMAT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {targetFormat !== "image/png" && (
                <div className="control-item quality-item">
                  <div className="quality-header">
                    <span className="control-label">Quality:</span>
                    <span className="quality-val">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    className="converter-slider"
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                </div>
              )}

              <button
                className="button button-primary action-btn"
                onClick={handleConvertAll}
                disabled={isProcessing}
              >
                {isProcessing ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
                <span>Convert All ({files.length})</span>
              </button>
            </div>

            {/* Files Conversion Table */}
            <div className="converter-table-container">
              <table className="converter-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Original Format</th>
                    <th>Dimensions</th>
                    <th>Original Size</th>
                    <th>Target Format</th>
                    <th>Result Size</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((item) => {
                    const isDone = item.status === "done";
                    const targetExt = targetFormat.split("/")[1].toUpperCase();

                    return (
                      <tr key={item.id}>
                        <td className="file-name-cell">
                          <img src={item.url} alt="" className="table-thumb" />
                          <span>{item.name}</span>
                        </td>
                        <td>
                          <span className="format-badge original">
                            {item.originalType.split("/")[1]?.toUpperCase() || "IMAGE"}
                          </span>
                        </td>
                        <td>
                          {item.width} × {item.height}
                        </td>
                        <td>{formatBytes(item.originalSize)}</td>
                        <td>
                          <span className="format-badge target">→ {targetExt}</span>
                        </td>
                        <td>
                          {isDone ? (
                            <strong className="result-size">{formatBytes(item.convertedSize)}</strong>
                          ) : (
                            <span className="pending-text">Pending</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="table-download-btn"
                            disabled={!isDone}
                            onClick={() => handleDownloadSingle(item)}
                            title="Download file"
                          >
                            <Download size={14} /> Download
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
