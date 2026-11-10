/**
 * PhotoPro Local Project Storage & State Persistence Engine
 * Enables Canva/Photoshop-style project saving completely on the frontend
 */

const STORAGE_KEY = "photopro_saved_projects_v1";

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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 30)));
    return true;
  } catch (err) {
    console.error("Failed to save project locally:", err);
    return false;
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

export const duplicateProjectInLocal = (id) => {
  try {
    const projects = getSavedProjects();
    const target = projects.find((p) => p.id === id);
    if (!target) return null;

    const copy = {
      ...JSON.parse(JSON.stringify(target)),
      id: crypto.randomUUID(),
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.unshift(copy);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return copy;
  } catch {
    return null;
  }
};

export const exportProjectJSON = (project) => {
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", jsonStr);
  dlAnchor.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, "-")}-photopro.json`);
  dlAnchor.click();
};
