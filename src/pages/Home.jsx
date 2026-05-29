import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Welcome from "@/pages/Welcome";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileBottomNav from "@/components/MobileBottomNav";
import { toast } from "sonner";
import { Calculator, Eye, BarChart3, GitBranch, Layers, FileUp, SlidersHorizontal, BookCopy, Scissors, CheckCircle2 } from "lucide-react";
import {
  calculateImposition,
  getImpositionSummary,
  PAGE_SIZES,
} from "@/lib/imposition-engine";
import { generateSpecSheetPDF } from "@/lib/spec-sheet-pdf";
import { generatePrepressPDF } from "@/lib/prepress-pdf";
import AppHeader from "@/components/imposition/AppHeader";
import ProgressBar from "@/components/imposition/ProgressBar";
import ProfileManager from "@/components/imposition/ProfileManager";
import ConfigPanel from "@/components/imposition/ConfigPanel";
import { useProfiles } from "@/hooks/useProfiles";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { useImpositionConfig, DEFAULT_MARKS } from "@/hooks/useImpositionConfig";
import { useProjects } from "@/hooks/useProjects";
import MarksConfigTable from "@/components/imposition/MarksConfigTable";
import SummaryPanel from "@/components/imposition/SummaryPanel";
import SignatureCard from "@/components/imposition/SignatureCard";
import CreepChart from "@/components/imposition/CreepChart";
import FlowDiagram from "@/components/imposition/FlowDiagram";
import PreviewPanel from "@/components/imposition/PreviewPanel";
import AdvancedExportModal from "@/components/imposition/AdvancedExportModal";
import ProjectsPanel from "@/components/imposition/ProjectsPanel";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { config, setConfig, marksConfig, setMarksConfig, resetConfig } = useImpositionConfig();
  const { prefs, update: updatePref, toggle: togglePref } = useAppPreferences();
  const { dyslexicFont, focusMode, highContrast, textScale, colorblindMode } = prefs;
  const [activeTab, setActiveTab] = useState("signatures");
  const [mobileTab, setMobileTab] = useState("projects"); // projects | config | preview
  const [pdfFile, setPdfFile] = useState(null);
  const [focusStep, setFocusStep] = useState(0);
  const { profiles, save: saveProfile, remove: removeProfile } = useProfiles();
  const {
    projects,
    saveProject,
    deleteProject,
    renameProject,
    loadProject,
    duplicateProject,
  } = useProjects();
  const [currentProjectName, setCurrentProjectName] = useState(null);

  const setTextScale = (fn) => updatePref("textScale", typeof fn === "function" ? fn(textScale) : fn);

  // Navegación por teclado: atajos globales
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key === "+") { e.preventDefault(); updatePref("textScale", Math.min(1.5, +(textScale + 0.1).toFixed(1))); }
      if (e.altKey && e.key === "-") { e.preventDefault(); updatePref("textScale", Math.max(0.8, +(textScale - 0.1).toFixed(1))); }
      if (e.altKey && e.key === "d") { e.preventDefault(); togglePref("dyslexicFont"); }
      if (e.altKey && e.key === "f") { e.preventDefault(); togglePref("focusMode"); }
      if (e.altKey && e.key === "c") { e.preventDefault(); togglePref("highContrast"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [textScale]);

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
    resetConfig();
    setCurrentProjectName(null);
    toast.success("Configuración reiniciada");
  };

  const handleSaveProject = async (name) => {
    await saveProject(name, config, imposition, summary, marksConfig);
    setCurrentProjectName(name);
  };

  const handleLoadProject = (project) => {
    const loaded = loadProject(project.id);
    if (loaded) {
      setConfig(loaded.config);
      setMarksConfig(loaded.marksConfig);
      setCurrentProjectName(project.name);
    }
  };

  const handleExportSpecSheet = () => {
    if (!imposition || !summary) return;
    generateSpecSheetPDF({ config, imposition, summary, marksConfig });
    toast.success("Hoja de especificaciones exportada");
  };

  const [exportingPrepress, setExportingPrepress] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportPrepress = () => {
    if (!imposition || !summary) return;
    setShowExportModal(true);
  };

  const handleConfirmExport = async (exportOptions) => {
    setExportingPrepress(true);
    try {
      const filename = await generatePrepressPDF({ config, imposition, summary, marksConfig, exportOptions });
      toast.success(`PDF de preimpresión exportado: ${filename}`);
      setShowExportModal(false);
    } finally {
      setExportingPrepress(false);
    }
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
      <AnimatePresence mode="wait">
        <motion.div
          key="welcome"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Welcome onStart={() => {
            setShowWelcome(false);
          }} />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Filtros de daltonismo
  const colorblindFilters = {
    normal: "",
    protanopia: "url(#protanopia-filter)",
    deuteranopia: "url(#deuteranopia-filter)",
    tritanopia: "url(#tritanopia-filter)",
  };

  const contrastStyle = highContrast ? {
    filter: "contrast(1.5) saturate(0.8)",
    background: "#000",
    color: "#fff",
  } : {
    filter: colorblindFilters[colorblindMode],
  };

  return (
    <div className="min-h-screen bg-background" style={{ ...(dyslexicFont ? { fontFamily: "'OpenDyslexic', sans-serif" } : {}), ...contrastStyle, fontSize: `${textScale}rem` }}>
      {/* SVG filters para daltonismo */}
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567 0.433 0     0 0
                                                 0.558 0.442 0     0 0
                                                 0     0.242 0.758 0 0
                                                 0     0     0     1 0" />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625 0.375 0     0 0
                                                 0.7   0.3   0     0 0
                                                 0     0.3   0.7   0 0
                                                 0     0     0     1 0" />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95  0.05  0     0 0
                                                 0     0.433 0.567 0 0
                                                 0     0.475 0.525 0 0
                                                 0     0     0     1 0" />
          </filter>
        </defs>
      </svg>

      <AdvancedExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleConfirmExport}
        exporting={exportingPrepress}
        marksConfig={marksConfig}
      />

      <AppHeader
        onReset={handleReset} onExport={handleExport} hasImposition={!!imposition}
        onShowWelcome={() => setShowWelcome(true)}
        onExportSpecSheet={handleExportSpecSheet}
        onExportPrepress={handleExportPrepress}
        exportingPrepress={exportingPrepress}
        dyslexicFont={dyslexicFont} onToggleDyslexicFont={() => togglePref("dyslexicFont")}
        focusMode={focusMode} onToggleFocusMode={() => togglePref("focusMode")}
        highContrast={highContrast} onToggleHighContrast={() => togglePref("highContrast")}
        colorblindMode={colorblindMode} onColorblindModeChange={(v) => updatePref("colorblindMode", v)}
        textScale={textScale}
        onTextScaleUp={() => updatePref("textScale", Math.min(1.5, +(textScale + 0.1).toFixed(1)))}
        onTextScaleDown={() => updatePref("textScale", Math.max(0.8, +(textScale - 0.1).toFixed(1)))}
      />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6">
        <ProgressBar currentStep={progressStep} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 md:pb-6">

          {/* Panel izquierdo: Configuración */}
          <aside className={`lg:col-span-3 space-y-4 ${mobileTab !== "projects" && mobileTab !== "config" ? "hidden md:block" : ""} ${mobileTab !== "config" ? "hidden md:block" : ""}`}>
            <ProjectsPanel
              projects={projects}
              onLoadProject={handleLoadProject}
              onDeleteProject={deleteProject}
              onRenameProject={renameProject}
              onDuplicateProject={duplicateProject}
              onSaveCurrentProject={handleSaveProject}
              currentProjectName={currentProjectName}
            />
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
              imposition={imposition} marksConfig={marksConfig}
            />
            {!focusMode && <MarksConfigTable marksConfig={marksConfig} onMarksChange={setMarksConfig} />}
          </aside>

          {/* Panel principal: Resultados */}
          <main className={`lg:col-span-9 space-y-6 ${mobileTab !== "preview" ? "hidden md:block" : ""}`}>
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
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