import "./BeforeAfterSlider.css";
import { useState, useRef, useEffect } from "react";
import { X, SplitSquareVertical } from "lucide-react";

function BeforeAfterSlider({ originalSrc, currentCanvas, onClose }) {
  const [sliderPos, setSliderPos] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    updatePosition(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    updatePosition(e);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const updatePosition = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  };

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, []);

  const currentSrc = currentCanvas?.toDataURL("image/jpeg", 0.92) || "";

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="before-after-modal">
        <div className="modal-heading">
          <div>
            <span className="eyebrow"><span className="eyebrow-line" /> SPLIT COMPARISON</span>
            <h3>Before & After Comparison</h3>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div
          ref={containerRef}
          className="before-after-container"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        >
          {/* After image (Current edits) */}
          <img src={currentSrc} alt="After edits" className="ba-image after-img" />

          {/* Before image (Original) clipped to slider position */}
          <div className="ba-before-wrapper" style={{ width: `${sliderPos}%` }}>
            <img src={originalSrc} alt="Before edits" className="ba-image before-img" />
            <span className="ba-tag tag-before">ORIGINAL</span>
          </div>

          <span className="ba-tag tag-after">EDITED</span>

          {/* Divider Handle */}
          <div className="ba-divider-line" style={{ left: `${sliderPos}%` }}>
            <div className="ba-handle-knob">
              <SplitSquareVertical size={16} />
            </div>
          </div>
        </div>

        <div className="ba-footer-hint">
          <span>Drag slider left or right to inspect adjustments</span>
        </div>
      </div>
    </div>
  );
}

export default BeforeAfterSlider;
