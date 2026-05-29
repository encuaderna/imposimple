import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { PAGE_SIZES, BINDING_METHODS, PAGE_FORMATS } from "@/lib/imposition-engine";
import { Settings2, BookOpen, Ruler, Layers, Printer, LayoutGrid, Info, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import PdfUploadZone from "@/components/imposition/PdfUploadZone";
import PaperAdvisor from "@/components/imposition/PaperAdvisor";
import PaperPresetsPanel from "@/components/imposition/PaperPresetsPanel";
import RealtimeImpositionPreview from "@/components/imposition/RealtimeImpositionPreview";
import ValidationWarnings from "@/components/imposition/ValidationWarnings";
import { useImpositionValidation } from "@/hooks/useImpositionValidation";

/** Burbuja de ayuda con ícono "i" azul visible */
function InfoTip({ text }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary cursor-help ml-1 align-middle text-[10px] font-bold leading-none border border-primary/30">
            i
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] text-xs leading-relaxed">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Bloque de ayuda educativa para principiantes */
function EduNote({ children }) {
  return (
    <div className="flex gap-2 bg-primary/5 border border-primary/15 rounded-lg p-2.5 mt-2">
      <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
      <p className="text-[11px] text-muted-foreground leading-snug">{children}</p>
    </div>
  );
}

const SECTIONS = ["pdf", "documento", "impresora", "tamaño", "pliego", "encuadernacion", "papel", "creep"];
const SECTION_LABELS = ["PDF", "Documento", "Impresora", "Tamaño", "Pliego", "Encuadernación", "Mis papeles", "Creep"];

export default function ConfigPanel({ config, onConfigChange, pdfFile, onPdfChange, focusMode, focusStep, onFocusStepChange, imposition, marksConfig }) {
  const update = (key, value) => onConfigChange({ ...config, [key]: value });
  const [expandedSections, setExpandedSections] = React.useState({
    pdf: true,
    documento: true,
    impresora: false,
    tamaño: false,
    pliego: false,
    encuadernacion: false,
    papel: false,
    creep: false,
  });

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fmt = PAGE_FORMATS[config.pageFormat || "quarto"];

  const isVisible = (sectionIndex) => !focusMode || focusStep === sectionIndex;

  // Validación en tiempo real
  const issues = useImpositionValidation(config, imposition, imposition ? {
    totalWithBlanks: imposition.signatures.reduce((sum, s) => sum + s.sheets.reduce((ss, sh) => ss + (sh.front.left ? 1 : 0) + (sh.front.right ? 1 : 0), 0), 0),
    totalSignatures: imposition.signatures.length,
    totalSheets: imposition.signatures.reduce((sum, s) => sum + s.sheets.length, 0),
    sheetsPerSignature: imposition.signatures[0]?.sheets.length || 0,
    pagesPerSignature: config.pagesPerSignature,
    blankPagesAdded: config.blankPagesStart + config.blankPagesEnd,
    totalCreepMm: imposition.signatures.reduce((sum, s) => sum + Math.max(...s.sheets.map(sh => sh.creep || 0)), 0),
    avgCreepPerSheet: imposition.signatures.reduce((sum, s) => sum + s.sheets.reduce((ss, sh) => ss + (sh.creep || 0), 0) / s.sheets.length, 0) / imposition.signatures.length,
  } : null);

  return (
    <div className="space-y-4">
      {/* Avisos de validación */}
      {!focusMode && <ValidationWarnings issues={issues} />}

      {focusMode && (
        <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
          <button onClick={() => onFocusStepChange(Math.max(0, focusStep - 1))} disabled={focusStep === 0} className="p-1 rounded hover:bg-primary/10 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4 text-primary" />
          </button>
          <span className="text-xs font-semibold text-primary">
            Paso {focusStep + 1} de {SECTIONS.length}: {SECTION_LABELS[focusStep]}
          </span>
          <button onClick={() => onFocusStepChange(Math.min(SECTIONS.length - 1, focusStep + 1))} disabled={focusStep === SECTIONS.length - 1} className="p-1 rounded hover:bg-primary/10 disabled:opacity-30">
            <ChevronRight className="w-4 h-4 text-primary" />
          </button>
        </div>
      )}

      {/* Subir PDF */}
      {isVisible(0) && (
        <Collapsible open={expandedSections.pdf} onOpenChange={() => toggleSection("pdf")} className="space-y-0">
          <Card className="border-primary/30 bg-primary/5 rounded-b-none">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-primary/10 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary uppercase tracking-wider">
                    <Upload className="w-4 h-4" />
                    1. Sube tu PDF
                  </CardTitle>
                  <ChevronDown className={`w-4 h-4 text-primary transition-transform ${expandedSections.pdf ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
          </Card>
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out">
            <Card className="border-primary/30 bg-primary/5 rounded-t-none border-t-0">
        <CardContent className="space-y-2">
          <PdfUploadZone pdfFile={pdfFile} onPdfChange={onPdfChange} onPageCountDetected={(n) => onConfigChange({ ...config, totalPages: n })} />
              <EduNote>
                Aquí subes el libro o documento que quieres imprimir. El sistema lo va a dividir automáticamente en cuadernillos numerados (1, 2, 3…) listos para doblar y coser.
              </EduNote>
            </CardContent>
          </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Documento */}
      {isVisible(1) && (
        <Collapsible open={expandedSections.documento} onOpenChange={() => toggleSection("documento")} className="space-y-0">
          <Card className="border-border/50 rounded-b-none">
            <CollapsibleTrigger asChild>
              <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    2. Documento
                  </CardTitle>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections.documento ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
          </Card>
          <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out">
            <Card className="border-border/50 rounded-t-none border-t-0">
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
            <Label className="text-xs text-muted-foreground">
              Total de páginas
              <InfoTip text="Cuenta el total de páginas de tu documento. Si tu libro tiene 128 páginas, escribe 128. El sistema añadirá páginas en blanco automáticamente si es necesario." />
            </Label>
            <Input
              type="number"
              min={4}
              value={config.totalPages || ""}
              onChange={(e) => update("totalPages", parseInt(e.target.value) || 0)}
              className="mt-1 bg-background/50 font-mono text-sm"
            />
            <EduNote>
              ¿No sabes cuántas páginas tiene? Abre el PDF en tu computador y fíjate en el número de la última página.
            </EduNote>
            </div>
            </CardContent>
            </Card>
            </CollapsibleContent>
            </Collapsible>
            )}

      {/* Impresora */}
      {isVisible(2) && <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Printer className="w-4 h-4" />
            3. Impresora
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">
              Tipo de impresión
              <InfoTip text="«Doble cara» imprime por los dos lados de la hoja (más económico). «Una cara» solo imprime por un lado." />
            </Label>
            <Select value={config.printSides || "double"} onValueChange={(v) => update("printSides", v)}>
              <SelectTrigger className="mt-1 bg-background/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="double">Doble cara (dúplex)</SelectItem>
                <SelectItem value="single">Una cara (símplex)</SelectItem>
              </SelectContent>
            </Select>
            <EduNote>
              La mayoría de impresoras modernas imprimen a doble cara. Si no estás seguro, elige «Doble cara».
            </EduNote>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex-1">
              <Label className="text-xs font-medium">Rotación alterna
                <InfoTip text="Actívalo si tu impresora «voltea» la hoja por el lado largo al imprimir por detrás. Así las páginas quedan derechas al doblar el cuadernillo." />
              </Label>
              <p className="text-[10px] text-muted-foreground">Girar por el lado largo</p>
            </div>
            <Switch
              checked={config.alternatePage || false}
              onCheckedChange={(v) => update("alternatePage", v)}
            />
          </div>
        </CardContent>
      </Card>}

      {/* Tamaño de página */}
      {isVisible(3) && <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Ruler className="w-4 h-4" />
            4. Tamaño de página
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">
              Formato del papel
              <InfoTip text="Este es el tamaño de cada página de tu libro (no de la hoja donde se imprime). Por ejemplo, un libro de bolsillo suele ser A5." />
            </Label>
            <Select value={config.pageSize} onValueChange={(v) => update("pageSize", v)}>
              <SelectTrigger className="mt-1 bg-background/50 font-mono text-sm">
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
            <EduNote>
              A5 es el tamaño más común para libros. A4 es el de una hoja de impresora normal. Si tu PDF tiene un tamaño especial, elige «Personalizado».
            </EduNote>
          </div>
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
      </Card>}

      {/* Formato de pliego */}
      {isVisible(4) && <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <LayoutGrid className="w-4 h-4" />
            5. Formato de pliego
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EduNote>
            Un «pliego» es la hoja grande que se dobla para formar páginas del libro. «Cuarto» significa que se dobla en 4 partes — es el más habitual para libros comunes.
          </EduNote>
          <div>
            <Label className="text-xs text-muted-foreground">
              Formato de imposición
              <InfoTip text="Define cuántas páginas caben en cada hoja física. Cuarto (4 págs/cara) es el estándar más común. Octavo cabe el doble pero el papel se dobla más veces." />
            </Label>
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
              <Label className="text-xs text-muted-foreground">
                Páginas por cuadernillo
                <InfoTip text="Un cuadernillo es un grupo de hojas dobladas juntas. Con 16 páginas por cuadernillo, un libro de 128 páginas se divide en 8 cuadernillos numerados del 1 al 8." />
              </Label>
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
      </Card>}

      {/* Encuadernación */}
      {isVisible(5) && <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            6. Encuadernación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label className="text-xs text-muted-foreground">
            Método de encuadernación
            <InfoTip text="Cómo se van a unir los cuadernillos entre sí para formar el libro." />
          </Label>
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
          <EduNote>
            «Cosido» es el método tradicional de los libros de calidad: se cose hilo por el lomo de cada cuadernillo. «Perfecta» usa pegamento caliente, como los libros de bolsillo modernos.
          </EduNote>

          {/* Asesor de papel */}
          {config.bindingMethod && config.totalPages >= 4 && (
            <PaperAdvisor
              bindingMethod={config.bindingMethod}
              totalPages={config.totalPages}
              pagesPerSignature={config.pagesPerSignature}
              onApplyThickness={(t) => update("paperThickness", t)}
            />
          )}
        </CardContent>
      </Card>}

      {/* Mis papeles favoritos */}
      {isVisible(6) && (
        <PaperPresetsPanel
          currentThickness={config.paperThickness}
          onApply={(t) => update("paperThickness", t)}
        />
      )}

      {/* Vista previa en tiempo real (siempre visible cuando hay imposición) */}
      {imposition && marksConfig && !focusMode && (
        <RealtimeImpositionPreview
          config={config}
          imposition={imposition}
          marksConfig={marksConfig}
        />
      )}

      {/* Compensación de Creep */}
      {isVisible(7) && <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Settings2 className="w-4 h-4" />
            7. Compensación de Creep
            <InfoTip text="El «creep» es el efecto de que las páginas del centro de un cuadernillo sobresalen un poco hacia afuera al doblar. Este ajuste lo corrige automáticamente." />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <EduNote>
            Cuando doblas varias hojas juntas, las del centro asoman un poco. Esta sección ajusta el margen interior de cada página para que al recortar el libro todo quede parejo.
          </EduNote>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-xs text-muted-foreground">
                Grosor del papel
                <InfoTip text="El papel de oficina normal mide ~0.10 mm. Papel más grueso (como cartulina o papel de arte) puede medir 0.15–0.20 mm." />
              </Label>
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
      </Card>}

    </div>
  );
}