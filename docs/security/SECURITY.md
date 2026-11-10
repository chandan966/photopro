# PhotoPro Security Policy & Architecture

## Security Overview
PhotoPro operates on a **zero-trust, privacy-by-design** client-side model. 
User photos, videos, and confidential PDF documents never leave the client's device, ensuring complete immunity against server-side data leaks, database breaches, and cloud transmission eavesdropping.

## Key Defenses
1. **Binary Magic Number Verification:** Validates genuine file formats at the byte level before processing, eliminating MIME-spoofing attacks.
2. **Decompression Bomb Protection:** Caps maximum decoded pixel geometry to 67 Megapixels (8192×8192) to prevent browser memory exhaustion (Denial of Service).
3. **SVG Sanitization:** Removes active execution vectors (`<script>`, `on*` attributes, foreign objects) to neutralize Stored XSS.
4. **Path Traversal Defense:** Sanitizes file export filenames to prevent path traversal on local systems.
5. **Strict Content Security Policy (CSP):** Configured in `index.html` to restrict script execution, frame embedding, and resource loading.
