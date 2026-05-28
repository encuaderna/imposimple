import React from "react";
import { AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  AlertTriangle: AlertTriangle,
  AlertCircle: AlertCircle,
  Info: Info,
};

const STYLE_BY_TYPE = {
  error: {
    bg: "bg-destructive/10 dark:bg-destructive/20",
    border: "border-destructive/30",
    icon: "text-destructive",
    title: "text-destructive font-semibold",
    badge: "bg-destructive/20 text-destructive",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200/50 dark:border-amber-800/50",
    icon: "text-amber-600 dark:text-amber-500",
    title: "text-amber-900 dark:text-amber-200 font-semibold",
    badge: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200/50 dark:border-blue-800/50",
    icon: "text-blue-600 dark:text-blue-500",
    title: "text-blue-900 dark:text-blue-200 font-semibold",
    badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300",
  },
};

/**
 * Componente que muestra avisos de validación en tiempo real.
 */
export default function ValidationWarnings({ issues = [] }) {
  const [dismissed, setDismissed] = React.useState(new Set());

  if (!issues || issues.length === 0) return null;

  const visibleIssues = issues.filter((_, i) => !dismissed.has(i));

  if (visibleIssues.length === 0) return null;

  const errorCount = issues.filter(i => i.type === "error").length;
  const warningCount = issues.filter(i => i.type === "warning").length;

  return (
    <div className="space-y-2">
      {/* Header con contador */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/50">
        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1 text-xs font-medium text-muted-foreground">
          {errorCount > 0 && (
            <>
              <span className="text-destructive font-semibold">{errorCount} error{errorCount !== 1 ? "es" : ""}</span>
              {warningCount > 0 && " · "}
            </>
          )}
          {warningCount > 0 && (
            <span className="text-amber-600">{warningCount} advertencia{warningCount !== 1 ? "s" : ""}</span>
          )}
        </div>
        {visibleIssues.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={() => setDismissed(new Set(issues.map((_, i) => i)))}
            title="Descartar todos"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Tarjetas de avisos */}
      <div className="space-y-2">
        {visibleIssues.map((issue, idx) => {
          const style = STYLE_BY_TYPE[issue.type];
          const Icon = ICON_MAP[issue.icon] || Info;

          return (
            <div
              key={idx}
              className={cn(
                "flex gap-3 rounded-lg border p-3 transition-all",
                style.bg,
                style.border
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", style.icon)} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm leading-snug", style.title)}>
                    {issue.title}
                  </p>
                  <button
                    onClick={() => setDismissed(new Set([...dismissed, idx]))}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Descartar aviso"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {issue.message}
                </p>

                {issue.suggestion && (
                  <div className="mt-2 text-xs font-medium bg-black/10 dark:bg-white/10 rounded px-2 py-1 inline-block">
                    💡 {issue.suggestion}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}