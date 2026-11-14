import React, { useState } from "react";
import { X, Lock, Unlock } from "lucide-react";
import "./ResizeDialogs.css";

/**
 * ImageSizeModal - Photopea / Photoshop Image Size Dialog
 */
export function ImageSizeModal({
  currentWidth = 1920,
  currentHeight = 1080,
  onApply,
  onClose,
}) {
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [lockAspect, setLockAspect] = useState(true);
  const [resample, setResample] = useState(true);

  const aspectRatio = currentWidth / currentHeight;

  const handleWidthChange = (val) => {
    const newW = Number(val);
    setWidth(newW);
    if (lockAspect && newW > 0) {
      setHeight(Math.round(newW / aspectRatio));
    }
  };

  const handleHeightChange = (val) => {
    const newH = Number(val);
    setHeight(newH);
    if (lockAspect && newH > 0) {
      setWidth(Math.round(newH * aspectRatio));
    }
  };

  const handleOk = () => {
    const finalW = Math.max(10, Math.min(8000, width));
    const finalH = Math.max(10, Math.min(8000, height));
    onApply?.(finalW, finalH, resample);
    onClose();
  };

  return (
    <div className="resize-modal-backdrop" onClick={onClose}>
      <div className="resize-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="resize-modal-header">
          <h3>Image Size</h3>
          <button className="resize-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="resize-modal-body">
          <div className="resize-info-row">
            <span>Original Size:</span>
            <b>{currentWidth} × {currentHeight} px</b>
          </div>

          <div className="resize-form-row">
            <label>Width:</label>
            <input
              type="number"
              className="resize-input"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
              min="10"
              max="8000"
            />
            <span className="resize-unit">Pixels</span>
          </div>

          <div className="resize-lock-row">
            <button
              className={`resize-lock-btn ${lockAspect ? "active" : ""}`}
              onClick={() => setLockAspect((v) => !v)}
              title="Constrain Proportions"
            >
              {lockAspect ? <Lock size={14} /> : <Unlock size={14} />}
              <span>{lockAspect ? "Aspect Ratio Locked" : "Aspect Ratio Free"}</span>
            </button>
          </div>

          <div className="resize-form-row">
            <label>Height:</label>
            <input
              type="number"
              className="resize-input"
              value={height}
              onChange={(e) => handleHeightChange(e.target.value)}
              min="10"
              max="8000"
            />
            <span className="resize-unit">Pixels</span>
          </div>

          <div className="resize-checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={resample}
                onChange={(e) => setResample(e.target.checked)}
              />
              <span>Resample Image Layers</span>
            </label>
          </div>
        </div>

        <div className="resize-modal-footer">
          <button className="resize-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="resize-btn-ok" onClick={handleOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * CanvasSizeModal - Photopea / Photoshop Canvas Size Dialog
 */
export function CanvasSizeModal({
  currentWidth = 1920,
  currentHeight = 1080,
  onApply,
  onClose,
}) {
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [anchor, setAnchor] = useState("center"); // 'top-left', 'top', 'top-right', 'center', etc.
  const [canvasBg, setCanvasBg] = useState("transparent");

  const handleOk = () => {
    const finalW = Math.max(10, Math.min(8000, width));
    const finalH = Math.max(10, Math.min(8000, height));
    onApply?.(finalW, finalH, anchor, canvasBg);
    onClose();
  };

  return (
    <div className="resize-modal-backdrop" onClick={onClose}>
      <div className="resize-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="resize-modal-header">
          <h3>Canvas Size</h3>
          <button className="resize-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="resize-modal-body">
          <div className="resize-info-row">
            <span>Current Canvas:</span>
            <b>{currentWidth} × {currentHeight} px</b>
          </div>

          <div className="resize-form-row">
            <label>New Width:</label>
            <input
              type="number"
              className="resize-input"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min="10"
              max="8000"
            />
            <span className="resize-unit">Pixels</span>
          </div>

          <div className="resize-form-row">
            <label>New Height:</label>
            <input
              type="number"
              className="resize-input"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min="10"
              max="8000"
            />
            <span className="resize-unit">Pixels</span>
          </div>

          <div className="resize-form-row">
            <label>Canvas Extension:</label>
            <select
              className="resize-input"
              value={canvasBg}
              onChange={(e) => setCanvasBg(e.target.value)}
            >
              <option value="transparent">Transparent</option>
              <option value="#ffffff">White</option>
              <option value="#000000">Black</option>
              <option value="#808080">Gray</option>
            </select>
          </div>
        </div>

        <div className="resize-modal-footer">
          <button className="resize-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="resize-btn-ok" onClick={handleOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
