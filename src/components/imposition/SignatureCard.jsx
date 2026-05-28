import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignatureSheet from "./SignatureSheet";

const SIGNATURE_COLORS = [
  { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", icon: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400" },
  { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", icon: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400" },
  { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", icon: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400" },
  { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", icon: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400" },
  { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", icon: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400" },
  { bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800", icon: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400" },
];

export default function SignatureCard({ signature }) {
  const [expanded, setExpanded] = useState(false);
  const color = SIGNATURE_COLORS[(signature.signatureIndex ?? 0) % SIGNATURE_COLORS.length];

  return (
    <div className={`rounded-2xl border ${color.border} ${color.bg} overflow-hidden shadow-sm transition-shadow hover:shadow-md`}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between gap-3"
        onClick={() => setExpanded(!expanded)}
        role="button"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color.icon}`}>
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{signature.label}</h3>
            <p className="text-xs text-muted-foreground font-mono">
              Págs. {signature.pageRange.first} – {signature.pageRange.last}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs rounded-lg border-border/50 bg-white/60 dark:bg-slate-800/60">
            {signature.sheets.length} hojas
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs rounded-lg bg-white/60 dark:bg-slate-800/60">
            creep {signature.totalCreep.toFixed(2)}mm
          </Badge>
          {/* Marca de alzado */}
          <div className="flex flex-col gap-0.5 opacity-60" title={`Marca de alzado: offset ${signature.collationOffset}mm`}>
            {Array.from({ length: Math.min(signature.signatureNumber, 5) }).map((_, i) => (
              <div key={i} className="w-3 h-0.5 bg-foreground rounded-full" />
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Detalles expandidos */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/40 dark:border-slate-700/50">
              <div className="pt-3 space-y-4">
                {signature.sheets.map((sheet) => (
                  <SignatureSheet
                    key={sheet.sheetIndex}
                    sheet={sheet}
                    sheetNumber={sheet.sheetIndex + 1}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}