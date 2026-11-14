import React from "react";
import {
  Crop,
  Eraser,
  Hand,
  Lasso,
  Move,
  Paintbrush,
  Palette,
  Pipette,
  Scissors,
  Sparkles,
  Square,
  Stamp,
  SunMedium,
  Type,
  Wand2,
  ZoomIn,
} from "lucide-react";
import "./EditorToolbar.css";

export default function EditorToolbar({
  activeTool,
  setActiveTool,
  foregroundColor = "#0ea5e9",
  backgroundColor = "#ffffff",
  onSwapColors,
  onResetColors,
  onOpenColorPicker,
}) {
  const tools = [
    { id: "move", label: "Move & Transform", icon: Move, shortcut: "V" },
    { id: "marquee", label: "Marquee Selection", icon: Square, shortcut: "M" },
    { id: "lasso", label: "Lasso Selection", icon: Lasso, shortcut: "L" },
    { id: "wand", label: "Magic Wand", icon: Wand2, shortcut: "W" },
    { id: "crop", label: "Crop & Straighten", icon: Crop, shortcut: "C" },
    { divider: true },
    { id: "eyedropper", label: "Eyedropper", icon: Pipette, shortcut: "I" },
    { id: "brush", label: "Brush Tool", icon: Paintbrush, shortcut: "B" },
    { id: "eraser", label: "Eraser Tool", icon: Eraser, shortcut: "E" },
    { id: "clone", label: "Clone Stamp", icon: Stamp, shortcut: "S" },
    { id: "healing", label: "Spot Healing", icon: Sparkles, shortcut: "J" },
    { id: "dodge", label: "Dodge / Burn / Sponge", icon: SunMedium, shortcut: "O" },
    { divider: true },
    { id: "text", label: "Type Tool", icon: Type, shortcut: "T" },
    { id: "shape", label: "Vector Shapes", icon: Square, shortcut: "U" },
    { divider: true },
    { id: "pan", label: "Hand / Pan View", icon: Hand, shortcut: "H" },
    { id: "zoom", label: "Zoom Tool", icon: ZoomIn, shortcut: "Z" },
  ];

  return (
    <aside className="editor-toolbar">
      <div className="toolbar-btn-group">
        {tools.map((item, idx) => {
          if (item.divider) {
            return <div key={`div-${idx}`} className="toolbar-divider" />;
          }

          const IconComp = item.icon;
          const isActive = activeTool === item.id;

          return (
            <button
              key={item.id}
              className={`toolbar-btn ${isActive ? "active" : ""}`}
              onClick={() => setActiveTool(item.id)}
              title={`${item.label} (${item.shortcut})`}
              aria-label={item.label}
            >
              <IconComp size={18} />
              <span className="toolbar-shortcut-badge">{item.shortcut}</span>
            </button>
          );
        })}
      </div>

      {/* Foreground / Background Color Swatch Widget */}
      <div className="toolbar-color-swatches" title="Color Swatches">
        <button
          className="swatch-swap-btn"
          onClick={onSwapColors}
          title="Switch Foreground and Background Colors (X)"
        >
          ⇄
        </button>
        <button
          className="swatch-reset-btn"
          onClick={onResetColors}
          title="Default Colors (Black/White) (D)"
        >
          ■
        </button>
        <div
          className="swatch-fg"
          style={{ backgroundColor: foregroundColor }}
          onClick={() => onOpenColorPicker?.("foreground")}
          title={`Foreground Color: ${foregroundColor} (Click to change)`}
        />
        <div
          className="swatch-bg"
          style={{ backgroundColor: backgroundColor }}
          onClick={() => onOpenColorPicker?.("background")}
          title={`Background Color: ${backgroundColor} (Click to change)`}
        />
      </div>
    </aside>
  );
}
