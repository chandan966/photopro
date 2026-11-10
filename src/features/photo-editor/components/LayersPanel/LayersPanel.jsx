import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Lock,
  Plus,
  Square,
  Trash2,
  Type,
  Unlock,
} from "lucide-react";
import "./LayersPanel.css";

const BLEND_MODES = [
  { id: "normal", label: "Normal" },
  { id: "multiply", label: "Multiply" },
  { id: "screen", label: "Screen" },
  { id: "overlay", label: "Overlay" },
  { id: "soft-light", label: "Soft Light" },
  { id: "hard-light", label: "Hard Light" },
  { id: "darken", label: "Darken" },
  { id: "lighten", label: "Lighten" },
  { id: "color-dodge", label: "Color Dodge" },
  { id: "color-burn", label: "Color Burn" },
  { id: "difference", label: "Difference" },
  { id: "exclusion", label: "Exclusion" },
  { id: "hue", label: "Hue" },
  { id: "saturation", label: "Saturation" },
  { id: "color", label: "Color" },
  { id: "luminosity", label: "Luminosity" },
];

export default function LayersPanel({
  layers = [],
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onAddLayer,
  onDuplicateLayer,
  onDeleteLayer,
  onMoveLayer,
  onToggleVisibility,
  onToggleLock,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  const handleStartRename = (layer) => {
    setEditingId(layer.id);
    setEditName(layer.name || "Layer");
  };

  const handleFinishRename = (id) => {
    if (editingId && editName.trim()) {
      onUpdateLayer?.(id, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const getLayerIcon = (type) => {
    switch (type) {
      case "text":
        return <Type size={16} color="#38bdf8" />;
      case "shape":
        return <Square size={16} color="#fbbf24" />;
      case "paint":
        return <Layers size={16} color="#f43f5e" />;
      default:
        return <ImageIcon size={16} color="#94a3b8" />;
    }
  };

  // Render list top-to-bottom so highest layer is visually at the top
  const reversedLayers = [...layers].reverse();

  return (
    <div className="layers-panel">
      {/* Top Header: Blend Mode & Opacity for Selected Layer */}
      <div className="layers-header">
        <div className="layers-controls-row">
          <label className="layers-select-label">Mode:</label>
          <select
            className="layers-blend-select"
            value={selectedLayer?.blendMode || "normal"}
            disabled={!selectedLayer}
            onChange={(e) => onUpdateLayer?.(selectedLayerId, { blendMode: e.target.value })}
          >
            {BLEND_MODES.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        <div className="layers-slider-group">
          <span className="layers-select-label">Opacity:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={selectedLayer ? Math.round((selectedLayer.opacity ?? 1) * 100) : 100}
            disabled={!selectedLayer}
            onChange={(e) => onUpdateLayer?.(selectedLayerId, { opacity: Number(e.target.value) / 100 })}
          />
          <span className="layers-slider-val">
            {selectedLayer ? Math.round((selectedLayer.opacity ?? 1) * 100) : 100}%
          </span>
        </div>
      </div>

      {/* Layer Deck */}
      <div className="layers-list">
        {layers.length === 0 ? (
          <div style={{ textAlign: "center", color: "#64748b", fontSize: "12px", marginTop: "24px" }}>
            No layers. Add an image or text.
          </div>
        ) : (
          reversedLayers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;
            const isEditing = editingId === layer.id;

            return (
              <div
                key={layer.id}
                className={`layer-item ${isSelected ? "active" : ""} ${layer.locked ? "locked" : ""}`}
                onClick={() => onSelectLayer?.(layer.id)}
              >
                {/* Thumbnail */}
                <div className="layer-thumb-container">
                  {layer.url ? (
                    <img src={layer.url} alt="Layer thumbnail" className="layer-thumbnail-img" />
                  ) : (
                    getLayerIcon(layer.type)
                  )}
                </div>

                {/* Layer Name / Renaming */}
                <div className="layer-info" onDoubleClick={() => handleStartRename(layer)}>
                  {isEditing ? (
                    <input
                      type="text"
                      className="layer-name-input"
                      value={editName}
                      autoFocus
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleFinishRename(layer.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleFinishRename(layer.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <>
                      <span className="layer-name-text">{layer.name || "Layer"}</span>
                      <span className="layer-meta-badge">
                        {layer.type} • {layer.blendMode || "Normal"}
                      </span>
                    </>
                  )}
                </div>

                {/* Visibility & Lock Actions */}
                <div className="layer-actions">
                  <button
                    className={`layer-action-icon-btn ${layer.visible !== false ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility?.(layer.id);
                    }}
                    title={layer.visible !== false ? "Hide Layer" : "Show Layer"}
                  >
                    {layer.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    className={`layer-action-icon-btn ${layer.locked ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock?.(layer.id);
                    }}
                    title={layer.locked ? "Unlock Layer" : "Lock Layer"}
                  >
                    {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="layers-bottom-actions">
        <button
          className="layers-footer-btn"
          disabled={!selectedLayerId}
          onClick={() => onMoveLayer?.("up")}
          title="Move Layer Up"
        >
          <ArrowUp size={15} />
        </button>
        <button
          className="layers-footer-btn"
          disabled={!selectedLayerId}
          onClick={() => onMoveLayer?.("down")}
          title="Move Layer Down"
        >
          <ArrowDown size={15} />
        </button>
        <button
          className="layers-footer-btn"
          disabled={!selectedLayerId}
          onClick={onDuplicateLayer}
          title="Duplicate Layer (Ctrl+J)"
        >
          <Copy size={15} />
        </button>
        <button
          className="layers-footer-btn"
          onClick={onAddLayer}
          title="New Blank Layer"
        >
          <Plus size={16} />
        </button>
        <button
          className="layers-footer-btn"
          disabled={!selectedLayerId}
          onClick={onDeleteLayer}
          title="Delete Layer (Del)"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
