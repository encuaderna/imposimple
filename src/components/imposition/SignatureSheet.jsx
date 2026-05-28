import React from "react";
import { cn } from "@/lib/utils";

function PageCell({ page, creep, side }) {
  if (!page) return <div className="flex-1 border border-dashed border-border/30 rounded" />;

  return (
    <div
      className={cn(
        "flex-1 border rounded-sm flex flex-col items-center justify-center relative overflow-hidden transition-all",
        page.isBlank
          ? "border-dashed border-muted-foreground/20 bg-muted/30"
          : "border-border/40 bg-card hover:bg-card/80"
      )}
      style={{ minHeight: 60 }}
    >
      {/* Indicador de creep */}
      {creep > 0 && (
        <div
          className="absolute top-0 left-0 bottom-0 bg-primary/10 border-r border-primary/20"
          style={{ width: `${Math.min(creep * 30, 40)}%` }}
        />
      )}

      <span
        className={cn(
          "font-mono text-sm font-semibold relative z-10",
          page.isBlank ? "text-muted-foreground/40 text-xs" : "text-foreground"
        )}
      >
        {page.label}
      </span>

      {creep > 0 && (
        <span className="text-[9px] font-mono text-primary/60 relative z-10 mt-0.5">
          {creep}mm
        </span>
      )}
    </div>
  );
}

export default function SignatureSheet({ sheet, sheetNumber }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Hoja {sheetNumber}
        </span>
        {sheet.creep > 0 && (
          <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            creep: {sheet.creep}mm
          </span>
        )}
      </div>

      {/* Frente */}
      <div className="flex gap-1 items-stretch">
        <span className="text-[9px] font-mono text-muted-foreground/50 w-6 flex items-center justify-end pr-1 shrink-0">F</span>
        <PageCell page={sheet.front.left} creep={sheet.creep} side="left" />
        <div className="w-px bg-destructive/30 shrink-0" title="Lomo" />
        <PageCell page={sheet.front.right} creep={sheet.creep} side="right" />
      </div>

      {/* Dorso */}
      <div className="flex gap-1 items-stretch">
        <span className="text-[9px] font-mono text-muted-foreground/50 w-6 flex items-center justify-end pr-1 shrink-0">D</span>
        <PageCell page={sheet.back.left} creep={sheet.creep} side="left" />
        <div className="w-px bg-destructive/30 shrink-0" title="Lomo" />
        <PageCell page={sheet.back.right} creep={sheet.creep} side="right" />
      </div>
    </div>
  );
}