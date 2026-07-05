import React, { useRef, useState } from "react";
import { Upload, X, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

async function getPdfPageCount(file) {
  const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
}

export default function PdfUploadZone({ pdfFile, onPdfChange, onPageCountDetected }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageCount, setPageCount] = useState(null);

  const handleFile = async (file) => {
    if (file && file.type === "application/pdf") {
      onPdfChange(file);
      setPageCount(null);
      setLoading(true);
      const count = await getPdfPageCount(file);
      setLoading(false);
      setPageCount(count);
      if (onPageCountDetected) onPageCountDetected(count);
    }
  };

  const handleClear = () => {
    onPdfChange(null);
    setPageCount(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div
      className="rounded-xl border-2 border-dashed transition-colors duration-200"
      style={{ borderColor: dragging ? "hsl(var(--primary))" : "hsl(var(--border))" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {pdfFile ? (
        <>
          <div className="p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{pdfFile.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                {loading && <><Loader2 className="w-3 h-3 animate-spin inline ml-1" /> Contando páginas…</>}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tarjeta de información */}
          {!loading && pageCount !== null && (
            <div className="mx-3 mb-3 p-3 rounded-lg border border-border/50 bg-background/70 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Tamaño del archivo</span>
                <span className="font-mono font-medium">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Páginas detectadas</span>
                <span className="font-mono font-medium">{pageCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] pt-1.5 border-t border-border/40">
                {pageCount % 4 === 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Múltiplo de 4 — listo para cuadernillos
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-amber-600 dark:text-amber-400">
                      No es múltiplo de 4 — se añadirán {4 - (pageCount % 4)} página(s) en blanco
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <button
          className="w-full p-5 flex flex-col items-center gap-2 text-center cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${dragging ? "bg-primary/10" : "bg-muted"}`}>
            <Upload className={`w-5 h-5 transition-colors ${dragging ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="text-sm font-medium">Sube tu PDF aquí</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Arrastra el archivo o haz clic para buscarlo.<br />
              Este PDF se dividirá en cuadernillos numerados.
            </p>
          </div>
          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">solo .pdf</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}