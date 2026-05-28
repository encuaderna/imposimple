import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  { key: "pdf", label: "PDF subido", color: "bg-blue-400" },
  { key: "pages", label: "Páginas", color: "bg-purple-400" },
  { key: "format", label: "Formato", color: "bg-amber-400" },
  { key: "binding", label: "Encuadernación", color: "bg-rose-400" },
  { key: "calculated", label: "¡Listo!", color: "bg-green-400" },
];

export default function ProgressBar({ currentStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full bg-white/70 dark:bg-slate-800/60 border border-rose-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 mb-5 shadow-sm">
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  done
                    ? "bg-green-400 text-white"
                    : active
                    ? `${step.color} text-white scale-110 shadow-md`
                    : "bg-muted text-muted-foreground border-2 border-border"
                }`}>
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] text-center leading-tight hidden sm:block font-medium transition-all ${
                  active ? "text-foreground" : done ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-1 flex-1 rounded-full transition-all mb-4 ${
                  i < currentIndex ? "bg-green-300 dark:bg-green-700" : "bg-border/50"
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}