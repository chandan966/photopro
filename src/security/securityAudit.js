/**
 * PhotoPro Runtime Security Auditor & Sanitization Suite
 *
 * Provides application-wide security controls:
 * - Safe URL validation (blocking javascript:, data: HTML, vbscript:)
 * - HTML string sanitization
 * - LocalStorage & IndexedDB quota protection
 * - Secure CSP reporter & policy checker
 */

/**
 * Validates whether a URL or blob reference is safe to embed or navigate to.
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeUrl(url) {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim().toLowerCase();

  // Explicitly block malicious protocols
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("data:text/html")
  ) {
    return false;
  }

  // Allow standard web protocols and client blob/data image schemes
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("data:application/pdf") ||
    trimmed.startsWith("/")
  );
}

/**
 * Escapes unsafe characters for plain HTML display
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Check storage capacity to prevent local exhaustion
 * @returns {Promise<{ available: boolean, usage?: number, quota?: number }>}
 */
export async function checkStorageHealth() {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usageMB = Math.round((estimate.usage || 0) / (1024 * 1024));
      const quotaMB = Math.round((estimate.quota || 0) / (1024 * 1024));
      const percentUsed = estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(1) : 0;
      return {
        available: true,
        usageMB,
        quotaMB,
        percentUsed,
      };
    } catch {
      return { available: false };
    }
  }
  return { available: false };
}

/**
 * Security telemetry logger for suspicious runtime events
 */
export function logSecurityEvent(level, category, message, details = {}) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, category, message, details };

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[SECURITY ${level.toUpperCase()}] [${category}]: ${message}`, details);
  }

  return entry;
}
