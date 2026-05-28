import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Layers, Scissors, ArrowRight } from "lucide-react";

function StatItem({ icon: Icon, label, value, unit, accent = false }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-primary/15" : "bg-muted"}`}>
        <Icon className={`w-4 h-4 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold font-mono">
          {value}
          {unit && <span className="text-xs text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

export default function SummaryPanel({ summary }) {
  if (!summary) return null;

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          Resumen de Imposición
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-border/30">
        <StatItem icon={BookOpen} label="Páginas del documento" value={summary.totalPages} accent />
        <StatItem icon={FileText} label="Total con blancos" value={summary.totalWithBlanks} />
        <StatItem icon={ArrowRight} label="Blancos añadidos" value={`${summary.blankStart} inicio + ${summary.blankEnd} final`} />
        <StatItem icon={Layers} label="Cuadernillos" value={summary.totalSignatures} accent />
        <StatItem icon={FileText} label="Págs/cuadernillo" value={summary.pagesPerSignature} />
        <StatItem icon={Scissors} label="Hojas totales" value={summary.totalSheets} />
        <StatItem icon={ArrowRight} label="Creep total acumulado" value={summary.totalCreepMm} unit="mm" accent />
        <StatItem icon={ArrowRight} label="Creep promedio/hoja" value={summary.avgCreepPerSheet} unit="mm" />
      </CardContent>
    </Card>
  );
}