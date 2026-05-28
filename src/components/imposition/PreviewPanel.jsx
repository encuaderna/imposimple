import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import SheetPreview from "./SheetPreview";

export default function PreviewPanel({ imposition, marksConfig, pageSize }) {
  const [selectedSig, setSelectedSig] = useState("0");

  if (!imposition || !imposition.signatures.length) return null;

  const signature = imposition.signatures[parseInt(selectedSig)];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            Vista Previa de Hoja
          </CardTitle>
          <Select value={selectedSig} onValueChange={setSelectedSig}>
            <SelectTrigger className="w-48 h-8 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {imposition.signatures.map((sig, i) => (
                <SelectItem key={i} value={String(i)} className="text-xs font-mono">
                  {sig.label} (Págs. {sig.pageRange.first}–{sig.pageRange.last})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {signature.sheets.map((sheet) => (
            <div key={sheet.sheetIndex}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono text-[10px]">
                  Hoja {sheet.sheetIndex + 1}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Frente: [{sheet.front.left?.label}, {sheet.front.right?.label}] • Dorso: [{sheet.back.left?.label}, {sheet.back.right?.label}]
                </span>
              </div>
              <SheetPreview
                sheet={sheet}
                signatureNumber={signature.signatureNumber}
                marksConfig={marksConfig}
                pageSize={pageSize}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}