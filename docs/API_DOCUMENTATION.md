# PhotoPro Services & Utility API Documentation

## `src/utils/fileValidation.js`
- `detectFileType(file: Blob): Promise<{ type: string, category: string, verified: boolean }>`:
  Inspects binary magic headers (JPEG, PNG, WebP, GIF, PDF, MP4, WebM) to verify genuine file types.
- `validateImageFile(file: File): Promise<{ isValid: boolean, error?: string, width?: number, height?: number }>`:
  Performs size check, magic byte sniff, and decompression bomb pixel geometry verification.
- `sanitizeFilename(name: string, fallback?: string): string`:
  Neutralizes path traversal (`../`), null bytes, and illegal Windows/Unix filesystem characters.
- `sanitizeSVG(svgString: string): string`:
  Strips active `<script>` tags, inline `javascript:` URIs, and `on*` event handlers from SVG XML.

## `src/security/securityAudit.js`
- `isSafeUrl(url: string): boolean`:
  Validates protocols, explicitly rejecting `javascript:`, `vbscript:`, and malicious data schemes.
- `escapeHTML(str: string): string`:
  Safely encodes `<`, `>`, `&`, `"`, `'` for rendering plain text into DOM contexts.
- `checkStorageHealth(): Promise<{ available: boolean, usageMB?: number, quotaMB?: number }>`:
  Monitors browser storage quota to prevent local database crashes.

## `src/features/photo-editor/services/filters.js`
- `applyLightroomAdjustments(ctx, width, height, settings)`:
  Applies exposure, contrast, highlights, shadows, whites, blacks, temperature, tint, vibrance, saturation.
- `applyHSLColorMixer(ctx, width, height, hslMixer)`:
  Performs 8-channel hue, saturation, and lightness adjustments in HSL color space.
- `parseCubeLUT(cubeText: string)`:
  Parses Adobe `.cube` 3D LUT tables into typed lookup arrays.
- `applyCubeLUT(ctx, width, height, lutData)`:
  Applies 3D trilinear interpolation color transforms to canvas ImageData.

## `src/features/pdf-studio/services/pdfEngine.js`
- `mergePDFs(fileArray: File[]): Promise<Blob>`: Merges multiple PDF files into one.
- `splitPDF(file: File, ranges: string): Promise<Blob[]>`: Splits PDF by page ranges.
- `addWatermarkToPDF(file: File, text: string, options): Promise<Blob>`: Stamps watermark text.
- `stampSignatureOnPDF(file: File, sigDataUrl: string, pageNum, x, y, w, h): Promise<Blob>`: Stamps digital signature.
- `protectPDF(file: File, userPassword: string): Promise<Blob>`: Encrypts document with user password.
