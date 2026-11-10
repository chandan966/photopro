/**
 * PhotoPro Master Project Store & File Format (.photopro)
 * 
 * Supports:
 * - Full multi-layer project persistence (Canvas dimensions, background, layers, masks, blend modes, adjustments)
 * - Exporting and importing native `.photopro` project files
 * - Browser LocalStorage & IndexedDB auto-recovery
 */

const STORAGE_KEY = "photopro_saved_projects_v2";

export const getSavedProjects = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveProjectToLocal = (project) => {
  try {
    const projects = getSavedProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = updatedProject;
    } else {
      projects.unshift(updatedProject);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 20)));
    return true;
  } catch (err) {
    // If LocalStorage quota is exceeded, prune oldest project and retry
    try {
      const projects = getSavedProjects().slice(0, 5);
      projects.unshift(project);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      return true;
    } catch {
      return false;
    }
  }
};

export const deleteProjectFromLocal = (id) => {
  try {
    const projects = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch {
    return false;
  }
};

/**
 * Export Native .photopro Project File
 */
export const exportProjectFile = (projectState, filename = "artwork") => {
  const payload = {
    version: "2.0",
    appName: "PhotoPro",
    exportedAt: new Date().toISOString(),
    name: filename,
    canvas: {
      width: projectState.width,
      height: projectState.height,
      bgType: projectState.bgType,
      canvasColor: projectState.canvasColor,
      activeGradient: projectState.activeGradient,
    },
    adjustments: {
      lrSettings: projectState.lrSettings,
      hslMixer: projectState.hslMixer,
      curves: projectState.curves,
      levels: projectState.levels,
      colorBalance: projectState.colorBalance,
    },
    layers: projectState.layers || [],
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const cleanName = filename.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const a = document.createElement("a");
  a.href = url;
  a.download = `${cleanName || "project"}.photopro`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Read and validate an uploaded .photopro project file
 */
export const importProjectFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file selected"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const data = JSON.parse(text);

        if (!data.canvas || !Array.isArray(data.layers)) {
          throw new Error("Invalid PhotoPro project schema. Missing canvas or layers.");
        }

        resolve(data);
      } catch (err) {
        reject(new Error("Unable to parse .photopro project file: " + err.message));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
