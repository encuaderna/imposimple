import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, Upload, Settings, Calculator, Crosshair, Download } from "lucide-react";

const FLOW_STEPS = [
  {
    icon: Upload,
    title: "Carga del PDF",
    desc: "Recepción del documento y extracción del número de páginas",
    color: "bg-blue-500/15 text-blue-600",
  },
  {
    icon: Settings,
    title: "Pre-procesamiento",
    desc: "Configuración de tamaño, encuadernación, páginas en blanco y parámetros de creep",
    color: "bg-amber-500/15 text-amber-600",
  },
  {
    icon: Calculator,
    title: "Cálculo de imposición",
    desc: "División en cuadernillos, asignación de páginas por hoja (frente/dorso), cálculo de creep por hoja",
    color: "bg-emerald-500/15 text-emerald-600",
  },
  {
    icon: Crosshair,
    title: "Renderizado de marcas",
    desc: "Aplicación de marcas de corte, plegado, registro, alzado, costura y barra de color",
    color: "bg-purple-500/15 text-purple-600",
  },
  {
    icon: Download,
    title: "Exportación",
    desc: "Generación del PDF impuesto listo para plancha o impresión digital",
    color: "bg-rose-500/15 text-rose-600",
  },
];

export default function FlowDiagram() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Flujo del Motor de Imposición
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {FLOW_STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${step.color}`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">FASE {i + 1}</span>
                  </div>
                  <p className="text-sm font-semibold mt-0.5">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className="flex justify-center">
                  <ArrowDown className="w-4 h-4 text-muted-foreground/30" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}