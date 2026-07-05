import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Mini diagrama SVG de la imposición de un cuadernillo.
 * Muestra el orden de las páginas en cada hoja física (frente/dorso).
 */
export default function SignatureImpositionPreview({ imposition }) {
  const [sigIndex, setSigIndex] = useState(0);

  if (!imposition || !imposition.signatures || imposition.signatures.length === 0) return null;

  const sig = imposition.signatures[sigIndex];
  const total = imposition.signatures.length;
  const sheets = sig.sheets || [];

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-accent uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            Vista previa de imposición
          </CardTitle>
          {total > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSigIndex((i) => Math.max(0, i - 1))}
                disabled={sigIndex === 0}
                className="p-1 rounded hover:bg-accent/20 disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-accent" />
              </button>
              <span className="text-[10px] font-mono text-muted-foreground">
                Cuad. {sigIndex + 1}/{total}
              </span>
              <button
                onClick={() => setSigIndex((i) => Math.min(total - 1, i + 1))}
                disabled={sigIndex === total - 1}
                className="p-1 rounded hover:bg-accent/20 disabled:opacity-30"
              >
                <ChevronRight className="w-3.5 h-3.5 text-accent" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[10px] text-muted-foreground mb-3">
          Cuadernillo {sig.signatureIndex + 1} · Págs. {sig.startPage}–{sig.endPage} · {sheets.length} {sheets.length === 1 ? "hoja" : "hojas"}
        </p>
        <div className="space-y-2">
          {sheets.map((sheet, sheetIdx) => (
            <SheetDiagram key={sheetIdx} sheet={sheet} sheetIdx={sheetIdx} />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-3 text-center italic">
          Frente (izq.) y dorso (der.) de cada hoja al doblar
        </p>
      </CardContent>
    </Card>
  );
}

function PageRect({ page, isBlank }) {
  const label = isBlank ? "B" : String(page);
  const bgColor = isBlank ? "#e2e8f0" : "hsl(215 28% 42% / 0.12)";
  const textColor = isBlank ? "#94a3b8" : "hsl(215 18% 22%)";
  const borderColor = isBlank ? "#cbd5e1" : "hsl(215 28% 42% / 0.4)";

  return (
    <g>
      <rect width="36" height="48" rx="3" fill={bgColor} stroke={borderColor} strokeWidth="1" />
      <text
        x="18" y="28"
        textAnchor="middle"
        fontSize="11"
        fontWeight={isBlank ? "400" : "600"}
        fill={textColor}
        fontFamily="monospace"
      >
        {label}
      </text>
      {isBlank && (
        <text x="18" y="40" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="sans-serif">
          blanco
        </text>
      )}
    </g>
  );
}

function SheetDiagram({ sheet, sheetIdx }) {
  const SHEET_W = 130;
  const SHEET_H = 60;
  const PAGE_W = 36;
  const PAGE_H = 48;
  const GAP = 6;
  const PAD_X = 12;
  const PAD_Y = 6;

  // front: left page | right page
  // back:  left page | right page
  const frontLeft = sheet.front?.left;
  const frontRight = sheet.front?.right;
  const backLeft = sheet.back?.left;
  const backRight = sheet.back?.right;

  const TOTAL_W = PAD_X * 2 + (PAGE_W * 2 + GAP) * 2 + 24; // two sides + arrow gap

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[9px] font-mono text-muted-foreground/70 pl-1">
        Hoja {sheetIdx + 1} {sheet.creep > 0 ? `· creep ${sheet.creep.toFixed(2)}mm` : ""}
      </p>
      <div className="overflow-x-auto">
        <svg width={TOTAL_W} height={SHEET_H} viewBox={`0 0 ${TOTAL_W} ${SHEET_H}`} className="block">
          {/* FRENTE */}
          <text x={PAD_X + PAGE_W} y="9" textAnchor="middle" fontSize="7" fill="#64748b" fontFamily="sans-serif">
            FRENTE
          </text>
          {/* front left page */}
          <g transform={`translate(${PAD_X}, ${PAD_Y})`}>
            <PageRect page={frontLeft} isBlank={!frontLeft} />
          </g>
          {/* front right page */}
          <g transform={`translate(${PAD_X + PAGE_W + GAP}, ${PAD_Y})`}>
            <PageRect page={frontRight} isBlank={!frontRight} />
          </g>

          {/* fold arrow */}
          <line
            x1={PAD_X * 2 + PAGE_W * 2 + GAP + 2}
            y1={SHEET_H / 2}
            x2={PAD_X * 2 + PAGE_W * 2 + GAP + 22}
            y2={SHEET_H / 2}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            markerEnd="url(#arr)"
          />
          <text
            x={PAD_X * 2 + PAGE_W * 2 + GAP + 12}
            y={SHEET_H / 2 - 3}
            textAnchor="middle"
            fontSize="7"
            fill="#94a3b8"
            fontFamily="sans-serif"
          >
            ↔
          </text>

          {/* DORSO */}
          <text
            x={PAD_X * 3 + PAGE_W * 3 + GAP * 2 + 22}
            y="9"
            textAnchor="middle"
            fontSize="7"
            fill="#64748b"
            fontFamily="sans-serif"
          >
            DORSO
          </text>
          {/* back left page */}
          <g transform={`translate(${PAD_X * 2 + PAGE_W * 2 + GAP + 24}, ${PAD_Y})`}>
            <PageRect page={backLeft} isBlank={!backLeft} />
          </g>
          {/* back right page */}
          <g transform={`translate(${PAD_X * 2 + PAGE_W * 3 + GAP * 2 + 24}, ${PAD_Y})`}>
            <PageRect page={backRight} isBlank={!backRight} />
          </g>
        </svg>
      </div>
    </div>
  );
}