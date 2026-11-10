import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Eye,
  FolderOpen,
  History,
  Maximize2,
  Minimize2,
  Redo2,
  Save,
  SplitSquareVertical,
  Undo2,
} from "lucide-react";
import "./EditorTopBar.css";

export default function EditorTopBar({
  onExit,
  projectName = "Untitled Project",
  setProjectName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenProject,
  onSaveProject,
  onQuickExport,
  onOpenExportModal,
  onSelectAll,
  onDeselect,
  onDeleteSelected,
  onDuplicateSelected,
  onMergeDown,
  onFlatten,
  onAddMask,
  onInvertMask,
  onRotateCW,
  onRotateCCW,
  onFlipH,
  onFlipV,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onActualSize,
  showGrid,
  onToggleGrid,
  showRulers,
  onToggleRulers,
  beforeAfterOpen,
  onToggleBeforeAfter,
  historyPanelOpen,
  onToggleHistoryPanel,
  isFullscreen,
  onToggleFullscreen,
  onNewCanvas,
  onOpenImage,
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'file', 'edit', 'image', 'layer', 'filter', 'view'
  const menuContainerRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleMenuClick = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const runAndClose = (fn) => {
    setOpenMenu(null);
    if (fn) fn();
  };

  return (
    <header className="editor-topbar" ref={menuContainerRef}>
      <div className="topbar-left">
        <button className="topbar-nav-btn" onClick={onExit} title="Return to Dashboard">
          <ArrowLeft size={16} />
          <span>Exit</span>
        </button>

        <nav className="topbar-menus">
          {/* File Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "file" ? "active" : ""}`}
              onClick={() => handleMenuClick("file")}
            >
              File
            </button>
            {openMenu === "file" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(onNewCanvas)}>
                  <span>New Project</span>
                  <span className="item-shortcut">Ctrl+N</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onOpenImage)}>
                  <span>Open Image...</span>
                  <span className="item-shortcut">Ctrl+O</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onOpenProject)}>
                  <span>Open .photopro Project...</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onSaveProject)}>
                  <span>Save Project (.photopro)</span>
                  <span className="item-shortcut">Ctrl+S</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onQuickExport)}>
                  <span>Quick Export (PNG)</span>
                  <span className="item-shortcut">Shift+Ctrl+E</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onOpenExportModal)}>
                  <span>Export As...</span>
                  <span className="item-shortcut">Ctrl+E</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "edit" ? "active" : ""}`}
              onClick={() => handleMenuClick("edit")}
            >
              Edit
            </button>
            {openMenu === "edit" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" disabled={!canUndo} onClick={() => runAndClose(onUndo)}>
                  <span>Undo</span>
                  <span className="item-shortcut">Ctrl+Z</span>
                </button>
                <button className="dropdown-item" disabled={!canRedo} onClick={() => runAndClose(onRedo)}>
                  <span>Redo</span>
                  <span className="item-shortcut">Ctrl+Y</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onSelectAll)}>
                  <span>Select All</span>
                  <span className="item-shortcut">Ctrl+A</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onDeselect)}>
                  <span>Deselect</span>
                  <span className="item-shortcut">Ctrl+D</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onDeleteSelected)}>
                  <span>Delete Selected</span>
                  <span className="item-shortcut">Del</span>
                </button>
              </div>
            )}
          </div>

          {/* Image Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "image" ? "active" : ""}`}
              onClick={() => handleMenuClick("image")}
            >
              Image
            </button>
            {openMenu === "image" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(onRotateCW)}>
                  <span>Rotate 90° Clockwise</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onRotateCCW)}>
                  <span>Rotate 90° Counter-CW</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onFlipH)}>
                  <span>Flip Horizontal</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onFlipV)}>
                  <span>Flip Vertical</span>
                </button>
              </div>
            )}
          </div>

          {/* Layer Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "layer" ? "active" : ""}`}
              onClick={() => handleMenuClick("layer")}
            >
              Layer
            </button>
            {openMenu === "layer" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(onDuplicateSelected)}>
                  <span>Duplicate Layer</span>
                  <span className="item-shortcut">Ctrl+J</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onDeleteSelected)}>
                  <span>Delete Layer</span>
                  <span className="item-shortcut">Del</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onAddMask)}>
                  <span>Add Layer Mask</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onInvertMask)}>
                  <span>Invert Layer Mask</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onMergeDown)}>
                  <span>Merge Down</span>
                  <span className="item-shortcut">Ctrl+E</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onFlatten)}>
                  <span>Flatten Image</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "view" ? "active" : ""}`}
              onClick={() => handleMenuClick("view")}
            >
              View
            </button>
            {openMenu === "view" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(onZoomIn)}>
                  <span>Zoom In</span>
                  <span className="item-shortcut">Ctrl++</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onZoomOut)}>
                  <span>Zoom Out</span>
                  <span className="item-shortcut">Ctrl+-</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onFitScreen)}>
                  <span>Fit on Screen</span>
                  <span className="item-shortcut">Ctrl+0</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onActualSize)}>
                  <span>Actual Size (100%)</span>
                  <span className="item-shortcut">Ctrl+1</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onToggleRulers)}>
                  <span>{showRulers ? "Hide Rulers" : "Show Rulers"}</span>
                  <span className="item-shortcut">Ctrl+R</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onToggleGrid)}>
                  <span>{showGrid ? "Hide Grid" : "Show Grid"}</span>
                  <span className="item-shortcut">Ctrl+'</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onToggleFullscreen)}>
                  <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                  <span className="item-shortcut">F11</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Center Project Name & Undo/Redo */}
      <div className="topbar-center">
        <input
          type="text"
          className="project-name-input"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Untitled Project"
          title="Click to rename project"
        />

        <div className="topbar-quick-actions">
          <button
            className="topbar-icon-btn"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            className="topbar-icon-btn"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
          <button
            className={`topbar-icon-btn ${historyPanelOpen ? "active" : ""}`}
            onClick={onToggleHistoryPanel}
            title="History Panel"
          >
            <History size={16} />
          </button>
          <button
            className={`topbar-icon-btn ${beforeAfterOpen ? "active" : ""}`}
            onClick={onToggleBeforeAfter}
            title="Compare Before/After"
          >
            <SplitSquareVertical size={16} />
          </button>
        </div>
      </div>

      {/* Right Actions: Fullscreen & Export */}
      <div className="topbar-right">
        <button
          className="topbar-icon-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>

        <button className="topbar-export-btn" onClick={onOpenExportModal}>
          <Download size={15} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
