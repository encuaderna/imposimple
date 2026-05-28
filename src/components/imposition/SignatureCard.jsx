import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SignatureSheet from "./SignatureSheet";

export default function SignatureCard({ signature }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{signature.label}</h3>
              <p className="text-xs text-muted-foreground font-mono">
                Págs. {signature.pageRange.first} – {signature.pageRange.last}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {signature.sheets.length} hojas
            </Badge>
            <Badge variant="secondary" className="font-mono text-xs">
              creep: {signature.totalCreep.toFixed(3)}mm
            </Badge>
            {/* Marca de alzado visual */}
            <div className="flex flex-col gap-0.5" title={`Marca de alzado: offset ${signature.collationOffset}mm`}>
              {Array.from({ length: signature.signatureNumber }).map((_, i) => (
                <div key={i} className="w-3 h-0.5 bg-foreground rounded-full" />
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 pb-4 space-y-3 border-t border-border/30">
              <div className="pt-3 space-y-4">
                {signature.sheets.map((sheet) => (
                  <SignatureSheet
                    key={sheet.sheetIndex}
                    sheet={sheet}
                    sheetNumber={sheet.sheetIndex + 1}
                  />
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}