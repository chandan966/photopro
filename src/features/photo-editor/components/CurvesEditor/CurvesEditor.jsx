import React, { useRef, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { buildSplineLUT } from "../../services/adjustmentEngine.js";
import "./CurvesEditor.css";

const DEFAULT_CURVES = {
  rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
};

export default function CurvesEditor({ curves = DEFAULT_CURVES, onChange, histogram = null }) {
  const [activeChannel, setActiveChannel] = useState("rgb"); // 'rgb', 'red', 'green', 'blue'
  const canvasRef = useRef(null);
  const dragPointIndexRef = useRef(null);

  const currentPoints = curves[activeChannel] || [{ x: 0, y: 0 }, { x: 255, y: 255 }];

  // Draw Curves Graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Grid lines (4x4)
    ctx.strokeStyle = "#1e2430";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const pos = Math.round((i / 4) * w);
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(w, pos);
      ctx.stroke();
    }

    // 2. Diagonal neutral baseline
    ctx.strokeStyle = "#2d3748";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw Histogram in background if available
    if (histogram && histogram.lumHist && histogram.maxCount > 0) {
      ctx.fillStyle = "rgba(100, 116, 139, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < 256; i++) {
        const histH = (histogram.lumHist[i] / histogram.maxCount) * (h * 0.7);
        const x = (i / 255) * w;
        ctx.lineTo(x, h - histH);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Calculate Spline LUT and plot curve
    const lut = buildSplineLUT(currentPoints);
    let curveColor = "#ffffff";
    if (activeChannel === "red") curveColor = "#ef4444";
    if (activeChannel === "green") curveColor = "#22c55e";
    if (activeChannel === "blue") curveColor = "#3b82f6";

    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      const cx = (i / 255) * w;
      const cy = h - (lut[i] / 255) * h;
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // 5. Draw Control Points
    currentPoints.forEach((p, idx) => {
      const px = (p.x / 255) * w;
      const py = h - (p.y / 255) * h;

      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = curveColor;
      ctx.fill();
      ctx.strokeStyle = "#090b0e";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [currentPoints, activeChannel, histogram]);

  // Pointer interaction
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = Math.max(0, Math.min(255, Math.round(((clientX - rect.left) / rect.width) * 255)));
    const y = Math.max(0, Math.min(255, Math.round((1 - (clientY - rect.top) / rect.height) * 255)));
    return { x, y };
  };

  const handlePointerDown = (e) => {
    const { x, y } = getCanvasCoords(e);

    // Check if clicked an existing point (within 12 units distance)
    const hitIndex = currentPoints.findIndex((p) => Math.hypot(p.x - x, p.y - y) < 14);

    if (hitIndex >= 0) {
      dragPointIndexRef.current = hitIndex;
    } else {
      // Add new point and start dragging it
      const newPoints = [...currentPoints, { x, y }].sort((a, b) => a.x - b.x);
      dragPointIndexRef.current = newPoints.findIndex((p) => p.x === x && p.y === y);
      onChange?.({ ...curves, [activeChannel]: newPoints });
    }
  };

  const handlePointerMove = (e) => {
    if (dragPointIndexRef.current === null) return;
    const idx = dragPointIndexRef.current;
    const { x, y } = getCanvasCoords(e);

    const updated = [...currentPoints];
    // Keep first and last points anchored to X=0 and X=255
    if (idx === 0) {
      updated[0] = { x: 0, y };
    } else if (idx === updated.length - 1) {
      updated[updated.length - 1] = { x: 255, y };
    } else {
      updated[idx] = { x, y };
    }

    onChange?.({ ...curves, [activeChannel]: updated });
  };

  const handlePointerUp = () => {
    dragPointIndexRef.current = null;
  };

  const handleResetChannel = () => {
    onChange?.({
      ...curves,
      [activeChannel]: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
    });
  };

  return (
    <div className="curves-editor">
      <div className="curves-header">
        <div className="curves-channel-tabs">
          {["rgb", "red", "green", "blue"].map((ch) => (
            <button
              key={ch}
              className={`curves-tab-btn ${activeChannel === ch ? `active-${ch}` : ""}`}
              onClick={() => setActiveChannel(ch)}
            >
              {ch.toUpperCase()}
            </button>
          ))}
        </div>

        <button className="curves-reset-btn" onClick={handleResetChannel} title="Reset Curve">
          <RotateCcw size={12} />
        </button>
      </div>

      <div className="curves-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={256}
          height={256}
          className="curves-canvas"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <span className="curves-hint">Click on curve to add points. Drag to shape tone curve.</span>
    </div>
  );
}
