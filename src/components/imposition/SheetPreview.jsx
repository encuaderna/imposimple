import React from "react";
import { cn } from "@/lib/utils";

/**
 * Vista previa visual de una hoja impuesta con marcas técnicas
 */
export default function SheetPreview({ sheet, signatureNumber, marksConfig, pageSize }) {
  const aspectRatio = pageSize ? (pageSize.width * 2) / pageSize.height : 1.414;

  return (
    <div className="relative" style={{ aspectRatio: aspectRatio, maxWidth: "100%" }}>
      {/* Hoja de papel */}
      <div className="absolute inset-0 bg-white border border-border/50 rounded-sm shadow-sm overflow-hidden">

        {/* Marcas de sangrado */}
        {marksConfig?.bleed && (
          <div className="absolute inset-0 border-4 border-dashed border-cyan-300/30 pointer-events-none" />
        )}

        {/* Línea de plegado central */}
        {marksConfig?.fold && (
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-px w-px border-l border-dashed border-red-400/60" />
        )}

        {/* Contenido: Frente */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 flex items-center justify-center border-r border-dashed border-border/30">
            <div className="text-center">
              <span className={cn(
                "font-mono text-lg font-bold",
                sheet.front.left?.isBlank ? "text-slate-300" : "text-slate-700"
              )}>
                {sheet.front.left?.label || "—"}
              </span>
              <div className="text-[8px] text-slate-400 mt-1">FRENTE IZQ</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className={cn(
                "font-mono text-lg font-bold",
                sheet.front.right?.isBlank ? "text-slate-300" : "text-slate-700"
              )}>
                {sheet.front.right?.label || "—"}
              </span>
              <div className="text-[8px] text-slate-400 mt-1">FRENTE DER</div>
            </div>
          </div>
        </div>

        {/* Marcas de corte */}
        {marksConfig?.crop && (
          <>
            {/* Esquina superior izquierda */}
            <div className="absolute top-1 left-1 w-3 h-px bg-slate-900" />
            <div className="absolute top-1 left-1 w-px h-3 bg-slate-900" />
            {/* Esquina superior derecha */}
            <div className="absolute top-1 right-1 w-3 h-px bg-slate-900" />
            <div className="absolute top-1 right-1 w-px h-3 bg-slate-900" />
            {/* Esquina inferior izquierda */}
            <div className="absolute bottom-1 left-1 w-3 h-px bg-slate-900" />
            <div className="absolute bottom-1 left-1 w-px h-3 bg-slate-900" />
            {/* Esquina inferior derecha */}
            <div className="absolute bottom-1 right-1 w-3 h-px bg-slate-900" />
            <div className="absolute bottom-1 right-1 w-px h-3 bg-slate-900" />
          </>
        )}

        {/* Marcas de registro */}
        {marksConfig?.registration && (
          <>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 border border-slate-900 rounded-full" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 border border-slate-900 rounded-full">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-900" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-900" />
            </div>
          </>
        )}

        {/* Marca de alzado (barra escalonada en el lomo) */}
        {marksConfig?.collation && (
          <div
            className="absolute left-0 w-1.5 h-3 bg-slate-900"
            style={{ top: `${10 + (signatureNumber - 1) * 8}%` }}
            title={`Marca de alzado C${signatureNumber}`}
          />
        )}

        {/* Identificador de cuadernillo */}
        {marksConfig?.signature_id && (
          <div className="absolute bottom-1 left-2 text-[7px] font-mono text-slate-400">
            C{signatureNumber} • H{sheet.sheetIndex + 1}
          </div>
        )}

        {/* Marcas de costura */}
        {marksConfig?.sewing && (
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-evenly pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-red-500" />
            ))}
          </div>
        )}

        {/* Barra de color */}
        {marksConfig?.color_bar && (
          <div className="absolute bottom-0 left-1/4 right-1/4 h-1.5 flex">
            <div className="flex-1 bg-cyan-500" />
            <div className="flex-1 bg-magenta-500 bg-pink-500" />
            <div className="flex-1 bg-yellow-500" />
            <div className="flex-1 bg-black" />
          </div>
        )}

        {/* Creep indicator */}
        {sheet.creep > 0 && (
          <div className="absolute top-1 right-2 text-[7px] font-mono text-primary bg-primary/10 px-1 rounded">
            Δ{sheet.creep}mm
          </div>
        )}
      </div>
    </div>
  );
}