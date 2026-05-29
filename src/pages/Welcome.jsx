import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Focus, Eye, Type, Keyboard, Contrast, ArrowRight, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Type,
    color: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    title: "Fuente para dislexia",
    desc: "Activa OpenDyslexic para facilitar la lectura si tienes dislexia.",
  },
  {
    icon: Focus,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    title: "Modo Enfoque",
    desc: "Muestra un paso a la vez para no abrumarte. Ideal si tienes TDAH.",
  },
  {
    icon: Eye,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    title: "Alto contraste",
    desc: "Aumenta el contraste visual para mayor comodidad en la lectura.",
  },
  {
    icon: Sparkles,
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    title: "Texto escalable",
    desc: "Agranda o reduce el texto con un clic o con Alt++ / Alt+−.",
  },
  {
    icon: Keyboard,
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-800",
    title: "Atajos de teclado",
    desc: "Controla todo sin ratón. Perfecto para distintas habilidades motoras.",
  },
  {
    icon: Contrast,
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200 dark:border-teal-800",
    title: "Modo claro / oscuro",
    desc: "Elige el tema que mejor se adapte a tu vista y entorno.",
  },
];

export default function Welcome({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo + título */}
      <div className="flex flex-col items-center gap-3 mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Imposición Editorial
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
          Convierte cualquier PDF en cuadernillos listos para imprimir y encuadernar,
          <strong className="text-foreground"> diseñado para que todas las personas puedan usarlo con comodidad.</strong>
        </p>
      </div>

      {/* Pill de accesibilidad */}
      <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-slate-800/70 border border-rose-200 dark:border-rose-800 rounded-full px-4 py-1.5 mb-10 shadow-sm">
        <span className="text-rose-500 text-sm">♿</span>
        <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Herramientas de accesibilidad incluidas</span>
      </div>

      {/* Tarjetas de funciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl mb-10">
        {FEATURES.map(({ icon: Icon, color, bg, border, title, desc }) => (
          <div
            key={title}
            className={`flex gap-3 items-start p-4 rounded-2xl border ${bg} ${border} shadow-sm`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg} border ${border}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        size="lg"
        onClick={onStart}
        className="gap-2 text-base px-8 py-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
      >
        Comenzar ahora
        <ArrowRight className="w-5 h-5" />
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        Puedes cambiar las opciones de accesibilidad en cualquier momento desde la barra superior.
      </p>

      <p className="text-xs text-muted-foreground/60 mt-3 italic">
        Dedicado a mi ahijada querida.
      </p>
    </div>
  );
}