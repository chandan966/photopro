import { useEffect, useRef } from "react";
import "./AdSenseBanner.css";

const ADSENSE_CLIENT_ID = "ca-pub-6527373182140065";

/**
 * AdSenseBanner
 * Safe, responsive Google AdSense banner component with error boundary protection
 * for React single-page applications.
 */
export default function AdSenseBanner({
  slot = "",
  format = "auto",
  responsive = "true",
  style = {},
  className = "",
}) {
  const containerRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Only attempt push once per mount and if slot exists or auto is enabled
    if (pushedRef.current) return;

    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (err) {
      // Catch AdSense duplicate push or adblocker suppression gracefully
      console.debug("AdSense push:", err);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`adsense-banner-container ${className}`}
      style={style}
      aria-label="Advertisement"
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot || undefined}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
