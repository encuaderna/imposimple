import React from "react";
import { Clock, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "imposition_projects";

function loadRecent() {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return all.slice(0, 3);
  } catch {
    return [];
  }
}

export default function RecentProjectsSection({ onResume }) {
  const projects = loadRecent();
  if (projects.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Proyectos recientes</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col gap-2 p-3 rounded-xl border border-border/50 bg-white/60 dark:bg-slate-800/60 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">{project.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {project.config?.totalPages || 0} págs · {project.config?.pageSize || "A5"}
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                  {project.updated_date
                    ? new Date(project.updated_date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px] gap-1 rounded-lg w-full"
              onClick={() => onResume(project)}
            >
              Continuar
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}