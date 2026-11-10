import "./BrandLogo.css";

export function BrandIcon({ size = 38, className = "" }) {
  return (
    <div
      className={`brand-icon-root ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src="/brand-logo.webp?v=2"
        alt="PhotoPro Emblem"
        width={size}
        height={size}
        className="brand-logo-img"
        loading="eager"
        decoding="async"
        onError={(e) => {
          // Fallback to png if webp fails
          if (e.currentTarget.src.includes(".webp")) {
            e.currentTarget.src = "/brand-logo.png?v=2";
          }
        }}
      />
    </div>
  );
}

function BrandLogo({ size = 38, showText = true, className = "" }) {
  return (
    <div className={`brand-logo-component ${className}`}>
      <BrandIcon size={size} />
      {showText && (
        <span className="brand-title-text" style={{ fontSize: `${Math.round(size * 0.58)}px` }}>
          Photo<span className="brand-ruby-highlight">Pro</span>
        </span>
      )}
    </div>
  );
}

export default BrandLogo;
