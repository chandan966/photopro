import { useCallback, useState } from "react";
import { Check } from "lucide-react";
import { PRESETS } from "./constants/presets.js";
import EditorPage from "./features/photo-editor/components/EditorPage/EditorPage.jsx";
import Footer from "./components/layout/Footer/Footer.jsx";
import Header from "./components/layout/Header/Header.jsx";
import BackgroundTool from "./features/ai-tools/components/BackgroundTool/BackgroundTool.jsx";
import ImageTool from "./features/ai-tools/components/ImageTool/ImageTool.jsx";
import PaletteTool from "./features/ai-tools/components/PaletteTool/PaletteTool.jsx";
import PDFStudio from "./features/pdf-studio/components/PDFStudio/PDFStudio.jsx";
import VideoStudio from "./features/video-editor/components/VideoStudio/VideoStudio.jsx";
import FeaturesModal from "./components/shared/FeaturesModal/FeaturesModal.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";

function App() {
  const [page, setPage] = useState("home"); // home, editor, pdf, video, background, enhancer, compressor, converter, palette
  const [toast, setToast] = useState("");
  const [editorPreset, setEditorPreset] = useState(PRESETS[0]);
  const [initialFile, setInitialFile] = useState(null);
  const [featuresModalOpen, setFeaturesModalOpen] = useState(false);

  const notify = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }, []);

  const openEditor = (preset = PRESETS[0], file = null) => {
    setEditorPreset(preset);
    setInitialFile(file);
    setPage("editor");
  };

  const openEditorWithUpload = (files) => openEditor(PRESETS[0], files?.[0] || null);

  return (
    <div className="app-shell">
      {page !== "editor" && (
        <Header
          page={page}
          navigate={setPage}
          openEditor={openEditor}
          onOpenFeaturesModal={() => setFeaturesModalOpen(true)}
        />
      )}

      {page === "home" && (
        <HomePage
          navigate={setPage}
          openEditor={openEditor}
          onUpload={openEditorWithUpload}
          notify={notify}
          onOpenFeaturesModal={() => setFeaturesModalOpen(true)}
        />
      )}

      {page === "editor" && (
        <EditorPage
          notify={notify}
          onExit={() => setPage("home")}
          initialPreset={editorPreset}
          initialFile={initialFile}
          onInitialFileHandled={() => setInitialFile(null)}
        />
      )}

      {page === "pdf" && <PDFStudio notify={notify} />}
      {page === "video" && <VideoStudio notify={notify} />}
      {page === "background" && <BackgroundTool notify={notify} />}
      {page === "enhancer" && <ImageTool type="enhancer" notify={notify} />}
      {page === "compressor" && <ImageTool type="compressor" notify={notify} />}
      {page === "converter" && <ImageTool type="converter" notify={notify} />}
      {page === "palette" && <PaletteTool notify={notify} />}

      {page !== "editor" && <Footer navigate={setPage} />}

      {/* 100 Features Directory Modal */}
      {featuresModalOpen && (
        <FeaturesModal
          onClose={() => setFeaturesModalOpen(false)}
          onLaunchStudio={() => openEditor(PRESETS[0])}
        />
      )}

      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
