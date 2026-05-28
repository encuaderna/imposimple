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
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Imposición Editorial</h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Motor de cuadernillos v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Dislexia */}
          <Button variant={dyslexicFont ? "secondary" : "ghost"} size="sm" className="text-xs gap-1.5" onClick={onToggleDyslexicFont} title="Fuente para dislexia">
            <span className="font-bold text-sm leading-none">Aa</span>
            <span className="hidden sm:inline">{dyslexicFont ? "Dislexia: ON" : "Dislexia"}</span>
          </Button>

          {/* Modo Enfoque */}
          <Button variant={focusMode ? "secondary" : "ghost"} size="sm" className="text-xs gap-1.5" onClick={onToggleFocusMode} title="Modo Enfoque (TDAH)">
            <Focus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{focusMode ? "Enfoque: ON" : "Enfoque"}</span>
          </Button>

          {/* Alto contraste */}
          <Button variant={highContrast ? "secondary" : "ghost"} size="sm" className="text-xs gap-1.5" onClick={onToggleHighContrast} title="Alto contraste">
            <Contrast className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{highContrast ? "Contraste: ON" : "Contraste"}</span>
          </Button>

          {/* Escalado de texto */}
          <div className="flex items-center gap-0.5 border border-border/50 rounded-md overflow-hidden">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none text-xs" onClick={onTextScaleDown} title="Reducir texto" disabled={textScale <= 0.8}>
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] font-mono text-muted-foreground px-1 select-none">{Math.round(textScale * 100)}%</span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none text-xs" onClick={onTextScaleUp} title="Aumentar texto" disabled={textScale >= 1.5}>
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Tema claro/oscuro */}
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </Button>

          {hasImposition && (
            <Button size="sm" onClick={onExport} className="text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}