import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Eye,
  FolderOpen,
  HelpCircle,
  History,
  Maximize2,
  Minimize2,
  Moon,
  Redo2,
  RotateCcw,
  Save,
  SplitSquareVertical,
  Sun,
  Undo2,
} from "lucide-react";
import "./EditorTopBar.css";

export default function EditorTopBar({
  onExit,
  projectName = "Untitled-1.psd",
  setProjectName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetImage,
  themeMode = "dark",
  onToggleTheme,
  onOpenProject,
  onSaveProject,
  onQuickExport,
  onOpenExportModal,
  onSelectAll,
  onDeselect,
  onInvertSelection,
  onDeleteSelected,
  onDuplicateSelected,
  onMergeDown,
  onFlatten,
  onAddMask,
  onInvertMask,
  onRotateCW,
  onRotateCCW,
  onRotate180,
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
  onOpenImageSize,
  onOpenCanvasSize,
  onOpenShortcuts,
  onSelectTab,
  onApplyFilterEffect,
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'file', 'edit', 'image', 'layer', 'select', 'filter', 'view', 'window', 'more'
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
          <ArrowLeft size={15} />
          <span>Exit</span>
        </button>

        <nav className="topbar-menus" role="menubar">
          {/* 1. File Menu */}
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
                  <span>New...</span>
                  <span className="item-shortcut">Ctrl+N</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onOpenImage)}>
                  <span>Open Image...</span>
                  <span className="item-shortcut">Ctrl+O</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onOpenProject)}>
                  <span>Open .photopro / PSD...</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onSaveProject)}>
                  <span>Save Project (.photopro)</span>
                  <span className="item-shortcut">Ctrl+S</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onQuickExport)}>
                  <span>Quick Export as PNG</span>
                  <span className="item-shortcut">Shift+Ctrl+E</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onOpenExportModal)}>
                  <span>Export As... (JPG, WEBP, SVG, PDF)</span>
                  <span className="item-shortcut">Ctrl+E</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onExit)}>
                  <span>Close Window</span>
                  <span className="item-shortcut">Ctrl+W</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Edit Menu */}
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
                <button className="dropdown-item" onClick={() => runAndClose(onRotateCW)}>
                  <span>Rotate 90° Clockwise</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onRotateCCW)}>
                  <span>Rotate 90° Counter-Clockwise</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onRotate180)}>
                  <span>Rotate 180°</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onFlipH)}>
                  <span>Flip Horizontal</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onFlipV)}>
                  <span>Flip Vertical</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onDeleteSelected)}>
                  <span>Clear / Delete Selected</span>
                  <span className="item-shortcut">Del</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Image Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "image" ? "active" : ""}`}
              onClick={() => handleMenuClick("image")}
            >
              Image
            </button>
            {openMenu === "image" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("adjustments"))}>
                  <span>Adjustments (Lightroom &amp; Curves)</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onOpenImageSize)}>
                  <span>Image Size...</span>
                  <span className="item-shortcut">Alt+Ctrl+I</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onOpenCanvasSize)}>
                  <span>Canvas Size...</span>
                  <span className="item-shortcut">Alt+Ctrl+C</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onResetImage)}>
                  <span>Revert to Original State</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Layer Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "layer" ? "active" : ""}`}
              onClick={() => handleMenuClick("layer")}
            >
              Layer
            </button>
            {openMenu === "layer" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("layers"))}>
                  <span>New Raster Layer</span>
                  <span className="item-shortcut">Shift+Ctrl+N</span>
                </button>
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

          {/* 5. Select Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "select" ? "active" : ""}`}
              onClick={() => handleMenuClick("select")}
            >
              Select
            </button>
            {openMenu === "select" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(onSelectAll)}>
                  <span>All</span>
                  <span className="item-shortcut">Ctrl+A</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onDeselect)}>
                  <span>Deselect</span>
                  <span className="item-shortcut">Ctrl+D</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(onInvertSelection)}>
                  <span>Inverse</span>
                  <span className="item-shortcut">Shift+Ctrl+I</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("background"))}>
                  <span>Magic Wand &amp; Background Studio...</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. Filter Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "filter" ? "active" : ""}`}
              onClick={() => handleMenuClick("filter")}
            >
              Filter
            </button>
            {openMenu === "filter" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(() => onApplyFilterEffect?.("gaussian-blur"))}>
                  <span>Gaussian Blur...</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onApplyFilterEffect?.("motion-blur"))}>
                  <span>Motion Blur...</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onApplyFilterEffect?.("unsharp-mask"))}>
                  <span>Unsharp Mask (Sharpen)...</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(() => onApplyFilterEffect?.("oil-painting"))}>
                  <span>Oil Painting (Kuwahara)...</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onApplyFilterEffect?.("sketch"))}>
                  <span>Pencil Sketch...</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onApplyFilterEffect?.("cartoon"))}>
                  <span>Cartoon (Sobel Edges)...</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onApplyFilterEffect?.("neon"))}>
                  <span>Neon Glow Bloom...</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onApplyFilterEffect?.("glitch"))}>
                  <span>Glitch Effect (RGB Shift)...</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onApplyFilterEffect?.("pixelate"))}>
                  <span>Pixelate / Mosaic...</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("filters"))}>
                  <span>Preset Filters Gallery...</span>
                </button>
              </div>
            )}
          </div>

          {/* 7. View Menu */}
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
                <button className="dropdown-item" onClick={() => runAndClose(onToggleBeforeAfter)}>
                  <span>{beforeAfterOpen ? "Hide Before/After" : "Compare Before/After"}</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onToggleFullscreen)}>
                  <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                  <span className="item-shortcut">F11</span>
                </button>
              </div>
            )}
          </div>

          {/* 8. Window Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "window" ? "active" : ""}`}
              onClick={() => handleMenuClick("window")}
            >
              Window
            </button>
            {openMenu === "window" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("layers"))}>
                  <span>Layers Panel</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("adjustments"))}>
                  <span>Adjustments &amp; Color Grading</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("history"))}>
                  <span>History Panel</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("background"))}>
                  <span>Background Studio</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("templates"))}>
                  <span>Canva Templates Panel</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("filters"))}>
                  <span>Filters Panel</span>
                </button>
                <button className="dropdown-item" onClick={() => runAndClose(() => onSelectTab?.("effects"))}>
                  <span>Effects Panel</span>
                </button>
              </div>
            )}
          </div>

          {/* 9. Help / More Menu */}
          <div className="menu-item-wrapper">
            <button
              className={`topbar-menu-btn ${openMenu === "more" ? "active" : ""}`}
              onClick={() => handleMenuClick("more")}
            >
              More
            </button>
            {openMenu === "more" && (
              <div className="topbar-dropdown-menu">
                <button className="dropdown-item" onClick={() => runAndClose(onOpenShortcuts)}>
                  <span>Keyboard Shortcuts...</span>
                  <span className="item-shortcut">?</span>
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => runAndClose(onToggleTheme)}>
                  <span>Theme: {themeMode === "dark" ? "Pro Dark (Active)" : "Light (Active)"}</span>
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
          placeholder="Untitled-1.psd"
          title="Click to rename document"
        />

        <div className="topbar-quick-actions">
          <button
            className="topbar-icon-btn"
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={15} />
          </button>
          <button
            className="topbar-icon-btn"
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={15} />
          </button>
          <button
            className="topbar-icon-btn"
            onClick={onResetImage}
            title="Reset Image to Original State"
          >
            <RotateCcw size={15} />
          </button>
          <button
            className={`topbar-icon-btn ${beforeAfterOpen ? "active" : ""}`}
            onClick={onToggleBeforeAfter}
            title="Compare Before/After"
          >
            <SplitSquareVertical size={15} />
          </button>
          <button
            className={`topbar-icon-btn ${historyPanelOpen ? "active" : ""}`}
            onClick={onToggleHistoryPanel}
            title="History Panel"
          >
            <History size={15} />
          </button>
          <button
            className="topbar-icon-btn"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle size={15} />
          </button>
          <button
            className="topbar-icon-btn theme-toggle-btn"
            onClick={onToggleTheme}
            title={themeMode === "dark" ? "Switch Theme" : "Switch Theme"}
          >
            {themeMode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>

      {/* Right Actions: Fullscreen, Quick Download & Export */}
      <div className="topbar-right">
        <button
          className="topbar-icon-btn"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen (F11)"}
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>

        <button
          className="topbar-download-btn"
          onClick={onQuickExport}
          title="Instant Quick Download (PNG)"
        >
          <Download size={13} />
          <span>Save PNG</span>
        </button>

        <button className="topbar-export-btn" onClick={onOpenExportModal}>
          <span>Export As...</span>
        </button>
      </div>
    </header>
  );
}
