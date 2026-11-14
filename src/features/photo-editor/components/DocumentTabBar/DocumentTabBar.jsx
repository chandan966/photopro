import React from "react";
import { Plus, X, FileImage } from "lucide-react";
import "./DocumentTabBar.css";

export default function DocumentTabBar({
  projectName = "Untitled-1.psd",
  zoom = 100,
  hasContent = false,
  onNewDocument,
  onCloseDocument,
}) {
  return (
    <div className="document-tab-bar" role="tablist">
      <div className="tab-items-wrapper">
        <div className="document-tab-item active" role="tab" aria-selected="true">
          <FileImage size={13} className="tab-icon" />
          <span className="tab-title">
            {projectName} @ {Math.round(zoom)}% (RGB/8)
          </span>
          <button
            className="tab-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onCloseDocument?.();
            }}
            title="Close Document (Ctrl+W)"
          >
            <X size={11} />
          </button>
        </div>

        {/* Plus Button to Open New Project Modal */}
        <button
          className="tab-new-btn"
          onClick={onNewDocument}
          title="New Project / Document (Ctrl+N)"
          aria-label="New Project"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
