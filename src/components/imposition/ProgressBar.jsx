import React from "react";
import { Check } from "lucide-react";

const STEPS = [
  { key: "pdf", label: "PDF subido" },
  { key: "pages", label: "Páginas" },
  { key: "format", label: "Formato" },
  { key: "binding", label: "Encuadernación" },
  { key: "calculated", label: "Calculado" },
];

export default function ProgressBar({ currentStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full bg-card border border-border/50 rounded-xl px-4 py-3 mb-4">
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done ? "bg-primary border-primary text-primary-foreground" :
                  active ? "bg-primary/10 border-primary text-primary" :
                  "bg-muted border-border text-muted-foreground"
                }`}>
                  {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-[10px] text-center leading-tight hidden sm:block ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded transition-all ${i < currentIndex ? "bg-primary" : "bg-border"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}