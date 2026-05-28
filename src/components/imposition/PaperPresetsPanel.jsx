import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePaperPresets } from "@/hooks/usePaperPresets";
import { Layers, Plus, Trash2, Check, RotateCcw, Pencil, X } from "lucide-react";

const EMPTY_FORM = { name: "", gsm: "", thickness: "", note: "" };

export default function PaperPresetsPanel({ currentThickness, onApply }) {
  const { presets, add, remove, update, reset } = usePaperPresets();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [applied, setApplied] = useState(null);

  const isValid = form.name.trim() && parseFloat(form.gsm) > 0 && parseFloat(form.thickness) > 0;

  const handleSave = () => {
    if (!isValid) return;
    const data = {
      name: form.name.trim(),
      gsm: parseFloat(form.gsm),
      thickness: parseFloat(form.thickness),
      note: form.note.trim(),
    };
    if (editingId) {
      update(editingId, data);
      setEditingId(null);
    } else {
      add(data);
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, gsm: String(p.gsm), thickness: String(p.thickness), note: p.note || "" });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleApply = (p) => {
    onApply(p.thickness);
    setApplied(p.id);
    setTimeout(() => setApplied(null), 1500);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            Mis papeles
          </CardTitle>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-muted-foreground hover:text-destructive" onClick={reset}>
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Restaurar predeterminados</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] gap-1 rounded-lg text-primary hover:bg-primary/10"
              onClick={() => { setShowForm((v) => !v); setEditingId(null); setForm(EMPTY_FORM); }}
            >
              <Plus className="w-3 h-3" />
              Nuevo
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Lista de presets */}
        <div className="space-y-1.5">
          {presets.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 bg-muted/30 hover:bg-muted/60 border border-border/30 rounded-lg px-2.5 py-2 transition-colors group"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold truncate">{p.name}</span>
                  <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{p.gsm} g/m²</Badge>
                  <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{p.thickness} mm</Badge>
                </div>
                {p.note && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{p.note}</p>}
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-muted-foreground hover:text-foreground" onClick={() => handleEdit(p)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Editar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-muted-foreground hover:text-destructive" onClick={() => remove(p.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Eliminar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Botón Aplicar */}
              <Button
                size="sm"
                variant={applied === p.id ? "default" : "outline"}
                className={`h-6 px-2 text-[10px] rounded-lg shrink-0 gap-1 transition-all ${applied === p.id ? "bg-green-600 text-white border-green-600" : "border-primary/40 text-primary hover:bg-primary/10"}`}
                onClick={() => handleApply(p)}
              >
                {applied === p.id ? <Check className="w-3 h-3" /> : null}
                {applied === p.id ? "¡Aplicado!" : "Aplicar"}
              </Button>
            </div>
          ))}

          {presets.length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-3">Sin papeles guardados. Añade uno.</p>
          )}
        </div>

        {/* Formulario nuevo / edición */}
        {showForm && (
          <div className="border border-primary/20 rounded-xl bg-primary/5 p-3 space-y-2.5 mt-2">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              {editingId ? "Editar papel" : "Nuevo papel"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <Label className="text-[10px] text-muted-foreground">Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Couché satinado 135"
                  className="mt-0.5 h-7 text-xs bg-background/60"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Gramaje (g/m²)</Label>
                <Input
                  type="number"
                  min={40}
                  max={400}
                  value={form.gsm}
                  onChange={(e) => setForm((f) => ({ ...f, gsm: e.target.value }))}
                  placeholder="90"
                  className="mt-0.5 h-7 text-xs font-mono bg-background/60"
                />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">Grosor (mm)</Label>
                <Input
                  type="number"
                  min={0.04}
                  max={0.50}
                  step={0.01}
                  value={form.thickness}
                  onChange={(e) => setForm((f) => ({ ...f, thickness: e.target.value }))}
                  placeholder="0.10"
                  className="mt-0.5 h-7 text-xs font-mono bg-background/60"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-[10px] text-muted-foreground">Nota (opcional)</Label>
                <Input
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Ej: Para interiores con fotos"
                  className="mt-0.5 h-7 text-xs bg-background/60"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1 h-7 text-xs rounded-lg" onClick={handleSave} disabled={!isValid}>
                <Check className="w-3 h-3 mr-1" />
                {editingId ? "Guardar cambios" : "Añadir papel"}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg px-3" onClick={handleCancel}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}