import React, { useState, useRef, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import { PRESETS, GRADIENT_PRESETS } from "../../../../constants/presets.js";
import {
  canvasBlob,
  downloadBlob,
  loadImage,
} from "../../../../utils/imageTools.js";
import {
  applyCartoonEffect,
  applySketchEffect,
  applyOilPaintingEffect,
  applyHDREffect,
  applySepiaEffect,
  applyGlitchEffect,
  applyDuotoneEffect,
  applyPixelateEffect,
  applyEmbossEffect,
  applySkinSmoothing,
  applyTeethWhitening,
  applyColorizationEffect,
  applyMotionBlur,
  applyZoomBlur,
  applyUnsharpMask,
  parseCubeLUT,
  applyCubeLUT,
} from "../../services/filters.js";
import { compositeCanvas, renderSingleLayer } from "../../services/canvasCompositor.js";
import { SelectionManager } from "../../services/selectionEngine.js";
import { BrushEngine } from "../../services/brushEngine.js";
import {
  exportProjectFile,
  importProjectFile,
  saveProjectToLocal,
} from "../../services/projectStore.js";

// Modular UI Components (Co-located JSX + CSS)
import EditorTopBar from "../EditorTopBar/EditorTopBar.jsx";
import EditorToolbar from "../EditorToolbar/EditorToolbar.jsx";
import EditorBottomBar from "../EditorBottomBar/EditorBottomBar.jsx";
import CanvasViewport from "../CanvasViewport/CanvasViewport.jsx";
import LayersPanel from "../LayersPanel/LayersPanel.jsx";
import AdjustmentsPanel from "../AdjustmentsPanel/AdjustmentsPanel.jsx";
import FiltersPanel from "../FiltersPanel/FiltersPanel.jsx";
import EffectsPanel from "../EffectsPanel/EffectsPanel.jsx";
import RetouchPanel from "../RetouchPanel/RetouchPanel.jsx";
import CropPanel from "../CropPanel/CropPanel.jsx";
import TextPanel from "../TextPanel/TextPanel.jsx";
import ShapesPanel from "../ShapesPanel/ShapesPanel.jsx";
import HistoryPanel from "../HistoryPanel/HistoryPanel.jsx";
import ColorPickerModal from "../ColorPickerModal/ColorPickerModal.jsx";
import ExportModal from "../ExportModal/ExportModal.jsx";
import BeforeAfterSlider from "../BeforeAfterSlider/BeforeAfterSlider.jsx";

import "./EditorPage.css";

const DEFAULT_LR_SETTINGS = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
  clarity: 0,
  dehaze: 0,
  vignette: 0,
  filmGrain: 0,
};

const DEFAULT_HSL_MIXER = {
  red: { h: 0, s: 0, l: 0 },
  orange: { h: 0, s: 0, l: 0 },
  yellow: { h: 0, s: 0, l: 0 },
  green: { h: 0, s: 0, l: 0 },
  cyan: { h: 0, s: 0, l: 0 },
  blue: { h: 0, s: 0, l: 0 },
  purple: { h: 0, s: 0, l: 0 },
  magenta: { h: 0, s: 0, l: 0 },
};

const DEFAULT_CURVES = {
  rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  red: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  green: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
  blue: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
};

const DEFAULT_LEVELS = {
  inBlack: 0,
  inGamma: 1.0,
  inWhite: 255,
  outBlack: 0,
  outWhite: 255,
};

const DEFAULT_COLOR_BALANCE = {
  shadows: [0, 0, 0],
  midtones: [0, 0, 0],
  highlights: [0, 0, 0],
};

function cloneCanvas(oldCanvas) {
  if (!oldCanvas) return null;
  const newCanvas = document.createElement("canvas");
  newCanvas.width = oldCanvas.width;
  newCanvas.height = oldCanvas.height;
  newCanvas.getContext("2d").drawImage(oldCanvas, 0, 0);
  return newCanvas;
}

export default function EditorPage({
  notify,
  onExit,
  initialPreset = PRESETS[0],
  initialFile,
  onInitialFileHandled,
  initialLayers = [],
  initialGradient = null,
}) {
  // Document & Canvas Setup
  const [projectName, setProjectName] = useState("Untitled Project");
  const [preset, setPreset] = useState(initialPreset);
  const [bgType, setBgType] = useState(initialGradient ? "gradient" : "solid");
  const [canvasColor, setCanvasColor] = useState("#ffffff");
  const [activeGradient, setActiveGradient] = useState(initialGradient || GRADIENT_PRESETS[0]);

  // Layers & Selection
  const [layers, setLayers] = useState(initialLayers);
  const [selectedLayerId, setSelectedLayerId] = useState(
    initialLayers.length > 0 ? initialLayers[initialLayers.length - 1].id : null
  );

  // Tools & Navigation
  const [activeTool, setActiveTool] = useState("move"); // move, marquee, lasso, wand, crop, eyedropper, brush, eraser, clone, healing, dodge, text, shape, pan, zoom
  const [activeTab, setActiveTab] = useState("layers"); // layers, adjustments, filters, effects, retouch, crop, text, shapes, history
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Swatches & Brushes
  const [foregroundColor, setForegroundColor] = useState("#ff2020");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [brushSettings, setBrushSettings] = useState({
    size: 24,
    hardness: 0.5,
    opacity: 1.0,
    flow: 1.0,
  });

  // Color Adjustments & Curves
  const [lrSettings, setLrSettings] = useState(DEFAULT_LR_SETTINGS);
  const [hslMixer, setHslMixer] = useState(DEFAULT_HSL_MIXER);
  const [curves, setCurves] = useState(DEFAULT_CURVES);
  const [levels, setLevels] = useState(DEFAULT_LEVELS);
  const [colorBalance, setColorBalance] = useState(DEFAULT_COLOR_BALANCE);
  const [histogram, setHistogram] = useState(null);

  // Filters & Special Effects
  const [activeFilter, setActiveFilter] = useState("none");
  const [filterCss, setFilterCss] = useState("none");
  const [filterIntensity, setFilterIntensity] = useState(100);

  // Crop & Transform State
  const [cropState, setCropState] = useState({
    ratioId: "free",
    ratio: null,
    straightenAngle: 0,
  });

  // History & Future Stacks
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // Modals & UI Toggles
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPreview, setExportPreview] = useState("");
  const [exportType, setExportType] = useState("image/png");
  const [beforeAfterOpen, setBeforeAfterOpen] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState(null);
  const [colorPickerTarget, setColorPickerTarget] = useState(null); // 'foreground' | 'background' | 'layer'
  const [showGrid, setShowGrid] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  // References
  const canvasRef = useRef(null);
  const uploadRef = useRef(null);
  const projectFileInputRef = useRef(null);
  const selectionManagerRef = useRef(null);
  const brushEngineRef = useRef(new BrushEngine(null));
  const isPointerDownRef = useRef(false);
  const dragStartRef = useRef(null);
  const lassoPointsRef = useRef([]);
  const processedInitialFileRef = useRef(null);

  // Initialize Selection Manager
  useEffect(() => {
    if (!selectionManagerRef.current) {
      selectionManagerRef.current = new SelectionManager(preset.width, preset.height);
    } else {
      selectionManagerRef.current.resize(preset.width, preset.height);
    }
  }, [preset.width, preset.height]);

  // Master Snapshot for Undo / Redo
  const snapshot = useCallback(
    (actionName = "Action") => {
      setHistory((prev) => [
        ...prev.slice(-30),
        {
          actionName,
          layers: layers.map((l) => ({
            ...l,
            canvas: l.canvas ? cloneCanvas(l.canvas) : undefined,
          })),
          preset: { ...preset },
          lrSettings: { ...lrSettings },
          hslMixer: JSON.parse(JSON.stringify(hslMixer)),
          curves: JSON.parse(JSON.stringify(curves)),
          levels: { ...levels },
          colorBalance: JSON.parse(JSON.stringify(colorBalance)),
          filterCss,
          filterIntensity,
          activeFilter,
          bgType,
          canvasColor,
          activeGradient,
        },
      ]);
      setFuture([]);
    },
    [
      layers,
      preset,
      lrSettings,
      hslMixer,
      curves,
      levels,
      colorBalance,
      filterCss,
      filterIntensity,
      activeFilter,
      bgType,
      canvasColor,
      activeGradient,
    ]
  );

  // Undo / Redo Operations
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [
      ...f,
      {
        actionName: "Future State",
        layers: layers.map((l) => ({
          ...l,
          canvas: l.canvas ? cloneCanvas(l.canvas) : undefined,
        })),
        preset: { ...preset },
        lrSettings: { ...lrSettings },
        hslMixer: JSON.parse(JSON.stringify(hslMixer)),
        curves: JSON.parse(JSON.stringify(curves)),
        levels: { ...levels },
        colorBalance: JSON.parse(JSON.stringify(colorBalance)),
        filterCss,
        filterIntensity,
        activeFilter,
        bgType,
        canvasColor,
        activeGradient,
      },
    ]);
    setLayers(prev.layers);
    setPreset(prev.preset);
    setLrSettings(prev.lrSettings);
    setHslMixer(prev.hslMixer);
    setCurves(prev.curves);
    setLevels(prev.levels);
    setColorBalance(prev.colorBalance);
    setFilterCss(prev.filterCss);
    setFilterIntensity(prev.filterIntensity);
    setActiveFilter(prev.activeFilter);
    setBgType(prev.bgType);
    setCanvasColor(prev.canvasColor);
    setActiveGradient(prev.activeGradient);
    setHistory((h) => h.slice(0, -1));
    notify?.(`Undo: ${prev.actionName || "Previous Action"}`);
  }, [
    history,
    layers,
    preset,
    lrSettings,
    hslMixer,
    curves,
    levels,
    colorBalance,
    filterCss,
    filterIntensity,
    activeFilter,
    bgType,
    canvasColor,
    activeGradient,
    notify,
  ]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    setHistory((h) => [
      ...h,
      {
        actionName: "Past State",
        layers: layers.map((l) => ({
          ...l,
          canvas: l.canvas ? cloneCanvas(l.canvas) : undefined,
        })),
        preset: { ...preset },
        lrSettings: { ...lrSettings },
        hslMixer: JSON.parse(JSON.stringify(hslMixer)),
        curves: JSON.parse(JSON.stringify(curves)),
        levels: { ...levels },
        colorBalance: JSON.parse(JSON.stringify(colorBalance)),
        filterCss,
        filterIntensity,
        activeFilter,
        bgType,
        canvasColor,
        activeGradient,
      },
    ]);
    setLayers(next.layers);
    setPreset(next.preset);
    setLrSettings(next.lrSettings);
    setHslMixer(next.hslMixer);
    setCurves(next.curves);
    setLevels(next.levels);
    setColorBalance(next.colorBalance);
    setFilterCss(next.filterCss);
    setFilterIntensity(next.filterIntensity);
    setActiveFilter(next.activeFilter);
    setBgType(next.bgType);
    setCanvasColor(next.canvasColor);
    setActiveGradient(next.activeGradient);
    setFuture((f) => f.slice(0, -1));
    notify?.("Redo");
  }, [
    future,
    layers,
    preset,
    lrSettings,
    hslMixer,
    curves,
    levels,
    colorBalance,
    filterCss,
    filterIntensity,
    activeFilter,
    bgType,
    canvasColor,
    activeGradient,
    notify,
  ]);

  const handleJumpToHistoryState = (index) => {
    if (index < 0 || index >= history.length) return;
    const target = history[index];
    setLayers(target.layers);
    setPreset(target.preset);
    setLrSettings(target.lrSettings);
    setHslMixer(target.hslMixer);
    setCurves(target.curves);
    setLevels(target.levels);
    setColorBalance(target.colorBalance);
    setFilterCss(target.filterCss);
    setFilterIntensity(target.filterIntensity);
    setActiveFilter(target.activeFilter);
    setBgType(target.bgType);
    setCanvasColor(target.canvasColor);
    setActiveGradient(target.activeGradient);
    setHistory((h) => h.slice(0, index));
    notify?.(`Reverted to state #${index + 1}`);
  };

  // Master Canvas Composite Loop
  const renderCanvas = useCallback(async () => {
    if (!canvasRef.current) return;
    const res = await compositeCanvas(
      canvasRef.current,
      {
        width: preset.width,
        height: preset.height,
        bgType,
        canvasColor,
        activeGradient,
        layers,
        filterCss,
        filterIntensity,
        lrSettings,
        hslMixer,
        curves,
        levels,
        colorBalance,
      },
      {
        showSelection: true,
        selectionManager: selectionManagerRef.current,
        activeLayerId: selectedLayerId,
        activeTool,
        zoom: zoom / 100,
        computeHistogram: activeTab === "adjustments",
      }
    );
    if (res?.histogram) {
      setHistogram(res.histogram);
    }
  }, [
    preset,
    bgType,
    canvasColor,
    activeGradient,
    layers,
    filterCss,
    filterIntensity,
    lrSettings,
    hslMixer,
    curves,
    levels,
    colorBalance,
    selectedLayerId,
    activeTool,
    zoom,
    activeTab,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Initial file handler
  useEffect(() => {
    if (!initialFile || processedInitialFileRef.current === initialFile) return;
    processedInitialFileRef.current = initialFile;
    void handleAddImageFiles([initialFile]);
    onInitialFileHandled?.();
  }, [initialFile]);

  // Add Image Files
  const handleAddImageFiles = async (files) => {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const url = URL.createObjectURL(file);
        const img = await loadImage(url);
        snapshot(`Add ${file.name}`);
        const scale = Math.min((preset.width * 0.8) / img.width, (preset.height * 0.8) / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const newLayer = {
          id: crypto.randomUUID(),
          type: "image",
          name: file.name.slice(0, 24),
          url,
          x: Math.round((preset.width - w) / 2),
          y: Math.round((preset.height - h) / 2),
          width: w,
          height: h,
          opacity: 1,
          blendMode: "normal",
          visible: true,
          locked: false,
        };
        if (!originalImageSrc) {
          setOriginalImageSrc(url);
        }
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
        notify?.(`Added image layer: ${newLayer.name}`);
      } catch (err) {
        notify?.(`Error adding image: ${err.message}`);
      }
    }
  };

  // Add Typography Layer (Canva Style)
  const handleAddTextLayer = (style = "heading") => {
    snapshot("Add Text");
    let text = "Bold Title";
    let fontSize = Math.round(preset.width * 0.06);
    let fontFamily = "Inter";
    let color = foregroundColor || "#ffffff";
    let bold = true;

    if (style === "subheading") {
      text = "Secondary Subhead";
      fontSize = Math.round(preset.width * 0.035);
      fontFamily = "Montserrat";
      bold = false;
    } else if (style === "body") {
      text = "Enter paragraph typography description...";
      fontSize = Math.round(preset.width * 0.024);
      fontFamily = "Roboto";
      bold = false;
    }

    const newLayer = {
      id: crypto.randomUUID(),
      type: "text",
      name: text.slice(0, 18),
      text,
      x: Math.round(preset.width * 0.2),
      y: Math.round(preset.height * 0.4),
      fontSize,
      fontFamily,
      color,
      bold,
      italic: false,
      underline: false,
      align: "left",
      opacity: 1,
      blendMode: "normal",
      visible: true,
      locked: false,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    setActiveTab("text");
    notify?.("Added typography layer");
  };

  // Add Vector Shape Layer
  const handleAddShapeLayer = (shapeType = "rectangle") => {
    snapshot(`Add ${shapeType}`);
    const size = Math.round(Math.min(preset.width, preset.height) * 0.3);
    const newLayer = {
      id: crypto.randomUUID(),
      type: "shape",
      shapeType,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
      x: Math.round((preset.width - size) / 2),
      y: Math.round((preset.height - size) / 2),
      width: size,
      height: shapeType === "rounded" ? Math.round(size * 0.65) : size,
      color: foregroundColor || "#e11d48",
      strokeColor: "#ffffff",
      strokeWidth: 2,
      cornerRadius: 12,
      opacity: 1,
      blendMode: "normal",
      visible: true,
      locked: false,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    setActiveTab("shapes");
    notify?.(`Added ${newLayer.name}`);
  };

  // Add Raster Drawing Layer
  const handleAddRasterLayer = () => {
    snapshot("Add Blank Layer");
    const c = document.createElement("canvas");
    c.width = preset.width;
    c.height = preset.height;
    const newLayer = {
      id: crypto.randomUUID(),
      type: "paint",
      name: `Layer ${layers.length + 1}`,
      canvas: c,
      x: 0,
      y: 0,
      width: preset.width,
      height: preset.height,
      opacity: 1,
      blendMode: "normal",
      visible: true,
      locked: false,
    };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    notify?.("Added new blank layer");
  };

  // Update Layer Properties
  const handleUpdateLayer = (id, updates) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  // Duplicate Layer
  const handleDuplicateSelected = () => {
    const selected = layers.find((l) => l.id === selectedLayerId);
    if (!selected) return;
    snapshot("Duplicate Layer");
    const copy = {
      ...selected,
      id: crypto.randomUUID(),
      name: `${selected.name} (Copy)`,
      x: (selected.x || 0) + 25,
      y: (selected.y || 0) + 25,
      canvas: selected.canvas ? cloneCanvas(selected.canvas) : undefined,
    };
    setLayers((prev) => [...prev, copy]);
    setSelectedLayerId(copy.id);
    notify?.("Duplicated layer");
  };

  // Delete Layer
  const handleDeleteSelected = () => {
    if (!selectedLayerId) return;
    snapshot("Delete Layer");
    setLayers((prev) => prev.filter((l) => l.id !== selectedLayerId));
    setSelectedLayerId(null);
    notify?.("Layer removed");
  };

  // Move Layer Up / Down
  const handleMoveLayer = (direction) => {
    if (!selectedLayerId) return;
    const idx = layers.findIndex((l) => l.id === selectedLayerId);
    if (idx === -1) return;
    snapshot("Reorder Layer");
    const next = [...layers];
    if (direction === "up" && idx < next.length - 1) {
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
    } else if (direction === "down" && idx > 0) {
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
    }
    setLayers(next);
  };

  const handleToggleVisibility = (id) => {
    snapshot("Toggle Visibility");
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  const handleToggleLock = (id) => {
    snapshot("Toggle Lock");
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)));
  };

  // Layer Masking
  const handleAddMask = () => {
    if (!selectedLayerId) return;
    snapshot("Add Layer Mask");
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = preset.width;
    maskCanvas.height = preset.height;
    const mCtx = maskCanvas.getContext("2d");
    mCtx.fillStyle = "#ffffff";
    mCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    const maskUrl = maskCanvas.toDataURL("image/png");

    setLayers((prev) =>
      prev.map((l) => (l.id === selectedLayerId ? { ...l, mask: maskUrl, maskEnabled: true } : l))
    );
    notify?.("Added layer mask (White reveals, Black conceals)");
  };

  const handleInvertMask = () => {
    if (!selectedLayerId) return;
    const layer = layers.find((l) => l.id === selectedLayerId);
    if (!layer || !layer.mask) {
      notify?.("Selected layer has no mask to invert.");
      return;
    }
    snapshot("Invert Mask");
    const img = new Image();
    img.onload = () => {
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      const mCtx = maskCanvas.getContext("2d");
      mCtx.drawImage(img, 0, 0);
      const imgData = mCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i];
        imgData.data[i + 1] = 255 - imgData.data[i + 1];
        imgData.data[i + 2] = 255 - imgData.data[i + 2];
      }
      mCtx.putImageData(imgData, 0, 0);
      const maskUrl = maskCanvas.toDataURL("image/png");
      setLayers((prev) =>
        prev.map((l) => (l.id === selectedLayerId ? { ...l, mask: maskUrl } : l))
      );
      notify?.("Inverted layer mask");
    };
    img.src = layer.mask;
  };

  // Merge Down & Flatten
  const handleMergeDown = async () => {
    if (!selectedLayerId) return;
    const idx = layers.findIndex((l) => l.id === selectedLayerId);
    if (idx <= 0) {
      notify?.("Cannot merge bottom layer down.");
      return;
    }
    snapshot("Merge Down");
    const lower = layers[idx - 1];
    const upper = layers[idx];

    const mergeCanvas = document.createElement("canvas");
    mergeCanvas.width = preset.width;
    mergeCanvas.height = preset.height;
    const mCtx = mergeCanvas.getContext("2d");

    await renderSingleLayer(mCtx, lower, preset.width, preset.height);
    await renderSingleLayer(mCtx, upper, preset.width, preset.height);

    const mergedUrl = mergeCanvas.toDataURL("image/png");
    const mergedLayer = {
      id: crypto.randomUUID(),
      type: "image",
      name: `Merged (${lower.name} + ${upper.name})`,
      url: mergedUrl,
      x: 0,
      y: 0,
      width: preset.width,
      height: preset.height,
      opacity: 1,
      blendMode: "normal",
      visible: true,
      locked: false,
    };

    setLayers((prev) => {
      const next = [...prev];
      next.splice(idx - 1, 2, mergedLayer);
      return next;
    });
    setSelectedLayerId(mergedLayer.id);
    notify?.("Merged layers down");
  };

  const handleFlatten = () => {
    if (!canvasRef.current || layers.length === 0) return;
    snapshot("Flatten Image");
    const flatUrl = canvasRef.current.toDataURL("image/png");
    const flatLayer = {
      id: crypto.randomUUID(),
      type: "image",
      name: "Background (Flattened)",
      url: flatUrl,
      x: 0,
      y: 0,
      width: preset.width,
      height: preset.height,
      opacity: 1,
      blendMode: "normal",
      visible: true,
      locked: false,
    };
    setLayers([flatLayer]);
    setSelectedLayerId(flatLayer.id);
    notify?.("Flattened all layers into single background");
  };

  // Selection Operations
  const handleSelectAll = () => {
    if (selectionManagerRef.current) {
      selectionManagerRef.current.selectAll();
      setHasSelection(true);
      renderCanvas();
      notify?.("Selected All (Ctrl+A)");
    }
  };

  const handleDeselect = () => {
    if (selectionManagerRef.current) {
      selectionManagerRef.current.clear();
      setHasSelection(false);
      renderCanvas();
      notify?.("Deselected (Ctrl+D)");
    }
  };

  // Rotate & Flip
  const handleRotate = (angleDeg) => {
    snapshot(`Rotate ${angleDeg}°`);
    if (selectedLayerId) {
      setLayers((prev) =>
        prev.map((l) =>
          l.id === selectedLayerId ? { ...l, rotation: ((l.rotation || 0) + angleDeg) % 360 } : l
        )
      );
    } else {
      if (Math.abs(angleDeg) === 90) {
        setPreset((p) => ({ ...p, width: p.height, height: p.width }));
        setLayers((prev) =>
          prev.map((l) => ({
            ...l,
            x: l.y,
            y: l.x,
            width: l.height,
            height: l.width,
          }))
        );
      }
    }
    notify?.(`Rotated ${angleDeg}°`);
  };

  const handleFlip = (direction) => {
    snapshot(`Flip ${direction}`);
    if (selectedLayerId) {
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== selectedLayerId) return l;
          return direction === "horizontal" ? { ...l, flipH: !l.flipH } : { ...l, flipV: !l.flipV };
        })
      );
    } else {
      setLayers((prev) =>
        prev.map((l) =>
          direction === "horizontal"
            ? { ...l, x: preset.width - (l.x + l.width), flipH: !l.flipH }
            : { ...l, y: preset.height - (l.y + l.height), flipV: !l.flipV }
        )
      );
    }
    notify?.(`Flipped ${direction}`);
  };

  // Crop & Straighten
  const handleApplyCrop = () => {
    snapshot("Apply Crop");
    let targetRatio = cropState.ratio;
    let newW = preset.width;
    let newH = preset.height;
    if (targetRatio) {
      if (newW / newH > targetRatio) {
        newW = Math.round(newH * targetRatio);
      } else {
        newH = Math.round(newW / targetRatio);
      }
    }
    const offsetX = Math.round((preset.width - newW) / 2);
    const offsetY = Math.round((preset.height - newH) / 2);

    setLayers((prev) =>
      prev.map((l) => ({
        ...l,
        x: l.x - offsetX,
        y: l.y - offsetY,
      }))
    );
    setPreset((p) => ({ ...p, width: newW, height: newH }));
    setActiveTool("move");
    notify?.(`Cropped to ${newW} × ${newH} px`);
  };

  const handleCancelCrop = () => {
    setActiveTool("move");
  };

  // Optical Blurs & Sharpen (FiltersPanel)
  const handleApplySpecialOpticalEffect = (effectType) => {
    if (!canvasRef.current) return;
    snapshot(`Apply ${effectType}`);
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const c = canvasRef.current;
        if (effectType === "motion-blur") {
          applyMotionBlur(c, 15);
        } else if (effectType === "zoom-blur") {
          applyZoomBlur(c);
        } else if (effectType === "unsharp") {
          applyUnsharpMask(c);
        }
        const url = c.toDataURL("image/png");
        const newLayer = {
          id: crypto.randomUUID(),
          type: "image",
          name: `${effectType} layer`,
          url,
          x: 0,
          y: 0,
          width: c.width,
          height: c.height,
          opacity: 1,
          blendMode: "normal",
          visible: true,
          locked: false,
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
        notify?.(`Applied ${effectType}`);
      } catch (err) {
        notify?.(`Error: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // Creative Effects (EffectsPanel)
  const handleApplyCreativeEffect = (effectType) => {
    if (!canvasRef.current) return;
    snapshot(`Apply ${effectType}`);
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const c = canvasRef.current;
        if (effectType === "cartoon") applyCartoonEffect(c);
        else if (effectType === "sketch") applySketchEffect(c);
        else if (effectType === "oil") applyOilPaintingEffect(c);
        else if (effectType === "hdr") applyHDREffect(c);
        else if (effectType === "sepia") applySepiaEffect(c);
        else if (effectType === "glitch") applyGlitchEffect(c);
        else if (effectType === "duotone") applyDuotoneEffect(c, "#ff2020", "#ffffff");
        else if (effectType === "pixelate") applyPixelateEffect(c, 14);
        else if (effectType === "emboss") applyEmbossEffect(c);

        const url = c.toDataURL("image/png");
        const newLayer = {
          id: crypto.randomUUID(),
          type: "image",
          name: `${effectType.toUpperCase()} Effect`,
          url,
          x: 0,
          y: 0,
          width: c.width,
          height: c.height,
          opacity: 1,
          blendMode: "normal",
          visible: true,
          locked: false,
        };
        setLayers((prev) => [...prev, newLayer]);
        setSelectedLayerId(newLayer.id);
        notify?.(`Applied ${effectType} effect`);
      } catch (err) {
        notify?.(`Effect error: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // Import 3D LUT (.cube)
  const handleImportLUT = (lutText, lutName) => {
    if (!canvasRef.current) return;
    snapshot(`Apply LUT ${lutName}`);
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const c = canvasRef.current;
        const lut = parseCubeLUT(lutText);
        applyCubeLUT(c, lut);
        const url = c.toDataURL("image/png");
        const lutLayer = {
          id: crypto.randomUUID(),
          type: "image",
          name: `LUT (${lutName})`,
          url,
          x: 0,
          y: 0,
          width: c.width,
          height: c.height,
          opacity: 1,
          blendMode: "normal",
          visible: true,
          locked: false,
        };
        setLayers((prev) => [...prev, lutLayer]);
        setSelectedLayerId(lutLayer.id);
        notify?.(`Applied 3D LUT profile: ${lutName}`);
      } catch (err) {
        notify?.(`LUT error: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // Beauty Retouch Actions
  const handleApplyRetouchAction = (action, params = {}) => {
    if (!canvasRef.current) return;
    snapshot(`Apply ${action}`);
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const c = canvasRef.current;
        if (action === "skin-smooth") applySkinSmoothing(c, params.intensity || 0.6);
        else if (action === "teeth-whiten") applyTeethWhitening(c);
        else if (action === "colorize") applyColorizationEffect(c);

        const url = c.toDataURL("image/png");
        const retouchLayer = {
          id: crypto.randomUUID(),
          type: "image",
          name: `${action.toUpperCase()} Layer`,
          url,
          x: 0,
          y: 0,
          width: c.width,
          height: c.height,
          opacity: 1,
          blendMode: "normal",
          visible: true,
          locked: false,
        };
        setLayers((prev) => [...prev, retouchLayer]);
        setSelectedLayerId(retouchLayer.id);
        notify?.(`Applied ${action} retouch`);
      } catch (err) {
        notify?.(`Retouch error: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // Canvas Viewport Pointer Interactions
  const handleCanvasPointerDown = (e) => {
    isPointerDownRef.current = true;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (activeTool === "eyedropper") {
      const ctx = canvasRef.current.getContext("2d");
      const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
      setForegroundColor(hex);
      notify?.(`Sampled color: ${hex}`);
      return;
    }

    if (activeTool === "zoom") {
      if (e.altKey) {
        setZoom((z) => Math.max(10, Math.round(z - 25)));
      } else {
        setZoom((z) => Math.min(500, Math.round(z + 25)));
      }
      return;
    }

    if (activeTool === "marquee") {
      dragStartRef.current = { x, y };
      return;
    }

    if (activeTool === "lasso") {
      lassoPointsRef.current = [{ x, y }];
      return;
    }

    if (activeTool === "wand") {
      if (selectionManagerRef.current) {
        selectionManagerRef.current.wandSelect(canvasRef.current, x, y, 32);
        setHasSelection(selectionManagerRef.current.hasSelection);
        renderCanvas();
      }
      return;
    }

    if (activeTool === "move") {
      const reversed = [...layers].reverse();
      const clicked = reversed.find((l) => {
        if (l.visible === false || l.locked) return false;
        return x >= l.x && x <= l.x + (l.width || 100) && y >= l.y && y <= l.y + (l.height || 100);
      });
      if (clicked) {
        setSelectedLayerId(clicked.id);
        dragStartRef.current = { x, y, layerX: clicked.x, layerY: clicked.y };
      } else {
        setSelectedLayerId(null);
      }
      return;
    }

    if (activeTool === "brush" || activeTool === "eraser" || activeTool === "dodge") {
      let activeLayer = layers.find((l) => l.id === selectedLayerId);
      if (!activeLayer || activeLayer.type !== "paint") {
        const offCanvas = document.createElement("canvas");
        offCanvas.width = preset.width;
        offCanvas.height = preset.height;
        const newPaintLayer = {
          id: crypto.randomUUID(),
          type: "paint",
          name: "Paint Layer",
          canvas: offCanvas,
          x: 0,
          y: 0,
          width: preset.width,
          height: preset.height,
          opacity: 1,
          blendMode: "normal",
          visible: true,
          locked: false,
        };
        setLayers((prev) => [...prev, newPaintLayer]);
        setSelectedLayerId(newPaintLayer.id);
        activeLayer = newPaintLayer;
      }

      brushEngineRef.current.setCanvas(activeLayer.canvas);
      brushEngineRef.current.reset();
      brushEngineRef.current.paintStroke(
        x,
        y,
        x,
        y,
        {
          size: brushSettings.size,
          hardness: brushSettings.hardness,
          color: foregroundColor,
          opacity: brushSettings.opacity,
          flow: brushSettings.flow,
          isEraser: activeTool === "eraser",
        },
        selectionManagerRef.current
      );
      dragStartRef.current = { x, y };
      renderCanvas();
      return;
    }
  };

  const handleCanvasPointerMove = (e) => {
    if (!isPointerDownRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoom / 100;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (activeTool === "move" && dragStartRef.current && selectedLayerId) {
      const dx = x - dragStartRef.current.x;
      const dy = y - dragStartRef.current.y;
      setLayers((prev) =>
        prev.map((l) => {
          if (l.id !== selectedLayerId || l.locked) return l;
          return {
            ...l,
            x: Math.round(dragStartRef.current.layerX + dx),
            y: Math.round(dragStartRef.current.layerY + dy),
          };
        })
      );
      return;
    }

    if (activeTool === "marquee" && dragStartRef.current) {
      if (selectionManagerRef.current) {
        selectionManagerRef.current.setRectSelection(
          dragStartRef.current.x,
          dragStartRef.current.y,
          x - dragStartRef.current.x,
          y - dragStartRef.current.y
        );
        setHasSelection(selectionManagerRef.current.hasSelection);
        renderCanvas();
      }
      return;
    }

    if (activeTool === "lasso") {
      lassoPointsRef.current.push({ x, y });
      if (selectionManagerRef.current) {
        selectionManagerRef.current.setPolygonSelection(lassoPointsRef.current);
        setHasSelection(selectionManagerRef.current.hasSelection);
        renderCanvas();
      }
      return;
    }

    if ((activeTool === "brush" || activeTool === "eraser" || activeTool === "dodge") && dragStartRef.current) {
      brushEngineRef.current.paintStroke(
        dragStartRef.current.x,
        dragStartRef.current.y,
        x,
        y,
        {
          size: brushSettings.size,
          hardness: brushSettings.hardness,
          color: foregroundColor,
          opacity: brushSettings.opacity,
          flow: brushSettings.flow,
          isEraser: activeTool === "eraser",
        },
        selectionManagerRef.current
      );
      dragStartRef.current = { x, y };
      renderCanvas();
      return;
    }
  };

  const handleCanvasPointerUp = () => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      dragStartRef.current = null;
      lassoPointsRef.current = [];
      brushEngineRef.current.reset();
      snapshot();
      renderCanvas();
    }
  };

  // Swatch Helpers
  const handleSwapColors = () => {
    setForegroundColor(backgroundColor);
    setBackgroundColor(foregroundColor);
  };

  const handleResetColors = () => {
    setForegroundColor("#ff2020");
    setBackgroundColor("#ffffff");
  };

  const handleSelectTool = (toolId) => {
    setActiveTool(toolId);
    if (toolId === "crop") setActiveTab("crop");
    else if (toolId === "text") setActiveTab("text");
    else if (toolId === "shape") setActiveTab("shapes");
    else if (toolId === "healing" || toolId === "clone") setActiveTab("retouch");
  };

  const handleFitScreen = () => {
    const availableW = window.innerWidth - 388;
    const availableH = window.innerHeight - 96;
    const scaleX = (availableW * 0.85) / preset.width;
    const scaleY = (availableH * 0.85) / preset.height;
    const fitZoom = Math.max(10, Math.min(200, Math.round(Math.min(scaleX, scaleY) * 100)));
    setZoom(fitZoom);
    setPan({ x: 0, y: 0 });
  };

  const handleNewCanvas = (w = 1280, h = 720, name = "New Artwork") => {
    snapshot("New Canvas");
    setPreset({ id: "custom", name, width: w, height: h });
    setLayers([]);
    setSelectedLayerId(null);
    setLrSettings(DEFAULT_LR_SETTINGS);
    setHslMixer(DEFAULT_HSL_MIXER);
    setCurves(DEFAULT_CURVES);
    setLevels(DEFAULT_LEVELS);
    setColorBalance(DEFAULT_COLOR_BALANCE);
    setActiveFilter("none");
    setFilterCss("none");
    if (selectionManagerRef.current) selectionManagerRef.current.clear();
    setHasSelection(false);
    notify?.(`Created new canvas (${w} × ${h})`);
  };

  const handleResetAdjustments = () => {
    snapshot("Reset Adjustments");
    setLrSettings(DEFAULT_LR_SETTINGS);
    setHslMixer(DEFAULT_HSL_MIXER);
    setCurves(DEFAULT_CURVES);
    setLevels(DEFAULT_LEVELS);
    setColorBalance(DEFAULT_COLOR_BALANCE);
    setActiveFilter("none");
    setFilterCss("none");
    notify?.("Reset all color adjustments");
  };

  // Project .photopro File Save & Open
  const handleSaveProjectFile = () => {
    const projectState = {
      width: preset.width,
      height: preset.height,
      bgType,
      canvasColor,
      activeGradient,
      lrSettings,
      hslMixer,
      curves,
      levels,
      colorBalance,
      layers: layers.map((l) => ({
        ...l,
        canvas: l.canvas ? l.canvas.toDataURL("image/png") : undefined,
      })),
    };
    exportProjectFile(projectState, projectName);
    saveProjectToLocal({ id: crypto.randomUUID(), name: projectName, ...projectState });
    notify?.(`Saved project file: ${projectName}.photopro`);
  };

  const handleProjectFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importProjectFile(file);
      snapshot("Open Project");
      if (data.name) setProjectName(data.name);
      if (data.canvas) {
        setPreset({
          id: "custom",
          name: "Loaded Canvas",
          width: data.canvas.width || 1280,
          height: data.canvas.height || 720,
        });
        if (data.canvas.bgType) setBgType(data.canvas.bgType);
        if (data.canvas.canvasColor) setCanvasColor(data.canvas.canvasColor);
        if (data.canvas.activeGradient) setActiveGradient(data.canvas.activeGradient);
      }
      if (data.adjustments) {
        if (data.adjustments.lrSettings) setLrSettings(data.adjustments.lrSettings);
        if (data.adjustments.hslMixer) setHslMixer(data.adjustments.hslMixer);
        if (data.adjustments.curves) setCurves(data.adjustments.curves);
        if (data.adjustments.levels) setLevels(data.adjustments.levels);
        if (data.adjustments.colorBalance) setColorBalance(data.adjustments.colorBalance);
      }
      if (Array.isArray(data.layers)) {
        const restored = await Promise.all(
          data.layers.map(async (l) => {
            if (l.type === "paint" && l.canvas && typeof l.canvas === "string") {
              const img = await loadImage(l.canvas);
              const c = document.createElement("canvas");
              c.width = img.width;
              c.height = img.height;
              c.getContext("2d").drawImage(img, 0, 0);
              return { ...l, canvas: c };
            }
            return l;
          })
        );
        setLayers(restored);
        if (restored.length > 0) setSelectedLayerId(restored[restored.length - 1].id);
      }
      notify?.("Successfully loaded .photopro project!");
    } catch (err) {
      notify?.(`Error loading project: ${err.message}`);
    } finally {
      e.target.value = "";
    }
  };

  // Export Design
  const handleExportDesign = async (size = "original", quality = 0.95) => {
    try {
      const source = canvasRef.current;
      if (!source) throw new Error("Canvas is not ready.");
      const targets = { hd: [1280, 720], fullhd: [1920, 1080], "2k": [2560, 1440], "4k": [3840, 2160] };
      let exportCanvas = source;

      if (targets[size]) {
        const [maxWidth, maxHeight] = targets[size];
        const scale = Math.min(maxWidth / source.width, maxHeight / source.height);
        exportCanvas = document.createElement("canvas");
        exportCanvas.width = Math.round(source.width * scale);
        exportCanvas.height = Math.round(source.height * scale);
        const ctx = exportCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(source, 0, 0, exportCanvas.width, exportCanvas.height);
      }

      const cleanName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-");

      if (exportType === "application/pdf") {
        const orientation = exportCanvas.width > exportCanvas.height ? "l" : "p";
        const pdf = new jsPDF({
          orientation,
          unit: "px",
          format: [exportCanvas.width, exportCanvas.height],
        });
        const imgData = exportCanvas.toDataURL("image/jpeg", 0.96);
        pdf.addImage(imgData, "JPEG", 0, 0, exportCanvas.width, exportCanvas.height);
        const pdfBlob = pdf.output("blob");
        downloadBlob(pdfBlob, `${cleanName || "artwork"}.pdf`);
      } else {
        const blob = await canvasBlob(exportCanvas, exportType, quality);
        const ext = exportType.split("/")[1].replace("jpeg", "jpg");
        downloadBlob(blob, `${cleanName || "artwork"}.${ext}`);
      }

      setExportOpen(false);
      notify?.("High-resolution export completed!");
    } catch (err) {
      notify?.(`Export error: ${err.message}`);
    }
  };

  const handleQuickExportPng = async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await canvasBlob(canvasRef.current, "image/png");
      const cleanName = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      downloadBlob(blob, `${cleanName || "artwork"}.png`);
      notify?.("Quick exported PNG!");
    } catch (err) {
      notify?.(`Export error: ${err.message}`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleSelectAll();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleDeselect();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveProjectFile();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedLayerId) {
        e.preventDefault();
        handleDeleteSelected();
        return;
      }

      if (e.key.toLowerCase() === "x") {
        handleSwapColors();
        return;
      }
      if (e.key.toLowerCase() === "d") {
        handleResetColors();
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "v") handleSelectTool("move");
      else if (key === "m") handleSelectTool("marquee");
      else if (key === "l") handleSelectTool("lasso");
      else if (key === "w") handleSelectTool("wand");
      else if (key === "c") handleSelectTool("crop");
      else if (key === "i") handleSelectTool("eyedropper");
      else if (key === "b") handleSelectTool("brush");
      else if (key === "e") handleSelectTool("eraser");
      else if (key === "s" && !e.ctrlKey && !e.metaKey) handleSelectTool("clone");
      else if (key === "j") handleSelectTool("healing");
      else if (key === "o") handleSelectTool("dodge");
      else if (key === "t") handleSelectTool("text");
      else if (key === "u") handleSelectTool("shape");
      else if (key === "h") handleSelectTool("pan");
      else if (key === "z" && !e.ctrlKey && !e.metaKey) handleSelectTool("zoom");

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selectedLayerId) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setLayers((prev) =>
          prev.map((l) => {
            if (l.id !== selectedLayerId || l.locked) return l;
            let dx = 0, dy = 0;
            if (e.key === "ArrowUp") dy = -step;
            if (e.key === "ArrowDown") dy = step;
            if (e.key === "ArrowLeft") dx = -step;
            if (e.key === "ArrowRight") dx = step;
            return { ...l, x: l.x + dx, y: l.y + dy };
          })
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  return (
    <main className="editor-app">
      {/* PROFESSIONAL TOP BAR WITH DROP DOWN MENUS */}
      <EditorTopBar
        onExit={onExit}
        projectName={projectName}
        setProjectName={setProjectName}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenProject={() => projectFileInputRef.current?.click()}
        onSaveProject={handleSaveProjectFile}
        onQuickExport={handleQuickExportPng}
        onOpenExportModal={() => {
          setExportPreview(canvasRef.current?.toDataURL("image/png") || "");
          setExportOpen(true);
        }}
        onSelectAll={handleSelectAll}
        onDeselect={handleDeselect}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        onMergeDown={handleMergeDown}
        onFlatten={handleFlatten}
        onAddMask={handleAddMask}
        onInvertMask={handleInvertMask}
        onRotateCW={() => handleRotate(90)}
        onRotateCCW={() => handleRotate(-90)}
        onFlipH={() => handleFlip("horizontal")}
        onFlipV={() => handleFlip("vertical")}
        onZoomIn={() => setZoom((z) => Math.min(500, Math.round(z + 10)))}
        onZoomOut={() => setZoom((z) => Math.max(10, Math.round(z - 10)))}
        onFitScreen={handleFitScreen}
        onActualSize={() => setZoom(100)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((g) => !g)}
        showRulers={showRulers}
        onToggleRulers={() => setShowRulers((r) => !r)}
        beforeAfterOpen={beforeAfterOpen}
        onToggleBeforeAfter={() => setBeforeAfterOpen((b) => !b)}
        historyPanelOpen={activeTab === "history"}
        onToggleHistoryPanel={() => setActiveTab(activeTab === "history" ? "layers" : "history")}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onNewCanvas={() => handleNewCanvas(1280, 720, "New Project")}
        onOpenImage={() => uploadRef.current?.click()}
      />

      {/* WORKSPACE ROW */}
      <div className="editor-workspace-row">
        {/* LEFT PHOTOSHOP TOOLBAR */}
        <EditorToolbar
          activeTool={activeTool}
          setActiveTool={handleSelectTool}
          foregroundColor={foregroundColor}
          backgroundColor={backgroundColor}
          onSwapColors={handleSwapColors}
          onResetColors={handleResetColors}
          onOpenColorPicker={(type) => setColorPickerTarget(type)}
        />

        {/* CENTER PAN & ZOOM CANVAS VIEWPORT */}
        <CanvasViewport
          canvasRef={canvasRef}
          zoom={zoom}
          pan={pan}
          onPanChange={setPan}
          onZoomChange={setZoom}
          showRulers={showRulers}
          showGrid={showGrid}
          isCropping={activeTool === "crop"}
          activeTool={activeTool}
          onCursorMove={setCursorPos}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          hasContent={layers.length > 0}
          onOpenImage={() => uploadRef.current?.click()}
          onNewCanvas={() => handleNewCanvas(1280, 720, "New Project")}
          onDrop={(e) => { e.preventDefault(); const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); if (files.length) handleAddImageFiles(files); }}
        />

        {/* RIGHT DOCK PANEL */}
        <aside className="editor-dock-container">
          {/* Dock Navigation Tabs */}
          <nav className="dock-tabs-nav">
            {[
              { id: "layers", label: "Layers", icon: "🗂️" },
              { id: "adjustments", label: "Adjust", icon: "🎨" },
              { id: "filters", label: "Filters", icon: "✨" },
              { id: "effects", label: "Effects", icon: "🌟" },
              { id: "retouch", label: "Retouch", icon: "💄" },
              { id: "crop", label: "Crop", icon: "✂️" },
              { id: "text", label: "Text", icon: "T" },
              { id: "shapes", label: "Shapes", icon: "⬡" },
              { id: "history", label: "History", icon: "📋" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`dock-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ marginRight: 4 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Dock Content Body */}
          <div className="dock-content-body">
            {activeTab === "layers" && (
              <LayersPanel
                layers={layers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
                onUpdateLayer={handleUpdateLayer}
                onAddLayer={handleAddRasterLayer}
                onDuplicateLayer={handleDuplicateSelected}
                onDeleteLayer={handleDeleteSelected}
                onMoveLayer={handleMoveLayer}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
              />
            )}
            {activeTab === "adjustments" && (
              <AdjustmentsPanel
                lrSettings={lrSettings}
                onChangeLrSettings={setLrSettings}
                hslMixer={hslMixer}
                onChangeHslMixer={setHslMixer}
                curves={curves}
                onChangeCurves={setCurves}
                levels={levels}
                onChangeLevels={setLevels}
                colorBalance={colorBalance}
                onChangeColorBalance={setColorBalance}
                histogram={histogram}
                onResetAll={handleResetAdjustments}
              />
            )}
            {activeTab === "filters" && (
              <FiltersPanel
                activeFilter={activeFilter}
                filterIntensity={filterIntensity}
                onChangeFilter={(filterId, css) => {
                  setActiveFilter(filterId);
                  setFilterCss(css);
                }}
                onChangeIntensity={setFilterIntensity}
                onApplySpecialEffect={handleApplySpecialOpticalEffect}
              />
            )}
            {activeTab === "effects" && (
              <EffectsPanel
                onApplyEffect={handleApplyCreativeEffect}
                activeEffect={null}
                isProcessing={isProcessing}
                onImportLUT={handleImportLUT}
              />
            )}
            {activeTab === "retouch" && (
              <RetouchPanel
                onApplyRetouch={handleApplyRetouchAction}
                activeTool={activeTool}
                setActiveTool={handleSelectTool}
                isProcessing={isProcessing}
              />
            )}
            {activeTab === "crop" && (
              <CropPanel
                selectedRatio={cropState.ratioId}
                onSelectRatio={(id, ratio) => setCropState((c) => ({ ...c, ratioId: id, ratio }))}
                straightenAngle={cropState.straightenAngle}
                onChangeStraighten={(angle) => setCropState((c) => ({ ...c, straightenAngle: angle }))}
                onRotateCW={() => handleRotate(90)}
                onRotateCCW={() => handleRotate(-90)}
                onFlipH={() => handleFlip("horizontal")}
                onFlipV={() => handleFlip("vertical")}
                onApplyCrop={handleApplyCrop}
                onCancelCrop={handleCancelCrop}
              />
            )}
            {activeTab === "text" && (
              <TextPanel
                selectedLayer={selectedLayer}
                onAddText={handleAddTextLayer}
                onUpdateText={(updates) => handleUpdateLayer(selectedLayerId, updates)}
              />
            )}
            {activeTab === "shapes" && (
              <ShapesPanel
                selectedLayer={selectedLayer}
                onAddShape={handleAddShapeLayer}
                onUpdateShape={(updates) => handleUpdateLayer(selectedLayerId, updates)}
              />
            )}
            {activeTab === "history" && (
              <HistoryPanel
                history={history}
                currentIndex={history.length - 1}
                onJumpToState={handleJumpToHistoryState}
              />
            )}
          </div>
        </aside>

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="editor-processing-overlay">
            <div className="editor-processing-spinner" />
            <span>Processing Effect...</span>
          </div>
        )}
      </div>

      {/* BOTTOM STATUS & ZOOM BAR */}
      <EditorBottomBar
        width={preset.width}
        height={preset.height}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitScreen={handleFitScreen}
        onActualSize={() => setZoom(100)}
        cursorPos={cursorPos}
        activeTool={activeTool}
        hasSelection={hasSelection}
      />

      {/* HIDDEN FILE INPUTS */}
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.length) {
            handleAddImageFiles(e.target.files);
            e.target.value = "";
          }
        }}
      />
      <input
        ref={projectFileInputRef}
        type="file"
        accept=".photopro,application/json"
        style={{ display: "none" }}
        onChange={handleProjectFileSelected}
      />

      {/* MODALS & OVERLAYS */}
      {exportOpen && (
        <ExportModal
          type={exportType}
          setType={setExportType}
          preview={exportPreview}
          onClose={() => setExportOpen(false)}
          onExport={handleExportDesign}
          width={preset.width}
          height={preset.height}
        />
      )}

      {beforeAfterOpen && (
        <BeforeAfterSlider
          originalSrc={originalImageSrc}
          currentCanvas={canvasRef.current}
          onClose={() => setBeforeAfterOpen(false)}
        />
      )}

      {colorPickerTarget && (
        <ColorPickerModal
          title={
            colorPickerTarget === "foreground"
              ? "Foreground Color"
              : colorPickerTarget === "background"
              ? "Background Color"
              : "Layer Color"
          }
          initialColor={
            colorPickerTarget === "foreground"
              ? foregroundColor
              : colorPickerTarget === "background"
              ? backgroundColor
              : selectedLayer?.color || "#e11d48"
          }
          onSelectColor={(color) => {
            if (colorPickerTarget === "foreground") setForegroundColor(color);
            else if (colorPickerTarget === "background") setBackgroundColor(color);
            else if (selectedLayerId) handleUpdateLayer(selectedLayerId, { color });
          }}
          onClose={() => setColorPickerTarget(null)}
        />
      )}
    </main>
  );
}
