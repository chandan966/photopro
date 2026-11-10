import React from "react";
import { History as HistoryIcon, RotateCcw } from "lucide-react";
import "./HistoryPanel.css";

export default function HistoryPanel({
  history = [],
  currentIndex = 0,
  onJumpToState,
}) {
  return (
    <div className="history-panel">
      <div className="history-panel-header">
        <span>History States ({history.length})</span>
      </div>

      <div className="history-items-list">
        {history.length === 0 ? (
          <div style={{ textAlign: "center", color: "#64748b", fontSize: "11px", marginTop: "20px" }}>
            No history states yet.
          </div>
        ) : (
          history.map((item, idx) => {
            const isActive = idx === history.length - 1;
            return (
              <button
                key={idx}
                className={`history-item-btn ${isActive ? "active" : ""}`}
                onClick={() => onJumpToState?.(idx)}
              >
                <span className="history-step-num">{idx + 1}</span>
                <HistoryIcon size={13} />
                <span>{item.actionName || `Action #${idx + 1}`}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
