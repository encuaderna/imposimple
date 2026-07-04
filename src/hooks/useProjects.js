import { useState, useCallback } from "react";

const STORAGE_KEY = "imposition_projects";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function persist(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState(load);

  const saveProject = useCallback((name, config, imposition, summary, marksConfig) => {
    const projectName = name || `Proyecto ${new Date().toLocaleDateString("es-ES")}`;
    const existing = load();
    const idx = existing.findIndex((p) => p.name === projectName);
    const entry = {
      id: idx >= 0 ? existing[idx].id : crypto.randomUUID(),
      name: projectName,
      config,
      imposition,
      summary,
      marksConfig,
      updated_date: new Date().toISOString(),
    };
    const updated = idx >= 0
      ? existing.map((p, i) => (i === idx ? entry : p))
      : [entry, ...existing];
    persist(updated);
    setProjects(updated);
    return projectName;
  }, []);

  const deleteProject = useCallback((id) => {
    const updated = load().filter((p) => p.id !== id);
    persist(updated);
    setProjects(updated);
  }, []);

  const renameProject = useCallback((id, newName) => {
    const updated = load().map((p) =>
      p.id === id ? { ...p, name: newName, updated_date: new Date().toISOString() } : p
    );
    persist(updated);
    setProjects(updated);
  }, []);

  const loadProject = useCallback((id) => {
    const project = load().find((p) => p.id === id);
    if (!project) return null;
    return {
      config: project.config,
      imposition: project.imposition,
      summary: project.summary,
      marksConfig: project.marksConfig,
    };
  }, []);

  const duplicateProject = useCallback((id) => {
    const existing = load();
    const project = existing.find((p) => p.id === id);
    if (!project) return;
    const copy = {
      ...project,
      id: crypto.randomUUID(),
      name: `${project.name} (copia)`,
      updated_date: new Date().toISOString(),
    };
    const updated = [copy, ...existing];
    persist(updated);
    setProjects(updated);
  }, []);

  return {
    projects,
    isLoading: false,
    saveProject,
    deleteProject,
    renameProject,
    loadProject,
    duplicateProject,
  };
}