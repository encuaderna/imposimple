import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { PAGE_SIZES, BINDING_METHODS } from "@/lib/imposition-engine";
import { Settings2, BookOpen, Ruler, Layers } from "lucide-react";

export default function ConfigPanel({ config, onConfigChange }) {
  const update = (key, value) => onConfigChange({ ...config, [key]: value });

  return (
    <div className="space-y-4">
      {/* Documento */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            Documento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Nombre del proyecto</Label>
            <Input
              value={config.name || ""}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Mi libro..."
              className="mt-1 bg-background/50 font-mono text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Total de páginas</Label>
            <Input
              type="number"
              min={4}
              value={config.totalPages || ""}
              onChange={(e) => update("totalPages", parseInt(e.target.value) || 0)}
              className="mt-1 bg-background/50 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tamaño de página */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Ruler className="w-4 h-4" />
            Tamaño de página
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={config.pageSize} onValueChange={(v) => update("pageSize", v)}>
            <SelectTrigger className="bg-background/50 font-mono text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAGE_SIZES).map(([key, size]) => (
                <SelectItem key={key} value={key} className="font-mono text-sm">
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {config.pageSize === "Custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Ancho (mm)</Label>
                <Input type="number" min={50} value={config.customWidth || ""} onChange={(e) => update("customWidth", parseFloat(e.target.value))} className="mt-1 bg-background/50 font-mono text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Alto (mm)</Label>
                <Input type="number" min={50} value={config.customHeight || ""} onChange={(e) => update("customHeight", parseFloat(e.target.value))} className="mt-1 bg-background/50 font-mono text-sm" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Encuadernación */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            Encuadernación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={config.bindingMethod} onValueChange={(v) => update("bindingMethod", v)}>
            <SelectTrigger className="bg-background/50 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BINDING_METHODS).map(([key, method]) => (
                <SelectItem key={key} value={key} className="text-sm">
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <Label className="text-xs text-muted-foreground">Páginas por cuadernillo</Label>
            <Select value={String(config.pagesPerSignature)} onValueChange={(v) => update("pagesPerSignature", parseInt(v))}>
              <SelectTrigger className="mt-1 bg-background/50 font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[8, 16, 32].map((n) => (
                  <SelectItem key={n} value={String(n)} className="font-mono text-sm">{n} páginas ({n / 4} hojas)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Parámetros de Creep */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Settings2 className="w-4 h-4" />
            Compensación de Creep
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">Grosor del papel</Label>
              <span className="text-xs font-mono text-primary">{config.paperThickness} mm</span>
            </div>
            <Slider
              value={[config.paperThickness * 100]}
              onValueChange={([v]) => update("paperThickness", v / 100)}
              min={3}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0.03 mm</span>
              <span>0.20 mm</span>
            </div>
          </div>
          <Separator className="opacity-50" />
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">Factor de acumulación</Label>
              <span className="text-xs font-mono text-primary">{config.creepFactor}</span>
            </div>
            <Slider
              value={[config.creepFactor * 100]}
              onValueChange={([v]) => update("creepFactor", v / 100)}
              min={50}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
          <Separator className="opacity-50" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Blancos al inicio</Label>
              <Input type="number" min={0} max={8} value={config.blankPagesStart} onChange={(e) => update("blankPagesStart", parseInt(e.target.value) || 0)} className="mt-1 bg-background/50 font-mono text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Blancos al final</Label>
              <Input type="number" min={0} max={8} value={config.blankPagesEnd} onChange={(e) => update("blankPagesEnd", parseInt(e.target.value) || 0)} className="mt-1 bg-background/50 font-mono text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}