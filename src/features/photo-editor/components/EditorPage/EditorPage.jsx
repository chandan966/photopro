import { useCallback, useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Aperture,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Blend,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  Crop,
  Download,
  Eraser,
  Expand,
  Eye,
  EyeOff,
  Film,
  FlipHorizontal2,
  FlipVertical2,
  Frame,
  Image as ImageIcon,
  Layers,
  Lock,
  Minus,
  Monitor,
  Move,
  Paintbrush,
  Palette,
  Plus,
  Redo2,
  RotateCcw,
  RotateCw,
  Save,
  Scissors,
  Sliders,
  SlidersHorizontal,
  Smile,
  Sparkles,
  SplitSquareVertical,
  Square,
  Sticker,
  Sun,
  Trash2,
  Type,
  Undo2,
  Unlock,
  Upload,
  Wand2,
  WandSparkles,
  X,
  Zap,
  Grid,
  Maximize2,
  Minimize2,
  History as HistoryIcon,
  Keyboard,
  Info,
  Pipette,
  Flame,
  SunMedium,
} from "lucide-react";
import {
  canvasBlob,
  createDemoSampleBlob,
  downloadBlob,
  drawShape,
  loadImage,
} from "../../../../utils/imageTools.js";
import {
  applyCartoonEffect,
  applyColorizationEffect,
  applyCubeLUT,
  applyDuotoneEffect,
  applyEmbossEffect,
  applyGlitchEffect,
  applyHDREffect,
  applyHSLColorMixer,
  applyLightroomAdjustments,
  applyOilPaintingEffect,
  applyPixelateEffect,
  applySepiaEffect,
  applySketchEffect,
  applySkinSmoothing,
  applyTeethWhitening,
  parseCubeLUT,
} from "../../services/filters.js";
import { CanvasToolManager } from "../../services/tools.js";
import { saveProjectToLocal } from "../../services/projectStore.js";
import {
  BLEND_MODES,
  FILTER_PRESETS,
  FONT_OPTIONS,
  GRADIENT_PRESETS,
  MAX_UPLOAD_BYTES,
  PRESETS,
  SHAPE_OPTIONS,
  SOLID_COLORS,
  STICKER_LIBRARY,
} from "../../../../constants/presets.js";
import LightroomPanel from "../LightroomPanel/LightroomPanel.jsx";
import EffectsPanel from "../EffectsPanel/EffectsPanel.jsx";
import RetouchPanel from "../RetouchPanel/RetouchPanel.jsx";
import BeforeAfterSlider from "../BeforeAfterSlider/BeforeAfterSlider.jsx";
import ExportModal from "../ExportModal/ExportModal.jsx";
import "./EditorPage.css";

const DEFAULT_LR_SETTINGS = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
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

function EditorPage({ notify, onExit, initialPreset = PRESETS[0], initialFile, onInitialFileHandled }) {
  const [preset, setPreset] = useState(initialPreset);
  const [activeTab, setActiveTab] = useState("Canvas"); // Canvas, Media, Lightroom, Effects, Retouch, Text, Elements, Stickers, Background
  const [activeTool, setActiveTool] = useState("move"); // move, crop, brush, eraser, clone, healing
  const [zoom, setZoom] = useState(65);
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // Original image state for Before/After comparison
  const [originalImageSrc, setOriginalImageSrc] = useState(null);
  const [beforeAfterOpen, setBeforeAfterOpen] = useState(false);

  // Lightroom & HSL Settings
  const [lrSettings, setLrSettings] = useState(DEFAULT_LR_SETTINGS);
  const [hslMixer, setHslMixer] = useState(DEFAULT_HSL_MIXER);

  // Background
  const [bgType, setBgType] = useState("solid");
  const [canvasColor, setCanvasColor] = useState("#090b0e");
  const [activeGradient, setActiveGradient] = useState(GRADIENT_PRESETS[0]);
  const [activeFilter, setActiveFilter] = useState("None");

  // Interactive Brush / Retouch Tool settings
  const [brushSize, setBrushSize] = useState(18);
  const [brushColor, setBrushColor] = useState("#e11d48");
  const [brushOpacity, setBrushOpacity] = useState(1);

  // Modals & UI Toggles
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPreview, setExportPreview] = useState("");
  const [customSizeOpen, setCustomSizeOpen] = useState(false);
  const [customWidth, setCustomWidth] = useState(1280);
  const [customHeight, setCustomHeight] = useState(720);
  const [exportType, setExportType] = useState("image/png");
  const [editorError, setEditorError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const uploadRef = useRef(null);
  const canvasRef = useRef(null);
  const toolManagerRef = useRef(null);
  const dragRef = useRef(null);
  const lastPointRef = useRef(null);
  const processedInitialFileRef = useRef(null);

  // Tool Manager Initialization
  useEffect(() => {
    if (canvasRef.current) {
      toolManagerRef.current = new CanvasToolManager(canvasRef.current);
    }
  }, []);

  // Snapshot for Undo/Redo
  const snapshot = useCallback(() => {
    setHistory((items) => [
      ...items.slice(-25),
      {
        layers: JSON.parse(JSON.stringify(layers)),
        preset,
        lrSettings: { ...lrSettings },
        hslMixer: JSON.parse(JSON.stringify(hslMixer)),
        activeFilter,
        bgType,
        canvasColor,
        activeGradient,
      },
    ]);
    setFuture([]);
    setSavedLocally(false);
  }, [layers, preset, lrSettings, hslMixer, activeFilter, bgType, canvasColor, activeGradient]);

  // Add Image Layer
  const addImageFiles = async (files) => {
    const file = [...files].find((item) => item.type.startsWith("image/"));
    if (!file) {
      setEditorError("Please choose a valid image file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setEditorError("File exceeds 50 MB limit. Please select a smaller photo.");
      return;
    }
    try {
      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      snapshot();
      const scale = Math.min((preset.width * 0.8) / img.width, (preset.height * 0.8) / img.height, 1);
      const newLayer = {
        id: crypto.randomUUID(),
        type: "image",
        name: file.name.slice(0, 20),
        url,
        x: (preset.width - img.width * scale) / 2,
        y: (preset.height - img.height * scale) / 2,
        width: img.width * scale,
        height: img.height * scale,
        opacity: 1,
        blendMode: "source-over",
        visible: true,
        locked: false,
      };

      if (!originalImageSrc) {
        setOriginalImageSrc(url);
      }

      setLayers((existing) => [...existing, newLayer]);
      setSelectedLayerId(newLayer.id);
      setEditorError("");
      notify?.("Added image to canvas");
    } catch (err) {
      setEditorError(err.message);
    }
  };

  // Add Demo Sample Artwork
  const addDemoSample = async () => {
    try {
      const demo = await createDemoSampleBlob("photopro-creative.jpg");
      await addImageFiles([demo]);
    } catch (err) {
      setEditorError(err.message);
    }
  };

  // Initial File handler
  useEffect(() => {
    if (!initialFile || processedInitialFileRef.current === initialFile) return;
    processedInitialFileRef.current = initialFile;
    void addImageFiles([initialFile]);
    onInitialFileHandled();
  }, [initialFile]);

  // Add Typography Layer
  const addTextLayer = (style = "heading") => {
    snapshot();
    let text = "Bold Headline";
    let fontSize = Math.round(preset.width * 0.065);
    let fontFamily = "Montserrat";
    let color = "#ffffff";
    let bold = true;

    if (style === "subheading") {
      text = "Secondary Text";
      fontSize = Math.round(preset.width * 0.038);
      fontFamily = "DM Sans";
      color = "#f43f5e";
      bold = false;
    } else if (style === "badge") {
      text = "NEW PRO";
      fontSize = Math.round(preset.width * 0.026);
      fontFamily = "Inter";
      color = "#ffffff";
      bold = true;
    }

    const newLayer = {
      id: crypto.randomUUID(),
      type: "text",
      name: text.slice(0, 18),
      text,
      x: preset.width * 0.15,
      y: preset.height * 0.45,
      fontSize,
      fontFamily,
      color,
      bold,
      italic: false,
      uppercase: style === "badge",
      opacity: 1,
      blendMode: "source-over",
      align: "left",
      hasShadow: true,
      shadowColor: "rgba(0,0,0,0.8)",
      shadowBlur: 16,
      strokeWidth: 0,
      strokeColor: "#000000",
      visible: true,
      locked: false,
    };
    setLayers((existing) => [...existing, newLayer]);
    setSelectedLayerId(newLayer.id);
    notify?.("Added text layer");
  };

  // Add Shape Layer
  const addShapeLayer = (shapeType = "rectangle") => {
    snapshot();
    const size = Math.min(preset.width, preset.height) * 0.28;
    const newLayer = {
      id: crypto.randomUUID(),
      type: "shape",
      shapeType,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
      x: (preset.width - size) / 2,
      y: (preset.height - size) / 2,
      width: size,
      height: size * (shapeType === "rounded" ? 0.65 : 1),
      color: "#e11d48",
      strokeColor: "#ffffff",
      strokeWidth: 0,
      opacity: 0.95,
      blendMode: "source-over",
      visible: true,
      locked: false,
    };
    setLayers((existing) => [...existing, newLayer]);
    setSelectedLayerId(newLayer.id);
    notify?.(`Added ${newLayer.name}`);
  };

  // Add Sticker / Badge Layer
  const addStickerLayer = (stickerItem) => {
    snapshot();
    const size = Math.min(preset.width, preset.height) * 0.18;
    const newLayer = {
      id: crypto.randomUUID(),
      type: "sticker",
      stickerId: stickerItem.id,
      name: stickerItem.label,
      iconText: stickerItem.icon,
      badgeText: stickerItem.text || "",
      x: preset.width * 0.4,
      y: preset.height * 0.35,
      width: size,
      height: size,
      color: stickerItem.color || "#e11d48",
      opacity: 1,
      blendMode: "source-over",
      visible: true,
      locked: false,
    };
    setLayers((existing) => [...existing, newLayer]);
    setSelectedLayerId(newLayer.id);
    notify?.(`Added ${stickerItem.label} sticker`);
  };

  // Master Render Engine (Canvas drawing loop)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = preset.width;
    canvas.height = preset.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render Canvas Background
    if (bgType === "solid") {
      ctx.fillStyle = canvasColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgType === "gradient" && activeGradient) {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, activeGradient.stops[0]);
      grad.addColorStop(1, activeGradient.stops[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Canvas Filter Preset
    const currentFilterObj = FILTER_PRESETS.find((f) => f.name === activeFilter);
    ctx.filter = currentFilterObj?.filter || "none";

    const renderLayer = async (layer) => {
      if (layer.visible === false) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity ?? 1;
      ctx.globalCompositeOperation = layer.blendMode || "source-over";

      if (layer.type === "image" && layer.url) {
        try {
          const img = await loadImage(layer.url);
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
        } catch {
          // Skip unloadable image
        }
      } else if (layer.type === "text") {
        const fontText = `${layer.bold ? "bold " : ""}${layer.italic ? "italic " : ""}${layer.fontSize}px "${layer.fontFamily || "DM Sans"}", sans-serif`;
        ctx.font = fontText;
        ctx.textAlign = layer.align || "left";

        if (layer.hasShadow) {
          ctx.shadowColor = layer.shadowColor || "rgba(0,0,0,0.8)";
          ctx.shadowBlur = layer.shadowBlur || 14;
        }

        const displayText = layer.uppercase ? layer.text.toUpperCase() : layer.text;
        if (layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.strokeColor || "#000000";
          ctx.lineWidth = layer.strokeWidth;
          ctx.strokeText(displayText, layer.x, layer.y);
        }

        ctx.fillStyle = layer.color || "#ffffff";
        ctx.fillText(displayText, layer.x, layer.y);
      } else if (layer.type === "shape") {
        drawShape(ctx, layer.shapeType || "rectangle", layer.x, layer.y, layer.width, layer.height, {
          color: layer.color,
          strokeColor: layer.strokeColor,
          strokeWidth: layer.strokeWidth,
        });
      } else if (layer.type === "sticker") {
        if (layer.badgeText) {
          ctx.fillStyle = layer.color;
          const radius = layer.height * 0.25;
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(layer.x, layer.y, layer.width, layer.height, radius);
          } else {
            ctx.rect(layer.x, layer.y, layer.width, layer.height);
          }
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = `800 ${Math.round(layer.height * 0.45)}px "Inter", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(layer.badgeText, layer.x + layer.width / 2, layer.y + layer.height / 2);
        } else if (layer.iconText) {
          ctx.font = `${Math.round(layer.height * 0.85)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(layer.iconText, layer.x + layer.width / 2, layer.y + layer.height / 2);
        }
      }
      ctx.restore();
    };

    (async () => {
      for (const layer of layers) {
        await renderLayer(layer);
      }
      ctx.filter = "none";

      // Apply Lightroom Adjustments on the Canvas ImageData
      const hasLr = Object.values(lrSettings).some((v) => v !== 0);
      const hasHsl = Object.values(hslMixer).some((c) => c.h !== 0 || c.s !== 0 || c.l !== 0);

      if (hasLr || hasHsl) {
        const fullFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (hasLr) applyLightroomAdjustments(fullFrame, lrSettings);
        if (hasHsl) applyHSLColorMixer(fullFrame, hslMixer);
        ctx.putImageData(fullFrame, 0, 0);
      }

      // Draw Selected Layer Bounding Box Indicator
      const activeLayer = layers.find((l) => l.id === selectedLayerId && l.visible !== false);
      if (activeLayer && activeTool === "move") {
        ctx.save();
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = Math.max(2, Math.round(preset.width * 0.002));
        ctx.setLineDash([6, 6]);

        let bx = activeLayer.x;
        let by = activeLayer.y;
        let bw = activeLayer.width || 120;
        let bh = activeLayer.height || 60;

        if (activeLayer.type === "text") {
          ctx.font = `${activeLayer.bold ? "bold " : ""}${activeLayer.fontSize}px "${activeLayer.fontFamily || "DM Sans"}"`;
          const textMetrics = ctx.measureText(activeLayer.text);
          bw = textMetrics.width;
          bh = activeLayer.fontSize * 1.2;
          by = activeLayer.y - activeLayer.fontSize * 0.9;
        }

        ctx.strokeRect(bx - 4, by - 4, bw + 8, bh + 8);

        // Corner handles
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        const handleSize = 8;
        const corners = [
          [bx - 4, by - 4],
          [bx + bw + 4, by - 4],
          [bx - 4, by + bh + 4],
          [bx + bw + 4, by + bh + 4],
        ];
        corners.forEach(([hx, hy]) => {
          ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
        });
        ctx.restore();
      }
    })();
  }, [preset, layers, lrSettings, hslMixer, activeFilter, bgType, canvasColor, activeGradient, selectedLayerId, activeTool]);

  // Apply Creative Photoshop Effects
  const applyCreativeEffect = (effectType) => {
    if (!canvasRef.current) return;
    snapshot();
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        if (effectType === "cartoon") applyCartoonEffect(canvas);
        else if (effectType === "sketch") applySketchEffect(canvas);
        else if (effectType === "oil") applyOilPaintingEffect(canvas);
        else if (effectType === "glitch") applyGlitchEffect(canvas);
        else if (effectType === "sepia") applySepiaEffect(canvas);
        else if (effectType === "hdr") applyHDREffect(canvas);
        else if (effectType === "duotone") applyDuotoneEffect(canvas, "#e11d48", "#090b0e");
        else if (effectType === "pixelate") applyPixelateEffect(canvas, 14);
        else if (effectType === "emboss") applyEmbossEffect(canvas);
        else if (effectType === "lightleak") toolManagerRef.current?.renderLightLeak();
        else if (effectType === "lensflare") toolManagerRef.current?.renderLensFlare(canvas.width * 0.75, canvas.height * 0.25);

        // Save result as new raster layer
        const url = canvas.toDataURL("image/png");
        const effectLayer = {
          id: crypto.randomUUID(),
          type: "image",
          name: `${effectType.toUpperCase()} Effect`,
          url,
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
          opacity: 1,
          blendMode: "source-over",
          visible: true,
          locked: false,
        };
        setLayers([effectLayer]);
        setSelectedLayerId(effectLayer.id);
        notify?.(`Applied ${effectType} effect`);
      } catch (err) {
        setEditorError(err.message);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // Import and Apply 3D LUT (.cube)
  const handleImportLUT = (lutText, lutName) => {
    if (!canvasRef.current) return;
    snapshot();
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const lut = parseCubeLUT(lutText);
        applyCubeLUT(canvas, lut);
        const url = canvas.toDataURL("image/png");
        const lutLayer = {
          id: crypto.randomUUID(),
          type: "image",
          name: `LUT (${lutName})`,
          url,
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
          opacity: 1,
          blendMode: "source-over",
          visible: true,
          locked: false,
        };
        setLayers([lutLayer]);
        setSelectedLayerId(lutLayer.id);
        notify?.(`Applied 3D LUT profile: ${lutName}`);
      } catch (err) {
        setEditorError(`LUT error: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // Apply Beauty Retouching (Skin Smoothing, Whitening, Colorize)
  const applyRetouchAction = (action, params = {}) => {
    if (!canvasRef.current) return;
    snapshot();
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        if (action === "skin-smooth") applySkinSmoothing(canvas, params.intensity || 0.6);
        else if (action === "teeth-whiten") applyTeethWhitening(canvas);
        else if (action === "colorize") applyColorizationEffect(canvas);

        const url = canvas.toDataURL("image/png");
        const retouchLayer = {
          id: crypto.randomUUID(),
          type: "image",
          name: `${action.toUpperCase()} Layer`,
          url,
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
          opacity: 1,
          blendMode: "source-over",
          visible: true,
          locked: false,
        };
        setLayers([retouchLayer]);
        setSelectedLayerId(retouchLayer.id);
        notify?.(`Applied ${action} retouch`);
      } catch (err) {
        setEditorError(err.message);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  // Layer Reordering
  const moveLayer = (direction) => {
    if (!selectedLayerId) return;
    const index = layers.findIndex((l) => l.id === selectedLayerId);
    if (index === -1) return;

    snapshot();
    const newLayers = [...layers];
    if (direction === "up" && index < newLayers.length - 1) {
      const temp = newLayers[index];
      newLayers[index] = newLayers[index + 1];
      newLayers[index + 1] = temp;
    } else if (direction === "down" && index > 0) {
      const temp = newLayers[index];
      newLayers[index] = newLayers[index - 1];
      newLayers[index - 1] = temp;
    }
    setLayers(newLayers);
  };

  // Duplicate Layer
  const duplicateSelected = () => {
    const selected = layers.find((l) => l.id === selectedLayerId);
    if (!selected) return;
    snapshot();
    const copy = {
      ...JSON.parse(JSON.stringify(selected)),
      id: crypto.randomUUID(),
      name: `${selected.name} (Copy)`,
      x: selected.x + 35,
      y: selected.y + 35,
    };
    setLayers((existing) => [...existing, copy]);
    setSelectedLayerId(copy.id);
    notify?.("Duplicated layer");
  };

  // Delete Layer
  const deleteSelected = () => {
    if (!selectedLayerId) return;
    snapshot();
    setLayers((items) => items.filter((l) => l.id !== selectedLayerId));
    setSelectedLayerId(null);
    notify?.("Layer removed");
  };

  // Toggle Visibility & Lock
  const toggleVisibility = (id) => {
    snapshot();
    setLayers((items) => items.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  const toggleLock = (id) => {
    snapshot();
    setLayers((items) => items.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)));
  };

  // Rotate & Flip
  const transformSelected = async (operation) => {
    const selected = layers.find((l) => l.id === selectedLayerId);
    if (!selected || selected.type !== "image") {
      notify?.("Select an image layer to rotate or flip.");
      return;
    }
    try {
      const img = await loadImage(selected.url);
      const cropInset = operation === "crop" ? 0.1 : 0;
      const sWidth = img.width * (1 - cropInset * 2);
      const sHeight = img.height * (1 - cropInset * 2);
      const rotated = operation === "rotate";
      const output = document.createElement("canvas");
      output.width = rotated ? sHeight : sWidth;
      output.height = rotated ? sWidth : sHeight;
      const ctx = output.getContext("2d");
      if (!ctx) return;

      if (rotated) {
        ctx.translate(output.width / 2, output.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      } else {
        if (operation === "flipH") {
          ctx.translate(output.width, 0);
          ctx.scale(-1, 1);
        }
        if (operation === "flipV") {
          ctx.translate(0, output.height);
          ctx.scale(1, -1);
        }
        ctx.drawImage(img, img.width * cropInset, img.height * cropInset, sWidth, sHeight, 0, 0, sWidth, sHeight);
      }

      const blob = await canvasBlob(output, "image/png");
      const url = URL.createObjectURL(blob);
      snapshot();
      setLayers((items) =>
        items.map((layer) =>
          layer.id === selected.id
            ? {
                ...layer,
                url,
                width: rotated ? layer.height : layer.width,
                height: rotated ? layer.width : layer.height,
              }
            : layer
        )
      );
      notify?.("Layer transformed");
    } catch (err) {
      setEditorError(err.message);
    }
  };

  // Undo & Redo
  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setFuture((items) => [
      ...items,
      {
        layers: JSON.parse(JSON.stringify(layers)),
        preset,
        lrSettings: { ...lrSettings },
        hslMixer: JSON.parse(JSON.stringify(hslMixer)),
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
    setActiveFilter(prev.activeFilter);
    setBgType(prev.bgType);
    setCanvasColor(prev.canvasColor);
    setActiveGradient(prev.activeGradient);
    setHistory((items) => items.slice(0, -1));
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[future.length - 1];
    setHistory((items) => [
      ...items,
      {
        layers: JSON.parse(JSON.stringify(layers)),
        preset,
        lrSettings: { ...lrSettings },
        hslMixer: JSON.parse(JSON.stringify(hslMixer)),
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
    setActiveFilter(next.activeFilter);
    setBgType(next.bgType);
    setCanvasColor(next.canvasColor);
    setActiveGradient(next.activeGradient);
    setFuture((items) => items.slice(0, -1));
  };

  // Save Project to Local Storage
  const handleSaveProject = () => {
    const project = {
      id: crypto.randomUUID(),
      name: `${preset.name} Artwork`,
      preset,
      layers: JSON.parse(JSON.stringify(layers)),
      lrSettings,
      hslMixer,
      activeFilter,
      createdAt: new Date().toISOString(),
    };
    saveProjectToLocal(project);
    setSavedLocally(true);
    notify?.("Project saved to local storage!");
    setTimeout(() => setSavedLocally(false), 3000);
  };

  // High Resolution Export (JPG, PNG, WebP, PDF with 4K scaling & Quality)
  const exportDesign = async (size = "original", quality = 0.95) => {
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

      const safeBaseName = `photopro-${preset.name.toLowerCase().replace(/\s+/g, "-")}`;

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
        downloadBlob(pdfBlob, `${safeBaseName}.pdf`);
      } else {
        const blob = await canvasBlob(exportCanvas, exportType, quality);
        const ext = exportType.split("/")[1].replace("jpeg", "jpg");
        downloadBlob(blob, `${safeBaseName}.${ext}`);
      }

      setExportOpen(false);
      notify?.("High-resolution export completed!");
    } catch (err) {
      setEditorError(err.message);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedLayerId) {
        e.preventDefault();
        deleteSelected();
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selectedLayerId) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setLayers((items) =>
          items.map((l) => {
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <main className="editor-app">
      {/* TOPBAR */}
      <header className="editor-topbar">
        <button className="icon-btn" onClick={onExit} title="Back to Home">
          <ArrowLeft size={18} />
        </button>
        <button className="brand editor-brand" onClick={onExit}>
          <span className="brand-mark"><Aperture size={18} /></span>
          Photo<span>Pro</span>
        </button>

        <div className="editor-doc-badge">
          <span className="doc-name">{preset.name}</span>
          <span className="doc-dim">{preset.width} × {preset.height} px</span>
        </div>

        <div className="top-action-bar">
          <button className="icon-btn" title="Undo (Ctrl+Z)" onClick={undo} disabled={!history.length}>
            <Undo2 size={16} />
          </button>
          <button className="icon-btn" title="Redo (Ctrl+Y)" onClick={redo} disabled={!future.length}>
            <Redo2 size={16} />
          </button>
          <div className="top-divider" />
          <button
            className="button button-outline mini-btn"
            onClick={() => setBeforeAfterOpen(true)}
            title="Compare with Original Image"
          >
            <SplitSquareVertical size={14} /> Split View
          </button>
          <button
            className={`button button-outline mini-btn ${savedLocally ? "saved" : ""}`}
            onClick={handleSaveProject}
            title="Save Project to Browser"
          >
            <Save size={14} /> {savedLocally ? "Saved!" : "Save"}
          </button>
          <div className="top-divider" />
          <button
            className={`icon-btn ${showGrid ? "active" : ""}`}
            title="Toggle Alignment Grid"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid size={15} />
          </button>
          <button
            className={`icon-btn ${historyPanelOpen ? "active" : ""}`}
            title="History Panel"
            onClick={() => setHistoryPanelOpen(!historyPanelOpen)}
          >
            <HistoryIcon size={15} />
          </button>
          <button
            className="icon-btn"
            title="EXIF & Image Metadata"
            onClick={() => setMetadataOpen(true)}
          >
            <Info size={15} />
          </button>
          <button
            className="icon-btn"
            title="Keyboard Shortcuts"
            onClick={() => setShortcutsOpen(true)}
          >
            <Keyboard size={15} />
          </button>
          <button
            className="icon-btn"
            title="Toggle Fullscreen"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <div className="top-divider" />
          <button
            className="button button-primary editor-export-btn"
            onClick={() => {
              setExportPreview(canvasRef.current?.toDataURL("image/png") || "");
              setExportOpen(true);
            }}
          >
            <Download size={15} /> Export
          </button>
        </div>
      </header>

      {/* WORKSPACE LAYOUT */}
      <div className="editor-layout">
        {/* LEFT TOOL RAIL */}
        <aside className="tool-rail">
          {[
            { id: "Canvas", label: "Canvas", icon: Frame },
            { id: "Media", label: "Media", icon: Upload },
            { id: "Lightroom", label: "Lightroom", icon: Sliders },
            { id: "Effects", label: "Effects", icon: Film },
            { id: "Retouch", label: "Retouch", icon: Sparkles },
            { id: "Text", label: "Text", icon: Type },
            { id: "Elements", label: "Shapes", icon: Square },
            { id: "Stickers", label: "Stickers", icon: Sticker },
            { id: "Background", label: "Colors", icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`rail-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "Media" && !layers.length) uploadRef.current?.click();
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* LEFT TOOL SIDEBAR */}
        <section className="editor-left-sidebar">
          {/* TAB: CANVAS */}
          {activeTab === "Canvas" && (
            <div className="sidebar-tab-content">
              <div className="sidebar-heading">
                <h3>Canvas Presets</h3>
                <p>Social media dimensions & display formats.</p>
              </div>
              <div className="preset-scroll-list">
                {PRESETS.map((item) => (
                  <button
                    key={item.name}
                    className={`preset-select-card ${preset.name === item.name ? "selected" : ""}`}
                    onClick={() => {
                      snapshot();
                      setPreset(item);
                    }}
                  >
                    <span className="preset-dot" style={{ backgroundColor: item.color }} />
                    <div className="preset-meta">
                      <strong>{item.name}</strong>
                      <small>{item.width} × {item.height} • {item.category}</small>
                    </div>
                  </button>
                ))}
              </div>
              <button
                className="button button-outline full-width custom-size-btn"
                onClick={() => {
                  setCustomWidth(preset.width);
                  setCustomHeight(preset.height);
                  setCustomSizeOpen(true);
                }}
              >
                <Plus size={15} /> Custom Dimensions
              </button>
            </div>
          )}

          {/* TAB: MEDIA */}
          {activeTab === "Media" && (
            <div className="sidebar-tab-content">
              <div className="sidebar-heading">
                <h3>Add Photos & Graphics</h3>
                <p>Drag images into workspace or choose local files.</p>
              </div>
              <button className="upload-dropzone-panel" onClick={() => uploadRef.current?.click()}>
                <Upload size={24} />
                <strong>Upload Photo</strong>
                <small>PNG, JPG, WebP up to 50 MB</small>
              </button>
              <button className="button button-outline full-width demo-add-btn" onClick={addDemoSample}>
                <Sparkles size={15} /> Add Sample Graphic
              </button>
            </div>
          )}

          {/* TAB: LIGHTROOM */}
          {activeTab === "Lightroom" && (
            <div className="sidebar-tab-content">
              <LightroomPanel
                settings={lrSettings}
                onChange={(s) => {
                  snapshot();
                  setLrSettings(s);
                }}
                hslMixer={hslMixer}
                onHslChange={(h) => {
                  snapshot();
                  setHslMixer(h);
                }}
                onReset={() => {
                  snapshot();
                  setLrSettings(DEFAULT_LR_SETTINGS);
                  setHslMixer(DEFAULT_HSL_MIXER);
                  notify?.("Reset tone adjustments");
                }}
              />
            </div>
          )}

          {/* TAB: EFFECTS */}
          {activeTab === "Effects" && (
            <div className="sidebar-tab-content">
              <EffectsPanel
                onApplyEffect={applyCreativeEffect}
                isProcessing={isProcessing}
                onImportLUT={handleImportLUT}
              />
            </div>
          )}

          {/* TAB: RETOUCH */}
          {activeTab === "Retouch" && (
            <div className="sidebar-tab-content">
              <RetouchPanel
                onApplyRetouch={applyRetouchAction}
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {/* TAB: TEXT */}
          {activeTab === "Text" && (
            <div className="sidebar-tab-content">
              <div className="sidebar-heading">
                <h3>Canva Typography</h3>
                <p>Click to insert pre-styled typography layers.</p>
              </div>
              <div className="text-preset-buttons">
                <button className="text-preset-row heading" onClick={() => addTextLayer("heading")}>
                  <span className="sample-text-h1">Add Large Heading</span>
                  <small>Bold Montserrat</small>
                </button>
                <button className="text-preset-row subheading" onClick={() => addTextLayer("subheading")}>
                  <span className="sample-text-h2">Add Subheading</span>
                  <small>Clean DM Sans Accent</small>
                </button>
                <button className="text-preset-row badge" onClick={() => addTextLayer("badge")}>
                  <span className="sample-text-tag">PRO BADGE TAG</span>
                  <small>Uppercase UI Tag</small>
                </button>
              </div>
            </div>
          )}

          {/* TAB: SHAPES */}
          {activeTab === "Elements" && (
            <div className="sidebar-tab-content">
              <div className="sidebar-heading">
                <h3>Vector Elements</h3>
                <p>Insert vector shapes, badges, and direction arrows.</p>
              </div>
              <div className="shape-grid-picker">
                {SHAPE_OPTIONS.map((shp) => (
                  <button key={shp.id} className="shape-picker-card" onClick={() => addShapeLayer(shp.id)}>
                    <Square size={18} />
                    <span>{shp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: STICKERS */}
          {activeTab === "Stickers" && (
            <div className="sidebar-tab-content">
              <div className="sidebar-heading">
                <h3>Stickers & Badges</h3>
                <p>Social overlays for YouTube thumbnails & marketing.</p>
              </div>
              <div className="sticker-grid-picker">
                {STICKER_LIBRARY.map((item) => (
                  <button key={item.id} className="sticker-card-btn" onClick={() => addStickerLayer(item)}>
                    <span className="sticker-emoji">{item.icon}</span>
                    <span className="sticker-lbl">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BACKGROUND */}
          {activeTab === "Background" && (
            <div className="sidebar-tab-content">
              <div className="sidebar-heading">
                <h3>Canvas Background</h3>
                <p>Solid crimson tones, gradients, or transparent.</p>
              </div>
              <div className="bg-type-selector">
                <button className={bgType === "solid" ? "active" : ""} onClick={() => setBgType("solid")}>
                  Solid
                </button>
                <button className={bgType === "gradient" ? "active" : ""} onClick={() => setBgType("gradient")}>
                  Gradient
                </button>
                <button className={bgType === "transparent" ? "active" : ""} onClick={() => setBgType("transparent")}>
                  Transparent
                </button>
              </div>

              {bgType === "solid" && (
                <>
                  <div className="color-palette-grid">
                    {SOLID_COLORS.map((c) => (
                      <button
                        key={c}
                        className="color-chip-btn"
                        style={{ backgroundColor: c }}
                        onClick={() => {
                          snapshot();
                          setCanvasColor(c);
                        }}
                      />
                    ))}
                  </div>
                  <label className="field-label custom-picker-label">
                    <span>Custom Hex</span>
                    <input
                      type="color"
                      value={canvasColor}
                      onChange={(e) => {
                        snapshot();
                        setCanvasColor(e.target.value);
                      }}
                    />
                  </label>
                </>
              )}

              {bgType === "gradient" && (
                <div className="gradient-palette-grid">
                  {GRADIENT_PRESETS.map((grad) => (
                    <button
                      key={grad.id}
                      className={`grad-chip-btn ${activeGradient.id === grad.id ? "active" : ""}`}
                      style={{ background: `linear-gradient(135deg, ${grad.stops[0]}, ${grad.stops[1]})` }}
                      onClick={() => {
                        snapshot();
                        setActiveGradient(grad);
                      }}
                    >
                      <span>{grad.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* CENTER WORKSPACE */}
        <section
          className="canvas-center-workspace"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addImageFiles(e.dataTransfer.files);
          }}
        >
          {/* TOOLBAR RAIL */}
          <div className="center-floating-toolbar">
            <button
              className={`tool-pill-btn ${activeTool === "move" ? "active" : ""}`}
              onClick={() => setActiveTool("move")}
              title="Move & Select (V)"
            >
              <Move size={15} />
            </button>
            <button
              className={`tool-pill-btn ${activeTool === "brush" ? "active" : ""}`}
              onClick={() => setActiveTool("brush")}
              title="Paintbrush (B)"
            >
              <Paintbrush size={15} />
            </button>
            <button
              className={`tool-pill-btn ${activeTool === "eraser" ? "active" : ""}`}
              onClick={() => setActiveTool("eraser")}
              title="Eraser (E)"
            >
              <Eraser size={15} />
            </button>
            <button
              className={`tool-pill-btn ${activeTool === "healing" ? "active" : ""}`}
              onClick={() => setActiveTool("healing")}
              title="Spot Healing Brush (J)"
            >
              <Sparkles size={15} />
            </button>
            <button
              className={`tool-pill-btn ${activeTool === "clone" ? "active" : ""}`}
              onClick={() => setActiveTool("clone")}
              title="Clone Stamp Tool (S)"
            >
              <Copy size={15} />
            </button>
            <button
              className={`tool-pill-btn ${activeTool === "dodge" ? "active" : ""}`}
              onClick={() => setActiveTool("dodge")}
              title="Dodge Tool (Lighten)"
            >
              <SunMedium size={15} />
            </button>
            <button
              className={`tool-pill-btn ${activeTool === "burn" ? "active" : ""}`}
              onClick={() => setActiveTool("burn")}
              title="Burn Tool (Darken)"
            >
              <Flame size={15} />
            </button>
            <button
              className={`tool-pill-btn ${activeTool === "eyedropper" ? "active" : ""}`}
              onClick={() => setActiveTool("eyedropper")}
              title="Eyedropper Sampler (I)"
            >
              <Pipette size={15} />
            </button>
          </div>

          <div className="workspace-status-bar">
            <span className="status-indicator">
              <span className="red-dot" /> 60 FPS Hardware Render
            </span>
            <span className="status-hint">Active Tool: {activeTool.toUpperCase()} • Arrow keys to nudge</span>
          </div>

          <div className="canvas-viewport">
            <div className={`canvas-render-wrapper ${showGrid ? "has-grid" : ""}`} style={{ width: `${zoom}%` }}>
              <canvas
                ref={canvasRef}
                className="active-design-canvas"
                onPointerDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * preset.width;
                  const y = ((e.clientY - rect.top) / rect.height) * preset.height;
                  lastPointRef.current = { x, y };

                  if (activeTool === "healing") {
                    toolManagerRef.current?.healSpot(x, y, brushSize);
                    return;
                  }
                  if (activeTool === "clone" && e.altKey) {
                    toolManagerRef.current?.setCloneSource(x, y);
                    notify?.("Clone source set!");
                    return;
                  }
                  if (activeTool === "clone") {
                    toolManagerRef.current?.paintClone(x, y, brushSize);
                    return;
                  }
                  if (activeTool === "dodge") {
                    toolManagerRef.current?.dodge(x, y, brushSize, 0.25);
                    return;
                  }
                  if (activeTool === "burn") {
                    toolManagerRef.current?.burn(x, y, brushSize, 0.25);
                    return;
                  }
                  if (activeTool === "eyedropper") {
                    const c = toolManagerRef.current?.sampleColor(x, y);
                    if (c) {
                      setBrushColor(c.hex);
                      notify?.(`Sampled color: ${c.hex}`);
                    }
                    return;
                  }

                  if (activeTool === "move") {
                    const layer = [...layers].reverse().find((item) => {
                      if (item.visible === false) return false;
                      if (item.type === "text") {
                        return (
                          x >= item.x - 20 &&
                          x <= item.x + preset.width * 0.4 &&
                          y >= item.y - item.fontSize &&
                          y <= item.y + item.fontSize * 0.4
                        );
                      }
                      return (
                        x >= item.x &&
                        x <= item.x + (item.width || 100) &&
                        y >= item.y &&
                        y <= item.y + (item.height || 100)
                      );
                    });

                    if (layer) {
                      setSelectedLayerId(layer.id);
                      if (!layer.locked) {
                        snapshot();
                        dragRef.current = { id: layer.id, x, y };
                        e.currentTarget.setPointerCapture(e.pointerId);
                      }
                    } else {
                      setSelectedLayerId(null);
                    }
                  }
                }}
                onPointerMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * preset.width;
                  const y = ((e.clientY - rect.top) / rect.height) * preset.height;

                  if (activeTool === "brush" && lastPointRef.current && e.buttons === 1) {
                    toolManagerRef.current?.drawBrushStroke(
                      lastPointRef.current.x,
                      lastPointRef.current.y,
                      x,
                      y,
                      brushColor,
                      brushSize,
                      brushOpacity
                    );
                    lastPointRef.current = { x, y };
                    return;
                  }
                  if (activeTool === "eraser" && lastPointRef.current && e.buttons === 1) {
                    toolManagerRef.current?.eraseStroke(
                      lastPointRef.current.x,
                      lastPointRef.current.y,
                      x,
                      y,
                      brushSize
                    );
                    lastPointRef.current = { x, y };
                    return;
                  }
                  if (activeTool === "clone" && e.buttons === 1) {
                    toolManagerRef.current?.paintClone(x, y, brushSize);
                    return;
                  }
                  if (activeTool === "dodge" && e.buttons === 1) {
                    toolManagerRef.current?.dodge(x, y, brushSize, 0.25);
                    return;
                  }
                  if (activeTool === "burn" && e.buttons === 1) {
                    toolManagerRef.current?.burn(x, y, brushSize, 0.25);
                    return;
                  }

                  if (dragRef.current && activeTool === "move") {
                    const dx = x - dragRef.current.x;
                    const dy = y - dragRef.current.y;
                    const targetId = dragRef.current.id;

                    setLayers((items) =>
                      items.map((item) =>
                        item.id === targetId ? { ...item, x: item.x + dx, y: item.y + dy } : item
                      )
                    );
                    dragRef.current = { ...dragRef.current, x, y };
                  }
                }}
                onPointerUp={() => {
                  dragRef.current = null;
                  lastPointRef.current = null;
                }}
              />
            </div>

            {layers.length === 0 && (
              <div className="empty-canvas-overlay">
                <div className="empty-icon-wrap">
                  <ImageIcon size={28} />
                </div>
                <h3>Your PhotoPro Canvas Is Ready</h3>
                <p>Drag photos into workspace or add typography and elements</p>
                <div className="empty-cta-row">
                  <button className="button button-primary" onClick={() => uploadRef.current?.click()}>
                    <Upload size={15} /> Upload Photo
                  </button>
                  <button className="button button-outline" onClick={addDemoSample}>
                    <Sparkles size={15} /> Add Demo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="canvas-bottom-bar">
            <span className="canvas-dim-tag">
              {preset.width} × {preset.height} px • {preset.name}
            </span>
            <div className="zoom-controller">
              <button className="icon-btn mini" onClick={() => setZoom((z) => Math.max(30, z - 5))}>
                <Minus size={14} />
              </button>
              <span className="zoom-level-text">{zoom}%</span>
              <button className="icon-btn mini" onClick={() => setZoom((z) => Math.min(150, z + 5))}>
                <Plus size={14} />
              </button>
              <button className="icon-btn mini" onClick={() => setZoom(65)} title="Fit to Screen">
                <Expand size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT LAYERS & PROPERTIES PANEL */}
        <aside className="properties-panel">
          {/* LAYERS MANAGER */}
          <div className="layers-stack-panel">
            <div className="layers-header">
              <span><Layers size={14} /> Layers Stack ({layers.length})</span>
              <div className="layers-actions">
                <button
                  className="icon-btn mini"
                  title="Move Down"
                  onClick={() => moveLayer("down")}
                  disabled={!selectedLayerId}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  className="icon-btn mini"
                  title="Move Up"
                  onClick={() => moveLayer("up")}
                  disabled={!selectedLayerId}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  className="icon-btn mini"
                  title="Duplicate"
                  onClick={duplicateSelected}
                  disabled={!selectedLayerId}
                >
                  <Copy size={14} />
                </button>
                <button
                  className="icon-btn mini delete"
                  title="Delete"
                  onClick={deleteSelected}
                  disabled={!selectedLayerId}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="layers-rows-container">
              {layers.length === 0 ? (
                <p className="no-layers-hint">No layers. Add images, text, or elements.</p>
              ) : (
                [...layers].reverse().map((layer) => (
                  <div
                    key={layer.id}
                    className={`layer-item-row ${layer.id === selectedLayerId ? "selected" : ""}`}
                    onClick={() => setSelectedLayerId(layer.id)}
                  >
                    <button
                      className="layer-vis-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(layer.id);
                      }}
                      title={layer.visible ? "Hide Layer" : "Show Layer"}
                    >
                      {layer.visible !== false ? <Eye size={13} /> : <EyeOff size={13} className="off" />}
                    </button>
                    <span className="layer-type-badge">
                      {layer.type === "image" && <ImageIcon size={13} />}
                      {layer.type === "text" && <Type size={13} />}
                      {layer.type === "shape" && <Square size={13} />}
                      {layer.type === "sticker" && <Sparkles size={13} />}
                    </span>
                    <span className="layer-title-text">{layer.name}</span>
                    <button
                      className="layer-lock-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(layer.id);
                      }}
                      title={layer.locked ? "Unlock" : "Lock"}
                    >
                      {layer.locked ? <Lock size={12} /> : <Unlock size={12} className="muted" />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sidebar-separator" />

          {/* SELECTED LAYER PROPERTIES */}
          <div className="prop-section-title">Layer Properties & Blend Modes</div>
          {selectedLayer ? (
            <div className="selected-layer-controls">
              <div className="selected-meta-badge">
                <strong>{selectedLayer.name}</strong>
                <span>({selectedLayer.type.toUpperCase()})</span>
              </div>

              {/* Blend Mode Selector */}
              <label className="field-label">
                <span>Blend Mode</span>
                <select
                  value={selectedLayer.blendMode || "source-over"}
                  onChange={(e) => {
                    snapshot();
                    setLayers((items) =>
                      items.map((l) => (l.id === selectedLayer.id ? { ...l, blendMode: e.target.value } : l))
                    );
                  }}
                >
                  {BLEND_MODES.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Opacity Slider */}
              <label className="slider-control">
                <div className="slider-label-row">
                  <span>Opacity</span>
                  <output>{Math.round((selectedLayer.opacity ?? 1) * 100)}%</output>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round((selectedLayer.opacity ?? 1) * 100)}
                  onChange={(e) => {
                    const opacity = Number(e.target.value) / 100;
                    setLayers((items) =>
                      items.map((l) => (l.id === selectedLayer.id ? { ...l, opacity } : l))
                    );
                  }}
                />
              </label>

              {/* Image Transform Controls */}
              {selectedLayer.type === "image" && (
                <div className="image-transform-buttons">
                  <button className="button button-outline mini-btn" onClick={() => transformSelected("rotate")}>
                    <RotateCw size={13} /> 90°
                  </button>
                  <button className="button button-outline mini-btn" onClick={() => transformSelected("flipH")}>
                    <FlipHorizontal2 size={13} /> Flip H
                  </button>
                  <button className="button button-outline mini-btn" onClick={() => transformSelected("flipV")}>
                    <FlipVertical2 size={13} /> Flip V
                  </button>
                </div>
              )}

              {/* Text Specific Controls */}
              {selectedLayer.type === "text" && (
                <div className="text-specific-controls">
                  <label className="field-label">
                    <span>Text Content</span>
                    <input
                      type="text"
                      value={selectedLayer.text}
                      onChange={(e) =>
                        setLayers((items) =>
                          items.map((l) =>
                            l.id === selectedLayer.id
                              ? { ...l, text: e.target.value, name: e.target.value.slice(0, 18) }
                              : l
                          )
                        )
                      }
                    />
                  </label>

                  <label className="field-label">
                    <span>Font Family</span>
                    <select
                      value={selectedLayer.fontFamily}
                      onChange={(e) => {
                        snapshot();
                        setLayers((items) =>
                          items.map((l) => (l.id === selectedLayer.id ? { ...l, fontFamily: e.target.value } : l))
                        );
                      }}
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="row-fields">
                    <label className="field-label">
                      <span>Size</span>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={selectedLayer.fontSize}
                        onChange={(e) =>
                          setLayers((items) =>
                            items.map((l) => (l.id === selectedLayer.id ? { ...l, fontSize: Number(e.target.value) } : l))
                          )
                        }
                      />
                    </label>
                    <label className="field-label">
                      <span>Color</span>
                      <input
                        type="color"
                        value={selectedLayer.color}
                        onChange={(e) =>
                          setLayers((items) =>
                            items.map((l) => (l.id === selectedLayer.id ? { ...l, color: e.target.value } : l))
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="row-fields">
                    <label className="field-label">
                      <span>Stroke (px)</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={selectedLayer.strokeWidth || 0}
                        onChange={(e) =>
                          setLayers((items) =>
                            items.map((l) => (l.id === selectedLayer.id ? { ...l, strokeWidth: Number(e.target.value) } : l))
                          )
                        }
                      />
                    </label>
                    <label className="field-label">
                      <span>Stroke Color</span>
                      <input
                        type="color"
                        value={selectedLayer.strokeColor || "#000000"}
                        onChange={(e) =>
                          setLayers((items) =>
                            items.map((l) => (l.id === selectedLayer.id ? { ...l, strokeColor: e.target.value } : l))
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="text-style-toggles">
                    <button
                      className={`toggle-btn ${selectedLayer.bold ? "active" : ""}`}
                      onClick={() =>
                        setLayers((items) =>
                          items.map((l) => (l.id === selectedLayer.id ? { ...l, bold: !l.bold } : l))
                        )
                      }
                    >
                      Bold
                    </button>
                    <button
                      className={`toggle-btn ${selectedLayer.italic ? "active" : ""}`}
                      onClick={() =>
                        setLayers((items) =>
                          items.map((l) => (l.id === selectedLayer.id ? { ...l, italic: !l.italic } : l))
                        )
                      }
                    >
                      Italic
                    </button>
                    <button
                      className={`toggle-btn ${selectedLayer.uppercase ? "active" : ""}`}
                      onClick={() =>
                        setLayers((items) =>
                          items.map((l) => (l.id === selectedLayer.id ? { ...l, uppercase: !l.uppercase } : l))
                        )
                      }
                    >
                      ALL CAPS
                    </button>
                  </div>
                </div>
              )}

              {/* Shape Specific Controls */}
              {selectedLayer.type === "shape" && (
                <div className="shape-specific-controls">
                  <label className="field-label">
                    <span>Fill Color</span>
                    <input
                      type="color"
                      value={selectedLayer.color}
                      onChange={(e) =>
                        setLayers((items) =>
                          items.map((l) => (l.id === selectedLayer.id ? { ...l, color: e.target.value } : l))
                        )
                      }
                    />
                  </label>
                </div>
              )}

              <button
                className="button button-outline full-width"
                onClick={() => {
                  snapshot();
                  setLayers((items) =>
                    items.map((l) =>
                      l.id === selectedLayer.id
                        ? { ...l, x: (preset.width - (l.width || 100)) / 2, y: preset.height * 0.45 }
                        : l
                    )
                  );
                  notify?.("Centered layer");
                }}
              >
                <Move size={14} /> Center On Canvas
              </button>
            </div>
          ) : (
            <p className="no-selection-hint">Select any layer to inspect blend modes and properties.</p>
          )}

          <div className="sidebar-separator" />

          {/* COLOR LUT FILTERS */}
          <div className="prop-section-title">Color Grading LUTs</div>
          <div className="filter-chips-grid">
            {FILTER_PRESETS.map((f) => (
              <button
                key={f.name}
                className={`filter-chip ${activeFilter === f.name ? "active" : ""}`}
                onClick={() => {
                  snapshot();
                  setActiveFilter(f.name);
                }}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          if (e.target.files.length) addImageFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* ERROR BANNER */}
      {editorError && (
        <div className="inline-error">
          <CircleHelp size={16} />
          <span>{editorError}</span>
          <button onClick={() => setEditorError("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* CUSTOM SIZE MODAL */}
      {customSizeOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCustomSizeOpen(false);
          }}
        >
          <div className="custom-size-modal">
            <div className="modal-heading">
              <h3>Custom Dimensions</h3>
              <button className="icon-btn" onClick={() => setCustomSizeOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <label className="field-label">
              <span>Width (px)</span>
              <input
                type="number"
                min="100"
                max="5000"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
              />
            </label>
            <label className="field-label">
              <span>Height (px)</span>
              <input
                type="number"
                min="100"
                max="5000"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
              />
            </label>
            <button
              className="button button-primary full-width"
              onClick={() => {
                if (customWidth > 0 && customHeight > 0) {
                  snapshot();
                  setPreset({ name: "Custom Canvas", width: customWidth, height: customHeight, color: "#111827" });
                  setCustomSizeOpen(false);
                  notify?.("Applied custom size");
                }
              }}
            >
              Apply Canvas Size
            </button>
          </div>
        </div>
      )}

      {/* BEFORE / AFTER SPLIT COMPARISON */}
      {beforeAfterOpen && (
        <BeforeAfterSlider
          originalSrc={originalImageSrc || layers[0]?.url || ""}
          currentCanvas={canvasRef.current}
          onClose={() => setBeforeAfterOpen(false)}
        />
      )}

      {/* EXPORT MODAL */}
      {exportOpen && (
        <ExportModal
          type={exportType}
          setType={setExportType}
          preview={exportPreview}
          onClose={() => setExportOpen(false)}
          onExport={exportDesign}
          width={preset.width}
          height={preset.height}
        />
      )}

      {/* HISTORY PANEL MODAL */}
      {historyPanelOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setHistoryPanelOpen(false);
          }}
        >
          <div className="custom-size-modal history-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow"><span className="eyebrow-line" /> NON-DESTRUCTIVE HISTORY</span>
                <h3>History Timeline ({history.length} Steps)</h3>
              </div>
              <button className="icon-btn" onClick={() => setHistoryPanelOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="history-steps-list">
              <div className="history-step-item current">
                <span className="step-dot" />
                <div className="step-info">
                  <strong>Current State</strong>
                  <small>{layers.length} Layers • Filter: {activeFilter}</small>
                </div>
                <span className="step-badge active">Now</span>
              </div>
              {[...history].reverse().map((step, idx) => (
                <div key={idx} className="history-step-item" onClick={() => {
                  undo();
                  setHistoryPanelOpen(false);
                }}>
                  <span className="step-dot past" />
                  <div className="step-info">
                    <strong>Undo Step -{idx + 1}</strong>
                    <small>{step.layers?.length || 0} Layers • {step.preset?.name || "Canvas"}</small>
                  </div>
                  <button className="button button-outline-sm">Rollback</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EXIF & IMAGE METADATA MODAL */}
      {metadataOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMetadataOpen(false);
          }}
        >
          <div className="custom-size-modal metadata-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow"><span className="eyebrow-line" /> TECHNICAL SPECIFICATIONS</span>
                <h3>EXIF & Canvas Metadata</h3>
              </div>
              <button className="icon-btn" onClick={() => setMetadataOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="metadata-grid">
              <div className="meta-card">
                <span className="meta-label">Canvas Dimensions</span>
                <strong>{preset.width} × {preset.height} px</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">Aspect Ratio</span>
                <strong>{(preset.width / preset.height).toFixed(2)}:1 ({preset.category})</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">Color Space</span>
                <strong>sRGB (8-bit per channel / 24-bit TrueColor)</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">Layers Count</span>
                <strong>{layers.length} Layers in stack</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">Lightroom Exposure</span>
                <strong>{lrSettings.exposure} EV</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">White Balance</span>
                <strong>{lrSettings.temperature}K • Tint: {lrSettings.tint}</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">Export Density</span>
                <strong>72 DPI Screen / 300 DPI Print Matrix</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">Processing Pipeline</span>
                <strong>WebGL 2.0 & Canvas 2D Context</strong>
              </div>
            </div>
            <button className="button button-outline full-width" onClick={() => setMetadataOpen(false)} style={{ marginTop: 16 }}>
              Close Metadata
            </button>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {shortcutsOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShortcutsOpen(false);
          }}
        >
          <div className="custom-size-modal shortcuts-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow"><span className="eyebrow-line" /> PRODUCTIVITY WORKFLOW</span>
                <h3>Keyboard Shortcuts Guide</h3>
              </div>
              <button className="icon-btn" onClick={() => setShortcutsOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="shortcuts-grid">
              {[
                { key: "Ctrl + Z", desc: "Undo last edit" },
                { key: "Ctrl + Y", desc: "Redo action" },
                { key: "V", desc: "Move & Select Tool" },
                { key: "B", desc: "Paintbrush Tool" },
                { key: "E", desc: "Eraser Tool" },
                { key: "J", desc: "Spot Healing Brush" },
                { key: "S", desc: "Clone Stamp (Alt+Click to anchor)" },
                { key: "O", desc: "Dodge Tool (Lighten)" },
                { key: "I", desc: "Eyedropper Color Picker" },
                { key: "Arrow Keys", desc: "Nudge selected layer by 1px" },
                { key: "Shift + Arrows", desc: "Nudge selected layer by 10px" },
                { key: "Delete / Backspace", desc: "Delete active layer" },
              ].map((s) => (
                <div key={s.key} className="shortcut-row">
                  <kbd className="kbd-badge">{s.key}</kbd>
                  <span>{s.desc}</span>
                </div>
              ))}
            </div>
            <button className="button button-outline full-width" onClick={() => setShortcutsOpen(false)} style={{ marginTop: 16 }}>
              Got It
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default EditorPage;
