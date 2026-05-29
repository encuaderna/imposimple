import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Hook para gestionar proyectos en la base de datos.
 * Los proyectos son privados del usuario (protegidos por RLS automática).
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar proyectos al montar
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await base44.entities.ImpositionProject.list('-updated_date');
      setProjects(data);
    } catch (e) {
      console.error("Error cargando proyectos:", e);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async (name, config, imposition, summary, marksConfig) => {
    try {
      const projectName = name || `Proyecto ${new Date().toLocaleDateString("es-ES")}`;
      
      // Buscar si existe un proyecto con el mismo nombre
      const existing = projects.find((p) => p.name === projectName);
      
      if (existing) {
        // Actualizar existente
        await base44.entities.ImpositionProject.update(existing.id, {
          name: projectName,
          config,
          imposition,
          summary,
          marksConfig,
        });
      } else {
        // Crear nuevo
        await base44.entities.ImpositionProject.create({
          name: projectName,
          config,
          imposition,
          summary,
          marksConfig,
        });
      }
      
      // Recargar lista
      await loadProjects();
      return projectName;
    } catch (e) {
      console.error("Error guardando proyecto:", e);
      throw e;
    }
  };

  const deleteProject = async (id) => {
    const previousProjects = projects;
    try {
      // Optimistic UI update
      setProjects((prev) => prev.filter((p) => p.id !== id));
      await base44.entities.ImpositionProject.delete(id);
    } catch (e) {
      // Rollback on error
      setProjects(previousProjects);
      console.error("Error eliminando proyecto:", e);
      throw e;
    }
  };

  const renameProject = async (id, newName) => {
    const previousProjects = projects;
    try {
      // Optimistic UI update
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, name: newName } : p
        )
      );
      await base44.entities.ImpositionProject.update(id, { name: newName });
    } catch (e) {
      // Rollback on error
      setProjects(previousProjects);
      console.error("Error renombrando proyecto:", e);
      throw e;
    }
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

  const duplicateProject = async (id) => {
    try {
      const project = getProject(id);
      if (!project) return null;

      await base44.entities.ImpositionProject.create({
        name: `${project.name} (copia)`,
        config: JSON.parse(JSON.stringify(project.config)),
        imposition: JSON.parse(JSON.stringify(project.imposition)),
        summary: JSON.parse(JSON.stringify(project.summary)),
        marksConfig: JSON.parse(JSON.stringify(project.marksConfig)),
      });

      // Recargar lista
      await loadProjects();
      return true;
    } catch (e) {
      console.error("Error duplicando proyecto:", e);
      throw e;
    }
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