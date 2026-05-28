import { useState, useEffect } from "react";

const STORAGE_KEY = "imposicion_projects";

/**
 * Hook para gestionar proyectos completos (configuración + imposición).
 * Persiste en localStorage.
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar proyectos al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Error cargando proyectos:", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Guardar proyectos cuando cambien
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects, isLoading]);

  const saveProject = (name, config, imposition, summary, marksConfig) => {
    const newProject = {
      id: Date.now().toString(),
      name: name || `Proyecto ${new Date().toLocaleDateString("es-ES")}`,
      config,
      imposition,
      summary,
      marksConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => {
      // Si existe un proyecto con el mismo nombre, actualizarlo
      const existing = prev.findIndex((p) => p.name === name);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { ...newProject, id: updated[existing].id, createdAt: updated[existing].createdAt };
        return updated;
      }
      return [...prev, newProject];
    });

    return newProject.id;
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const renameProject = (id, newName) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const getProject = (id) => {
    return projects.find((p) => p.id === id);
  };

  const loadProject = (id) => {
    const project = getProject(id);
    if (project) {
      return {
        config: project.config,
        imposition: project.imposition,
        summary: project.summary,
        marksConfig: project.marksConfig,
      };
    }
    return null;
  };

  const duplicateProject = (id) => {
    const project = getProject(id);
    if (!project) return null;

    const newProject = {
      id: Date.now().toString(),
      name: `${project.name} (copia)`,
      config: JSON.parse(JSON.stringify(project.config)),
      imposition: JSON.parse(JSON.stringify(project.imposition)),
      summary: JSON.parse(JSON.stringify(project.summary)),
      marksConfig: JSON.parse(JSON.stringify(project.marksConfig)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [...prev, newProject]);
    return newProject.id;
  };

  return {
    projects,
    isLoading,
    saveProject,
    deleteProject,
    renameProject,
    getProject,
    loadProject,
    duplicateProject,
  };
}