import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, RotateCcw, Sun, Moon, Focus, Contrast, ZoomIn, ZoomOut, Sparkles, FileText, Printer, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";

export default function AppHeader({
  onReset, onExport, onExportSpecSheet, onExportPrepress, exportingPrepress, hasImposition,
  dyslexicFont, onToggleDyslexicFont,
  focusMode, onToggleFocusMode,
  highContrast, onToggleHighContrast,
  textScale, onTextScaleUp, onTextScaleDown,
  onShowWelcome,
}) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">Imposición Editorial</h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Motor de cuadernillos v1.0</p>
          </div>
        </div>

        {/* Controles de accesibilidad */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">

          <Button
            variant={dyslexicFont ? "secondary" : "ghost"}
            size="sm"
            className={`text-xs gap-1.5 rounded-xl ${dyslexicFont ? "bg-secondary text-secondary-foreground border border-border" : ""}`}
            onClick={onToggleDyslexicFont}
            title="Fuente para dislexia (Alt+D)"
          >
            <span className="font-bold text-sm leading-none">Aa</span>
            <span className="hidden sm:inline">{dyslexicFont ? "Dislexia: ON" : "Dislexia"}</span>
          </Button>

          <Button
            variant={focusMode ? "secondary" : "ghost"}
            size="sm"
            className={`text-xs gap-1.5 rounded-xl ${focusMode ? "bg-secondary text-secondary-foreground border border-border" : ""}`}
            onClick={onToggleFocusMode}
            title="Modo Enfoque / TDAH (Alt+F)"
          >
            <Focus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{focusMode ? "Enfoque: ON" : "Enfoque"}</span>
          </Button>

          <Button
            variant={highContrast ? "secondary" : "ghost"}
            size="sm"
            className={`text-xs gap-1.5 rounded-xl ${highContrast ? "bg-secondary text-secondary-foreground border border-border" : ""}`}
            onClick={onToggleHighContrast}
            title="Alto contraste (Alt+C)"
          >
            <Contrast className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{highContrast ? "Contraste: ON" : "Contraste"}</span>
          </Button>

          {/* Escalado de texto */}
          <div className="flex items-center gap-0 bg-secondary/60 border border-border/40 rounded-xl overflow-hidden">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none text-xs" onClick={onTextScaleDown} title="Reducir texto (Alt+−)" disabled={textScale <= 0.8}>
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] font-mono text-muted-foreground px-1.5 select-none">{Math.round(textScale * 100)}%</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none text-xs" onClick={onTextScaleUp} title="Aumentar texto (Alt++)" disabled={textScale >= 1.5}>
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Tema */}
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-xl" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button variant="ghost" size="sm" onClick={onShowWelcome} className="text-xs gap-1.5 rounded-xl text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Intro</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs gap-1.5 rounded-xl text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </Button>

          {hasImposition && (
            <>
              <Button variant="outline" size="sm" onClick={onExportSpecSheet} className="text-xs gap-1.5 rounded-xl shadow-sm border-primary/40 text-primary hover:bg-primary/10">
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Especificaciones</span>
              </Button>
              <Button
                size="sm"
                onClick={onExportPrepress}
                disabled={exportingPrepress}
                className="text-xs gap-1.5 rounded-xl shadow-sm bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {exportingPrepress
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Printer className="w-3.5 h-3.5" />
                }
                <span className="hidden sm:inline">{exportingPrepress ? "Generando…" : "PDF Preimpresión"}</span>
              </Button>
              <Button size="sm" onClick={onExport} className="text-xs gap-1.5 rounded-xl shadow-sm">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">JSON</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}