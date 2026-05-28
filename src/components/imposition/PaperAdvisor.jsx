import React, { useState } from "react";
import { getPaperRecommendation } from "@/lib/paper-advisor";
import { AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LEVEL_STYLES = {
  ok:      { border: "border-green-200 dark:border-green-800",  bg: "bg-green-50 dark:bg-green-950/30",  icon: CheckCircle2, iconColor: "text-green-600", badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" },
  warning: { border: "border-amber-200 dark:border-amber-800",  bg: "bg-amber-50 dark:bg-amber-950/30",  icon: AlertTriangle, iconColor: "text-amber-500", badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  error:   { border: "border-red-200 dark:border-red-800",      bg: "bg-red-50 dark:bg-red-950/30",      icon: XCircle,       iconColor: "text-red-500",   badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
};

export default function PaperAdvisor({ bindingMethod, totalPages, pagesPerSignature, onApplyThickness }) {
  const [expanded, setExpanded] = useState(false);

  const rec = getPaperRecommendation(bindingMethod, totalPages, pagesPerSignature);
  if (!rec) return null;

  const { border, bg, icon: Icon, iconColor, badgeClass } = LEVEL_STYLES[rec.level];

  return (
    <div className={`rounded-xl border ${border} ${bg} overflow-hidden`}>
      {/* Cabecera siempre visible */}
      <button
        className="w-full flex items-start gap-2.5 p-3 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-foreground">{rec.title}</span>
            <Badge className={`text-[9px] px-1.5 py-0 font-mono ${badgeClass}`}>
              {rec.level === "ok" ? "✓ Viable" : rec.level === "warning" ? "⚠ Atención" : "✗ Problema"}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{rec.message}</p>
        </div>
        <div className="shrink-0 mt-0.5 text-muted-foreground">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Detalle expandible */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-inherit pt-3">

          {/* Sugerencias de papel */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" />
              Papeles recomendados
            </p>
            <div className="space-y-1.5">
              {rec.suggestions.map((s, i) => (
                <div key={s.id} className="flex items-start gap-2 bg-background/60 rounded-lg p-2 border border-border/30">
                  <span className="text-[10px] font-bold font-mono text-muted-foreground/60 mt-0.5 w-3 shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold">{s.type}</span>
                      <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{s.gsm} g/m²</Badge>
                      <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{s.thickness} mm</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
                    <p className="text-[10px] text-primary/80 italic mt-0.5">→ {s.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nota adicional */}
          {rec.note && (
            <div className="flex gap-1.5 text-[10px] text-muted-foreground italic">
              <span className="shrink-0">💡</span>
              <span>{rec.note}</span>
            </div>
          )}

          {/* Botón aplicar grosor sugerido */}
          {rec.suggestedThickness && onApplyThickness && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[10px] h-7 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => onApplyThickness(rec.suggestedThickness)}
            >
              Aplicar grosor sugerido ({rec.suggestedThickness} mm) al cálculo de creep
            </Button>
          )}
        </div>
      )}
    </div>
  );
}