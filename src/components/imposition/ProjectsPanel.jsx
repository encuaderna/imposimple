import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderOpen, MoreVertical, Trash2, Copy, Download, Upload, Plus, Calendar, Settings, Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Panel de gestión completa de proyectos.
 */
export default function ProjectsPanel({
  projects,
  onLoadProject,
  onDeleteProject,
  onRenameProject,
  onDuplicateProject,
  onSaveCurrentProject,
  currentProjectName,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renamingProjectId, setRenamingProjectId] = useState(null);
  const [newName, setNewName] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProject = (name) => {
    if (!name.trim()) {
      toast.error("El nombre del proyecto no puede estar vacío");
      return;
    }
    onSaveCurrentProject(name);
    setShowSaveDialog(false);
    toast.success(`Proyecto "${name}" guardado`);
  };

  const handleRename = (id, name) => {
    if (!name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    onRenameProject(id, name);
    setShowRenameDialog(false);
    setRenamingProjectId(null);
    setNewName("");
    toast.success("Proyecto renombrado");
  };

  const handleDuplicate = (id) => {
    const newId = onDuplicateProject(id);
    if (newId) {
      toast.success("Proyecto duplicado");
    }
  };

  const handleExport = (project) => {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Proyecto exportado");
  };

  const handleLoad = (project) => {
    onLoadProject(project);
    toast.success(`Proyecto "${project.name}" cargado`);
  };

  return (
    <div className="space-y-4">
      {/* Encabezado con acciones */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <FolderOpen className="w-4 h-4" />
              Mis Proyectos
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              className="text-xs gap-1.5 rounded-xl bg-primary hover:bg-primary/90"
            >
              <Plus className="w-3.5 h-3.5" />
              Guardar actual
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs bg-background/50"
            />
          </div>

          {/* Lista de proyectos o estado vacío */}
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderOpen className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs font-medium text-muted-foreground">No hay proyectos guardados</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Guarda tu configuración actual para reutilizarla después</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              Sin resultados para "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filtered.map((project) => {
                const isCurrentProject = currentProjectName === project.name;
                return (
                  <div
                    key={project.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all group",
                      isCurrentProject
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/40 bg-muted/20 hover:bg-muted/40"
                    )}
                  >
                    {/* Info del proyecto */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-foreground">
                        {project.name}
                        {isCurrentProject && (
                          <Badge className="ml-2 text-[9px] h-5 px-1.5 bg-primary/20 text-primary border-primary/30">
                            Actual
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.updatedAt).toLocaleDateString("es-ES")}
                        </span>
                        <span>
                          {project.config?.totalPages || 0} págs
                        </span>
                        <span>
                          {project.summary?.totalSignatures || 0} cuads
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleLoad(project)}
                        title="Cargar proyecto"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => {
                              setRenamingProjectId(project.id);
                              setNewName(project.name);
                              setShowRenameDialog(true);
                            }}
                            className="text-xs gap-2"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            Renombrar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(project.id)}
                            className="text-xs gap-2"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleExport(project)}
                            className="text-xs gap-2"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Exportar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDeleteProject(project.id)}
                            className="text-xs gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo: Guardar proyecto */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Guardar proyecto actual</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre del proyecto</label>
              <Input
                defaultValue={currentProjectName || ""}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Mi proyecto..."
                className="mt-1 text-xs h-8"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(false)}
              className="text-xs rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => handleSaveProject(newName || currentProjectName)}
              className="text-xs rounded-xl"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Renombrar proyecto */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Renombrar proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nuevo nombre</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nuevo nombre..."
                className="mt-1 text-xs h-8"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRenameDialog(false)}
              className="text-xs rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => handleRename(renamingProjectId, newName)}
              className="text-xs rounded-xl"
            >
              Renombrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}