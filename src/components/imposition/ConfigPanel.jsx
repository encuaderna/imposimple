import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PAGE_SIZES, BINDING_METHODS, PAGE_FORMATS } from "@/lib/imposition-engine";
import { Settings2, BookOpen, Ruler, Layers, Printer, LayoutGrid, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function InfoTip({ text }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help inline ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ConfigPanel({ config, onConfigChange }) {
  const update = (key, value) => onConfigChange({ ...config, [key]: value });

  const fmt = PAGE_FORMATS[config.pageFormat || "quarto"];

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

      {/* Impresora */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Printer className="w-4 h-4" />
            Impresora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Tipo de impresión</Label>
            <Select value={config.printSides || "double"} onValueChange={(v) => update("printSides", v)}>
              <SelectTrigger className="mt-1 bg-background/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="double">Doble cara (dúplex)</SelectItem>
                <SelectItem value="single">Una cara (símplex)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex-1">
              <Label className="text-xs font-medium">Rotación alterna
                <InfoTip text="También conocida como «girar por el lado largo». Las hojas impares se rotan 180° para que al plegar el cuadernillo las páginas queden orientadas correctamente." />
              </Label>
              <p className="text-[10px] text-muted-foreground">Girar por el lado largo</p>
            </div>
            <Switch
              checked={config.alternatePage || false}
              onCheckedChange={(v) => update("alternatePage", v)}
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

      {/* Formato de pliego */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <LayoutGrid className="w-4 h-4" />
            Formato de pliego
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Formato de imposición</Label>
            <Select value={config.pageFormat || "quarto"} onValueChange={(v) => update("pageFormat", v)}>
              <SelectTrigger className="mt-1 bg-background/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PAGE_FORMATS).map(([key, f]) => (
                  <SelectItem key={key} value={key} className="text-sm">{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">
              {fmt.pagesPerSheet} págs/hoja · {fmt.defaultSheetsPerSig} hoja(s) recomendada(s)/cuadernillo
            </p>
          </div>

          <Separator className="opacity-50" />

          {/* Modo de pliegos */}
          <div>
            <Label className="text-xs text-muted-foreground">
              Modo de pliegos
              <InfoTip text="Pliegos estándar usa los controles de páginas por cuadernillo. Pliegos personalizados te permite definir exactamente cuántas hojas físicas tiene cada plica." />
            </Label>
            <Select value={config.signatureMode || "standard"} onValueChange={(v) => update("signatureMode", v)}>
              <SelectTrigger className="mt-1 bg-background/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Pliegos estándar — longitud</SelectItem>
                <SelectItem value="custom">Pliegos personalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.signatureMode !== "custom" ? (
            <div>
              <Label className="text-xs text-muted-foreground">Páginas por cuadernillo</Label>
              <Select value={String(config.pagesPerSignature)} onValueChange={(v) => update("pagesPerSignature", parseInt(v))}>
                <SelectTrigger className="mt-1 bg-background/50 font-mono text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[8, 16, 32].map((n) => (
                    <SelectItem key={n} value={String(n)} className="font-mono text-sm">
                      {n} páginas ({n / 4} hojas)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label className="text-xs text-muted-foreground">
                Hojas por plica
                <InfoTip text="La longitud de un pliego es el número de hojas físicas por cuadernillo. Para folio: cada hoja = 1 pliegue. Cuarto: 2 pliegues/hoja. Octavo: 4 pliegues/hoja. Se recomienda no más de 1 hoja para octavo." />
              </Label>
              <Input
                type="number"
                min={1}
                max={16}
                value={config.sheetsPerSig || fmt.defaultSheetsPerSig}
                onChange={(e) => update("sheetsPerSig", parseInt(e.target.value) || 1)}
                className="mt-1 bg-background/50 font-mono text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                = {(config.sheetsPerSig || fmt.defaultSheetsPerSig) * fmt.pagesPerSheet} páginas por cuadernillo
              </p>
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
        </CardContent>
      </Card>

      {/* Compensación de Creep */}
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