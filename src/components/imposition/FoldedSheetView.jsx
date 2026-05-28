import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Visualizador interactivo de hoja doblada con efecto de creep.
 * Muestra frente/dorso con animación de volteo y compensación visual del creep.
 */
export default function FoldedSheetView({ sheet, signatureNumber, totalSheets, marksConfig }) {
  const [flipped, setFlipped] = useState(false);
  const [hoveredPage, setHoveredPage] = useState(null);

  const creepPx = Math.min(sheet.creep * 6, 24); // escalar a píxeles visuales
  const sheetDepth = signatureNumber; // posición en la pila = profundidad visual

  const face = flipped ? sheet.back : sheet.front;
  const faceLabel = flipped ? "DORSO" : "FRENTE";

  const pageColor = (page) => {
    if (!page || page.isBlank) return "bg-muted/40 text-muted-foreground/30 border-dashed";
    return "bg-card text-foreground border-border/60";
  };

  return (
    <div className="flex flex-col items-center gap-4 select-none">

      {/* ── Indicador de posición en la pila ────────────────────────── */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
        <span>Hoja {sheet.sheetIndex + 1} de {totalSheets}</span>
        <span className="mx-1 text-border">·</span>
        <span className={cn(
          "px-1.5 py-0.5 rounded font-semibold",
          sheet.creep > 0
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-muted text-muted-foreground"
        )}>
          {sheet.creep > 0 ? `creep: ${sheet.creep} mm` : "sin creep"}
        </span>
        <span className="mx-1 text-border">·</span>
        <span className={cn(
          "px-1.5 py-0.5 rounded",
          flipped ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
        )}>
          {faceLabel}
        </span>
      </div>

      {/* ── Hoja con perspectiva ─────────────────────────────────────── */}
      <div
        className="relative cursor-pointer"
        style={{ perspective: "1200px" }}
        onClick={() => setFlipped((f) => !f)}
        title="Clic para voltear la hoja"
      >
        {/* Sombra de profundidad (pila de cuadernillos) */}
        {[...Array(Math.min(3, sheetDepth - 1))].map((_, i) => (
          <div
            key={i}
            className="absolute inset-0 bg-border/20 rounded-sm border border-border/10"
            style={{
              transform: `translateX(${(i + 1) * 2}px) translateY(${(i + 1) * 2}px)`,
              zIndex: -i - 1,
            }}
          />
        ))}

        {/* Hoja principal con animación de volteo */}
        <div
          className="transition-transform duration-500 ease-in-out"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* FRENTE */}
          <div className="bg-white dark:bg-slate-900 rounded-sm border border-border shadow-md overflow-hidden"
            style={{ width: 440, height: 300, backfaceVisibility: "hidden" }}>
            <SheetFace
              face={sheet.front}
              faceLabel="FRENTE"
              creepPx={creepPx}
              marksConfig={marksConfig}
              signatureNumber={signatureNumber}
              sheetIndex={sheet.sheetIndex}
              hoveredPage={hoveredPage}
              onHover={setHoveredPage}
            />
          </div>

          {/* DORSO (espejado) */}
          <div
            className="absolute inset-0 bg-white dark:bg-slate-900 rounded-sm border border-border shadow-md overflow-hidden"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <SheetFace
              face={sheet.back}
              faceLabel="DORSO"
              creepPx={creepPx}
              marksConfig={marksConfig}
              signatureNumber={signatureNumber}
              sheetIndex={sheet.sheetIndex}
              hoveredPage={hoveredPage}
              onHover={setHoveredPage}
              mirrored
            />
          </div>
        </div>
      </div>

      {/* ── Instrucción de interacción ───────────────────────────────── */}
      <p className="text-[10px] text-muted-foreground/60 font-mono">
        ↩ clic para ver el {flipped ? "frente" : "dorso"}
      </p>

      {/* ── Leyenda de páginas hover ─────────────────────────────────── */}
      {hoveredPage && (
        <div className="text-[11px] font-mono bg-foreground/5 border border-border/50 rounded-lg px-3 py-2 text-muted-foreground">
          Página <strong className="text-foreground">{hoveredPage.label}</strong>
          {hoveredPage.isBlank ? " — página en blanco" : ""}
          {sheet.creep > 0 && ` · desplazamiento creep: ${sheet.creep} mm`}
        </div>
      )}
    </div>
  );
}

/* ── Sub-componente: cara de la hoja ─────────────────────────────────── */
function SheetFace({ face, faceLabel, creepPx, marksConfig, signatureNumber, sheetIndex, hoveredPage, onHover, mirrored }) {
  const pages = mirrored
    ? [face.right, face.left]   // dorso: derecha primero al mostrar espejado
    : [face.left, face.right];

  const positions = mirrored ? ["DER", "IZQ"] : ["IZQ", "DER"];

  return (
    <div className="relative w-full h-full flex">

      {/* Marca de costura */}
      {marksConfig?.sewing && (
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-evenly pointer-events-none z-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
          ))}
        </div>
      )}

      {/* Línea de plegado */}
      {marksConfig?.fold && (
        <div className="absolute top-2 bottom-2 left-1/2 -translate-x-px w-px border-l-2 border-dashed border-red-400/50 z-10 pointer-events-none" />
      )}

      {/* Marcas de alzado */}
      {marksConfig?.collation && (
        <div
          className="absolute left-0 w-2 bg-slate-800 dark:bg-slate-200 z-20 rounded-r-sm"
          style={{ top: `${8 + (signatureNumber - 1) * 8}%`, height: 14 }}
          title={`Alzado C${signatureNumber}`}
        />
      )}

      {/* Marcas de corte */}
      {marksConfig?.crop && (
        <>
          <div className="absolute top-2 left-2 w-4 h-px bg-slate-800 dark:bg-slate-300 z-20" />
          <div className="absolute top-2 left-2 h-4 w-px bg-slate-800 dark:bg-slate-300 z-20" />
          <div className="absolute top-2 right-2 w-4 h-px bg-slate-800 dark:bg-slate-300 z-20" />
          <div className="absolute top-2 right-2 h-4 w-px bg-slate-800 dark:bg-slate-300 z-20" />
          <div className="absolute bottom-2 left-2 w-4 h-px bg-slate-800 dark:bg-slate-300 z-20" />
          <div className="absolute bottom-2 left-2 h-4 w-px bg-slate-800 dark:bg-slate-300 z-20" />
          <div className="absolute bottom-2 right-2 w-4 h-px bg-slate-800 dark:bg-slate-300 z-20" />
          <div className="absolute bottom-2 right-2 h-4 w-px bg-slate-800 dark:bg-slate-300 z-20" />
        </>
      )}

      {/* Barra de color CMYK */}
      {marksConfig?.color_bar && (
        <div className="absolute bottom-0 left-1/4 right-1/4 h-2 flex z-20">
          <div className="flex-1 bg-cyan-500" />
          <div className="flex-1 bg-pink-500" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-slate-900" />
        </div>
      )}

      {/* Páginas izquierda y derecha */}
      {pages.map((page, idx) => (
        <PageSlot
          key={idx}
          page={page}
          position={positions[idx]}
          creepPx={creepPx}
          isLeft={idx === 0}
          isHovered={hoveredPage?.label === page?.label}
          onHover={onHover}
        />
      ))}

      {/* Etiqueta de cara */}
      <div className="absolute bottom-2 right-3 text-[8px] font-mono text-muted-foreground/40 z-20">
        {faceLabel} · C{signatureNumber} H{sheetIndex + 1}
      </div>

      {/* Sangrado */}
      {marksConfig?.bleed && (
        <div className="absolute inset-1 border border-dashed border-cyan-400/30 pointer-events-none z-10 rounded-sm" />
      )}
    </div>
  );
}

/* ── Sub-componente: celda de página ─────────────────────────────────── */
function PageSlot({ page, position, creepPx, isLeft, isHovered, onHover }) {
  const isEmpty = !page || page.isBlank;

  return (
    <div
      className={cn(
        "flex-1 relative flex flex-col items-center justify-center transition-all duration-200 cursor-pointer",
        isLeft ? "border-r border-dashed border-slate-200 dark:border-slate-700" : "",
        isEmpty ? "bg-slate-50 dark:bg-slate-800/40" : "bg-white dark:bg-slate-900",
        isHovered && !isEmpty ? "bg-primary/5 dark:bg-primary/10" : ""
      )}
      onMouseEnter={() => page && onHover(page)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Compensación de creep: banda visual en el margen interior */}
      {creepPx > 0 && (
        <div
          className="absolute top-0 bottom-0 bg-primary/8 border-primary/20"
          style={{
            [isLeft ? "right" : "left"]: 0,
            width: creepPx,
            borderLeft: isLeft ? "none" : "1px solid hsl(var(--primary) / 0.25)",
            borderRight: isLeft ? "1px solid hsl(var(--primary) / 0.25)" : "none",
          }}
          title={`Margen creep: ${Math.round(creepPx / 6 * 10) / 10} mm`}
        />
      )}

      {/* Número de página */}
      <div className="text-center z-10 relative">
        <span className={cn(
          "font-mono font-bold transition-all duration-200",
          isEmpty ? "text-2xl text-slate-200 dark:text-slate-700" : "text-3xl text-slate-700 dark:text-slate-200",
          isHovered && !isEmpty ? "text-primary scale-110 inline-block" : ""
        )}>
          {page?.label || "—"}
        </span>
        {!isEmpty && (
          <div className="text-[9px] font-mono text-muted-foreground/50 mt-1">{position}</div>
        )}
        {isEmpty && (
          <div className="text-[9px] font-mono text-slate-300 dark:text-slate-600 mt-1">BLANCO</div>
        )}
      </div>

      {/* Indicador numérico del creep en la esquina */}
      {creepPx > 0 && !isEmpty && (
        <div className={cn(
          "absolute text-[8px] font-mono text-primary/50 bottom-2",
          isLeft ? "right-2" : "left-2"
        )}>
          ←{Math.round(creepPx / 6 * 10) / 10}mm
        </div>
      )}
    </div>
  );
}