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
import FeaturesModal from "./components/shared/FeaturesModal/FeaturesModal.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import ImageCompressor from "./features/image-compressor/components/ImageCompressor/ImageCompressor.jsx";
import ImageConverter from "./features/image-converter/components/ImageConverter/ImageConverter.jsx";
import ImageResizer from "./features/image-resizer/components/ImageResizer/ImageResizer.jsx";
import DesignStudio from "./features/design-studio/components/DesignStudio/DesignStudio.jsx";
import BrandKit from "./features/brand-kit/components/BrandKit/BrandKit.jsx";
import LegalTrustModal from "./components/shared/LegalTrustModal/LegalTrustModal.jsx";

function App() {
  const [page, setPage] = useState("home"); // home, editor, design, pdf, background, enhancer, compressor, converter, resizer, brand-kit, palette
  const [toast, setToast] = useState("");
  const [editorPreset, setEditorPreset] = useState(PRESETS[0]);
  const [initialFile, setInitialFile] = useState(null);
  const [editorInitialLayers, setEditorInitialLayers] = useState([]);
  const [editorInitialGradient, setEditorInitialGradient] = useState(null);
  const [featuresModalOpen, setFeaturesModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState(null);

  const notify = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }, []);

  const openEditor = (preset = PRESETS[0], file = null, layers = [], gradient = null) => {
    setEditorPreset(preset);
    setInitialFile(file);
    setEditorInitialLayers(layers || []);
    setEditorInitialGradient(gradient || null);
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
          onOpenLegalModal={setLegalModalTab}
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
          initialLayers={editorInitialLayers}
          initialGradient={editorInitialGradient}
          onInitialFileHandled={() => setInitialFile(null)}
        />
      )}

      {page === "design" && (
        <DesignStudio
          onExit={() => setPage("home")}
          onOpenInEditor={(preset, layers, grad) => openEditor(preset, null, layers, grad)}
        />
      )}

      {page === "compressor" && <ImageCompressor notify={notify} onExit={() => setPage("home")} />}
      {page === "converter" && <ImageConverter notify={notify} onExit={() => setPage("home")} />}
      {page === "resizer" && <ImageResizer notify={notify} onExit={() => setPage("home")} />}
      {page === "brand-kit" && (
        <BrandKit
          notify={notify}
          onExit={() => setPage("home")}
          onApplyBrandToStudio={() => openEditor(PRESETS[0])}
        />
      )}

      {page === "pdf" && <PDFStudio notify={notify} />}
      {page === "background" && <BackgroundTool notify={notify} />}
      {page === "enhancer" && <ImageTool type="enhancer" notify={notify} />}
      {page === "palette" && <PaletteTool notify={notify} />}

      {page !== "editor" && <Footer navigate={setPage} onOpenLegalModal={setLegalModalTab} />}

      {/* 100 Features Directory Modal */}
      {featuresModalOpen && (
        <FeaturesModal
          onClose={() => setFeaturesModalOpen(false)}
          onLaunchStudio={() => openEditor(PRESETS[0])}
        />
      )}

      {/* Legal & Trust Center Modal */}
      {legalModalTab && (
        <LegalTrustModal
          initialTab={legalModalTab}
          onClose={() => setLegalModalTab(null)}
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
