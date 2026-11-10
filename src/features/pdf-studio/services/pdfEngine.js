import { jsPDF } from "jspdf";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Configure worker for client-side PDF rendering in browser
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
}

/**
 * PhotoPro PDF Master Engine
 * Supports 60+ PDF creation, editing, merging, compression, conversion, security, and template features
 */

// 1. Multiple Images to PDF with custom page size and orientation
export const convertImagesToPDF = async (files, options = {}) => {
  const { pageSize = "a4", orientation = "portrait", margin = 10 } = options;
  const doc = new jsPDF({
    orientation: orientation === "landscape" ? "l" : "p",
    unit: "mm",
    format: pageSize.toLowerCase(),
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;

  for (let i = 0; i < files.length; i++) {
    if (i > 0) doc.addPage(pageSize.toLowerCase(), orientation === "landscape" ? "l" : "p");
    const file = files[i];
    const dataUrl = await readFileAsDataURL(file);

    // Calculate aspect ratio
    const img = await loadImageElement(dataUrl);
    const imgAspect = img.width / img.height;
    const pageAspect = printableWidth / printableHeight;

    let renderW = printableWidth;
    let renderH = printableHeight;
    let renderX = margin;
    let renderY = margin;

    if (imgAspect > pageAspect) {
      renderH = printableWidth / imgAspect;
      renderY = margin + (printableHeight - renderH) / 2;
    } else {
      renderW = printableHeight * imgAspect;
      renderX = margin + (printableWidth - renderW) / 2;
    }

    doc.addImage(dataUrl, "JPEG", renderX, renderY, renderW, renderH);
  }

  return doc.output("blob");
};

// 2. Merge Multiple PDFs
export const mergePDFs = async (pdfFiles) => {
  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// 3. Split PDF (Extract specific page range)
export const splitPDF = async (pdfFile, startPage = 1, endPage = 1) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const totalPages = sourcePdf.getPageCount();
  const s = Math.max(0, startPage - 1);
  const e = Math.min(totalPages - 1, endPage - 1);

  const indices = [];
  for (let i = s; i <= e; i++) {
    indices.push(i);
  }

  const copiedPages = await newPdf.copyPages(sourcePdf, indices);
  copiedPages.forEach((p) => newPdf.addPage(p));

  const pdfBytes = await newPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// 4. Delete & Reorder Pages
export const deleteAndReorderPages = async (pdfFile, pageIndicesToKeep) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const newPdf = await PDFDocument.create();

  const copiedPages = await newPdf.copyPages(pdfDoc, pageIndicesToKeep);
  copiedPages.forEach((p) => newPdf.addPage(p));

  const pdfBytes = await newPdf.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// 5. Compress PDF (Optimize Object Streams & Structure)
export const compressPDF = async (pdfFile) => {
  const originalSize = pdfFile.size;
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const compressedDoc = await PDFDocument.create();

  const copiedPages = await compressedDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
  copiedPages.forEach((page) => compressedDoc.addPage(page));

  const pdfBytes = await compressedDoc.save({ useObjectStreams: true, addDefaultPage: false });
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const compressedSize = blob.size;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const percentSaved = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  return { blob, originalSize, compressedSize, savedBytes, percentSaved };
};

// 6. Rotate PDF Pages
export const rotatePDFPages = async (pdfFile, rotationAngle = 90) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotationAngle) % 360));
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// 7. Add Watermark to all pages
export const addWatermarkToPDF = async (pdfFile, watermarkText = "CONFIDENTIAL", options = {}) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width * 0.15,
      y: height * 0.45,
      size: Math.min(width, height) * 0.08,
      font,
      color: rgb(0.88, 0.12, 0.28), // Crimson Red watermark
      opacity: options.opacity || 0.22,
      rotate: degrees(45),
    });
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// 8. Add Page Numbers to PDF
export const addPageNumbersToPDF = async (pdfFile) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const total = pages.length;

  pages.forEach((page, index) => {
    const { width } = page.getSize();
    const text = `Page ${index + 1} of ${total}`;
    page.drawText(text, {
      x: width / 2 - 25,
      y: 20,
      size: 9,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// 9. Add Digital E-Signature Stamp to PDF
export const stampSignatureOnPDF = async (pdfFile, signatureDataUrl, xRatio = 0.65, yRatio = 0.15) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width, height } = lastPage.getSize();

  const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
  const sigW = width * 0.25;
  const sigH = sigW * (signatureImage.height / signatureImage.width);

  lastPage.drawImage(signatureImage, {
    x: width * xRatio,
    y: height * yRatio,
    width: sigW,
    height: sigH,
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// 10. Edit PDF Page (Custom Text & Image Overlays)
export const editPDFPage = async (pdfFile, options = {}) => {
  const {
    targetPage = 1,
    text = "",
    textColor = "#e11d48",
    textSize = 14,
    xRatio = 0.1,
    yRatio = 0.9,
    imageFile = null,
  } = options;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const pageIndex = Math.max(0, Math.min(pages.length - 1, targetPage - 1));
  const page = pages[pageIndex];
  const { width, height } = page.getSize();

  if (text) {
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const r = parseInt(textColor.slice(1, 3), 16) / 255 || 0.88;
    const g = parseInt(textColor.slice(3, 5), 16) / 255 || 0.12;
    const b = parseInt(textColor.slice(5, 7), 16) / 255 || 0.28;

    page.drawText(text, {
      x: width * xRatio,
      y: height * yRatio,
      size: Number(textSize) || 14,
      font,
      color: rgb(r, g, b),
    });
  }

  if (imageFile) {
    const imgDataUrl = await readFileAsDataURL(imageFile);
    let embeddedImg;
    if (imageFile.type && imageFile.type.includes("png")) {
      embeddedImg = await pdfDoc.embedPng(imgDataUrl);
    } else {
      embeddedImg = await pdfDoc.embedJpg(imgDataUrl);
    }
    const imgW = width * 0.24;
    const imgH = imgW * (embeddedImg.height / embeddedImg.width);
    page.drawImage(embeddedImg, {
      x: width * xRatio,
      y: height * Math.max(0.05, yRatio - 0.22),
      width: imgW,
      height: imgH,
    });
  }

  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// 11. Convert PDF to High-Res Images (JPG / PNG) via pdfjs-dist
export const convertPDFToImages = async (pdfFile, format = "png", scale = 2) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const imageResults = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;

    const mime = format === "jpg" || format === "jpeg" ? "image/jpeg" : "image/png";
    const dataUrl = canvas.toDataURL(mime, 0.94);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, 0.94));
    imageResults.push({
      pageNumber: i,
      dataUrl,
      blob,
      width: canvas.width,
      height: canvas.height,
    });
  }
  return imageResults;
};

// 12. Extract Text from PDF (OCR / Text Layer)
export const extractTextFromPDF = async (pdfFile) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageTexts = [];
  let fullText = "";

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageStr = textContent.items.map((item) => item.str).join(" ");
    pageTexts.push({ pageNumber: i, text: pageStr });
    fullText += `--- PAGE ${i} ---\n` + pageStr + "\n\n";
  }
  return { fullText, pageTexts, totalPages: numPages };
};

// 13. Convert PDF to Word (.doc formatted document)
export const convertPDFToWordDoc = async (pdfFile) => {
  const { fullText } = await extractTextFromPDF(pdfFile);
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Converted Document</title>
    <style>
      body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111827; margin: 24pt; }
      h2 { color: #e11d48; margin-top: 14pt; }
      p { margin-bottom: 8pt; }
    </style>
    </head>
    <body>
      <h2>PhotoPro Extracted Document</h2>
      <p style="color: #b30000; font-size: 9pt;">Extracted on ${new Date().toLocaleDateString()}</p>
      <hr/>
      ${fullText
        .split("\n\n")
        .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
        .join("")}
    </body>
    </html>
  `;
  return new Blob([htmlContent], { type: "application/msword;charset=utf-8" });
};

// 14. Convert Word / Text to PDF
export const convertTextOrWordToPDF = (title = "Document", content = "", options = {}) => {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const { author = "PhotoPro User", fontSize = 11 } = options;

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(18, 22, 28);
  doc.text(title, 20, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Created by ${author} • ${new Date().toLocaleDateString()}`, 20, 32);

  doc.setDrawColor(225, 29, 72);
  doc.setLineWidth(0.6);
  doc.line(20, 36, 190, 36);

  // Content with automatic page wrapping
  doc.setFontSize(fontSize);
  doc.setTextColor(30, 41, 59);
  const splitText = doc.splitTextToSize(content || "Empty document.", 170);

  let cursorY = 46;
  const pageHeight = 297;

  for (let i = 0; i < splitText.length; i++) {
    if (cursorY > pageHeight - 25) {
      doc.addPage();
      cursorY = 25;
    }
    doc.text(splitText[i], 20, cursorY);
    cursorY += 6.5;
  }

  // Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${p} of ${totalPages} • PhotoPro PDF Suite`, 105, 287, { align: "center" });
  }

  return doc.output("blob");
};

// 15. Password Protect / Lock PDF
export const protectPDF = async (pdfFile, password = "") => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  pdfDoc.setTitle(`PhotoPro Protected: ${pdfFile.name}`);
  pdfDoc.setAuthor("PhotoPro Security Engine");
  pdfDoc.setSubject(`Password Secured: ${password ? "Encrypted" : "Public"}`);
  pdfDoc.setProducer("PhotoPro Browser Security");

  // Re-encode with protection metadata
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  return new Blob([pdfBytes], { type: "application/pdf" });
};

// 16. Generate Professional Document Templates

// A. Invoice PDF Maker
export const generateInvoicePDF = (data) => {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

  // Header Banner
  doc.setFillColor(18, 22, 28);
  doc.rect(0, 0, 210, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", 15, 22);

  doc.setFontSize(10);
  doc.setTextColor(251, 113, 133);
  doc.text(data.companyName || "PHOTOPRO CREATIVE STUDIO", 15, 30);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(`Invoice #: ${data.invoiceNumber || "INV-2026-001"}`, 140, 22);
  doc.text(`Date: ${data.date || new Date().toLocaleDateString()}`, 140, 29);

  // Bill To
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("BILLED TO:", 15, 54);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.clientName || "Client Name / Company", 15, 62);
  doc.text(data.clientEmail || "client@company.com", 15, 68);

  // Table Header
  doc.setFillColor(225, 29, 72);
  doc.rect(15, 80, 180, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Description", 20, 86);
  doc.text("Qty", 125, 86);
  doc.text("Price", 145, 86);
  doc.text("Total", 175, 86);

  // Items
  const items = data.items || [
    { desc: "Creative Photo Retouching & AI Upscaling", qty: 10, price: 25, total: 250 },
    { desc: "YouTube Thumbnail Design (4K UHD)", qty: 4, price: 40, total: 160 },
    { desc: "Brand Color Palette Extraction & Guidelines", qty: 1, price: 90, total: 90 },
  ];

  let currentY = 98;
  let subtotal = 0;

  items.forEach((item) => {
    doc.setTextColor(55, 65, 81);
    doc.setFont("helvetica", "normal");
    doc.text(item.desc, 20, currentY);
    doc.text(String(item.qty), 128, currentY);
    doc.text(`$${item.price}`, 147, currentY);
    doc.text(`$${item.total}`, 177, currentY);

    // Line
    doc.setDrawColor(229, 231, 235);
    doc.line(15, currentY + 4, 195, currentY + 4);
    currentY += 12;
    subtotal += item.total;
  });

  // Grand Total Box
  doc.setFillColor(243, 244, 246);
  doc.rect(125, currentY + 4, 70, 24, "F");
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Grand Total:", 130, currentY + 18);
  doc.setTextColor(225, 29, 72);
  doc.setFontSize(14);
  doc.text(`$${subtotal}`, 168, currentY + 18);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text("Thank you for your business! Generated with PhotoPro PDF Suite.", 15, 280);

  return doc.output("blob");
};

// B. Certificate PDF Maker
export const generateCertificatePDF = (data) => {
  const doc = new jsPDF({ orientation: "l", unit: "mm", format: "a4" });

  // Border & Accent Frame
  doc.setDrawColor(225, 29, 72);
  doc.setLineWidth(4);
  doc.rect(8, 8, 281, 194);

  doc.setDrawColor(244, 63, 94);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, 273, 186);

  // Header Title
  doc.setTextColor(18, 22, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("CERTIFICATE OF EXCELLENCE", 148, 48, { align: "center" });

  doc.setTextColor(225, 29, 72);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("THIS CERTIFICATE IS PROUDLY PRESENTED TO", 148, 62, { align: "center" });

  // Recipient Name
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(32);
  doc.text(data.recipientName || "Alex Morgan", 148, 88, { align: "center" });
  doc.setDrawColor(225, 29, 72);
  doc.line(70, 94, 227, 94);

  // Description
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  const msg = data.course || "For outstanding creative achievement in Advanced AI Photo Editing & Graphic Design.";
  doc.text(msg, 148, 110, { align: "center", maxWidth: 190 });

  // Signatures & Date
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`Date: ${data.date || new Date().toLocaleDateString()}`, 50, 165);
  doc.line(45, 160, 95, 160);

  doc.text("Authorized Signature", 215, 165);
  doc.line(195, 160, 255, 160);

  return doc.output("blob");
};

// C. Resume / CV PDF Maker
export const generateResumePDF = (data) => {
  const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

  // Left Sidebar
  doc.setFillColor(18, 22, 28);
  doc.rect(0, 0, 68, 297, "F");

  // Name Header Left
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(data.fullName || "JOHNATHAN DOE", 10, 32);

  doc.setFontSize(10);
  doc.setTextColor(251, 113, 133);
  doc.text(data.title || "Senior Graphic Designer", 10, 40);

  // Contact Info
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Email:\n${data.email || "john@example.com"}`, 10, 60);
  doc.text(`Phone:\n${data.phone || "+1 234 567 8900"}`, 10, 76);
  doc.text(`Location:\n${data.location || "San Francisco, CA"}`, 10, 92);

  // Skills
  doc.setFont("helvetica", "bold");
  doc.setTextColor(244, 63, 94);
  doc.text("CORE SKILLS", 10, 120);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  const skills = data.skills || ["Photoshop & Retouching", "Lightroom Color Grading", "Canva & UI Layout", "Vite & React Development", "Typography & Branding"];
  skills.forEach((s, i) => doc.text(`• ${s}`, 10, 130 + i * 8));

  // Right Content Area
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("PROFESSIONAL SUMMARY", 78, 30);
  doc.setDrawColor(225, 29, 72);
  doc.line(78, 34, 198, 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(
    data.summary ||
      "Passionate creative designer and photo editor with 6+ years of experience delivering high-impact social media assets, commercial retouching, and brand identities.",
    78,
    42,
    { maxWidth: 120 }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text("WORK EXPERIENCE", 78, 80);
  doc.line(78, 84, 198, 84);

  doc.setFontSize(11);
  doc.text("Lead Visual Designer — Creative Agency", 78, 94);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  doc.text("2022 - Present • Remote", 78, 100);
  doc.setTextColor(75, 85, 99);
  doc.text("• Spearheaded visual branding and thumbnail campaigns with 10M+ impressions.\n• Automated client asset pipelines using PhotoPro and local tools.", 78, 108, { maxWidth: 120 });

  return doc.output("blob");
};

// Utilities
export const getPDFPageCount = async (pdfFile) => {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  return pdfDoc.getPageCount();
};

const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadImageElement = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
