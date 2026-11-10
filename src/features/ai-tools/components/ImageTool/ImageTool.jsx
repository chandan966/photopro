import "./ImageTool.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, FileImage, Layers, LoaderCircle, LockKeyhole, SlidersHorizontal, Sparkles } from "lucide-react";
import { canvasBlob, downloadBlob, formatBytes, loadImage, renderImage } from "../../../../utils/imageTools.js";
import { ToolPage, UploadDropzone } from "../../../../components/shared/ToolPage/ToolPage.jsx";
import { MAX_UPLOAD_BYTES } from "../../../../constants/presets.js";

function ImageTool({ type, notify }) {
  const config = {
    enhancer: { title: "AI image enhancer", subtitle: "Resize, sharpen and refine images locally. This version uses standard resizing, not AI super-resolution.", icon: Sparkles },
    compressor: { title: "Image compressor", subtitle: "Reduce file size with quality controls and a before-and-after preview.", icon: SlidersHorizontal },
    converter: { title: "Image converter", subtitle: "Convert images between browser-supported formats, right on your device.", icon: FileImage },
  }[type];
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [image, setImage] = useState(null);
  const [quality, setQuality] = useState(82);
  const [format, setFormat] = useState(type === "converter" ? "image/webp" : "image/jpeg");
  const [resolution, setResolution] = useState("original");
  const [sharpen, setSharpen] = useState(0.35);
  const [error, setError] = useState("");
  const [resultInfo, setResultInfo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const previewRef = useRef(null);
  useEffect(() => {
    if (!selected) return;
    loadImage(URL.createObjectURL(selected)).then(setImage).catch((failure) => setError(failure.message));
  }, [selected]);
  const targetSize = useMemo(() => {
    if (!image) return null;
    const sizes = { original: [image.naturalWidth, image.naturalHeight], hd: [1280, 720], fullhd: [1920, 1080], "2k": [2560, 1440], "4k": [3840, 2160] };
    const [maxWidth, maxHeight] = sizes[resolution];
    if (resolution === "original") return [maxWidth, maxHeight];
    const ratio = Math.min(maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    return [Math.round(image.naturalWidth * ratio), Math.round(image.naturalHeight * ratio)];
  }, [image, resolution]);
  const process = async (file = selected, doDownload = true) => {
    if (!file) return;
    setError(""); setResultInfo(null); setProcessing(true);
    try {
      const source = file === selected && image ? image : await loadImage(URL.createObjectURL(file));
      const sizes = { original: [source.naturalWidth, source.naturalHeight], hd: [1280, 720], fullhd: [1920, 1080], "2k": [2560, 1440], "4k": [3840, 2160] };
      let [width, height] = sizes[resolution];
      if (resolution !== "original") {
        const ratio = Math.min(width / source.naturalWidth, height / source.naturalHeight);
        width = Math.round(source.naturalWidth * ratio); height = Math.round(source.naturalHeight * ratio);
      }
      const canvas = renderImage(source, width, height, {
        sharpen: type === "enhancer" ? sharpen : 0,
        background: format === "image/jpeg" ? "#ffffff" : undefined,
      });
      const blob = await canvasBlob(canvas, format, quality / 100);
      setResultInfo({ blob, width, height, originalSize: file.size, compressedSize: blob.size, file });
      if (previewRef.current) previewRef.current.src = URL.createObjectURL(blob);
      if (doDownload) {
        const extension = format.split("/")[1].replace("jpeg", "jpg");
        downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, "")}-makephoto.${extension}`);
      }
      return true;
    } catch (failure) { setError(failure.message); return false; }
    finally { setProcessing(false); }
  };
  const onFiles = (items) => {
    const images = items.filter((file) => file.type.startsWith("image/"));
    const valid = images.filter((file) => file.size <= MAX_UPLOAD_BYTES);
    setFiles(valid); setSelected(valid[0] || null); setResultInfo(null);
    if (images.length !== valid.length) setError("Images larger than 50 MB were excluded.");
    else if (!valid.length) setError("Choose a supported image file.");
    else setError("");
  };
  const batchProcess = async () => {
    let completed = 0;
    for (const file of files) if (await process(file, true)) completed += 1;
    notify(`${completed} of ${files.length} images processed successfully.`);
  };
  return <ToolPage title={config.title} subtitle={config.subtitle} icon={config.icon}>
    {!selected ? <>{error && <div className="error-banner">{error}</div>}<UploadDropzone onFiles={onFiles} multiple={type !== "enhancer"} /></> : <div className="tool-workspace-card">
      <div className="tool-workspace-toolbar"><button className="button button-quiet" onClick={() => { setSelected(null); setFiles([]); setResultInfo(null); }}>← Choose another image</button><span className="privacy-pill"><LockKeyhole size={13} /> Processed on device</span></div>
      <div className="image-tool-layout">
        <div className="image-preview-column"><div className="preview-heading"><b>Preview</b><span>{selected.name} · {formatBytes(selected.size)}</span></div><div className="before-after-grid"><div className="preview-frame checkerboard"><img src={selected ? URL.createObjectURL(selected) : ""} alt="Original image preview" /></div><div className="preview-frame checkerboard">{resultInfo ? <img ref={previewRef} alt="Processed image preview" /> : <div className="preview-placeholder">Your processed preview will appear here</div>}</div><div className="preview-caption">ORIGINAL</div><div className="preview-caption">PROCESSED</div></div>
          {files.length > 1 && <div className="batch-files"><b>{files.length} images selected</b><span>{files.map((file) => file.name).join(" · ")}</span></div>}
        </div>
        <aside className="tool-controls"><h3>{type === "enhancer" ? "Upscale & enhance" : type === "compressor" ? "Compression settings" : "Convert format"}</h3>
          {type === "enhancer" && <><label className="field-label">Output size<select value={resolution} onChange={(event) => setResolution(event.target.value)}><option value="original">Original dimensions</option><option value="hd">HD · fit within 1280 × 720</option><option value="fullhd">Full HD · fit within 1920 × 1080</option><option value="2k">2K · fit within 2560 × 1440</option><option value="4k">4K UHD · fit within 3840 × 2160</option></select></label><p className="small-note">Standard browser resizing only. Enlarging cannot recreate detail missing from the original; no AI upscaling model is bundled.</p><label className="slider-control"><span>Sharpen <output>{Math.round(sharpen * 100)}%</output></span><input type="range" min="0" max="100" value={sharpen * 100} onChange={(event) => setSharpen(Number(event.target.value) / 100)} /></label></>}
          {type === "compressor" && <><label className="field-label">Output format<select value={format} onChange={(event) => setFormat(event.target.value)}><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option><option value="image/png">PNG</option></select></label><label className="slider-control"><span>Quality <output>{quality}%</output></span><input type="range" min="10" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label><div className="file-stats"><span>Original size <b>{formatBytes(selected.size)}</b></span><span>New size <b>{resultInfo ? formatBytes(resultInfo.compressedSize) : "—"}</b></span><span>Saved <b>{resultInfo ? `${Math.max(0, Math.round((1 - resultInfo.compressedSize / selected.size) * 100))}%` : "—"}</b></span></div><p className="small-note">PNG export is lossless; its quality setting is not adjustable in browsers.</p></>}
          {type === "converter" && <><label className="field-label">Convert to<select value={format} onChange={(event) => setFormat(event.target.value)}><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></label><p className="small-note">HEIC decoding depends on your browser. Formats it cannot decode will show an error rather than being uploaded.</p></>}
          {targetSize && type === "enhancer" && <div className="dimensions-info">Output dimensions: <b>{targetSize[0]} × {targetSize[1]} px</b></div>}
          <button className="button button-primary full-width" disabled={processing} onClick={() => process()}>{processing ? <LoaderCircle size={16} className="spin" /> : type === "enhancer" ? <Sparkles size={16} /> : <Download size={16} />}{processing ? "Processing locally…" : type === "enhancer" ? "Enhance & download" : type === "compressor" ? "Compress & download" : "Convert & download"}</button>
          {type !== "enhancer" && files.length > 1 && <button className="button button-outline full-width space-top" disabled={processing} onClick={batchProcess}><Layers size={15} /> Process all {files.length} files</button>}
          {resultInfo && <p className="success-note"><Check size={14} /> Ready · {resultInfo.width} × {resultInfo.height}px · {formatBytes(resultInfo.compressedSize)}</p>}
        </aside>
      </div>
      {error && <div className="error-banner">{error}</div>}
    </div>}
  </ToolPage>;
}

export default ImageTool;
