import React from "react";
import { X, Command } from "lucide-react";
import "./ShortcutsModal.css";

const SHORTCUT_SECTIONS = [
  {
    title: "Tools (Single Key)",
    items: [
      { key: "V", desc: "Move / Transform Tool" },
      { key: "M", desc: "Marquee Selection" },
      { key: "L", desc: "Lasso Selection" },
      { key: "W", desc: "Magic Wand / Quick Selection" },
      { key: "C", desc: "Crop Tool" },
      { key: "I", desc: "Eyedropper" },
      { key: "B", desc: "Brush Tool" },
      { key: "E", desc: "Eraser Tool" },
      { key: "G", desc: "Gradient / Paint Bucket" },
      { key: "T", desc: "Type / Text Tool" },
      { key: "U", desc: "Shape Tool" },
      { key: "H", desc: "Hand / Pan View" },
      { key: "Z", desc: "Zoom Tool" },
      { key: "X", desc: "Swap Colors (FG/BG)" },
      { key: "D", desc: "Default Colors (Black/White)" },
    ],
  },
  {
    title: "Document & File",
    items: [
      { key: "Ctrl + N", desc: "New Project Document" },
      { key: "Ctrl + O", desc: "Open Image File" },
      { key: "Ctrl + S", desc: "Save Project (.photopro)" },
      { key: "Ctrl + E", desc: "Export Image Dialog" },
      { key: "Shift + Ctrl + E", desc: "Quick Export as PNG" },
      { key: "Ctrl + W", desc: "Close Document" },
    ],
  },
  {
    title: "Edit & Layers",
    items: [
      { key: "Ctrl + Z", desc: "Undo Last Action" },
      { key: "Ctrl + Y", desc: "Redo Last Action" },
      { key: "Ctrl + T", desc: "Free Transform Layer" },
      { key: "Ctrl + J", desc: "Duplicate Selected Layer" },
      { key: "Delete", desc: "Delete Layer / Clear Selection" },
      { key: "Ctrl + ]", desc: "Bring Layer Forward" },
      { key: "Ctrl + [", desc: "Send Layer Backward" },
      { key: "Ctrl + E", desc: "Merge Down with Lower Layer" },
    ],
  },
  {
    title: "Selections & View",
    items: [
      { key: "Ctrl + A", desc: "Select Entire Canvas" },
      { key: "Ctrl + D", desc: "Deselect Active Selection" },
      { key: "Shift + Ctrl + I", desc: "Invert Selection" },
      { key: "Ctrl + +", desc: "Zoom In" },
      { key: "Ctrl + -", desc: "Zoom Out" },
      { key: "Ctrl + 0", desc: "Fit to Screen" },
      { key: "Ctrl + 1", desc: "100% Actual Pixels" },
      { key: "Space + Drag", desc: "Pan Viewport Smoothly" },
    ],
  },
];

export default function ShortcutsModal({ onClose }) {
  return (
    <div className="shortcuts-modal-backdrop" onClick={onClose}>
      <div className="shortcuts-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <div className="shortcuts-title-row">
            <Command size={16} color="#0078d4" />
            <h3>Photoshop & Photopea Keyboard Shortcuts</h3>
          </div>
          <button className="shortcuts-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="shortcuts-modal-body">
          {SHORTCUT_SECTIONS.map((sec) => (
            <div key={sec.title} className="shortcuts-section-card">
              <h4>{sec.title}</h4>
              <div className="shortcuts-list">
                {sec.items.map((item) => (
                  <div key={item.key} className="shortcut-row">
                    <span className="shortcut-desc">{item.desc}</span>
                    <kbd className="shortcut-key">{item.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
