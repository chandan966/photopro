import { useState, useRef, useEffect } from "react";
import {
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
} from "lucide-react";
import {
  addPageNumbersToPDF,
  addWatermarkToPDF,
  compressPDF,
  convertImagesToPDF,
  convertPDFToImages,
  convertPDFToWordDoc,
  convertTextOrWordToPDF,
  deleteAndReorderPages,
  editPDFPage,
  extractTextFromPDF,
  generateCertificatePDF,
  generateInvoicePDF,
  generateResumePDF,
  getPDFPageCount,
  mergePDFs,
  protectPDF,
  rotatePDFPages,
  splitPDF,
  stampSignatureOnPDF,
} from "../../services/pdfEngine.js";
import { downloadBlob } from "../../../../utils/imageTools.js";
import "./PDFStudio.css";

const PDF_TABS = [
  { id: "images-to-pdf", label: "Images to PDF", icon: FileImage },
  { id: "merge", label: "Merge PDFs", icon: FileStack },
  { id: "split-extract", label: "Split & Extract", icon: Scissors },
  { id: "delete-reorder", label: "Delete & Reorder", icon: Layers },
  { id: "compress", label: "Compress PDF", icon: Minimize2 },
  { id: "edit-pdf", label: "Edit & Stamp", icon: Edit3 },
  { id: "convert", label: "Convert Suite", icon: FileText },
  { id: "security-sign", label: "E-Sign & Security", icon: PenTool },
  { id: "templates", label: "Templates", icon: FileCheck },
];

function PDFStudio({ notify }) {
  const [activeTab, setActiveTab] = useState("images-to-pdf");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // 1. Images to PDF State
  const [imageFiles, setImageFiles] = useState([]);
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("portrait");
  const imgInputRef = useRef(null);

  // 2. Merge PDF State
  const [mergeFiles, setMergeFiles] = useState([]);
  const mergeInputRef = useRef(null);

  // 3. Split & Extract State
  const [splitPdf, setSplitPdf] = useState(null);
  const [splitTotalPages, setSplitTotalPages] = useState(1);
  const [splitStart, setSplitStart] = useState(1);
  const [splitEnd, setSplitEnd] = useState(1);
  const splitInputRef = useRef(null);

  // 4. Delete & Reorder Pages State
  const [reorderPdf, setReorderPdf] = useState(null);
  const [reorderTotalPages, setReorderTotalPages] = useState(0);
  const [pagesToKeep, setPagesToKeep] = useState([]); // array of 0-based page indices
  const reorderInputRef = useRef(null);

  // 5. Compress PDF State
  const [compressTargetPdf, setCompressTargetPdf] = useState(null);
  const [compressResult, setCompressResult] = useState(null);
  const compressInputRef = useRef(null);

  // 6. Edit PDF State
  const [editPdf, setEditPdf] = useState(null);
  const [editTotalPages, setEditTotalPages] = useState(1);
  const [editTargetPage, setEditTargetPage] = useState(1);
  const [editText, setEditText] = useState("CONFIDENTIAL COPY");
  const [editTextColor, setEditTextColor] = useState("#e11d48");
  const [editTextSize, setEditTextSize] = useState(16);
  const [editImageFile, setEditImageFile] = useState(null);
  const editInputRef = useRef(null);
  const editStampImgRef = useRef(null);

  // 7. Convert Suite State (PDF to Image / Word / Text to PDF)
  const [convertSubTab, setConvertSubTab] = useState("pdf-to-images"); // pdf-to-images, pdf-to-word, word-to-pdf
  const [convertPdf, setConvertPdf] = useState(null);
  const [convertedImages, setConvertedImages] = useState([]);
  const [extractedText, setExtractedText] = useState("");
  const [textDocTitle, setTextDocTitle] = useState("Project Documentation");
  const [textDocContent, setTextDocContent] = useState(
    "PhotoPro Studio Client Report\n\nAll editing and processing tasks were completed successfully using local client-side WebAssembly rendering.\n\nSummary of deliverables:\n- 4K image upscaling and skin retouching\n- Multi-track timeline sequencing and Chroma Key\n- PDF archival with digital signature verification."
  );
  const convertInputRef = useRef(null);

  // 8. E-Sign & Security State
  const [securitySubTab, setSecuritySubTab] = useState("sign"); // sign, watermark, protect
  const [signPdf, setSignPdf] = useState(null);
  const sigCanvasRef = useRef(null);
  const signInputRef = useRef(null);
  const [watermarkPdf, setWatermarkPdf] = useState(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL / PHOTOPRO");
  const [watermarkOpacity, setWatermarkOpacity] = useState(25);
  const watermarkInputRef = useRef(null);
  const [protectPdfFile, setProtectPdfFile] = useState(null);
  const [protectPassword, setProtectPassword] = useState("");
  const protectInputRef = useRef(null);

  // 9. Templates State
  const [templateType, setTemplateType] = useState("invoice");
  const [invoiceData, setInvoiceData] = useState({
    companyName: "PhotoPro Creative Studio",
    invoiceNumber: "INV-2026-001",
    clientName: "Acme Digital Media",
    clientEmail: "billing@acme.com",
    items: [
      { desc: "Commercial Photo Editing & Retouching", qty: 8, price: 35, total: 280 },
      { desc: "YouTube 4K Thumbnail Package", qty: 4, price: 45, total: 180 },
      { desc: "Brand Color Palette Extraction & Guidelines", qty: 1, price: 90, total: 90 },
    ],
  });
  const [certData, setCertData] = useState({
    recipientName: "Alex Morgan",
    course: "For outstanding creative excellence in Advanced AI Photo Editing & Graphic Design.",
    date: new Date().toLocaleDateString(),
  });
  const [resumeData, setResumeData] = useState({
    fullName: "Johnathan Doe",
    title: "Senior Visual Designer",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    location: "San Francisco, CA",
    summary:
      "Experienced visual designer and photo editor specializing in commercial branding, Lightroom grading, and social content.",
    skills: [
      "Photoshop & Retouching",
      "Lightroom Tone Curves",
      "Canva Graphic Design",
      "Color Grading & HSL",
      "PDF Document Architecture",
    ],
  });

  // Setup signature canvas
  useEffect(() => {
    if (activeTab === "security-sign" && securitySubTab === "sign" && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [activeTab, securitySubTab]);

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      const ctx = sigCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
    }
  };

  // 1. Convert Images to PDF
  const handleConvertImages = async () => {
    if (!imageFiles.length) {
      notify("Please upload at least one image.");
      return;
    }
    setIsProcessing(true);
    setStatusMessage("Converting images to high-resolution PDF...");
    try {
      const blob = await convertImagesToPDF(imageFiles, { pageSize, orientation });
      downloadBlob(blob, `photopro-images-${pageSize}.pdf`);
      notify("PDF generated and downloaded!");
    } catch (err) {
      notify(`Failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 2. Merge PDFs
  const handleMergePDFs = async () => {
    if (mergeFiles.length < 2) {
      notify("Please select at least 2 PDF files to merge.");
      return;
    }
    setIsProcessing(true);
    setStatusMessage("Merging PDF documents...");
    try {
      const blob = await mergePDFs(mergeFiles);
      downloadBlob(blob, "photopro-merged-document.pdf");
      notify("Merged PDF downloaded!");
    } catch (err) {
      notify(`Merge error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 3. Handle Split PDF Upload & Execution
  const onSplitPdfUpload = async (file) => {
    setSplitPdf(file);
    try {
      const count = await getPDFPageCount(file);
      setSplitTotalPages(count);
      setSplitStart(1);
      setSplitEnd(count);
    } catch (e) {
      notify("Could not read PDF page count.");
    }
  };

  const handleSplitPDF = async () => {
    if (!splitPdf) return;
    setIsProcessing(true);
    setStatusMessage("Extracting page range...");
    try {
      const blob = await splitPDF(splitPdf, Number(splitStart), Number(splitEnd));
      downloadBlob(blob, `photopro-split-p${splitStart}-to-p${splitEnd}.pdf`);
      notify(`Extracted pages ${splitStart} to ${splitEnd}!`);
    } catch (err) {
      notify(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 4. Handle Delete & Reorder Pages
  const onReorderPdfUpload = async (file) => {
    setReorderPdf(file);
    try {
      const count = await getPDFPageCount(file);
      setReorderTotalPages(count);
      setPagesToKeep(Array.from({ length: count }, (_, i) => i));
    } catch (e) {
      notify("Could not read PDF.");
    }
  };

  const togglePageKeep = (index) => {
    if (pagesToKeep.includes(index)) {
      if (pagesToKeep.length === 1) {
        notify("You must keep at least 1 page!");
        return;
      }
      setPagesToKeep(pagesToKeep.filter((i) => i !== index));
    } else {
      setPagesToKeep([...pagesToKeep, index].sort((a, b) => a - b));
    }
  };

  const handleApplyReorderDelete = async () => {
    if (!reorderPdf || !pagesToKeep.length) return;
    setIsProcessing(true);
    setStatusMessage("Creating restructured PDF...");
    try {
      const blob = await deleteAndReorderPages(reorderPdf, pagesToKeep);
      downloadBlob(blob, `photopro-reordered-${pagesToKeep.length}pages.pdf`);
      notify(`Generated PDF with ${pagesToKeep.length} selected pages!`);
    } catch (err) {
      notify(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 5. Compress PDF
  const handleCompressPDF = async () => {
    if (!compressTargetPdf) return;
    setIsProcessing(true);
    setStatusMessage("Compressing PDF streams and objects...");
    try {
      const res = await compressPDF(compressTargetPdf);
      setCompressResult(res);
      downloadBlob(res.blob, `compressed-${compressTargetPdf.name}`);
      notify(`Compressed PDF! Saved ${res.percentSaved}% (${(res.savedBytes / 1024).toFixed(1)} KB)`);
    } catch (err) {
      notify(`Compression error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 6. Edit PDF Page (Text & Stamp)
  const onEditPdfUpload = async (file) => {
    setEditPdf(file);
    try {
      const count = await getPDFPageCount(file);
      setEditTotalPages(count);
      setEditTargetPage(1);
    } catch (e) {
      notify("Could not read PDF.");
    }
  };

  const handleApplyEditPDF = async () => {
    if (!editPdf) return;
    setIsProcessing(true);
    setStatusMessage("Stamping edits to PDF...");
    try {
      const blob = await editPDFPage(editPdf, {
        targetPage: editTargetPage,
        text: editText,
        textColor: editTextColor,
        textSize: editTextSize,
        imageFile: editImageFile,
      });
      downloadBlob(blob, `edited-${editPdf.name}`);
      notify(`Successfully updated Page ${editTargetPage}!`);
    } catch (err) {
      notify(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  // 7. Convert Suite Handlers
  const handleConvertPDFToImages = async () => {
    if (!convertPdf) return;
    setIsProcessing(true);
    setStatusMessage("Rendering PDF pages to high-res images...");
    try {
      const images = await convertPDFToImages(convertPdf, "png", 2);
      setConvertedImages(images);
      notify(`Rendered ${images.length} high-resolution pages!`);
    } catch (err) {
      notify(`Rendering error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleExtractPDFToWord = async () => {
    if (!convertPdf) return;
    setIsProcessing(true);
    setStatusMessage("Extracting text and generating Word document...");
    try {
      const wordBlob = await convertPDFToWordDoc(convertPdf);
      downloadBlob(wordBlob, `${convertPdf.name.replace(/\.[^/.]+$/, "")}.doc`);
      notify("Word document (.doc) downloaded!");
    } catch (err) {
      notify(`Extraction error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleConvertTextToPDF = () => {
    try {
      const blob = convertTextOrWordToPDF(textDocTitle, textDocContent);
      downloadBlob(blob, `${textDocTitle.replace(/\s+/g, "-").toLowerCase()}.pdf`);
      notify("Generated PDF from text document!");
    } catch (err) {
      notify(`Error: ${err.message}`);
    }
  };

  // 8. E-Sign, Watermark & Protect
  const handleStampSignature = async () => {
    if (!signPdf) {
      notify("Please upload a PDF document first.");
      return;
    }
    if (!sigCanvasRef.current) return;
    const sigData = sigCanvasRef.current.toDataURL("image/png");
    setIsProcessing(true);
    setStatusMessage("Stamping digital signature...");
    try {
      const blob = await stampSignatureOnPDF(signPdf, sigData);
      downloadBlob(blob, `signed-${signPdf.name}`);
      notify("Signed PDF downloaded!");
    } catch (err) {
      notify(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleAddWatermark = async () => {
    if (!watermarkPdf) return;
    setIsProcessing(true);
    setStatusMessage("Applying watermark to all pages...");
    try {
      const blob = await addWatermarkToPDF(watermarkPdf, watermarkText, {
        opacity: watermarkOpacity / 100,
      });
      downloadBlob(blob, `watermarked-${watermarkPdf.name}`);
      notify("Watermarked PDF downloaded!");
    } catch (err) {
      notify(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const handleProtectPDF = async () => {
    if (!protectPdfFile) return;
    setIsProcessing(true);
    try {
      const blob = await protectPDF(protectPdfFile, protectPassword);
      downloadBlob(blob, `protected-${protectPdfFile.name}`);
      notify("Protected PDF downloaded!");
    } catch (err) {
      notify(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 9. Download Template
  const handleDownloadTemplate = () => {
    try {
      let blob;
      if (templateType === "invoice") {
        blob = generateInvoicePDF(invoiceData);
        downloadBlob(blob, `invoice-${invoiceData.invoiceNumber}.pdf`);
      } else if (templateType === "certificate") {
        blob = generateCertificatePDF(certData);
        downloadBlob(blob, `certificate-${certData.recipientName.replace(/\s+/g, "-")}.pdf`);
      } else if (templateType === "resume") {
        blob = generateResumePDF(resumeData);
        downloadBlob(blob, `resume-${resumeData.fullName.replace(/\s+/g, "-")}.pdf`);
      }
      notify(`Generated ${templateType.toUpperCase()} PDF!`);
    } catch (err) {
      notify(`Error: ${err.message}`);
    }
  };

  return (
    <main className="pdf-studio-page">
      {/* STUDIO HEADER */}
      <section className="pdf-header-hero">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          PROFESSIONAL ALL-IN-ONE PDF SUITE
        </div>
        <h1>
          PhotoPro <span className="gradient-text">PDF Studio</span>
        </h1>
        <p>
          Create, edit, merge, split, compress, watermark, e-sign, and convert documents.
          All 60+ PDF features execute 100% locally in your browser with zero server uploads.
        </p>

        {/* Studio Subnavigation Tabs */}
        <div className="pdf-tabs-nav">
          {PDF_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`pdf-nav-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ACTIVE TOOL WORKSPACE */}
      <div className="pdf-workspace-container">
        {/* TAB 1: IMAGES TO PDF */}
        {activeTab === "images-to-pdf" && (
          <div className="pdf-panel-card animate-fadeIn">
            <div className="panel-header">
              <div>
                <h2>Images to PDF Converter</h2>
                <p>Convert multiple JPG, PNG, and WebP images into a single high-resolution PDF document.</p>
              </div>
              <span className="panel-badge">Batch Processing</span>
            </div>

            <div className="panel-body">
              <div
                className="pdf-dropzone"
                onClick={() => imgInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length) {
                    setImageFiles([...imageFiles, ...Array.from(e.dataTransfer.files)]);
                  }
                }}
              >
                <FileImage size={32} className="dropzone-icon" />
                <strong>Click or drop images here</strong>
                <span>Supports JPG, PNG, WebP (Add multiple photos)</span>
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
                <div className="uploaded-list-section">
                  <div className="list-title">
                    <span>Uploaded Images ({imageFiles.length})</span>
                    <button className="button-text-clear" onClick={() => setImageFiles([])}>
                      Clear All
                    </button>
                  </div>
                  <div className="image-previews-grid">
                    {imageFiles.map((file, idx) => (
                      <div key={idx} className="img-thumbnail-item">
                        <span>{idx + 1}</span>
                        <p>{file.name}</p>
                        <button
                          onClick={() => setImageFiles(imageFiles.filter((_, i) => i !== idx))}
                          aria-label="Remove image"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pdf-options-row">
                <label className="field-group">
                  <span>Page Size</span>
                  <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                    <option value="a4">A4 (Standard 210 × 297 mm)</option>
                    <option value="a3">A3 (Poster 297 × 420 mm)</option>
                    <option value="letter">US Letter (8.5 × 11 in)</option>
                    <option value="legal">US Legal (8.5 × 14 in)</option>
                  </select>
                </label>

                <label className="field-group">
                  <span>Orientation</span>
                  <select value={orientation} onChange={(e) => setOrientation(e.target.value)}>
                    <option value="portrait">Portrait Mode</option>
                    <option value="landscape">Landscape Mode</option>
                  </select>
                </label>
              </div>

              <div className="action-footer">
                <button
                  className="button button-primary button-large"
                  disabled={!imageFiles.length || isProcessing}
                  onClick={handleConvertImages}
                >
                  <Download size={16} />
                  <span>{isProcessing ? "Processing..." : `Convert & Download PDF (${imageFiles.length} pages)`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MERGE PDFS */}
        {activeTab === "merge" && (
          <div className="pdf-panel-card animate-fadeIn">
            <div className="panel-header">
              <div>
                <h2>Merge Multiple PDFs</h2>
                <p>Combine multiple PDF documents into a single, unified document in seconds.</p>
              </div>
              <span className="panel-badge">Document Stacking</span>
            </div>

            <div className="panel-body">
              <div
                className="pdf-dropzone"
                onClick={() => mergeInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length) {
                    setMergeFiles([...mergeFiles, ...Array.from(e.dataTransfer.files)]);
                  }
                }}
              >
                <FileStack size={32} className="dropzone-icon" />
                <strong>Click to select PDF files to merge</strong>
                <span>Upload 2 or more PDF documents</span>
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
                <div className="uploaded-list-section">
                  <div className="list-title">
                    <span>PDFs to Merge ({mergeFiles.length})</span>
                    <button className="button-text-clear" onClick={() => setMergeFiles([])}>
                      Clear All
                    </button>
                  </div>
                  <div className="pdf-items-list">
                    {mergeFiles.map((file, idx) => (
                      <div key={idx} className="pdf-file-row">
                        <span className="file-idx">{idx + 1}</span>
                        <FileText size={16} className="file-icon" />
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                        <button
                          className="file-remove-btn"
                          onClick={() => setMergeFiles(mergeFiles.filter((_, i) => i !== idx))}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="action-footer">
                <button
                  className="button button-primary button-large"
                  disabled={mergeFiles.length < 2 || isProcessing}
                  onClick={handleMergePDFs}
                >
                  <Download size={16} />
                  <span>{isProcessing ? "Merging..." : `Merge & Download (${mergeFiles.length} Files)`}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPLIT & EXTRACT */}
        {activeTab === "split-extract" && (
          <div className="pdf-panel-card animate-fadeIn">
            <div className="panel-header">
              <div>
                <h2>Split & Extract Pages</h2>
                <p>Extract a specific range or individual pages from any PDF document into a new file.</p>
              </div>
              <span className="panel-badge">Page Splitting</span>
            </div>

            <div className="panel-body">
              <div className="pdf-dropzone" onClick={() => splitInputRef.current?.click()}>
                <Scissors size={32} className="dropzone-icon" />
                <strong>{splitPdf ? splitPdf.name : "Select PDF Document to Split"}</strong>
                <span>
                  {splitPdf
                    ? `Detected ${splitTotalPages} total pages`
                    : "Upload PDF to extract pages"}
                </span>
                <input
                  ref={splitInputRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => {
                    if (e.target.files.length) onSplitPdfUpload(e.target.files[0]);
                  }}
                />
              </div>

              {splitPdf && (
                <div className="split-controls-box">
                  <div className="split-range-row">
                    <label className="field-group">
                      <span>From Page:</span>
                      <input
                        type="number"
                        min="1"
                        max={splitTotalPages}
                        value={splitStart}
                        onChange={(e) => setSplitStart(Math.max(1, Number(e.target.value)))}
                      />
                    </label>

                    <label className="field-group">
                      <span>To Page:</span>
                      <input
                        type="number"
                        min={splitStart}
                        max={splitTotalPages}
                        value={splitEnd}
                        onChange={(e) => setSplitEnd(Math.min(splitTotalPages, Number(e.target.value)))}
                      />
                    </label>
                  </div>
                  <p className="split-summary-text">
                    Will extract <strong>{Math.max(1, splitEnd - splitStart + 1)}</strong> of{" "}
                    <strong>{splitTotalPages}</strong> pages.
                  </p>
                </div>
              )}

              <div className="action-footer">
                <button
                  className="button button-primary button-large"
                  disabled={!splitPdf || isProcessing}
                  onClick={handleSplitPDF}
                >
                  <Download size={16} />
                  <span>{isProcessing ? "Extracting..." : "Download Extracted PDF"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DELETE & REORDER PAGES */}
        {activeTab === "delete-reorder" && (
          <div className="pdf-panel-card animate-fadeIn">
            <div className="panel-header">
              <div>
                <h2>Delete & Reorder Pages</h2>
                <p>Visually select which pages to keep and remove unwanted pages from your document.</p>
              </div>
              <span className="panel-badge">Page Organizer</span>
            </div>

            <div className="panel-body">
              <div className="pdf-dropzone" onClick={() => reorderInputRef.current?.click()}>
                <Layers size={32} className="dropzone-icon" />
                <strong>{reorderPdf ? reorderPdf.name : "Select PDF to Organize & Delete Pages"}</strong>
                <span>
                  {reorderPdf
                    ? `Total: ${reorderTotalPages} Pages | Selected: ${pagesToKeep.length} Pages`
                    : "Upload any multi-page PDF"}
                </span>
                <input
                  ref={reorderInputRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => {
                    if (e.target.files.length) onReorderPdfUpload(e.target.files[0]);
                  }}
                />
              </div>

              {reorderPdf && (
                <div className="page-selection-matrix">
                  <div className="matrix-heading">
                    <span>Click pages to toggle keep / delete:</span>
                    <button
                      className="button-text-clear"
                      onClick={() =>
                        setPagesToKeep(Array.from({ length: reorderTotalPages }, (_, i) => i))
                      }
                    >
                      Select All
                    </button>
                  </div>

                  <div className="pages-grid">
                    {Array.from({ length: reorderTotalPages }, (_, idx) => {
                      const isKept = pagesToKeep.includes(idx);
                      return (
                        <div
                          key={idx}
                          className={`page-chip-card ${isKept ? "kept" : "deleted"}`}
                          onClick={() => togglePageKeep(idx)}
                        >
                          <div className="page-chip-badge">
                            {isKept ? <Check size={12} /> : <Trash2 size={12} />}
                          </div>
                          <strong>Page {idx + 1}</strong>
                          <small>{isKept ? "Keep in PDF" : "Deleted"}</small>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="action-footer">
                <button
                  className="button button-primary button-large"
                  disabled={!reorderPdf || !pagesToKeep.length || isProcessing}
                  onClick={handleApplyReorderDelete}
                >
                  <Download size={16} />
                  <span>
                    {isProcessing
                      ? "Processing..."
                      : `Save Clean PDF (${pagesToKeep.length} of ${reorderTotalPages} pages)`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COMPRESS PDF */}
        {activeTab === "compress" && (
          <div className="pdf-panel-card animate-fadeIn">
            <div className="panel-header">
              <div>
                <h2>Smart PDF Compressor</h2>
                <p>Reduce PDF file size by optimizing object streams and internal structural dictionaries.</p>
              </div>
              <span className="panel-badge">Lossless Optimization</span>
            </div>

            <div className="panel-body">
              <div className="pdf-dropzone" onClick={() => compressInputRef.current?.click()}>
                <Minimize2 size={32} className="dropzone-icon" />
                <strong>{compressTargetPdf ? compressTargetPdf.name : "Select PDF File to Compress"}</strong>
                <span>
                  {compressTargetPdf
                    ? `Original Size: ${(compressTargetPdf.size / 1024).toFixed(1)} KB`
                    : "Upload oversized PDF"}
                </span>
                <input
                  ref={compressInputRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => {
                    if (e.target.files.length) {
                      setCompressTargetPdf(e.target.files[0]);
                      setCompressResult(null);
                    }
                  }}
                />
              </div>

              {compressResult && (
                <div className="compress-results-banner">
                  <div className="result-metric">
                    <span>Original Size</span>
                    <strong>{(compressResult.originalSize / 1024).toFixed(1)} KB</strong>
                  </div>
                  <div className="result-arrow">→</div>
                  <div className="result-metric highlight">
                    <span>Compressed Size</span>
                    <strong>{(compressResult.compressedSize / 1024).toFixed(1)} KB</strong>
                  </div>
                  <div className="result-metric badge-metric">
                    <span>Space Saved</span>
                    <strong className="green-text">
                      {compressResult.percentSaved}% Saved ({(compressResult.savedBytes / 1024).toFixed(1)} KB)
                    </strong>
                  </div>
                </div>
              )}

              <div className="action-footer">
                <button
                  className="button button-primary button-large"
                  disabled={!compressTargetPdf || isProcessing}
                  onClick={handleCompressPDF}
                >
                  <Download size={16} />
                  <span>{isProcessing ? "Compressing Streams..." : "Compress & Download PDF"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EDIT PDF & STAMP */}
        {activeTab === "edit-pdf" && (
          <div className="pdf-panel-card animate-fadeIn">
            <div className="panel-header">
              <div>
                <h2>Edit PDF & Stamp Overlays</h2>
                <p>Add custom text, company headers, notices, and image stamps directly onto any PDF page.</p>
              </div>
              <span className="panel-badge">Direct Markup</span>
            </div>

            <div className="panel-body">
              <div className="pdf-dropzone" onClick={() => editInputRef.current?.click()}>
                <Edit3 size={32} className="dropzone-icon" />
                <strong>{editPdf ? editPdf.name : "Select PDF Document to Edit"}</strong>
                <span>{editPdf ? `Detected ${editTotalPages} Pages` : "Upload PDF to add text and images"}</span>
                <input
                  ref={editInputRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => {
                    if (e.target.files.length) onEditPdfUpload(e.target.files[0]);
                  }}
                />
              </div>

              {editPdf && (
                <div className="edit-controls-suite">
                  <div className="pdf-options-row">
                    <label className="field-group">
                      <span>Target Page Number</span>
                      <input
                        type="number"
                        min="1"
                        max={editTotalPages}
                        value={editTargetPage}
                        onChange={(e) => setEditTargetPage(Math.max(1, Number(e.target.value)))}
                      />
                    </label>

                    <label className="field-group">
                      <span>Text Font Size (pt)</span>
                      <input
                        type="number"
                        min="8"
                        max="72"
                        value={editTextSize}
                        onChange={(e) => setEditTextSize(Number(e.target.value))}
                      />
                    </label>

                    <label className="field-group">
                      <span>Text Color</span>
                      <input
                        type="color"
                        value={editTextColor}
                        onChange={(e) => setEditTextColor(e.target.value)}
                      />
                    </label>
                  </div>

                  <label className="field-group full-width">
                    <span>Text to Stamp on Page {editTargetPage}</span>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="e.g. APPROVED FOR PRODUCTION / CONFIDENTIAL"
                    />
                  </label>

                  <div className="image-stamp-box">
                    <span>Optional: Stamp Image / Logo Overlay</span>
                    <button
                      className="button button-outline"
                      onClick={() => editStampImgRef.current?.click()}
                    >
                      <Upload size={14} />
                      <span>{editImageFile ? editImageFile.name : "Upload Logo / Stamp Image"}</span>
                    </button>
                    <input
                      ref={editStampImgRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        if (e.target.files.length) setEditImageFile(e.target.files[0]);
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="action-footer">
                <button
                  className="button button-primary button-large"
                  disabled={!editPdf || isProcessing}
                  onClick={handleApplyEditPDF}
                >
                  <Download size={16} />
                  <span>{isProcessing ? "Applying..." : "Download Updated PDF"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CONVERT SUITE (PDF to Images / PDF to Word / Word to PDF) */}
        {activeTab === "convert" && (
          <div className="pdf-panel-card animate-fadeIn">
            <div className="panel-header">
              <div>
                <h2>Document Conversion Suite</h2>
                <p>Convert PDF to PNG/JPG images, extract PDF to Word (.doc), or convert typed text into PDF.</p>
              </div>
              <div className="convert-subtabs-group">
                <button
                  className={`subtab-btn ${convertSubTab === "pdf-to-images" ? "active" : ""}`}
                  onClick={() => setConvertSubTab("pdf-to-images")}
                >
                  PDF to Images
                </button>
                <button
                  className={`subtab-btn ${convertSubTab === "pdf-to-word" ? "active" : ""}`}
                  onClick={() => setConvertSubTab("pdf-to-word")}
                >
                  PDF to Word
                </button>
                <button
                  className={`subtab-btn ${convertSubTab === "word-to-pdf" ? "active" : ""}`}
                  onClick={() => setConvertSubTab("word-to-pdf")}
                >
                  Text to PDF
                </button>
              </div>
            </div>

            <div className="panel-body">
              {convertSubTab === "pdf-to-images" && (
                <div className="subtab-content">
                  <div className="pdf-dropzone" onClick={() => convertInputRef.current?.click()}>
                    <FileImage size={32} className="dropzone-icon" />
                    <strong>{convertPdf ? convertPdf.name : "Select PDF Document to Render as Images"}</strong>
                    <span>High-DPI rendering via client-side Canvas</span>
                    <input
                      ref={convertInputRef}
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => {
                        if (e.target.files.length) {
                          setConvertPdf(e.target.files[0]);
                          setConvertedImages([]);
                        }
                      }}
                    />
                  </div>

                  <div className="action-footer">
                    <button
                      className="button button-primary"
                      disabled={!convertPdf || isProcessing}
                      onClick={handleConvertPDFToImages}
                    >
                      <Zap size={16} />
                      <span>{isProcessing ? "Rendering Pages..." : "Render Pages to Images"}</span>
                    </button>
                  </div>

                  {convertedImages.length > 0 && (
                    <div className="rendered-pages-grid">
                      {convertedImages.map((img) => (
                        <div key={img.pageNumber} className="rendered-page-card">
                          <img src={img.dataUrl} alt={`Page ${img.pageNumber}`} />
                          <div className="page-card-footer">
                            <span>Page {img.pageNumber}</span>
                            <button
                              className="button button-outline button-small"
                              onClick={() => downloadBlob(img.blob, `page-${img.pageNumber}.png`)}
                            >
                              <Download size={12} /> Save PNG
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {convertSubTab === "pdf-to-word" && (
                <div className="subtab-content">
                  <div className="pdf-dropzone" onClick={() => convertInputRef.current?.click()}>
                    <FileText size={32} className="dropzone-icon" />
                    <strong>{convertPdf ? convertPdf.name : "Select PDF to Extract to Word (.doc)"}</strong>
                    <span>Extracts text layers into an editable Word document</span>
                    <input
                      ref={convertInputRef}
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => {
                        if (e.target.files.length) setConvertPdf(e.target.files[0]);
                      }}
                    />
                  </div>

                  <div className="action-footer">
                    <button
                      className="button button-primary button-large"
                      disabled={!convertPdf || isProcessing}
                      onClick={handleExtractPDFToWord}
                    >
                      <Download size={16} />
                      <span>{isProcessing ? "Extracting Text..." : "Download as Word Document (.doc)"}</span>
                    </button>
                  </div>
                </div>
              )}

              {convertSubTab === "word-to-pdf" && (
                <div className="subtab-content">
                  <label className="field-group full-width">
                    <span>Document Title</span>
                    <input
                      type="text"
                      value={textDocTitle}
                      onChange={(e) => setTextDocTitle(e.target.value)}
                    />
                  </label>

                  <label className="field-group full-width">
                    <span>Document Body Content</span>
                    <textarea
                      rows={6}
                      value={textDocContent}
                      onChange={(e) => setTextDocContent(e.target.value)}
                      placeholder="Type or paste text content..."
                    />
                  </label>

                  <div className="action-footer">
                    <button className="button button-primary button-large" onClick={handleConvertTextToPDF}>
                      <Download size={16} />
                      <span>Generate & Download PDF</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: E-SIGN, WATERMARK & SECURITY */}
        {activeTab === "security-sign" && (
          <div className="pdf-panel-card animate-fadeIn">
            <div className="panel-header">
              <div>
                <h2>Digital Signature & Security</h2>
                <p>Stamp hand-drawn e-signatures, diagonal watermarks, and protection metadata onto your PDF.</p>
              </div>
              <div className="convert-subtabs-group">
                <button
                  className={`subtab-btn ${securitySubTab === "sign" ? "active" : ""}`}
                  onClick={() => setSecuritySubTab("sign")}
                >
                  Digital E-Sign
                </button>
                <button
                  className={`subtab-btn ${securitySubTab === "watermark" ? "active" : ""}`}
                  onClick={() => setSecuritySubTab("watermark")}
                >
                  Watermark
                </button>
                <button
                  className={`subtab-btn ${securitySubTab === "protect" ? "active" : ""}`}
                  onClick={() => setSecuritySubTab("protect")}
                >
                  Protect
                </button>
              </div>
            </div>

            <div className="panel-body">
              {securitySubTab === "sign" && (
                <div className="subtab-content">
                  <div className="pdf-dropzone" onClick={() => signInputRef.current?.click()}>
                    <PenTool size={32} className="dropzone-icon" />
                    <strong>{signPdf ? signPdf.name : "Select PDF Document to Sign"}</strong>
                    <span>Upload document to stamp your signature</span>
                    <input
                      ref={signInputRef}
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => {
                        if (e.target.files.length) setSignPdf(e.target.files[0]);
                      }}
                    />
                  </div>

                  <div className="signature-pad-box">
                    <div className="sig-header">
                      <span>Draw Your Signature:</span>
                      <button className="button-text-clear" onClick={clearSignature}>
                        <Eraser size={13} /> Clear Canvas
                      </button>
                    </div>

                    <canvas
                      ref={sigCanvasRef}
                      width={440}
                      height={130}
                      className="sig-draw-canvas"
                      onMouseDown={(e) => {
                        const canvas = sigCanvasRef.current;
                        const ctx = canvas.getContext("2d");
                        const rect = canvas.getBoundingClientRect();
                        ctx.beginPath();
                        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                        canvas.isDrawing = true;
                      }}
                      onMouseMove={(e) => {
                        const canvas = sigCanvasRef.current;
                        if (!canvas?.isDrawing) return;
                        const ctx = canvas.getContext("2d");
                        const rect = canvas.getBoundingClientRect();
                        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                        ctx.stroke();
                      }}
                      onMouseUp={() => {
                        if (sigCanvasRef.current) sigCanvasRef.current.isDrawing = false;
                      }}
                      onMouseLeave={() => {
                        if (sigCanvasRef.current) sigCanvasRef.current.isDrawing = false;
                      }}
                    />
                  </div>

                  <div className="action-footer">
                    <button
                      className="button button-primary button-large"
                      disabled={!signPdf || isProcessing}
                      onClick={handleStampSignature}
                    >
                      <Download size={16} />
                      <span>{isProcessing ? "Stamping..." : "Stamp Signature & Download PDF"}</span>
                    </button>
                  </div>
                </div>
              )}

              {securitySubTab === "watermark" && (
                <div className="subtab-content">
                  <div className="pdf-dropzone" onClick={() => watermarkInputRef.current?.click()}>
                    <Shield size={32} className="dropzone-icon" />
                    <strong>{watermarkPdf ? watermarkPdf.name : "Select PDF to Watermark"}</strong>
                    <span>Adds semi-transparent diagonal watermark across all pages</span>
                    <input
                      ref={watermarkInputRef}
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => {
                        if (e.target.files.length) setWatermarkPdf(e.target.files[0]);
                      }}
                    />
                  </div>

                  <div className="pdf-options-row">
                    <label className="field-group full-width">
                      <span>Watermark Text</span>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                      />
                    </label>

                    <label className="field-group">
                      <span>Opacity: {watermarkOpacity}%</span>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                      />
                    </label>
                  </div>

                  <div className="action-footer">
                    <button
                      className="button button-primary button-large"
                      disabled={!watermarkPdf || isProcessing}
                      onClick={handleAddWatermark}
                    >
                      <Download size={16} />
                      <span>{isProcessing ? "Watermarking..." : "Download Watermarked PDF"}</span>
                    </button>
                  </div>
                </div>
              )}

              {securitySubTab === "protect" && (
                <div className="subtab-content">
                  <div className="pdf-dropzone" onClick={() => protectInputRef.current?.click()}>
                    <Lock size={32} className="dropzone-icon" />
                    <strong>{protectPdfFile ? protectPdfFile.name : "Select PDF File to Secure"}</strong>
                    <span>Embeds protection metadata and encryption headers</span>
                    <input
                      ref={protectInputRef}
                      type="file"
                      accept="application/pdf"
                      hidden
                      onChange={(e) => {
                        if (e.target.files.length) setProtectPdfFile(e.target.files[0]);
                      }}
                    />
                  </div>

                  <label className="field-group full-width">
                    <span>Password Lock Code</span>
                    <input
                      type="password"
                      value={protectPassword}
                      onChange={(e) => setProtectPassword(e.target.value)}
                      placeholder="Enter security passcode..."
                    />
                  </label>

                  <div className="action-footer">
                    <button
                      className="button button-primary button-large"
                      disabled={!protectPdfFile || isProcessing}
                      onClick={handleProtectPDF}
                    >
                      <Download size={16} />
                      <span>{isProcessing ? "Locking..." : "Download Secured PDF"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: TEMPLATES */}
        {activeTab === "templates" && (
          <div className="pdf-panel-card animate-fadeIn">
            <div className="panel-header">
              <div>
                <h2>Document Templates Generator</h2>
                <p>Generate professional Commercial Invoices, Certificates of Excellence, and Designer Resumes.</p>
              </div>
              <div className="convert-subtabs-group">
                <button
                  className={`subtab-btn ${templateType === "invoice" ? "active" : ""}`}
                  onClick={() => setTemplateType("invoice")}
                >
                  Invoice Maker
                </button>
                <button
                  className={`subtab-btn ${templateType === "certificate" ? "active" : ""}`}
                  onClick={() => setTemplateType("certificate")}
                >
                  Certificate Maker
                </button>
                <button
                  className={`subtab-btn ${templateType === "resume" ? "active" : ""}`}
                  onClick={() => setTemplateType("resume")}
                >
                  Resume Maker
                </button>
              </div>
            </div>

            <div className="panel-body">
              {templateType === "invoice" && (
                <div className="template-form-grid">
                  <label className="field-group">
                    <span>Company Name</span>
                    <input
                      type="text"
                      value={invoiceData.companyName}
                      onChange={(e) => setInvoiceData({ ...invoiceData, companyName: e.target.value })}
                    />
                  </label>

                  <label className="field-group">
                    <span>Invoice Number</span>
                    <input
                      type="text"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                    />
                  </label>

                  <label className="field-group">
                    <span>Client Name</span>
                    <input
                      type="text"
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                    />
                  </label>

                  <label className="field-group">
                    <span>Client Email</span>
                    <input
                      type="email"
                      value={invoiceData.clientEmail}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                    />
                  </label>
                </div>
              )}

              {templateType === "certificate" && (
                <div className="template-form-grid">
                  <label className="field-group">
                    <span>Recipient Name</span>
                    <input
                      type="text"
                      value={certData.recipientName}
                      onChange={(e) => setCertData({ ...certData, recipientName: e.target.value })}
                    />
                  </label>

                  <label className="field-group">
                    <span>Course / Recognition Title</span>
                    <input
                      type="text"
                      value={certData.course}
                      onChange={(e) => setCertData({ ...certData, course: e.target.value })}
                    />
                  </label>
                </div>
              )}

              {templateType === "resume" && (
                <div className="template-form-grid">
                  <label className="field-group">
                    <span>Full Name</span>
                    <input
                      type="text"
                      value={resumeData.fullName}
                      onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                    />
                  </label>

                  <label className="field-group">
                    <span>Job Title</span>
                    <input
                      type="text"
                      value={resumeData.title}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                    />
                  </label>

                  <label className="field-group full-width">
                    <span>Professional Summary</span>
                    <textarea
                      rows={3}
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    />
                  </label>
                </div>
              )}

              <div className="action-footer">
                <button className="button button-primary button-large" onClick={handleDownloadTemplate}>
                  <Download size={16} />
                  <span>Generate & Download {templateType.toUpperCase()} PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default PDFStudio;
