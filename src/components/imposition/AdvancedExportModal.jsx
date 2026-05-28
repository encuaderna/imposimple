import React, { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Printer, Loader2, FileText, Scissors, Palette, Settings2, Info } from "lucide-react";
import { TECHNICAL_MARKS } from "@/lib/imposition-engine";

const SECTION = ({ icon: Icon, title, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="w-3.5 h-3.5" />
      {title}
    </div>
    <div className="space-y-2.5 pl-1">{children}</div>
  </div>
);

const OptionRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="min-w-0">
      <p className="text-sm font-medium leading-none">{label}</p>
      {description && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{description}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const DEFAULT_EXPORT_OPTIONS = {
  // Documento
  pageFormat: "a3",
  orientation: "landscape",
  // Marcas personalizadas (sobrescriben marksConfig global)
  useCustomMarks: false,
  marks: {
    crop: true,
    fold: true,
    registration: true,
    bleed: true,
    collation: true,
    signature_id: true,
    sewing: false,
    color_bar: false,
  },
  // Sangrado
  bleedMm: 3,
  // Modo de color
  colorMode: "color", // "color" | "grayscale" | "blackwhite"
  // Incluir portada de resumen
  includeCover: true,
  // Incluir dorso en dúplex
  includeBack: true,
};

export default function AdvancedExportModal({ open, onClose, onExport, exporting, marksConfig }) {
  const [opts, setOpts] = useState({
    ...DEFAULT_EXPORT_OPTIONS,
    marks: { ...DEFAULT_EXPORT_OPTIONS.marks, ...marksConfig },
  });

  const set = (key, val) => setOpts((o) => ({ ...o, [key]: val }));
  const setMark = (key, val) => setOpts((o) => ({ ...o, marks: { ...o.marks, [key]: val } }));

  const handleExport = () => onExport(opts);

  const activeMarksCount = Object.values(opts.useCustomMarks ? opts.marks : marksConfig).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Settings2 className="w-4 h-4 text-primary" />
            Exportación avanzada
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Configura las opciones del PDF antes de generar el archivo de preimpresión.
          </p>
        </DialogHeader>

        <div className="space-y-5 py-1">

          {/* ── Formato del documento */}
          <SECTION icon={FileText} title="Formato del documento">
            <OptionRow label="Tamaño de página" description="Formato del pliego PDF de salida">
              <Select value={opts.pageFormat} onValueChange={(v) => set("pageFormat", v)}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a3" className="text-xs">A3 (recomendado)</SelectItem>
                  <SelectItem value="a2" className="text-xs">A2</SelectItem>
                  <SelectItem value="a4" className="text-xs">A4</SelectItem>
                  <SelectItem value="tabloid" className="text-xs">Tabloide (11×17")</SelectItem>
                </SelectContent>
              </Select>
            </OptionRow>

            <OptionRow label="Orientación" description="Rotación del documento">
              <Select value={opts.orientation} onValueChange={(v) => set("orientation", v)}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape" className="text-xs">Apaisado</SelectItem>
                  <SelectItem value="portrait" className="text-xs">Vertical</SelectItem>
                </SelectContent>
              </Select>
            </OptionRow>

            <OptionRow label="Incluir portada de resumen" description="Primera página con parámetros del proyecto">
              <Switch checked={opts.includeCover} onCheckedChange={(v) => set("includeCover", v)} />
            </OptionRow>

            <OptionRow label="Incluir cara dorso (dúplex)" description="Genera páginas de reverso para impresión a dos caras">
              <Switch checked={opts.includeBack} onCheckedChange={(v) => set("includeBack", v)} />
            </OptionRow>
          </SECTION>

          <Separator />

          {/* ── Modo de color */}
          <SECTION icon={Palette} title="Modo de color">
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "color",      label: "Color",       desc: "CMYK completo" },
                { val: "grayscale",  label: "Escala grises", desc: "Tinta negra + grises" },
                { val: "blackwhite", label: "Blanco/negro", desc: "Solo tinta negra" },
              ].map(({ val, label, desc }) => (
                <button
                  key={val}
                  onClick={() => set("colorMode", val)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    opts.colorMode === val
                      ? "border-primary bg-primary/8 ring-1 ring-primary/30"
                      : "border-border/60 hover:border-border bg-muted/20"
                  }`}
                >
                  <p className="font-semibold">{label}</p>
                  <p className="text-muted-foreground leading-snug mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </SECTION>

          <Separator />

          {/* ── Sangrado */}
          <SECTION icon={Scissors} title="Sangrado">
            <OptionRow
              label={`Zona de sangrado: ${opts.bleedMm} mm`}
              description="Área extra alrededor del contenido para corte de guillotina"
            >
              <div className="w-32">
                <Slider
                  min={0} max={10} step={0.5}
                  value={[opts.bleedMm]}
                  onValueChange={([v]) => set("bleedMm", v)}
                  className="mt-1"
                />
              </div>
            </OptionRow>
          </SECTION>

          <Separator />

          {/* ── Marcas técnicas */}
          <SECTION icon={Printer} title="Marcas técnicas">
            <OptionRow
              label="Personalizar marcas para esta exportación"
              description="Sobreescribe la configuración global de marcas"
            >
              <Switch checked={opts.useCustomMarks} onCheckedChange={(v) => set("useCustomMarks", v)} />
            </OptionRow>

            {opts.useCustomMarks ? (
              <div className="grid grid-cols-2 gap-2 mt-1">
                {Object.entries(TECHNICAL_MARKS).map(([key, mark]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      opts.marks[key]
                        ? "border-primary/30 bg-primary/5"
                        : "border-border/40 bg-muted/20"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium truncate">{mark.label}</p>
                    </div>
                    <Switch
                      checked={!!opts.marks[key]}
                      onCheckedChange={(v) => setMark(key, v)}
                      className="scale-90"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Se usará la configuración global: <strong className="text-foreground">{activeMarksCount}</strong> marcas activas.
                </span>
              </div>
            )}
          </SECTION>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-xl">
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="text-xs gap-1.5 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {exporting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Printer className="w-3.5 h-3.5" />
            }
            {exporting ? "Generando PDF…" : "Generar PDF de preimpresión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}