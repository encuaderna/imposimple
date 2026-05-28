import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calculator, Eye, BarChart3, GitBranch, Layers } from "lucide-react";
import {
  calculateImposition,
  getImpositionSummary,
  PAGE_SIZES,
  TECHNICAL_MARKS,
} from "@/lib/imposition-engine";
import AppHeader from "@/components/imposition/AppHeader";
import ConfigPanel from "@/components/imposition/ConfigPanel";
import MarksConfigTable from "@/components/imposition/MarksConfigTable";
import SummaryPanel from "@/components/imposition/SummaryPanel";
import SignatureCard from "@/components/imposition/SignatureCard";
import CreepChart from "@/components/imposition/CreepChart";
import FlowDiagram from "@/components/imposition/FlowDiagram";
import PreviewPanel from "@/components/imposition/PreviewPanel";

const DEFAULT_CONFIG = {
  name: "",
  totalPages: 128,
  pageSize: "A5",
  customWidth: 148,
  customHeight: 210,
  bindingMethod: "sewn",
  pagesPerSignature: 16,
  paperThickness: 0.1,
  creepFactor: 0.8,
  blankPagesStart: 0,
  blankPagesEnd: 0,
};

const DEFAULT_MARKS = Object.fromEntries(
  Object.entries(TECHNICAL_MARKS).map(([key, mark]) => [key, mark.defaultEnabled])
);

export default function Home() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [marksConfig, setMarksConfig] = useState(DEFAULT_MARKS);
  const [activeTab, setActiveTab] = useState("signatures");

  const imposition = useMemo(() => {
    if (config.totalPages < 4) return null;
    return calculateImposition(config);
  }, [config]);

  const summary = useMemo(() => {
    if (!imposition) return null;
    return getImpositionSummary(imposition);
  }, [imposition]);

  const currentPageSize = config.pageSize === "Custom"
    ? { width: config.customWidth, height: config.customHeight }
    : PAGE_SIZES[config.pageSize];

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setMarksConfig(DEFAULT_MARKS);
    toast.success("Configuración reiniciada");
  };

  const handleExport = () => {
    const data = {
      config,
      marksConfig,
      imposition,
      summary,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imposicion-${config.name || "proyecto"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Esquema de imposición exportado");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onReset={handleReset} onExport={handleExport} hasImposition={!!imposition} />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Panel izquierdo: Configuración */}
          <aside className="lg:col-span-3 space-y-4">
            <ConfigPanel config={config} onConfigChange={setConfig} />
            <MarksConfigTable marksConfig={marksConfig} onMarksChange={setMarksConfig} />
          </aside>

          {/* Panel principal: Resultados */}
          <main className="lg:col-span-9 space-y-6">
            {/* Resumen rápido */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickStat label="Páginas" value={summary.totalWithBlanks} sub={`+${summary.blankPagesAdded} blancos`} />
                <QuickStat label="Cuadernillos" value={summary.totalSignatures} sub={`${summary.pagesPerSignature} págs c/u`} />
                <QuickStat label="Hojas totales" value={summary.totalSheets} sub={`${summary.sheetsPerSignature} por cuad.`} />
                <QuickStat label="Creep total" value={`${summary.totalCreepMm}mm`} sub={`${summary.avgCreepPerSheet}mm/hoja`} />
              </div>
            )}

            {/* Botón de calcular si no hay datos */}
            {!imposition && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Calculator className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold">Configura tu proyecto</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Ingresa al menos 4 páginas en el panel de configuración para generar la imposición.
                </p>
              </div>
            )}

            {/* Tabs de resultados */}
            {imposition && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="signatures" className="gap-1.5 text-xs">
                    <Layers className="w-3.5 h-3.5" />
                    Cuadernillos
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-1.5 text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    Vista previa
                  </TabsTrigger>
                  <TabsTrigger value="creep" className="gap-1.5 text-xs">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Análisis creep
                  </TabsTrigger>
                  <TabsTrigger value="flow" className="gap-1.5 text-xs">
                    <GitBranch className="w-3.5 h-3.5" />
                    Flujo
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="gap-1.5 text-xs">
                    <Calculator className="w-3.5 h-3.5" />
                    Resumen
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signatures" className="mt-4 space-y-3">
                  {imposition.signatures.map((sig) => (
                    <SignatureCard key={sig.signatureIndex} signature={sig} />
                  ))}
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <PreviewPanel
                    imposition={imposition}
                    marksConfig={marksConfig}
                    pageSize={currentPageSize}
                  />
                </TabsContent>

                <TabsContent value="creep" className="mt-4">
                  <CreepChart signatures={imposition.signatures} />
                </TabsContent>

                <TabsContent value="flow" className="mt-4">
                  <FlowDiagram />
                </TabsContent>

                <TabsContent value="summary" className="mt-4">
                  <SummaryPanel summary={summary} />
                </TabsContent>
              </Tabs>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value, sub }) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-3">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold font-mono mt-1">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}