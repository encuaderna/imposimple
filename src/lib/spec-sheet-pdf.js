/**
 * Genera una "Hoja de Especificaciones" en PDF para comunicación diseñador ↔ imprenta.
 * Usa jsPDF (ya instalado).
 */
import { jsPDF } from "jspdf";
import { PAGE_SIZES, PAGE_FORMATS, BINDING_METHODS, TECHNICAL_MARKS } from "./imposition-engine";

const BRAND = "#3b5a8a";
const LIGHT  = "#eef2f7";
const GRAY   = "#6b7a90";
const BLACK  = "#1a2233";
const LINE   = "#c8d2e0";

function mm(v) { return Math.round(v * 100) / 100; }

function header(doc, title) {
  const W = doc.internal.pageSize.getWidth();
  // Banda superior
  doc.setFillColor(BRAND);
  doc.rect(0, 0, W, 22, "F");
  // Título izquierda
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor("#ffffff");
  doc.text("Hoja de Especificaciones de Imposición", 12, 10);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text(title, 12, 16.5);
  // Fecha derecha
  doc.setFontSize(7);
  doc.setTextColor("#ccd6e8");
  const dateStr = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  doc.text(dateStr, W - 12, 16.5, { align: "right" });
  return 28; // y inicial tras el header
}

function sectionTitle(doc, text, y) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(LIGHT);
  doc.rect(10, y, W - 20, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(BRAND);
  doc.text(text.toUpperCase(), 13, y + 5);
  return y + 10;
}

function row(doc, label, value, y, x1 = 13, x2 = 75, rowH = 6.5) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GRAY);
  doc.text(label, x1, y + 4.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BLACK);
  doc.text(String(value ?? "—"), x2, y + 4.5);
  doc.setDrawColor(LINE);
  doc.setLineWidth(0.2);
  doc.line(x1, y + rowH, doc.internal.pageSize.getWidth() - 10, y + rowH);
  return y + rowH;
}

function twoColRow(doc, label1, val1, label2, val2, y) {
  const W = doc.internal.pageSize.getWidth();
  const mid = W / 2;
  row(doc, label1, val1, y, 13, 65, 6.5);
  // second column
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GRAY);
  doc.text(label2, mid + 5, y + 4.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BLACK);
  doc.text(String(val2 ?? "—"), mid + 55, y + 4.5);
  return y + 6.5;
}

/** Dibuja el esquema visual de un cuadernillo (vista abierta de pliego) */
function drawSignatureSchema(doc, signature, y, pageSize) {
  const W = doc.internal.pageSize.getWidth();
  const margin = 14;
  const boxW = (W - margin * 2) / signature.sheets.length;
  const boxH = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(BRAND);
  doc.text(`${signature.label}  (págs. ${signature.pageRange.first} – ${signature.pageRange.last})`, margin, y + 4);
  y += 7;

  signature.sheets.forEach((sheet, i) => {
    const x = margin + i * boxW;
    // Fondo
    doc.setFillColor(i % 2 === 0 ? "#f5f8fc" : "#eef2f8");
    doc.roundedRect(x + 1, y, boxW - 2, boxH, 1.5, 1.5, "F");
    doc.setDrawColor(BRAND);
    doc.setLineWidth(0.3);
    doc.roundedRect(x + 1, y, boxW - 2, boxH, 1.5, 1.5, "S");

    // Línea de lomo central
    const cx = x + boxW / 2;
    doc.setDrawColor("#aabbcc");
    doc.setLineWidth(0.5);
    doc.line(cx, y + 2, cx, y + boxH - 2);

    // Números de página
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(BLACK);
    const fl = sheet.front?.left?.label ?? "—";
    const fr = sheet.front?.right?.label ?? "—";
    const bl = sheet.back?.left?.label ?? "";
    const br = sheet.back?.right?.label ?? "";
    doc.text(fl, cx - 3, y + 7.5, { align: "right" });
    doc.text(fr, cx + 3, y + 7.5);

    doc.setFontSize(6);
    doc.setTextColor(GRAY);
    if (bl || br) doc.text(`↩ ${bl} / ${br}`, x + boxW / 2, y + 13, { align: "center" });

    // Creep
    doc.setFontSize(5.5);
    doc.setTextColor(GRAY);
    doc.text(`creep: ${sheet.creep}mm`, x + boxW / 2, y + boxH - 1.5, { align: "center" });
  });

  return y + boxH + 4;
}

export async function generateSpecSheetPDF({ config, imposition, summary, marksConfig }) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = doc.internal.pageSize.getWidth();
  const projectName = config.name || "Sin nombre";

  // ── PÁGINA 1: Parámetros del proyecto ──────────────────────────────────────
  let y = header(doc, `Proyecto: ${projectName}`);

  // ── Sección 1: Datos del documento
  y = sectionTitle(doc, "1. Datos del documento", y);

  const pageSizeInfo = config.pageSize === "Custom"
    ? { label: `Personalizado (${mm(config.customWidth)}×${mm(config.customHeight)} mm)` }
    : PAGE_SIZES[config.pageSize];

  y = twoColRow(doc, "Nombre del proyecto", projectName, "Fecha de generación", new Date().toLocaleDateString("es-ES"), y);
  y = twoColRow(doc, "Total de páginas originales", config.totalPages, "Formato de página", pageSizeInfo?.label ?? config.pageSize, y);
  y = twoColRow(doc, "Páginas con blancos", summary.totalWithBlanks, "Blancos añadidos", summary.blankPagesAdded, y);
  y = twoColRow(doc, "Blancos al inicio", summary.blankStart, "Blancos al final", summary.blankEnd, y);

  y += 4;

  // ── Sección 2: Configuración de imposición
  y = sectionTitle(doc, "2. Configuración de imposición", y);

  const bindLabel = BINDING_METHODS[config.bindingMethod]?.label ?? config.bindingMethod;
  const fmtLabel  = PAGE_FORMATS[config.pageFormat]?.label ?? config.pageFormat;
  const sidesLabel = config.printSides === "double" ? "Doble cara (dúplex)" : "Una cara (símplex)";

  y = twoColRow(doc, "Método de encuadernación", bindLabel, "Formato de pliego", fmtLabel, y);
  y = twoColRow(doc, "Páginas por cuadernillo", summary.pagesPerSignature, "Hojas por cuadernillo", summary.sheetsPerSignature, y);
  y = twoColRow(doc, "Total de cuadernillos", summary.totalSignatures, "Total de hojas físicas", summary.totalSheets, y);
  y = twoColRow(doc, "Tipo de impresión", sidesLabel, "Rotación alterna", config.alternatePage ? "Sí" : "No", y);
  y = twoColRow(doc, "Modo de pliegos", config.signatureMode === "custom" ? "Personalizado" : "Estándar", "Modo de enfoque", config.focusMode ? "Activo" : "—", y);

  y += 4;

  // ── Sección 3: Creep y papel
  y = sectionTitle(doc, "3. Compensación de Creep", y);

  y = twoColRow(doc, "Grosor del papel", `${config.paperThickness} mm`, "Factor de acumulación", config.creepFactor, y);
  y = twoColRow(doc, "Creep total acumulado", `${summary.totalCreepMm} mm`, "Creep promedio por hoja", `${summary.avgCreepPerSheet} mm`, y);

  y += 4;

  // ── Sección 4: Marcas técnicas
  y = sectionTitle(doc, "4. Marcas técnicas habilitadas", y);

  const activeMark  = Object.entries(marksConfig).filter(([, v]) => v);
  const inactiveMark = Object.entries(marksConfig).filter(([, v]) => !v);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#2a6832");
  doc.text("✓ Activas:", 13, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(BLACK);
  const activeLabels = activeMark.map(([k]) => TECHNICAL_MARKS[k]?.label ?? k).join("  ·  ");
  doc.text(activeLabels || "Ninguna", 35, y + 5);
  y += 7;

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(GRAY);
  doc.text("✗ Inactivas:", 13, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GRAY);
  const inactiveLabels = inactiveMark.map(([k]) => TECHNICAL_MARKS[k]?.label ?? k).join("  ·  ");
  doc.text(inactiveLabels || "Ninguna", 40, y + 5);
  y += 10;

  // ── Nota para la imprenta
  doc.setFillColor("#fff8e1");
  doc.setDrawColor("#f5c842");
  doc.setLineWidth(0.3);
  doc.roundedRect(10, y, W - 20, 14, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor("#7a5a00");
  doc.text("⚠  Nota para la imprenta", 14, y + 5.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor("#5a4200");
  const nota = `Este documento es una hoja de especificaciones generada automáticamente. Verifique siempre los valores con el archivo PDF original antes de producción. El creep calculado asume papel de ${config.paperThickness} mm de grosor.`;
  const lines = doc.splitTextToSize(nota, W - 30);
  doc.text(lines, 14, y + 10);
  y += 18;

  // ── PÁGINA 2: Esquema visual de cuadernillos ────────────────────────────────
  doc.addPage();
  y = header(doc, `Esquema visual de imposición — ${projectName}`);

  y = sectionTitle(doc, "5. Esquema visual de cuadernillos", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(GRAY);
  doc.text("Cada bloque representa una hoja física. El número izquierdo es la página delantera-izquierda y el derecho la delantera-derecha. El reverso aparece en gris.", 13, y + 1);
  y += 6;

  const currentPageSize = config.pageSize === "Custom"
    ? { width: config.customWidth, height: config.customHeight }
    : PAGE_SIZES[config.pageSize];

  for (const sig of imposition.signatures) {
    // Verificar espacio en página
    if (y > 260) {
      doc.addPage();
      y = header(doc, `Esquema visual (cont.) — ${projectName}`);
      y += 6;
    }
    y = drawSignatureSchema(doc, sig, y, currentPageSize);
  }

  // Footer todas las páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(GRAY);
    doc.text(`Imposición Editorial · Hoja de especificaciones · ${projectName}`, 12, 292);
    doc.text(`Pág. ${p} / ${totalPages}`, W - 12, 292, { align: "right" });
    doc.setDrawColor(LINE);
    doc.setLineWidth(0.3);
    doc.line(10, 289, W - 10, 289);
  }

  doc.save(`especificaciones-${(projectName || "proyecto").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}