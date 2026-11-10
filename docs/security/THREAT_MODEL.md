# PhotoPro STRIDE Threat Model

| Threat Category | Potential Attack Vector | PhotoPro Defense | Status |
|---|---|---|---|
| **Spoofing** | Disguising malicious files as valid image/PDF formats | Binary magic number inspection in `fileValidation.js` | Mitigated |
| **Tampering** | Injected JavaScript inside SVG or PDF files | Strict SVG sanitization via DOMParser and script stripping | Mitigated |
| **Repudiation** | Unauthorized manipulation of digital signatures | Pure client-side rasterization and timestamped stamping | Mitigated |
| **Information Disclosure** | Cloud server leakage of sensitive user photos/documents | 100% Client-side processing; zero network transmission | Mitigated |
| **Denial of Service** | Decompression bombs (giant pixel dimensions crashing browser memory) | Megapixel cap (max 67 MP) before allocating canvas buffers | Mitigated |
| **Elevation of Privilege** | DOM-based XSS via unsanitized URLs or inputs | Explicit URL protocol validation (`isSafeUrl`) and HTML escaping | Mitigated |
