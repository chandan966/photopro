import "./BackgroundTool.css";
import { useEffect, useRef, useState } from "react";
import { Download, LockKeyhole, WandSparkles } from "lucide-react";
import { canvasBlob, downloadBlob, loadImage } from "../../../../utils/imageTools.js";
import { ToolPage, UploadDropzone } from "../../../../components/shared/ToolPage/ToolPage.jsx";
import { MAX_UPLOAD_BYTES } from "../../../../constants/presets.js";

function BackgroundTool({ notify }) {
  const [file, setFile] = useState(null);
  const [src, setSrc] = useState("");
  const [result, setResult] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [backgroundChoice, setBackgroundChoice] = useState("#ffffff");
  const [brush, setBrush] = useState(28);
  const [mode, setMode] = useState("erase");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);
  const pointer = useRef(false);
  const setImage = (imageFile) => {
    if (imageFile.size > MAX_UPLOAD_BYTES) {
      setError("This image is larger than the 50 MB limit. Choose a smaller image.");
      return;
    }
    setFile(imageFile); setSrc(URL.createObjectURL(imageFile)); setResult(""); setError("");
  };
  useEffect(() => {
    if (!src || !canvasRef.current) return;
    loadImage(result || src).then((image) => {
      const canvas = canvasRef.current; canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0);
    }).catch((failure) => setError(failure.message));
  }, [src, result]);
  useEffect(() => {
    if (src) loadImage(src).then((image) => { originalImageRef.current = image; }).catch((failure) => setError(failure.message));
  }, [src]);
  const removeBg = async () => {
    if (!file) return;
    setLoading(true); setError(""); setProgress("Loading the local segmentation model…");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const output = await removeBackground(file, { progress: (_key, current, total) => setProgress(`Preparing local AI model… ${Math.round((current / total) * 100)}%`) });
      setResult(URL.createObjectURL(output));
      setProgress("Background removed. The image was processed in your browser.");
    } catch (failure) {
      setError(`Background removal could not run: ${failure.message || "The local AI model failed to load."} Check your connection and try again.`);
    } finally { setLoading(false); }
  };
  const paint = (event) => {
    if (!pointer.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext("2d");
    const radius = brush * (canvas.width / rect.width) / 2;
    if (mode === "restore" && originalImageRef.current) {
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(originalImageRef.current, 0, 0, canvas.width, canvas.height); ctx.restore();
      return;
    }
    ctx.save(); ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };
  const setBackground = async (backgroundColor) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("The image canvas is not ready.");
      const foreground = await loadImage(canvas.toDataURL("image/png"));
      const output = document.createElement("canvas"); output.width = canvas.width; output.height = canvas.height;
      const ctx = output.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable in this browser.");
      ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, output.width, output.height); ctx.drawImage(foreground, 0, 0);
      const blob = await canvasBlob(output, "image/png"); downloadBlob(blob, "makephoto-background.png");
      notify("Image downloaded with the selected background.");
    } catch (failure) { setError(failure.message); }
  };
  return <ToolPage title="Background remover" subtitle="Remove image backgrounds locally, refine edges by hand, and choose a new backdrop." icon={WandSparkles}>
    {!file ? <>{error && <div className="error-banner">{error}</div>}<UploadDropzone onFiles={(files) => files[0] && setImage(files[0])} /></> : <div className="tool-workspace-card">
      <div className="tool-workspace-toolbar"><button className="button button-quiet" onClick={() => { setFile(null); setSrc(""); setResult(""); }}>← Choose another image</button><span className="privacy-pill"><LockKeyhole size={13} /> Processed on device</span></div>
      <div className="remover-layout">      <div className="remover-preview checkerboard"><canvas ref={canvasRef} style={{ backgroundColor: backgroundChoice === "transparent" ? "transparent" : backgroundChoice }} onPointerDown={(event) => { pointer.current = true; event.currentTarget.setPointerCapture(event.pointerId); paint(event); }} onPointerMove={paint} onPointerUp={() => { pointer.current = false; }} /></div>
        <aside className="tool-controls"><h3>Remove background</h3><p>AI segmentation runs in your browser. The model may need to download before the first use.</p><button className="button button-primary full-width" onClick={removeBg} disabled={loading}><WandSparkles size={16} />{loading ? "Processing…" : "Remove background with AI"}</button>{progress && <p className="status-note">{progress}</p>}
          <div className="sidebar-separator" /><h3>Manual refinement</h3><div className="segmented-control"><button className={mode === "erase" ? "selected" : ""} onClick={() => setMode("erase")}>Erase</button><button className={mode === "restore" ? "selected" : ""} onClick={() => setMode("restore")}>Restore</button></div><label className="slider-control"><span>Brush size <output>{brush}px</output></span><input type="range" min="5" max="120" value={brush} onChange={(event) => setBrush(Number(event.target.value))} /></label>
          <div className="sidebar-separator" /><h3>Background color</h3><div className="background-options">{["transparent", "#ffffff", "#fff5f5", "#22c55e"].map((value) => <button key={value} className={`color-swatch ${value === "transparent" ? "transparent-swatch" : ""}`} style={{ backgroundColor: value === "transparent" ? undefined : value }} aria-label={`${value} background`} onClick={() => { setBackgroundChoice(value); if (value !== "transparent") setColor(value); }} />)}<input type="color" value={color} onChange={(event) => { setColor(event.target.value); setBackgroundChoice(event.target.value); }} aria-label="Custom background color" /></div><button className="button button-outline full-width" onClick={() => setBackground(color)}><Download size={15} /> Download with color</button>
          <button className="button button-outline full-width space-top" onClick={async () => { const blob = await canvasBlob(canvasRef.current, "image/png"); downloadBlob(blob, "makephoto-cutout.png"); }}><Download size={15} /> Download transparent PNG</button>
        </aside></div>
      {error && <div className="error-banner">{error}</div>}
    </div>}
  </ToolPage>;
}

export default BackgroundTool;
