import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Grid3X3, Zap } from "lucide-react";
import { PAGE_SIZES } from "@/lib/imposition-engine";
import { cn } from "@/lib/utils";

/**
 * Vista previa visual en tiempo real de cómo quedan las páginas en la hoja física.
 * Se actualiza inmediatamente al cambiar cualquier parámetro.
 */
export default function RealtimeImpositionPreview({ config, imposition, marksConfig }) {
  if (!imposition || !config) return null;

  // Primera firma para mostrar la primera hoja como ejemplo
  const firstSig = imposition.signatures[0];
  if (!firstSig || !firstSig.sheets.length) return null;

  const firstSheet = firstSig.sheets[0];
  const pageSize = config.pageSize === "Custom"
    ? { width: config.customWidth, height: config.customHeight }
    : PAGE_SIZES[config.pageSize];

  const aspectRatio = (pageSize.width * 2) / pageSize.height; // doble cara

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            Preview de imposición
          </CardTitle>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Zap className="w-3 h-3 text-primary" />
            <span>Actualización en tiempo real</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Info summary */}
        <div className="flex flex-wrap gap-2 text-[10px]">
          <Badge variant="outline">1ª hoja · C{firstSig.signatureNumber}</Badge>
          <Badge variant="outline">Págs. {firstSheet.front.left?.label || "—"}–{firstSheet.front.right?.label || "—"}</Badge>
          {firstSheet.creep > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              creep: {firstSheet.creep} mm
            </Badge>
          )}
        </div>

        {/* Visualización 2D de la hoja doblada */}
        <div className="flex justify-center bg-muted/20 rounded-xl p-4">
          <div
            className="bg-white border-2 border-border rounded-sm shadow-lg overflow-hidden"
            style={{
              width: "100%",
              maxWidth: 500,
              aspectRatio: aspectRatio,
              position: "relative",
            }}
          >
            {/* Línea de plegado central */}
            {marksConfig?.fold && (
              <div
                className="absolute top-0 bottom-0 left-1/2 -translate-x-px w-0.5 bg-red-400/50 z-30"
                style={{ borderLeft: "1px dashed rgb(248 113 113 / 0.3)" }}
              />
            )}

            {/* FRENTE: Izquierda y Derecha */}
            <div className="absolute inset-0 flex">
              {/* Página izquierda (frente) */}
              <FrontPageCell
                page={firstSheet.front.left}
                isLeft={true}
                creep={firstSheet.creep}
                position="IZQ"
                signatureNumber={firstSig.signatureNumber}
              />
              {/* Página derecha (frente) */}
              <FrontPageCell
                page={firstSheet.front.right}
                isLeft={false}
                creep={firstSheet.creep}
                position="DER"
                signatureNumber={firstSig.signatureNumber}
              />
            </div>

            {/* Marcas técnicas */}
            {marksConfig?.crop && <CropMarks />}
            {marksConfig?.collation && <CollationMark signatureNumber={firstSig.signatureNumber} />}
            {marksConfig?.sewing && <SewingMarks />}
          </div>
        </div>

        {/* Info adicional */}
        <div className="grid grid-cols-3 gap-2 text-[10px] bg-muted/30 rounded-lg p-2">
          <div className="text-center">
            <span className="font-mono text-muted-foreground">Grosor papel</span>
            <p className="font-semibold text-foreground">{config.paperThickness} mm</p>
          </div>
          <div className="text-center border-x border-border/30">
            <span className="font-mono text-muted-foreground">Creep total</span>
            <p className="font-semibold text-foreground">{firstSheet.creep} mm</p>
          </div>
          <div className="text-center">
            <span className="font-mono text-muted-foreground">Método</span>
            <p className="font-semibold text-foreground capitalize">
              {config.bindingMethod === "saddle_stitch" ? "Grapado" : config.bindingMethod === "perfect_bind" ? "Perfecta" : "Cosido"}
            </p>
          </div>
        </div>

        {/* Nota educativa */}
        <div className="text-[10px] text-muted-foreground flex gap-2 bg-primary/5 border border-primary/15 rounded-lg p-2">
          <Grid3X3 className="w-3 h-3 shrink-0 mt-0.5" />
          <span>
            Esta vista muestra la <strong>primera hoja del primer cuadernillo</strong>. Actualízala cambiando parámetros de páginas, encuadernación o grosor.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Celda de página en el frente
 */
function FrontPageCell({ page, isLeft, creep, position, signatureNumber }) {
  const isEmpty = !page || page.isBlank;
  const creepPx = Math.min(creep * 8, 16); // escala visual

  return (
    <div
      className={cn(
        "flex-1 relative flex flex-col items-center justify-center transition-all",
        "border-dashed border-border/40",
        isLeft ? "border-r" : "",
        isEmpty ? "bg-slate-50 dark:bg-slate-800/50" : "bg-white dark:bg-slate-900"
      )}
    >
      {/* Banda de creep */}
      {creepPx > 0 && (
        <div
          className="absolute top-0 bottom-0 bg-primary/8 border-primary/30"
          style={{
            [isLeft ? "right" : "left"]: 0,
            width: creepPx,
            [isLeft ? "borderRight" : "borderLeft"]: "1px solid hsl(var(--primary) / 0.3)",
          }}
        />
      )}

      {/* Contenido */}
      <div className="relative z-10 text-center">
        <div className={cn(
          "font-mono font-bold transition-all",
          isEmpty ? "text-2xl text-slate-300 dark:text-slate-600" : "text-3xl text-slate-700 dark:text-slate-200"
        )}>
          {page?.label || "—"}
        </div>
        <div className={cn(
          "text-[8px] font-mono mt-1",
          isEmpty ? "text-slate-300 dark:text-slate-600" : "text-muted-foreground/60"
        )}>
          {isEmpty ? "BLANCO" : `FRENTE ${position}`}
        </div>
      </div>

      {/* Indicador creep en esquina */}
      {creepPx > 0 && !isEmpty && (
        <div className="absolute bottom-2 text-[8px] font-mono text-primary/50" style={{ [isLeft ? "right" : "left"]: 4 }}>
          ←{creep}mm
        </div>
      )}
    </div>
  );
}

function CropMarks() {
  return (
    <>
      {/* Esquinas */}
      {[
        { top: 2, left: 2 },
        { top: 2, right: 2 },
        { bottom: 2, left: 2 },
        { bottom: 2, right: 2 },
      ].map((pos, i) => (
        <div key={i} className="absolute w-3 h-3 z-20 pointer-events-none" style={pos}>
          <div className="absolute w-3 h-0.5 bg-slate-800 dark:bg-slate-300" style={{ [Object.keys(pos)[0]]: 0, [Object.keys(pos)[1]]: 0 }} />
          <div className="absolute h-3 w-0.5 bg-slate-800 dark:bg-slate-300" style={{ [Object.keys(pos)[0]]: 0, [Object.keys(pos)[1]]: 0 }} />
        </div>
      ))}
    </>
  );
}

function CollationMark({ signatureNumber }) {
  return (
    <div
      className="absolute left-0 w-1 bg-slate-800 dark:bg-slate-300 z-20"
      style={{
        top: `${8 + (signatureNumber - 1) * 6}%`,
        height: 12,
      }}
    />
  );
}

function SewingMarks() {
  return (
    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-around pointer-events-none z-20">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-1 h-1 rounded-full bg-red-400/70" />
      ))}
    </div>
  );
}