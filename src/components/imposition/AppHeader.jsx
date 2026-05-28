import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, RotateCcw } from "lucide-react";

export default function AppHeader({ onReset, onExport, hasImposition }) {
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