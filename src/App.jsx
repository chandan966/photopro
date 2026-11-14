import { useCallback, useEffect, useState } from "react";
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
import AboutPage from "./pages/AboutPage/AboutPage.jsx";
import ContactPage from "./pages/ContactPage/ContactPage.jsx";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage/PrivacyPolicyPage.jsx";
import TermsPage from "./pages/TermsPage/TermsPage.jsx";
import DisclaimerPage from "./pages/DisclaimerPage/DisclaimerPage.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";
import ImageCompressor from "./features/image-compressor/components/ImageCompressor/ImageCompressor.jsx";
import ImageConverter from "./features/image-converter/components/ImageConverter/ImageConverter.jsx";
import ImageResizer from "./features/image-resizer/components/ImageResizer/ImageResizer.jsx";
import DesignStudio from "./features/design-studio/components/DesignStudio/DesignStudio.jsx";
import BrandKit from "./features/brand-kit/components/BrandKit/BrandKit.jsx";
import LegalTrustModal from "./components/shared/LegalTrustModal/LegalTrustModal.jsx";
import { ROUTE_MAP, getPathForPage, updatePageSEO } from "./utils/seo.js";

function App() {
  const [page, setPage] = useState("home");
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

  // Centralized Navigation with URL history and SEO synchronization
  const navigateToPage = useCallback((targetPage, pushHistory = true) => {
    setPage(targetPage);
    updatePageSEO(targetPage);

    if (pushHistory) {
      const path = getPathForPage(targetPage);
      if (window.location.pathname !== path) {
        window.history.pushState({ page: targetPage }, "", path);
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Initialize Route on First Mount & Handle Direct Deep Links
  useEffect(() => {
    const rawPath = window.location.pathname.toLowerCase().replace(/\/$/, "") || "/";
    let target = ROUTE_MAP[rawPath];

    // Check hash fallback (e.g. #about, #privacy)
    if (!target && window.location.hash) {
      const hashClean = "/" + window.location.hash.replace("#", "").toLowerCase();
      target = ROUTE_MAP[hashClean];
    }

    if (!target) {
      target = rawPath === "/" ? "home" : "404";
    }

    setPage(target);
    updatePageSEO(target);
  }, []);

  // Handle Browser Back / Forward Button
  useEffect(() => {
    const handlePopState = (e) => {
      const targetPage = e.state?.page || ROUTE_MAP[window.location.pathname.toLowerCase().replace(/\/$/, "") || "/"] || "home";
      setPage(targetPage);
      updatePageSEO(targetPage);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openEditor = (preset = PRESETS[0], file = null, layers = [], gradient = null) => {
    setEditorPreset(preset);
    setInitialFile(file);
    setEditorInitialLayers(layers || []);
    setEditorInitialGradient(gradient || null);
    navigateToPage("editor");
  };

  const openEditorWithUpload = (files) => openEditor(PRESETS[0], files?.[0] || null);

  return (
    <div className="app-shell">
      {page !== "editor" && (
        <Header
          page={page}
          navigate={navigateToPage}
          openEditor={openEditor}
          onOpenLegalModal={setLegalModalTab}
        />
      )}

      {/* 1. Main Home Dashboard */}
      {page === "home" && (
        <HomePage
          navigate={navigateToPage}
          openEditor={openEditor}
          onUpload={openEditorWithUpload}
          notify={notify}
          onOpenFeaturesModal={() => setFeaturesModalOpen(true)}
        />
      )}

      {/* 2. Photo Studio (Full-Screen Pro Editor) */}
      {page === "editor" && (
        <EditorPage
          notify={notify}
          onExit={() => navigateToPage("home")}
          initialPreset={editorPreset}
          initialFile={initialFile}
          initialLayers={editorInitialLayers}
          initialGradient={editorInitialGradient}
          onInitialFileHandled={() => setInitialFile(null)}
        />
      )}

      {/* 3. Essential Legal & Information Pages */}
      {page === "about" && <AboutPage navigate={navigateToPage} openEditor={openEditor} />}
      {page === "contact" && <ContactPage notify={notify} />}
      {page === "privacy" && <PrivacyPolicyPage />}
      {page === "terms" && <TermsPage />}
      {page === "disclaimer" && <DisclaimerPage />}
      {page === "404" && <NotFoundPage navigate={navigateToPage} openEditor={openEditor} />}

      {/* 4. Creative Studios & Utilities */}
      {page === "design" && (
        <DesignStudio
          onExit={() => navigateToPage("home")}
          onOpenInEditor={(preset, layers, grad) => openEditor(preset, null, layers, grad)}
        />
      )}

      {page === "compressor" && <ImageCompressor notify={notify} onExit={() => navigateToPage("home")} />}
      {page === "converter" && <ImageConverter notify={notify} onExit={() => navigateToPage("home")} />}
      {page === "resizer" && <ImageResizer notify={notify} onExit={() => navigateToPage("home")} />}
      {page === "brand-kit" && (
        <BrandKit
          notify={notify}
          onExit={() => navigateToPage("home")}
          onApplyBrandToStudio={() => openEditor(PRESETS[0])}
        />
      )}

      {page === "pdf" && <PDFStudio notify={notify} />}
      {page === "background" && <BackgroundTool notify={notify} />}
      {page === "enhancer" && <ImageTool type="enhancer" notify={notify} />}
      {page === "palette" && <PaletteTool notify={notify} />}

      {/* Global Footer (shown on all pages except full-screen Editor) */}
      {page !== "editor" && <Footer navigate={navigateToPage} onOpenLegalModal={setLegalModalTab} />}

      {/* 100+ Features Directory Modal */}
      {featuresModalOpen && (
        <FeaturesModal
          onClose={() => setFeaturesModalOpen(false)}
          onLaunchStudio={() => openEditor(PRESETS[0])}
        />
      )}

      {/* Legal & Trust Center Quick Modal */}
      {legalModalTab && (
        <LegalTrustModal
          initialTab={legalModalTab}
          onClose={() => setLegalModalTab(null)}
        />
      )}

      {/* System Toast Notification */}
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
