import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css";
import "./components/layout/Header.css";
import "./pages/HomePage.css";
import "./components/layout/Footer.css";
import "./components/editor/EditorPage.css";
import "./components/editor/ExportModal.css";
import "./components/shared/ToolPage.css";
import "./components/tools/BackgroundTool.css";
import "./components/tools/ImageTool.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
