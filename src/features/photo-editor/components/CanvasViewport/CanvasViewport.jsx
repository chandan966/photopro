import React, { useRef, useEffect, useState } from "react";
import "./CanvasViewport.css";

export default function CanvasViewport({
  canvasRef,
  zoom = 100,
  pan = { x: 0, y: 0 },
  onPanChange,
  onZoomChange,
  showRulers = false,
  showGrid = false,
  isCropping = false,
  activeTool = "move",
  onCursorMove,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) {
  const containerRef = useRef(null);
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Handle Wheel Zoom & Wheel Pan
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const delta = e.deltaY < 0 ? 10 : -10;
      onZoomChange?.(Math.max(10, Math.min(500, zoom + delta)));
    } else {
      // Pan
      onPanChange?.({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  const handleMouseDown = (e) => {
    // If Spacebar held or activeTool is 'pan' or Middle click
    if (activeTool === "pan" || e.button === 1 || e.spaceKey) {
      isPanningRef.current = true;
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }
    onPointerDown?.(e);
  };

  const handleMouseMove = (e) => {
    if (isPanningRef.current) {
      onPanChange?.({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
      return;
    }

    // Report canvas cursor coordinates
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      onCursorMove?.({ x, y });
    }

    onPointerMove?.(e);
  };

  const handleMouseUp = (e) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }
    onPointerUp?.(e);
  };

  return (
    <div
      ref={containerRef}
      className="canvas-viewport-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: activeTool === "pan" ? "grab" : "default",
      }}
    >
      {/* Top and Left Rulers */}
      {showRulers && (
        <>
          <div className="viewport-ruler-corner" />
          <div className="viewport-ruler-top" />
          <div className="viewport-ruler-left" />
        </>
      )}

      {/* Canvas Stage */}
      <div
        className="canvas-viewport-stage"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
        }}
      >
        <canvas ref={canvasRef} className="main-stage-canvas" />

        {/* Grid Overlay */}
        {showGrid && <div className="viewport-grid-overlay" />}

        {/* Crop Overlay with Rule of Thirds */}
        {isCropping && (
          <div className="viewport-crop-overlay">
            <div className="crop-rule-third-h1" />
            <div className="crop-rule-third-h2" />
            <div className="crop-rule-third-v1" />
            <div className="crop-rule-third-v2" />
          </div>
        )}
      </div>
    </div>
  );
}
