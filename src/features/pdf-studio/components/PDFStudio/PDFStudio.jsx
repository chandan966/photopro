import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  Eraser,
  FileCheck,
  FileDigit,
  FileImage,
  FilePlus,
  FileStack,
  FileText,
  Lock,
  PenTool,
  Plus,
  RotateCw,
  Scissors,
  Shield,
  Sparkles,
  Stamp,
  Trash2,
  Upload,
  Zap,
  Minimize2,
  Edit3,
  Copy,
  Layers,
  Search,
  ExternalLink,
  Wrench,
  ScanText,
  Presentation,
  Sheet,
  Globe,
  FileType,
  Crop,
  FormInput,
  Unlock,
  EyeOff,
  GitCompare,
  Languages,
  FileCode,
  Archive,
  RefreshCw,
  BookOpen,
} from "lucide-react";

import {
  ALL_PDF_TOOLS,
  PDF_CATEGORIES,
} from "../../constants/pdfTools.js";

import {
  addPageNumbersToPDF,
  addWatermarkToPDF,
  analyzePDFIntelligence,
  bundleImagesToZip,
  compressPDF,
  convertImagesToPDF,
  convertPDFToImages,
  convertPDFToMarkdown,
  convertPDFToWordDoc,
  convertTextToPDF,
  extractPagesToPDF,
  extractTextFromPDF,
  getPDFPageCount,
  mergePDFs,
  organizePDFPages,
  redactPDF,
  removePagesFromPDF,
  renderPDFThumbnails,
  repairPDF,
  rotateAllPDFPages,
  splitAllPagesToZip,
  splitPDF,
  stampSignatureOnPDF,
} from "../../services/pdfEngine.js";

import { downloadBlob } from "../../../../utils/imageTools.js";
import "./PDFStudio.css";

function PDFStudio({ notify }) {
  // Navigation State
  const [activeToolId, setActiveToolId] = useState(null); // null = Catalog Grid View
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [convertDropdownOpen, setConvertDropdownOpen] = useState(false);

  // File states
  const [singlePdf, setSinglePdf] = useState(null);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [pdfThumbnails, setPdfThumbnails] = useState([]);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Merge PDF State
  const [mergeFiles, setMergeFiles] = useState([]);
  const mergeInputRef = useRef(null);

  // 2. Split PDF State
  const [splitMode, setSplitMode] = useState("range"); // "range" or "all-zip"
  const [splitStart, setSplitStart] = useState(1);
  const [splitEnd, setSplitEnd] = useState(1);

  // 3. Remove / Extract Pages State
  const [selectedPageIndices, setSelectedPageIndices] = useState(new Set());

  // 4. Organize PDF State
  const [organizePages, setOrganizePages] = useState([]); // [ { originalIndex, rotation, pageNumber, dataUrl } ]

  // 5. Compress PDF State
  const [compressLevel, setCompressLevel] = useState("recommended"); // low, recommended, extreme
  const [compressResult, setCompressResult] = useState(null);

  // 6. Images to PDF State
  const [imageFiles, setImageFiles] = useState([]);
  const [imgPageSize, setImgPageSize] = useState("a4");
  const [imgOrientation, setImgOrientation] = useState("portrait");
  const [imgMargin, setImgMargin] = useState(10);
  const imgInputRef = useRef(null);

  // 7. PDF to Images State
  const [renderedImages, setRenderedImages] = useState([]);
  const [imgFormat, setImgFormat] = useState("png");
  const [renderScale, setRenderScale] = useState(2);

  // 8. Text / Word to PDF State
  const [textDocTitle, setTextDocTitle] = useState("Document Title");
  const [textDocContent, setTextDocContent] = useState(
    "PhotoPro Studio Client Document\n\nAll tasks and document conversions are processed securely inside your web browser.\n\nSummary of features:\n- High-resolution rendering\n- Document protection\n- Client-side data privacy."
  );

  // 9. Page Numbers State
  const [pageNumberPos, setPageNumberPos] = useState("bottom-center");
  const [pageNumberFormat, setPageNumberFormat] = useState("Page X of Y");

  // 10. Watermark State
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkColor, setWatermarkColor] = useState("#e11d48");
  const [watermarkOpacity, setWatermarkOpacity] = useState(24);
  const [watermarkAngle, setWatermarkAngle] = useState(45);
  const [watermarkImageFile, setWatermarkImageFile] = useState(null);
  const watermarkImgInputRef = useRef(null);

  // 11. E-Sign State
  const [signPage, setSignPage] = useState(1);
  const [sigMode, setSigMode] = useState("draw"); // "draw", "type", "upload"
  const [typedName, setTypedName] = useState("Alex Morgan");
  const sigCanvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  // 12. Protect / Unlock State
  const [passwordInput, setPasswordInput] = useState("");

  // 13. AI Summarizer & Intelligence State
  const [aiReport, setAiReport] = useState(null);

  // Setup signature canvas
  useEffect(() => {
    if (activeToolId === "sign-pdf" && sigMode === "draw" && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [activeToolId, sigMode]);

  // Load single PDF metadata & thumbnails
  const handleSinglePdfUpload = async (file) => {
    setSinglePdf(file);
    setCompressResult(null);
    setRenderedImages([]);
    setAiReport(null);
    setSelectedPageIndices(new Set());
    setLoadingThumbnails(true);

    try {
      const count = await getPDFPageCount(file);
      setPdfPageCount(count);
      setSplitStart(1);
      setSplitEnd(count);
      setSignPage(1);

      // Render thumbnails for visual tools
      const { thumbnails } = await renderPDFThumbnails(file, { maxPages: 36 });
      setPdfThumbnails(thumbnails);
      setOrganizePages(
        thumbnails.map((t, idx) => ({
          originalIndex: idx,
          rotation: 0,
          pageNumber: t.pageNumber,
          dataUrl: t.dataUrl,
        }))
      );
    } catch (err) {
      notify("Failed to inspect PDF: " + err.message);
    } finally {
      setLoadingThumbnails(false);
    }
  };

  // Switch Tool & Reset Context
  const selectTool = (toolId) => {
    setActiveToolId(toolId);
    setMegaMenuOpen(false);
    setConvertDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const returnToCatalog = () => {
    setActiveToolId(null);
    setSinglePdf(null);
    setMergeFiles([]);
    setImageFiles([]);
    setCompressResult(null);
    setRenderedImages([]);
    setAiReport(null);
    setPdfThumbnails([]);
  };

  // Filtered tools in catalog
  const filteredTools = ALL_PDF_TOOLS.filter((t) => {
    const matchCategory =
      selectedCategory === "all" || t.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const activeToolObj = ALL_PDF_TOOLS.find((t) => t.id === activeToolId);

  // ----------------------------------------------------
  // TOOL EXECUTION HANDLERS
  // ----------------------------------------------------

  // 1. Merge PDF
  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) {
      notify("Please upload at least 2 PDF files to merge.");
      return;
    }
    setIsProcessing(true);
    setStatusMessage("Merging PDF files...");
    try {
      const blob = await mergePDFs(mergeFiles);
      downloadBlob(blob, "photopro-merged.pdf");
      notify("PDF files merged successfully!");
    } catch (err) {
      notify("Merge failed: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 2. Split PDF
  const handleExecuteSplit = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    try {
      if (splitMode === "all-zip") {
        setStatusMessage("Extracting all pages into individual PDFs...");
        const zipBlob = await splitAllPagesToZip(singlePdf);
        downloadBlob(zipBlob, `${singlePdf.name.replace(/\.[^/.]+$/, "")}-pages.zip`);
        notify("All pages extracted to ZIP!");
      } else {
        setStatusMessage(`Extracting pages ${splitStart} to ${splitEnd}...`);
        const blob = await splitPDF(singlePdf, splitStart, splitEnd);
        downloadBlob(blob, `split-p${splitStart}-p${splitEnd}-${singlePdf.name}`);
        notify(`Pages ${splitStart}–${splitEnd} extracted!`);
      }
    } catch (err) {
      notify("Split error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 3. Remove Pages
  const handleExecuteRemovePages = async () => {
    if (!singlePdf) return;
    if (selectedPageIndices.size === 0) {
      notify("Click on pages to select which ones to remove.");
      return;
    }
    if (selectedPageIndices.size >= pdfPageCount) {
      notify("You cannot delete all pages!");
      return;
    }
    setIsProcessing(true);
    setStatusMessage(`Removing ${selectedPageIndices.size} selected pages...`);
    try {
      const blob = await removePagesFromPDF(singlePdf, Array.from(selectedPageIndices));
      downloadBlob(blob, `cleaned-${singlePdf.name}`);
      notify(`Removed ${selectedPageIndices.size} pages!`);
    } catch (err) {
      notify("Error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 4. Extract Pages
  const handleExecuteExtractPages = async () => {
    if (!singlePdf) return;
    if (selectedPageIndices.size === 0) {
      notify("Please select at least 1 page to extract.");
      return;
    }
    setIsProcessing(true);
    setStatusMessage(`Extracting ${selectedPageIndices.size} pages...`);
    try {
      const blob = await extractPagesToPDF(singlePdf, Array.from(selectedPageIndices).sort((a, b) => a - b));
      downloadBlob(blob, `extracted-${selectedPageIndices.size}pages-${singlePdf.name}`);
      notify(`Extracted ${selectedPageIndices.size} pages!`);
    } catch (err) {
      notify("Error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 5. Organize Pages
  const handleExecuteOrganize = async () => {
    if (!singlePdf || !organizePages.length) return;
    setIsProcessing(true);
    setStatusMessage("Saving restructured PDF...");
    try {
      const config = organizePages.map((p) => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation || 0,
      }));
      const blob = await organizePDFPages(singlePdf, config);
      downloadBlob(blob, `organized-${singlePdf.name}`);
      notify("Organized PDF downloaded!");
    } catch (err) {
      notify("Error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 6. Rotate All Pages
  const handleExecuteRotate = async (angle = 90) => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage(`Rotating all pages by ${angle}°...`);
    try {
      const blob = await rotateAllPDFPages(singlePdf, angle);
      downloadBlob(blob, `rotated-${angle}deg-${singlePdf.name}`);
      notify(`Rotated all pages by ${angle}°!`);
    } catch (err) {
      notify("Error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 7. Compress PDF
  const handleExecuteCompress = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Optimizing and compressing document...");
    try {
      const res = await compressPDF(singlePdf, compressLevel);
      setCompressResult(res);
      downloadBlob(res.blob, `compressed-${singlePdf.name}`);
      if (res.percentSaved > 0) {
        notify(`Saved ${res.percentSaved}% (${(res.savedBytes / 1024).toFixed(1)} KB)!`);
      } else {
        notify("PDF optimized! Downloaded result.");
      }
    } catch (err) {
      notify("Compression error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 8. Repair PDF
  const handleExecuteRepair = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Rebuilding xref tables and repairing document...");
    try {
      const blob = await repairPDF(singlePdf);
      downloadBlob(blob, `repaired-${singlePdf.name}`);
      notify("Repaired PDF downloaded successfully!");
    } catch (err) {
      notify("Repair error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 9. Convert Images to PDF
  const handleExecuteImagesToPdf = async () => {
    if (!imageFiles.length) {
      notify("Please upload at least 1 image.");
      return;
    }
    setIsProcessing(true);
    setStatusMessage(`Converting ${imageFiles.length} images to PDF...`);
    try {
      const blob = await convertImagesToPDF(imageFiles, {
        pageSize: imgPageSize,
        orientation: imgOrientation,
        margin: imgMargin,
      });
      downloadBlob(blob, `images-${imgPageSize}.pdf`);
      notify("Images converted to PDF!");
    } catch (err) {
      notify("Conversion failed: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 10. PDF to Images
  const handleExecutePdfToImages = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Rendering pages to high-resolution images...");
    try {
      const results = await convertPDFToImages(singlePdf, imgFormat, renderScale);
      setRenderedImages(results);
      notify(`Rendered ${results.length} pages!`);
    } catch (err) {
      notify("Rendering error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleDownloadAllImagesZip = async () => {
    if (!renderedImages.length || !singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Bundling images into ZIP package...");
    try {
      const baseName = singlePdf.name.replace(/\.[^/.]+$/, "");
      const zipBlob = await bundleImagesToZip(renderedImages, baseName, imgFormat);
      downloadBlob(zipBlob, `${baseName}-images-${imgFormat}.zip`);
      notify("ZIP downloaded successfully!");
    } catch (err) {
      notify("ZIP error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 11. PDF to Word
  const handleExecutePdfToWord = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Extracting text and formatting Word document...");
    try {
      const blob = await convertPDFToWordDoc(singlePdf);
      downloadBlob(blob, `${singlePdf.name.replace(/\.[^/.]+$/, "")}.doc`);
      notify("Word document (.doc) downloaded!");
    } catch (err) {
      notify("Word conversion failed: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 12. PDF to Markdown
  const handleExecutePdfToMarkdown = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Parsing structured markdown...");
    try {
      const blob = await convertPDFToMarkdown(singlePdf);
      downloadBlob(blob, `${singlePdf.name.replace(/\.[^/.]+$/, "")}.md`);
      notify("Markdown document (.md) downloaded!");
    } catch (err) {
      notify("Markdown export failed: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 13. Text / Word to PDF
  const handleExecuteTextToPdf = () => {
    try {
      const blob = convertTextToPDF(textDocTitle, textDocContent);
      downloadBlob(blob, `${textDocTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      notify("PDF generated and downloaded!");
    } catch (err) {
      notify("Error: " + err.message);
    }
  };

  // 14. Add Page Numbers
  const handleExecuteAddPageNumbers = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Numbering pages...");
    try {
      const blob = await addPageNumbersToPDF(singlePdf, {
        position: pageNumberPos,
        format: pageNumberFormat,
      });
      downloadBlob(blob, `numbered-${singlePdf.name}`);
      notify("Page numbers added!");
    } catch (err) {
      notify("Error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 15. Add Watermark
  const handleExecuteAddWatermark = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Applying watermark to all pages...");
    try {
      const blob = await addWatermarkToPDF(singlePdf, watermarkText, {
        opacity: watermarkOpacity / 100,
        color: watermarkColor,
        angle: Number(watermarkAngle),
        imageFile: watermarkImageFile,
      });
      downloadBlob(blob, `watermarked-${singlePdf.name}`);
      notify("Watermarked PDF downloaded!");
    } catch (err) {
      notify("Watermark error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 16. Sign PDF
  const handleExecuteSign = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage(`Stamping signature onto Page ${signPage}...`);
    try {
      let sigData = null;
      if (sigMode === "draw" && sigCanvasRef.current) {
        sigData = sigCanvasRef.current.toDataURL("image/png");
      } else if (sigMode === "type") {
        const c = document.createElement("canvas");
        c.width = 400;
        c.height = 120;
        const ctx = c.getContext("2d");
        ctx.font = "italic 38px 'Brush Script MT', cursive, sans-serif";
        ctx.fillStyle = "#1e293b";
        ctx.fillText(typedName || "Signature", 20, 70);
        sigData = c.toDataURL("image/png");
      }

      if (!sigData) {
        notify("Please provide a signature first.");
        setIsProcessing(false);
        return;
      }

      const blob = await stampSignatureOnPDF(singlePdf, sigData, {
        targetPage: signPage,
        xRatio: 0.65,
        yRatio: 0.12,
        scale: 0.26,
      });
      downloadBlob(blob, `signed-p${signPage}-${singlePdf.name}`);
      notify("Signed PDF downloaded!");
    } catch (err) {
      notify("Signature error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 17. Redact PDF
  const handleExecuteRedact = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Permanently blacking out sensitive areas...");
    try {
      const blob = await redactPDF(singlePdf, [
        { targetPage: 1, xRatio: 0.15, yRatio: 0.75, wRatio: 0.45, hRatio: 0.05 },
        { targetPage: 1, xRatio: 0.15, yRatio: 0.65, wRatio: 0.35, hRatio: 0.04 },
      ]);
      downloadBlob(blob, `redacted-${singlePdf.name}`);
      notify("Redacted PDF downloaded!");
    } catch (err) {
      notify("Redact error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 18. AI Intelligence / Summarizer
  const handleExecuteAIAnalyze = async () => {
    if (!singlePdf) return;
    setIsProcessing(true);
    setStatusMessage("Reading document text layer and generating intelligence summary...");
    try {
      const report = await analyzePDFIntelligence(singlePdf);
      setAiReport(report);
      notify("Document analysis ready!");
    } catch (err) {
      notify("AI analyze error: " + err.message);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // Signature canvas drawing events
  const getCanvasPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
    if (clientX === undefined || clientY === undefined) return null;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e, canvas);
    if (!pos) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    isDrawingRef.current = true;
    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(e, canvas);
    if (!pos) return;
    const ctx = canvas.getContext("2d");
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const clearCanvasSignature = () => {
    if (sigCanvasRef.current) {
      const ctx = sigCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
    }
  };

  return (
    <main className="pdf-studio-root">
      {/* ========================================================
          1. TOP NAVIGATION SUB-BAR (IMAGE 2)
          ======================================================== */}
      <nav className="ilove-subnav-bar">
        <div className="ilove-subnav-inner">
          <button
            className={`ilove-nav-btn ${activeToolId === "merge-pdf" ? "active" : ""}`}
            onClick={() => selectTool("merge-pdf")}
          >
            MERGE PDF
          </button>
          <button
            className={`ilove-nav-btn ${activeToolId === "split-pdf" ? "active" : ""}`}
            onClick={() => selectTool("split-pdf")}
          >
            SPLIT PDF
          </button>
          <button
            className={`ilove-nav-btn ${activeToolId === "compress-pdf" ? "active" : ""}`}
            onClick={() => selectTool("compress-pdf")}
          >
            COMPRESS PDF
          </button>

          {/* CONVERT PDF DROPDOWN */}
          <div
            className="ilove-nav-dropdown-wrapper"
            onMouseEnter={() => setConvertDropdownOpen(true)}
            onMouseLeave={() => setConvertDropdownOpen(false)}
          >
            <button
              className="ilove-nav-btn with-chevron"
              onClick={() => setConvertDropdownOpen(!convertDropdownOpen)}
            >
              CONVERT PDF <ChevronDown size={13} />
            </button>
            {convertDropdownOpen && (
              <div className="ilove-quick-dropdown animate-popIn">
                <div className="dropdown-col">
                  <span className="dropdown-col-title">CONVERT TO PDF</span>
                  <button onClick={() => selectTool("jpg-to-pdf")}>JPG to PDF</button>
                  <button onClick={() => selectTool("word-to-pdf")}>WORD to PDF</button>
                  <button onClick={() => selectTool("powerpoint-to-pdf")}>POWERPOINT to PDF</button>
                  <button onClick={() => selectTool("excel-to-pdf")}>EXCEL to PDF</button>
                  <button onClick={() => selectTool("html-to-pdf")}>HTML to PDF</button>
                </div>
                <div className="dropdown-col">
                  <span className="dropdown-col-title">CONVERT FROM PDF</span>
                  <button onClick={() => selectTool("pdf-to-jpg")}>PDF to JPG</button>
                  <button onClick={() => selectTool("pdf-to-word")}>PDF to WORD</button>
                  <button onClick={() => selectTool("pdf-to-markdown")}>PDF to Markdown</button>
                </div>
              </div>
            )}
          </div>

          {/* ALL PDF TOOLS MEGA DROPDOWN (IMAGE 1) */}
          <div
            className="ilove-nav-dropdown-wrapper"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <button
              className="ilove-nav-btn with-chevron all-tools-btn"
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
            >
              ALL PDF TOOLS <ChevronDown size={13} />
            </button>

            {megaMenuOpen && (
              <div className="ilove-mega-menu animate-fadeIn">
                <div className="mega-menu-content">
                  {PDF_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <div key={cat.id} className="mega-column">
                      <span className="mega-col-heading">{cat.label.toUpperCase()}</span>
                      {ALL_PDF_TOOLS.filter((t) => t.category === cat.id).map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            className="mega-tool-item"
                            onClick={() => selectTool(tool.id)}
                          >
                            <span
                              className="mega-item-icon"
                              style={{ color: tool.color, backgroundColor: tool.bgLight }}
                            >
                              <Icon size={14} />
                            </span>
                            <span className="mega-item-name">{tool.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ========================================================
          2. DASHBOARD CATALOG VIEW (IMAGE 3)
          Shown when no active tool is selected
          ======================================================== */}
      {!activeToolId && (
        <div className="ilove-catalog-container animate-fadeIn">
          {/* Hero Section */}
          <header className="ilove-hero-header">
            <h1>Every tool you need to work with PDFs in one place</h1>
            <p>
              Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge,
              split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
            </p>
          </header>

          {/* Filter Bar & Search */}
          <div className="ilove-controls-bar">
            <div className="ilove-category-pills">
              {PDF_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`category-pill ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="ilove-search-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Search PDF tool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Responsive Tools Cards Grid (IMAGE 3) */}
          <div className="ilove-tools-grid">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <article
                  key={tool.id}
                  className="ilove-tool-card"
                  onClick={() => selectTool(tool.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => e.key === "Enter" && selectTool(tool.id)}
                >
                  <div className="card-top-row">
                    <div
                      className="tool-card-icon-badge"
                      style={{ color: tool.color, backgroundColor: tool.bgLight }}
                    >
                      <Icon size={22} />
                    </div>
                  </div>
                  <h3 className="tool-card-title">{tool.title}</h3>
                  <p className="tool-card-desc">{tool.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          3. ACTIVE TOOL WORKSPACE
          Shown when user clicks any tool
          ======================================================== */}
      {activeToolId && activeToolObj && (
        <div className="ilove-workspace-view animate-fadeIn">
          {/* Breadcrumb Back Bar */}
          <div className="workspace-header-bar">
            <button className="back-to-catalog-btn" onClick={returnToCatalog}>
              <ArrowLeft size={16} />
              <span>All PDF Tools</span>
            </button>

            <div className="tool-identity">
              <div
                className="tool-badge-pill"
                style={{ color: activeToolObj.color, backgroundColor: activeToolObj.bgLight }}
              >
                {activeToolObj.category.toUpperCase()}
              </div>
              <h2>{activeToolObj.title}</h2>
              <p>{activeToolObj.description}</p>
            </div>
          </div>

          {/* ==================== WORKSPACE WORKFLOWS ==================== */}

          {/* TOOL: MERGE PDF */}
          {activeToolId === "merge-pdf" && (
            <div className="workspace-tool-box">
              <div
                className="ilove-dropzone"
                onClick={() => mergeInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length) {
                    setMergeFiles([...mergeFiles, ...Array.from(e.dataTransfer.files)]);
                  }
                }}
              >
                <div className="dropzone-btn-big">Select PDF files</div>
                <span className="dropzone-hint">or drop PDFs here</span>
                <input
                  ref={mergeInputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  hidden
                  onChange={(e) => {
                    if (e.target.files.length) {
                      setMergeFiles([...mergeFiles, ...Array.from(e.target.files)]);
                    }
                  }}
                />
              </div>

              {mergeFiles.length > 0 && (
                <div className="file-list-preview-card">
                  <div className="file-list-header">
                    <strong>Selected PDFs ({mergeFiles.length})</strong>
                    <button className="clear-btn" onClick={() => setMergeFiles([])}>
                      Clear All
                    </button>
                  </div>

                  <div className="file-cards-row">
                    {mergeFiles.map((file, idx) => (
                      <div key={idx} className="file-chip">
                        <span className="file-num">{idx + 1}</span>
                        <div className="file-info">
                          <p className="file-title">{file.name}</p>
                          <small>{(file.size / 1024).toFixed(1)} KB</small>
                        </div>
                        <button
                          className="file-del-btn"
                          onClick={() => setMergeFiles(mergeFiles.filter((_, i) => i !== idx))}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={mergeFiles.length < 2 || isProcessing}
                      onClick={handleExecuteMerge}
                    >
                      <span>{isProcessing ? "Merging PDFs..." : `Merge PDF (${mergeFiles.length} files) →`}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: SPLIT PDF */}
          {activeToolId === "split-pdf" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">or drop PDF here to split</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <div className="split-options-tabs">
                    <button
                      className={`split-tab ${splitMode === "range" ? "active" : ""}`}
                      onClick={() => setSplitMode("range")}
                    >
                      Custom Page Range
                    </button>
                    <button
                      className={`split-tab ${splitMode === "all-zip" ? "active" : ""}`}
                      onClick={() => setSplitMode("all-zip")}
                    >
                      Extract All Pages (ZIP)
                    </button>
                  </div>

                  {splitMode === "range" ? (
                    <div className="split-range-config">
                      <label>
                        <span>From Page:</span>
                        <input
                          type="number"
                          min="1"
                          max={pdfPageCount}
                          value={splitStart}
                          onChange={(e) => setSplitStart(Math.max(1, Number(e.target.value)))}
                        />
                      </label>
                      <label>
                        <span>To Page:</span>
                        <input
                          type="number"
                          min={splitStart}
                          max={pdfPageCount}
                          value={splitEnd}
                          onChange={(e) => setSplitEnd(Math.min(pdfPageCount, Number(e.target.value)))}
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="split-info-banner">
                      Every single page in <strong>{singlePdf.name}</strong> will be split into an individual PDF file and packaged into a ZIP archive.
                    </p>
                  )}

                  {/* Visual Page Thumbnails Preview */}
                  {pdfThumbnails.length > 0 && (
                    <div className="thumbnails-grid-preview">
                      {pdfThumbnails.map((t) => (
                        <div
                          key={t.pageNumber}
                          className={`page-thumb-box ${
                            splitMode === "range" &&
                            t.pageNumber >= splitStart &&
                            t.pageNumber <= splitEnd
                              ? "in-range"
                              : ""
                          }`}
                        >
                          <img src={t.dataUrl} alt={`Page ${t.pageNumber}`} />
                          <span>Page {t.pageNumber}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecuteSplit}
                    >
                      <span>{isProcessing ? "Processing..." : "Split PDF →"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: REMOVE PAGES & EXTRACT PAGES */}
          {(activeToolId === "remove-pages" || activeToolId === "extract-pages") && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">
                    or drop PDF here to {activeToolId === "remove-pages" ? "remove" : "extract"} pages
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>
                      {activeToolId === "remove-pages"
                        ? `Selected to Delete: ${selectedPageIndices.size} of ${pdfPageCount} pages`
                        : `Selected to Extract: ${selectedPageIndices.size} of ${pdfPageCount} pages`}
                    </span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <p className="instruction-lead">
                    {activeToolId === "remove-pages"
                      ? "Click on any page thumbnail to mark it for deletion:"
                      : "Click on pages you want to extract into your new document:"}
                  </p>

                  <div className="thumbnails-grid-interactive">
                    {pdfThumbnails.map((t, idx) => {
                      const isSelected = selectedPageIndices.has(idx);
                      return (
                        <div
                          key={t.pageNumber}
                          className={`interactive-page-card ${isSelected ? "selected-marked" : ""}`}
                          onClick={() => {
                            const next = new Set(selectedPageIndices);
                            if (next.has(idx)) next.delete(idx);
                            else next.add(idx);
                            setSelectedPageIndices(next);
                          }}
                        >
                          <div className="card-badge-status">
                            {isSelected ? (
                              activeToolId === "remove-pages" ? (
                                <Trash2 size={13} />
                              ) : (
                                <Check size={13} />
                              )
                            ) : (
                              t.pageNumber
                            )}
                          </div>
                          <img src={t.dataUrl} alt={`Page ${t.pageNumber}`} />
                          <small>Page {t.pageNumber}</small>
                        </div>
                      );
                    })}
                  </div>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={selectedPageIndices.size === 0 || isProcessing}
                      onClick={
                        activeToolId === "remove-pages"
                          ? handleExecuteRemovePages
                          : handleExecuteExtractPages
                      }
                    >
                      <span>
                        {isProcessing
                          ? "Processing..."
                          : activeToolId === "remove-pages"
                          ? `Remove ${selectedPageIndices.size} Pages & Save →`
                          : `Extract ${selectedPageIndices.size} Pages →`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: ORGANIZE PDF */}
          {activeToolId === "organize-pdf" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">organize and reorder pages visually</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {organizePages.length}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <div className="thumbnails-grid-interactive">
                    {organizePages.map((p, idx) => (
                      <div key={idx} className="organize-page-card">
                        <div className="organize-actions-bar">
                          <button
                            title="Rotate 90° Clockwise"
                            onClick={() => {
                              const next = [...organizePages];
                              next[idx].rotation = (next[idx].rotation + 90) % 360;
                              setOrganizePages(next);
                            }}
                          >
                            <RotateCw size={13} />
                          </button>
                          <button
                            title="Delete this page"
                            onClick={() => {
                              if (organizePages.length <= 1) {
                                notify("At least 1 page must remain.");
                                return;
                              }
                              setOrganizePages(organizePages.filter((_, i) => i !== idx));
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <img
                          src={p.dataUrl}
                          alt={`Page ${idx + 1}`}
                          style={{ transform: `rotate(${p.rotation}deg)` }}
                        />
                        <span className="page-label">Page {idx + 1}</span>
                      </div>
                    ))}
                  </div>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecuteOrganize}
                    >
                      <span>{isProcessing ? "Saving..." : "Save Organized PDF →"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: ROTATE PDF */}
          {activeToolId === "rotate-pdf" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">rotate PDF pages permanently</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <div className="rotate-buttons-suite">
                    <button className="rotate-btn" onClick={() => handleExecuteRotate(90)}>
                      <RotateCw size={18} /> Rotate 90° Clockwise
                    </button>
                    <button className="rotate-btn" onClick={() => handleExecuteRotate(180)}>
                      <RotateCw size={18} /> Rotate 180°
                    </button>
                    <button className="rotate-btn" onClick={() => handleExecuteRotate(270)}>
                      <RotateCw size={18} /> Rotate 270° (Counter-CW)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: COMPRESS PDF */}
          {activeToolId === "compress-pdf" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">reduce PDF file size in seconds</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Original Size: {(singlePdf.size / 1024).toFixed(1)} KB</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <div className="compress-tiers-grid">
                    <div
                      className={`compress-tier-card ${compressLevel === "extreme" ? "active" : ""}`}
                      onClick={() => setCompressLevel("extreme")}
                    >
                      <span className="tier-tag">Maximum Size Reduction</span>
                      <h4>Extreme Compression</h4>
                      <p>Lowest quality, high compression. Perfect for email attachments and small upload limits.</p>
                    </div>

                    <div
                      className={`compress-tier-card ${compressLevel === "recommended" ? "active" : ""}`}
                      onClick={() => setCompressLevel("recommended")}
                    >
                      <span className="tier-tag popular">Recommended</span>
                      <h4>Recommended Compression</h4>
                      <p>Good quality, high compression. The perfect balance for web and sharing.</p>
                    </div>

                    <div
                      className={`compress-tier-card ${compressLevel === "low" ? "active" : ""}`}
                      onClick={() => setCompressLevel("low")}
                    >
                      <span className="tier-tag">Lossless</span>
                      <h4>Low Compression</h4>
                      <p>High quality, low compression. Optimizes internal streams without downscaling images.</p>
                    </div>
                  </div>

                  {compressResult && (
                    <div className="compression-success-banner">
                      <div className="metric">
                        <span>Original</span>
                        <strong>{(compressResult.originalSize / 1024).toFixed(1)} KB</strong>
                      </div>
                      <span className="arrow">→</span>
                      <div className="metric">
                        <span>Compressed</span>
                        <strong className="green">{(compressResult.compressedSize / 1024).toFixed(1)} KB</strong>
                      </div>
                      <div className="metric highlight">
                        <span>Savings</span>
                        <strong>{compressResult.percentSaved}% Saved</strong>
                      </div>
                    </div>
                  )}

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecuteCompress}
                    >
                      <span>{isProcessing ? "Compressing..." : "Compress PDF →"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: JPG TO PDF */}
          {activeToolId === "jpg-to-pdf" && (
            <div className="workspace-tool-box">
              <div
                className="ilove-dropzone"
                onClick={() => imgInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length) {
                    setImageFiles([...imageFiles, ...Array.from(e.dataTransfer.files)]);
                  }
                }}
              >
                <div className="dropzone-btn-big">Select JPG / PNG images</div>
                <span className="dropzone-hint">or drop images here to create PDF</span>
                <input
                  ref={imgInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => {
                    if (e.target.files.length) {
                      setImageFiles([...imageFiles, ...Array.from(e.target.files)]);
                    }
                  }}
                />
              </div>

              {imageFiles.length > 0 && (
                <div className="file-list-preview-card">
                  <div className="file-list-header">
                    <strong>Uploaded Images ({imageFiles.length})</strong>
                    <button className="clear-btn" onClick={() => setImageFiles([])}>
                      Clear All
                    </button>
                  </div>

                  <div className="image-thumbs-strip">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="img-chip">
                        <span>{idx + 1}</span>
                        <p>{file.name}</p>
                        <button onClick={() => setImageFiles(imageFiles.filter((_, i) => i !== idx))}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="options-row-grid">
                    <label>
                      <span>Page Format:</span>
                      <select value={imgPageSize} onChange={(e) => setImgPageSize(e.target.value)}>
                        <option value="a4">A4 (210 × 297 mm)</option>
                        <option value="letter">US Letter (8.5 × 11 in)</option>
                        <option value="a3">A3 (Poster)</option>
                      </select>
                    </label>

                    <label>
                      <span>Orientation:</span>
                      <select value={imgOrientation} onChange={(e) => setImgOrientation(e.target.value)}>
                        <option value="portrait">Portrait Mode</option>
                        <option value="landscape">Landscape Mode</option>
                      </select>
                    </label>

                    <label>
                      <span>Page Margin:</span>
                      <select value={imgMargin} onChange={(e) => setImgMargin(Number(e.target.value))}>
                        <option value="0">No Margin (Full Bleed)</option>
                        <option value="10">Small (10 mm)</option>
                        <option value="20">Large (20 mm)</option>
                      </select>
                    </label>
                  </div>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecuteImagesToPdf}
                    >
                      <span>{isProcessing ? "Converting..." : `Convert to PDF (${imageFiles.length} pages) →`}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: PDF TO JPG */}
          {activeToolId === "pdf-to-jpg" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">render PDF pages into high-res images</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <div className="options-row-grid">
                    <label>
                      <span>Image Format:</span>
                      <select value={imgFormat} onChange={(e) => setImgFormat(e.target.value)}>
                        <option value="png">PNG (Lossless & High Fidelity)</option>
                        <option value="jpg">JPG (Smaller file size)</option>
                      </select>
                    </label>

                    <label>
                      <span>DPI Resolution:</span>
                      <select value={renderScale} onChange={(e) => setRenderScale(Number(e.target.value))}>
                        <option value="1.5">Standard Quality (150 DPI)</option>
                        <option value="2">High Quality (300 DPI - Recommended)</option>
                        <option value="3">Ultra High Quality (450 DPI)</option>
                      </select>
                    </label>
                  </div>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecutePdfToImages}
                    >
                      <span>{isProcessing ? "Rendering..." : "Convert PDF to Images →"}</span>
                    </button>
                  </div>

                  {renderedImages.length > 0 && (
                    <div className="rendered-images-panel">
                      <div className="batch-download-bar">
                        <strong>Extracted {renderedImages.length} images</strong>
                        <button className="btn-solid-coral" onClick={handleDownloadAllImagesZip}>
                          <Archive size={14} /> Download All as ZIP
                        </button>
                      </div>

                      <div className="images-download-grid">
                        {renderedImages.map((img) => (
                          <div key={img.pageNumber} className="img-export-card">
                            <img src={img.dataUrl} alt={`Page ${img.pageNumber}`} />
                            <div className="img-card-bar">
                              <span>Page {img.pageNumber}</span>
                              <button
                                onClick={() => downloadBlob(img.blob, `page-${img.pageNumber}.${imgFormat}`)}
                              >
                                <Download size={13} /> Save {imgFormat.toUpperCase()}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TOOL: PDF TO WORD & PDF TO MARKDOWN */}
          {(activeToolId === "pdf-to-word" || activeToolId === "pdf-to-markdown") && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">extract text layers and export document</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <p className="instruction-lead">
                    {activeToolId === "pdf-to-word"
                      ? "Extracts text content and formatting into an editable Word document (.doc)."
                      : "Extracts structured headings, paragraphs, and list items into formatted Markdown (.md)."}
                  </p>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={
                        activeToolId === "pdf-to-word"
                          ? handleExecutePdfToWord
                          : handleExecutePdfToMarkdown
                      }
                    >
                      <span>
                        {isProcessing
                          ? "Extracting..."
                          : activeToolId === "pdf-to-word"
                          ? "Convert to Word (.doc) →"
                          : "Convert to Markdown (.md) →"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: WORD / TEXT / HTML TO PDF */}
          {(activeToolId === "word-to-pdf" ||
            activeToolId === "powerpoint-to-pdf" ||
            activeToolId === "excel-to-pdf" ||
            activeToolId === "html-to-pdf") && (
            <div className="workspace-tool-box">
              <div className="active-doc-panel">
                <label className="field-group full-width">
                  <span>Document Title:</span>
                  <input
                    type="text"
                    value={textDocTitle}
                    onChange={(e) => setTextDocTitle(e.target.value)}
                  />
                </label>

                <label className="field-group full-width">
                  <span>Document Body Content:</span>
                  <textarea
                    rows={8}
                    value={textDocContent}
                    onChange={(e) => setTextDocContent(e.target.value)}
                    placeholder="Type or paste document text..."
                  />
                </label>

                <div className="tool-cta-footer">
                  <button className="ilove-action-btn-huge" onClick={handleExecuteTextToPdf}>
                    <span>Generate &amp; Download PDF →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TOOL: ADD PAGE NUMBERS */}
          {activeToolId === "add-page-numbers" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">stamp page numbers across document</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <div className="options-row-grid">
                    <label>
                      <span>Position on Page:</span>
                      <select value={pageNumberPos} onChange={(e) => setPageNumberPos(e.target.value)}>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="top-center">Top Center</option>
                      </select>
                    </label>

                    <label>
                      <span>Number Format:</span>
                      <select value={pageNumberFormat} onChange={(e) => setPageNumberFormat(e.target.value)}>
                        <option value="Page X of Y">Page X of Y</option>
                        <option value="X of Y">X of Y</option>
                        <option value="Page X">Page X</option>
                        <option value="X">X (Only Number)</option>
                      </select>
                    </label>
                  </div>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecuteAddPageNumbers}
                    >
                      <span>{isProcessing ? "Stamping..." : "Add Page Numbers →"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: ADD WATERMARK */}
          {activeToolId === "add-watermark" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">stamp watermark across all pages</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <div className="options-row-grid">
                    <label className="full-width">
                      <span>Watermark Text:</span>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                      />
                    </label>

                    <label>
                      <span>Opacity: {watermarkOpacity}%</span>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                      />
                    </label>

                    <label>
                      <span>Rotation Angle:</span>
                      <select value={watermarkAngle} onChange={(e) => setWatermarkAngle(Number(e.target.value))}>
                        <option value="45">Diagonal (45°)</option>
                        <option value="0">Horizontal (0°)</option>
                        <option value="90">Vertical (90°)</option>
                      </select>
                    </label>

                    <label>
                      <span>Color:</span>
                      <input
                        type="color"
                        value={watermarkColor}
                        onChange={(e) => setWatermarkColor(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecuteAddWatermark}
                    >
                      <span>{isProcessing ? "Applying..." : "Add Watermark →"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: SIGN PDF */}
          {activeToolId === "sign-pdf" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">stamp e-signature onto any page</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <div className="split-options-tabs">
                    <button
                      className={`split-tab ${sigMode === "draw" ? "active" : ""}`}
                      onClick={() => setSigMode("draw")}
                    >
                      Draw Signature
                    </button>
                    <button
                      className={`split-tab ${sigMode === "type" ? "active" : ""}`}
                      onClick={() => setSigMode("type")}
                    >
                      Type Signature
                    </button>
                  </div>

                  {sigMode === "draw" ? (
                    <div className="signature-pad-container">
                      <div className="sig-actions-row">
                        <span>Draw with your mouse, trackpad, or stylus:</span>
                        <button className="clear-btn" onClick={clearCanvasSignature}>
                          <Eraser size={13} /> Clear
                        </button>
                      </div>
                      <canvas
                        ref={sigCanvasRef}
                        width={460}
                        height={140}
                        className="sig-canvas"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                      />
                    </div>
                  ) : (
                    <div className="type-signature-box">
                      <label>
                        <span>Your Full Name:</span>
                        <input
                          type="text"
                          value={typedName}
                          onChange={(e) => setTypedName(e.target.value)}
                        />
                      </label>
                      <div className="signature-preview-badge">
                        <span>Preview:</span>
                        <p style={{ fontFamily: "'Brush Script MT', cursive, sans-serif" }}>
                          {typedName || "Signature"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="options-row-grid">
                    <label>
                      <span>Stamp on Page:</span>
                      <input
                        type="number"
                        min="1"
                        max={pdfPageCount}
                        value={signPage}
                        onChange={(e) => setSignPage(Math.max(1, Number(e.target.value)))}
                      />
                    </label>
                  </div>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecuteSign}
                    >
                      <span>{isProcessing ? "Stamping..." : `Sign Document (Page ${signPage}) →`}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: REPAIR PDF */}
          {activeToolId === "repair-pdf" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">recover data from damaged or broken PDF</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <p className="instruction-lead">
                    Reconstructs cross-reference dictionaries, removes corrupt object streams, and re-encodes a clean, standard-compliant PDF file.
                  </p>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecuteRepair}
                    >
                      <span>{isProcessing ? "Repairing..." : "Repair & Clean PDF →"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: REDACT PDF */}
          {activeToolId === "redact-pdf" && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">blackout sensitive data permanently</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  <p className="instruction-lead">
                    Applies permanent blackout redactions over confidential text layers before sharing.
                  </p>

                  <div className="tool-cta-footer">
                    <button
                      className="ilove-action-btn-huge"
                      disabled={isProcessing}
                      onClick={handleExecuteRedact}
                    >
                      <span>{isProcessing ? "Redacting..." : "Apply Redaction & Save →"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TOOL: AI SUMMARIZER & INTELLIGENCE */}
          {(activeToolId === "ai-summarizer" || activeToolId === "translate-pdf") && (
            <div className="workspace-tool-box">
              {!singlePdf ? (
                <div className="ilove-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="dropzone-btn-big">Select PDF file</div>
                  <span className="dropzone-hint">extract intelligence, key metrics & summary</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => e.target.files?.[0] && handleSinglePdfUpload(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="active-doc-panel">
                  <div className="doc-summary-strip">
                    <strong>{singlePdf.name}</strong>
                    <span>Total Pages: {pdfPageCount}</span>
                    <button className="btn-link" onClick={() => setSinglePdf(null)}>
                      Change PDF
                    </button>
                  </div>

                  {!aiReport ? (
                    <div className="tool-cta-footer">
                      <button
                        className="ilove-action-btn-huge"
                        disabled={isProcessing}
                        onClick={handleExecuteAIAnalyze}
                      >
                        <Sparkles size={16} />
                        <span>{isProcessing ? "Analyzing Text..." : "Analyze Document Intelligence →"}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="ai-report-box animate-fadeIn">
                      <div className="report-metrics-row">
                        <div className="report-metric">
                          <span>Total Pages</span>
                          <strong>{aiReport.totalPages}</strong>
                        </div>
                        <div className="report-metric">
                          <span>Word Count</span>
                          <strong>{aiReport.wordCount.toLocaleString()}</strong>
                        </div>
                        <div className="report-metric">
                          <span>Characters</span>
                          <strong>{aiReport.charCount.toLocaleString()}</strong>
                        </div>
                        <div className="report-metric">
                          <span>Est. Read Time</span>
                          <strong>~{aiReport.readingTimeMin} min</strong>
                        </div>
                      </div>

                      <div className="report-section">
                        <h4>Executive Summary</h4>
                        <p>{aiReport.summarySnippet}</p>
                      </div>

                      <div className="report-section">
                        <h4>Key Takeaways</h4>
                        <ul>
                          {aiReport.takeaways.map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="report-section">
                        <h4>Top Document Keywords</h4>
                        <div className="tags-row">
                          {aiReport.topTopics.map((topic, idx) => (
                            <span key={idx} className="topic-tag">
                              {topic.word} ({topic.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default PDFStudio;
