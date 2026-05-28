import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, RotateCcw, Sun, Moon, Focus, Contrast, ZoomIn, ZoomOut } from "lucide-react";
import { useTheme } from "next-themes";

export default function AppHeader({
  onReset, onExport, hasImposition,
  dyslexicFont, onToggleDyslexicFont,
  focusMode, onToggleFocusMode,
  highContrast, onToggleHighContrast,
  textScale, onTextScaleUp, onTextScaleDown,
}) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b border-rose-100 dark:border-slate-700 bg-gradient-to-r from-orange-50/80 via-rose-50/80 to-purple-50/80 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-slate-900/90 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
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
            className={`text-xs gap-1.5 rounded-xl ${dyslexicFont ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300" : ""}`}
            onClick={onToggleDyslexicFont}
            title="Fuente para dislexia (Alt+D)"
          >
            <span className="font-bold text-sm leading-none">Aa</span>
            <span className="hidden sm:inline">{dyslexicFont ? "Dislexia: ON" : "Dislexia"}</span>
          </Button>

          <Button
            variant={focusMode ? "secondary" : "ghost"}
            size="sm"
            className={`text-xs gap-1.5 rounded-xl ${focusMode ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300" : ""}`}
            onClick={onToggleFocusMode}
            title="Modo Enfoque / TDAH (Alt+F)"
          >
            <Focus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{focusMode ? "Enfoque: ON" : "Enfoque"}</span>
          </Button>

          <Button
            variant={highContrast ? "secondary" : "ghost"}
            size="sm"
            className={`text-xs gap-1.5 rounded-xl ${highContrast ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300" : ""}`}
            onClick={onToggleHighContrast}
            title="Alto contraste (Alt+C)"
          >
            <Contrast className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{highContrast ? "Contraste: ON" : "Contraste"}</span>
          </Button>

          {/* Escalado de texto */}
          <div className="flex items-center gap-0 bg-white/60 dark:bg-slate-800/60 border border-border/40 rounded-xl overflow-hidden">
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

          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs gap-1.5 rounded-xl text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </Button>

          {hasImposition && (
            <Button size="sm" onClick={onExport} className="text-xs gap-1.5 rounded-xl shadow-sm">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}