import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, ChevronRight, LayoutGrid, Layers } from "lucide-react";
import FoldedSheetView from "./FoldedSheetView";
import SheetPreview from "./SheetPreview";

export default function PreviewPanel({ imposition, marksConfig, pageSize }) {
  const [selectedSig, setSelectedSig] = useState(0);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [viewMode, setViewMode] = useState("interactive"); // "interactive" | "grid"

  if (!imposition?.signatures?.length) return null;

  const signature = imposition.signatures[selectedSig];
  const sheet = signature.sheets[selectedSheet];
  const totalSheets = signature.sheets.length;

  const handlePrevSheet = () => setSelectedSheet((s) => Math.max(0, s - 1));
  const handleNextSheet = () => setSelectedSheet((s) => Math.min(totalSheets - 1, s + 1));

  const handleSigChange = (val) => {
    setSelectedSig(parseInt(val));
    setSelectedSheet(0);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            Visualizador de pliegos
          </CardTitle>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Selector de modo de vista */}
            <div className="flex items-center bg-muted/50 border border-border/40 rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2.5 rounded-none text-xs gap-1.5 ${viewMode === "interactive" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                onClick={() => setViewMode("interactive")}
              >
                <Layers className="w-3 h-3" />
                Interactivo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 px-2.5 rounded-none text-xs gap-1.5 ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-3 h-3" />
                Cuadrícula
              </Button>
            </div>

            {/* Selector de cuadernillo */}
            <Select value={String(selectedSig)} onValueChange={handleSigChange}>
              <SelectTrigger className="w-52 h-8 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {imposition.signatures.map((sig, i) => (
                  <SelectItem key={i} value={String(i)} className="text-xs font-mono">
                    {sig.label} · Págs. {sig.pageRange.first}–{sig.pageRange.last}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info resumen del cuadernillo */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="outline" className="font-mono text-[10px]">
            {signature.sheets.length} hoja{signature.sheets.length !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px]">
            {signature.pageRange.first}–{signature.pageRange.last}
          </Badge>
          {signature.sheets.some(s => s.creep > 0) && (
            <Badge className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
              creep aplicado
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === "interactive" ? (
          <div className="space-y-6">
            {/* Navegación de hojas */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevSheet}
                disabled={selectedSheet === 0}
                className="gap-1.5 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Hoja anterior
              </Button>

              {/* Indicadores de posición */}
              <div className="flex items-center gap-1.5">
                {signature.sheets.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSheet(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i === selectedSheet
                        ? "bg-primary scale-125"
                        : "bg-border hover:bg-muted-foreground/40"
                    }`}
                    title={`Hoja ${i + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextSheet}
                disabled={selectedSheet === totalSheets - 1}
                className="gap-1.5 text-xs"
              >
                Hoja siguiente
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Visualizador interactivo */}
            <div className="flex justify-center py-4">
              <FoldedSheetView
                sheet={sheet}
                signatureNumber={signature.signatureNumber}
                totalSheets={totalSheets}
                marksConfig={marksConfig}
              />
            </div>

            {/* Tabla de páginas de la hoja actual */}
            <div className="border border-border/40 rounded-xl overflow-hidden">
              <div className="grid grid-cols-5 text-[10px] font-mono text-muted-foreground bg-muted/40 px-3 py-2 uppercase tracking-wider">
                <span>Cara</span>
                <span>Izquierda</span>
                <span className="text-center">Lomo</span>
                <span>Derecha</span>
                <span className="text-right">Creep</span>
              </div>
              <div className="divide-y divide-border/30">
                {[
                  { label: "Frente", face: sheet.front },
                  { label: "Dorso", face: sheet.back },
                ].map(({ label, face }) => (
                  <div key={label} className="grid grid-cols-5 items-center px-3 py-2.5 text-sm font-mono">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                      label === "Frente"
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-amber-500 dark:text-amber-400"
                    }`}>{label}</span>
                    <PagePill page={face.left} />
                    <div className="flex justify-center">
                      <div className="w-px h-5 bg-destructive/40 rounded" />
                    </div>
                    <PagePill page={face.right} />
                    <span className="text-right text-[10px] text-primary font-semibold">
                      {sheet.creep > 0 ? `${sheet.creep}mm` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nota educativa sobre creep */}
            {sheet.creep > 0 && (
              <div className="flex gap-2 bg-primary/5 border border-primary/15 rounded-lg p-3 text-[11px] text-muted-foreground leading-snug">
                <span className="text-primary text-base leading-none">📐</span>
                <span>
                  La banda azul en el margen interior representa los <strong className="text-foreground">{sheet.creep} mm</strong> de compensación
                  de creep aplicados a esta hoja. Las páginas del interior de un cuadernillo doblado sobresalen
                  más hacia afuera; este margen extra asegura que el contenido quede alineado tras el guillotinado.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Modo cuadrícula: todas las hojas del cuadernillo */
          <div className="space-y-6">
            {signature.sheets.map((s) => (
              <div key={s.sheetIndex} className="border border-border/30 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/20">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Hoja {s.sheetIndex + 1}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    F: [{s.front.left?.label ?? "B"}, {s.front.right?.label ?? "B"}] · D: [{s.back.left?.label ?? "B"}, {s.back.right?.label ?? "B"}]
                  </span>
                  {s.creep > 0 && (
                    <span className="ml-auto text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      creep: {s.creep}mm
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <SheetPreview
                    sheet={s}
                    signatureNumber={signature.signatureNumber}
                    marksConfig={marksConfig}
                    pageSize={pageSize}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PagePill({ page }) {
  if (!page) return <span className="text-muted-foreground/30 text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold border ${
      page.isBlank
        ? "text-muted-foreground/40 border-dashed border-muted-foreground/20 bg-transparent"
        : "text-foreground border-border/50 bg-muted/40"
    }`}>
      {page.label}
    </span>
  );
}