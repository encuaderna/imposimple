import React, { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PdfUploadZone({ pdfFile, onPdfChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (file && file.type === "application/pdf") {
      onPdfChange(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div className="rounded-xl border-2 border-dashed transition-colors duration-200"
      style={{ borderColor: dragging ? "hsl(var(--primary))" : "hsl(var(--border))" }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {pdfFile ? (
        <div className="p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{pdfFile.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB · PDF listo para imposición
            </p>
          </div>
          <button
            onClick={() => onPdfChange(null)}
            className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
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