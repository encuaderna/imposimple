import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, RotateCcw, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function AppHeader({ onReset, onExport, hasImposition, dyslexicFont, onToggleDyslexicFont }) {
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

        <div className="flex items-center gap-2">
          <Button
            variant={dyslexicFont ? "secondary" : "ghost"}
            size="sm"
            className="text-xs gap-1.5"
            onClick={onToggleDyslexicFont}
            title="Fuente para dislexia"
          >
            <span className="font-bold text-sm leading-none">Aa</span>
            {dyslexicFont ? "Dislexia: ON" : "Dislexia"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </Button>
          {hasImposition && (
            <Button size="sm" onClick={onExport} className="text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Exportar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}