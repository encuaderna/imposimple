import React from "react";
import { BookOpen, FileText, Layers, Scissors, ArrowRight } from "lucide-react";

function StatItem({ icon: Icon, label, value, unit, accent = false, color = "" }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/40 dark:border-slate-700/40 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
        accent ? "bg-primary/15 text-primary" : color || "bg-muted text-muted-foreground"
      }`}>
        <Icon className="w-4 h-4" />
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
    <div className="rounded-2xl border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-rose-50 dark:from-purple-950/30 dark:to-rose-950/30 shadow-sm">
      <div className="px-5 py-4 border-b border-purple-100 dark:border-purple-900/50">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-purple-700 dark:text-purple-300 uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          Resumen de Imposición
        </h3>
      </div>
      <div className="px-5 py-2">
        <StatItem icon={BookOpen} label="Páginas del documento" value={summary.totalPages} accent />
        <StatItem icon={FileText} label="Total con blancos" value={summary.totalWithBlanks} />
        <StatItem icon={ArrowRight} label="Blancos añadidos" value={`${summary.blankStart} inicio + ${summary.blankEnd} final`} />
        <StatItem icon={Layers} label="Cuadernillos" value={summary.totalSignatures} accent />
        <StatItem icon={FileText} label="Págs / cuadernillo" value={summary.pagesPerSignature} />
        <StatItem icon={Scissors} label="Hojas totales" value={summary.totalSheets} />
        <StatItem icon={ArrowRight} label="Creep total acumulado" value={summary.totalCreepMm} unit="mm" accent />
        <StatItem icon={ArrowRight} label="Creep promedio / hoja" value={summary.avgCreepPerSheet} unit="mm" />
      </div>
    </div>
  );
}