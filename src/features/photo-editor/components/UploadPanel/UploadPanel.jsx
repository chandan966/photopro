import React, { useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Minimize,
  FolderOpen,
  Plus,
  RefreshCw,
} from "lucide-react";
import "./UploadPanel.css";

export default function UploadPanel({
  onUploadImage, // (file, mode: 'replace' | 'layer')
  onRotateCW,
  onRotateCCW,
  onRotate180,
  onFlipH,
  onFlipV,
  onFitCanvas,
  onFillCanvas,
  onResetImage,
  onOpenProjectFile,
}) {
  const fileInputRef = useRef(null);
  const layerInputRef = useRef(null);
  const projectInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      onUploadImage?.(files[0], "replace");
    }
  };

  return (
    <div className="upload-panel">
      <div className="upload-header">
        <h3>Image & Asset Manager</h3>
        <p>Import photos, manage layer overlays, and apply instant transformations.</p>
      </div>

      {/* 1. MAIN DROPZONE */}
      <div
        className="upload-dropzone-box"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={32} className="upload-drop-icon" />
        <strong>Drop Photos Here or Browse</strong>
        <span>Supports JPG, PNG, WebP, SVG (up to 50 MB)</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            if (e.target.files?.length) {
              onUploadImage?.(e.target.files[0], "replace");
            }
          }}
        />
      </div>

      {/* 2. UPLOAD MODES */}
      <div className="upload-section">
        <div className="upload-section-title">
          <Plus size={14} /> Add Additional Overlays
        </div>
        <button
          className="button button-outline button-small full-width"
          onClick={() => layerInputRef.current?.click()}
        >
          <ImageIcon size={14} /> Add Image as New Layer
        </button>
        <input
          ref={layerInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            if (e.target.files?.length) {
              onUploadImage?.(e.target.files[0], "layer");
            }
          }}
        />
      </div>

      {/* 3. INSTANT TRANSFORMATIONS */}
      <div className="upload-section">
        <div className="upload-section-title">
          <RotateCw size={14} /> Rotate & Flip
        </div>
        <div className="transform-buttons-grid">
          <button className="button button-outline button-small" onClick={onRotateCW} title="Rotate 90 degrees clockwise">
            <RotateCw size={13} /> Rotate 90°
          </button>
          <button className="button button-outline button-small" onClick={onRotateCCW} title="Rotate 90 degrees counter-clockwise">
            <RotateCcw size={13} /> Rotate -90°
          </button>
          <button className="button button-outline button-small" onClick={onRotate180} title="Rotate 180 degrees upside down">
            <RefreshCw size={13} /> Rotate 180°
          </button>
          <button className="button button-outline button-small" onClick={onFlipH} title="Flip horizontally">
            <FlipHorizontal size={13} /> Flip H
          </button>
          <button className="button button-outline button-small" onClick={onFlipV} title="Flip vertically">
            <FlipVertical size={13} /> Flip V
          </button>
        </div>
      </div>

      {/* 4. CANVAS FITTING & RESET */}
      <div className="upload-section">
        <div className="upload-section-title">
          <Maximize size={14} /> Scale & Fitting
        </div>
        <div className="fitting-buttons-grid">
          <button className="button button-outline button-small" onClick={onFitCanvas}>
            <Minimize size={13} /> Fit to Canvas
          </button>
          <button className="button button-outline button-small" onClick={onFillCanvas}>
            <Maximize size={13} /> Fill Canvas
          </button>
          <button className="button button-outline button-small full-width" onClick={onResetImage}>
            <RefreshCw size={13} /> Reset Image to Original
          </button>
        </div>
      </div>

      {/* 5. OPEN PROJECT FILE */}
      <div className="upload-section">
        <div className="upload-section-title">
          <FolderOpen size={14} /> Reopen Saved Projects
        </div>
        <button
          className="button button-outline button-small full-width"
          onClick={() => projectInputRef.current?.click()}
        >
          <FolderOpen size={14} /> Open .photopro Project
        </button>
        <input
          ref={projectInputRef}
          type="file"
          accept=".photopro,.json"
          hidden
          onChange={(e) => {
            if (e.target.files?.length) {
              onOpenProjectFile?.(e.target.files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}
