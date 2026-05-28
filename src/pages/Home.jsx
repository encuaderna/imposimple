import React, { useState, useMemo, useEffect } from "react";
import Welcome from "@/pages/Welcome";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calculator, Eye, BarChart3, GitBranch, Layers, FileUp, SlidersHorizontal, BookCopy, Scissors, CheckCircle2 } from "lucide-react";
import {
  calculateImposition,
  getImpositionSummary,
  PAGE_SIZES,
  TECHNICAL_MARKS,
} from "@/lib/imposition-engine";
import AppHeader from "@/components/imposition/AppHeader";
import ProgressBar from "@/components/imposition/ProgressBar";
import ProfileManager from "@/components/imposition/ProfileManager";
import ConfigPanel from "@/components/imposition/ConfigPanel";
import { useProfiles } from "@/hooks/useProfiles";
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
  printSides: "double",
  pageFormat: "quarto",
  alternatePage: false,
  signatureMode: "standard",
  sheetsPerSig: 2,
};

const DEFAULT_MARKS = Object.fromEntries(
  Object.entries(TECHNICAL_MARKS).map(([key, mark]) => [key, mark.defaultEnabled])
);

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [marksConfig, setMarksConfig] = useState(DEFAULT_MARKS);
  const [activeTab, setActiveTab] = useState("signatures");
  const [pdfFile, setPdfFile] = useState(null);
  const { profiles, save: saveProfile, remove: removeProfile } = useProfiles();
  const [dyslexicFont, setDyslexicFont] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [focusStep, setFocusStep] = useState(0);
  const [textScale, setTextScale] = useState(1.0);

  // Navegación por teclado: atajos globales
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key === "+") { e.preventDefault(); setTextScale(v => Math.min(1.5, +(v + 0.1).toFixed(1))); }
      if (e.altKey && e.key === "-") { e.preventDefault(); setTextScale(v => Math.max(0.8, +(v - 0.1).toFixed(1))); }
      if (e.altKey && e.key === "d") { e.preventDefault(); setDyslexicFont(v => !v); }
      if (e.altKey && e.key === "f") { e.preventDefault(); setFocusMode(v => !v); }
      if (e.altKey && e.key === "c") { e.preventDefault(); setHighContrast(v => !v); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const imposition = useMemo(() => {
    if (config.totalPages < 4) return null;
    return calculateImposition(config);
  }, [config]);

  const summary = useMemo(() => {
    if (!imposition) return null;
    return getImpositionSummary(imposition);
  }, [imposition]);

  // Calcular paso actual para la barra de progreso
  const progressStep = !pdfFile ? "pdf"
    : config.totalPages < 4 ? "pages"
    : config.pageSize === "Custom" && (!config.customWidth || !config.customHeight) ? "format"
    : !config.bindingMethod ? "binding"
    : "calculated";

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

  if (showWelcome) {
    return (
      <Welcome onStart={() => {
        setShowWelcome(false);
      }} />
    );
  }

  const contrastStyle = highContrast ? {
    filter: "contrast(1.5) saturate(0.8)",
    background: "#000",
    color: "#fff",
  } : {};

  return (
    <div className="min-h-screen bg-background" style={{ ...(dyslexicFont ? { fontFamily: "'OpenDyslexic', sans-serif" } : {}), ...contrastStyle, fontSize: `${textScale}rem` }}>
      <AppHeader
        onReset={handleReset} onExport={handleExport} hasImposition={!!imposition}
        onShowWelcome={() => setShowWelcome(true)}
        dyslexicFont={dyslexicFont} onToggleDyslexicFont={() => setDyslexicFont(v => !v)}
        focusMode={focusMode} onToggleFocusMode={() => setFocusMode(v => !v)}
        highContrast={highContrast} onToggleHighContrast={() => setHighContrast(v => !v)}
        textScale={textScale}
        onTextScaleUp={() => setTextScale(v => Math.min(1.5, +(v + 0.1).toFixed(1)))}
        onTextScaleDown={() => setTextScale(v => Math.max(0.8, +(v - 0.1).toFixed(1)))}
      />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6">
        <ProgressBar currentStep={progressStep} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Panel izquierdo: Configuración */}
          <aside className="lg:col-span-3 space-y-4">
            <ProfileManager
              config={config}
              onLoad={(cfg) => setConfig({ ...cfg })}
              profiles={profiles}
              onSave={saveProfile}
              onRemove={removeProfile}
            />
            <ConfigPanel
              config={config} onConfigChange={setConfig}
              pdfFile={pdfFile} onPdfChange={setPdfFile}
              focusMode={focusMode} focusStep={focusStep} onFocusStepChange={setFocusStep}
            />
            {!focusMode && <MarksConfigTable marksConfig={marksConfig} onMarksChange={setMarksConfig} />}
          </aside>

          {/* Panel principal: Resultados */}
          <main className="lg:col-span-9 space-y-6">
            {/* Resumen rápido */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickStat label="Páginas" value={summary.totalWithBlanks} sub={`+${summary.blankPagesAdded} blancos`} colorIndex={0} />
                <QuickStat label="Cuadernillos" value={summary.totalSignatures} sub={`${summary.pagesPerSignature} págs c/u`} colorIndex={1} />
                <QuickStat label="Hojas totales" value={summary.totalSheets} sub={`${summary.sheetsPerSignature} por cuad.`} colorIndex={2} />
                <QuickStat label="Creep total" value={`${summary.totalCreepMm}mm`} sub={`${summary.avgCreepPerSheet}mm/hoja`} colorIndex={3} />
              </div>
            )}

            {/* Estado vacío — Modo guiado visual */}
            {!imposition && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h2 className="text-lg font-semibold mb-1">¿Cómo funciona?</h2>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-8">
                  Sigue estos pasos para convertir tu PDF en cuadernillos listos para imprimir y encuadernar.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 w-full max-w-2xl">
                  {[
                    { icon: FileUp, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", step: "1", title: "Sube tu PDF", desc: "Arrastra o selecciona el archivo de tu libro" },
                    { icon: SlidersHorizontal, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", step: "2", title: "Elige el tamaño", desc: "A5, A4, carta u otro formato" },
                    { icon: BookCopy, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", step: "3", title: "Define el pliego", desc: "Cuántas páginas por cuadernillo" },
                    { icon: Scissors, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", step: "4", title: "Encuadernación", desc: "Cosido, pegado o grapado" },
                    { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", step: "5", title: "¡Listo!", desc: "Exporta e imprime cada cuadernillo" },
                  ].map(({ icon: Icon, color, bg, border, step, title, desc }, i) => (
                    <React.Fragment key={step}>
                      <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${bg} ${border}`}>
                        <div className={`w-10 h-10 rounded-full ${bg} border ${border} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <span className={`text-[10px] font-bold font-mono ${color}`}>PASO {step}</span>
                        <p className="text-xs font-semibold leading-tight">{title}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
                      </div>
                      {i < 4 && <div className="hidden sm:flex items-center justify-center text-muted-foreground/30 text-xl">→</div>}
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-6 border border-border/50 rounded-lg px-3 py-2 bg-muted/30">
                  💡 <strong>Atajos de teclado:</strong> Alt+D (dislexia) · Alt+F (enfoque) · Alt+C (contraste) · Alt++ / Alt+− (tamaño de texto)
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

const STAT_COLORS = [
  "from-blue-50 to-blue-100/50 border-blue-200 dark:from-blue-950/30 dark:to-blue-900/20 dark:border-blue-800",
  "from-purple-50 to-purple-100/50 border-purple-200 dark:from-purple-950/30 dark:to-purple-900/20 dark:border-purple-800",
  "from-amber-50 to-amber-100/50 border-amber-200 dark:from-amber-950/30 dark:to-amber-900/20 dark:border-amber-800",
  "from-rose-50 to-rose-100/50 border-rose-200 dark:from-rose-950/30 dark:to-rose-900/20 dark:border-rose-800",
];

function QuickStat({ label, value, sub, colorIndex = 0 }) {
  return (
    <div className={`bg-gradient-to-br ${STAT_COLORS[colorIndex]} border rounded-2xl p-4 shadow-sm`}>
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold font-mono mt-1">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}