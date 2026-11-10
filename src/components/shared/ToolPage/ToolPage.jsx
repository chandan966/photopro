import { useState, useRef } from "react";
import { FolderOpen, Upload } from "lucide-react";

export function ToolPage({ title, subtitle, icon: Icon, children }) {
  return <main className="tool-page"><div className="tool-page-heading"><span className="tool-page-icon"><Icon size={22} /></span><div><div className="eyebrow"><span className="eyebrow-line" /> MAKEPHOTO STUDIO</div><h1>{title}</h1><p>{subtitle}</p></div></div>{children}</main>;
}

export function UploadDropzone({ onFiles, multiple = false, accept = "image/*" }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);
  return <div className={`dropzone ${drag ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(event) => { event.preventDefault(); setDrag(false); onFiles([...event.dataTransfer.files]); }}>
    <span className="drop-icon"><Upload size={22} /></span><b>Drag and drop your image{multiple ? "s" : ""} here</b><span>or choose from your device</span><button className="button button-primary" onClick={() => inputRef.current?.click()}><FolderOpen size={16} /> Choose {multiple ? "files" : "image"}</button><small>Files are processed locally and never uploaded.</small><input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden onChange={(event) => { onFiles([...event.target.files]); event.target.value = ""; }} />
  </div>;
}

