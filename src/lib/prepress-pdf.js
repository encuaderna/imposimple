/**
 * Generador de PDF de preimpresión con hojas impuestas completas.
 * Produce un archivo listo para entrega a imprenta con:
 * - Una página PDF por cara de hoja física
 * - Marcas técnicas seleccionadas (corte, plegado, alzado, registro, costura, color, sangrado)
 * - Organización por cuadernillos
 * - Compensación de creep aplicada visualmente
 */
import { jsPDF } from "jspdf";
import { PAGE_SIZES, PAGE_FORMATS, BINDING_METHODS, TECHNICAL_MARKS } from "./imposition-engine";

// ── Paleta ──────────────────────────────────────────────────────────────────
const BRAND      = "#3b5a8a";
const GRAY       = "#6b7a90";
const BLACK      = "#1a2233";
const LINE       = "#c8d2e0";
const BLEED_MM   = 3;   // sangrado estándar en mm
const MARK_OFF   = 5;   // distancia de la caja al borde de la hoja (mm)
const MARK_LEN   = 5;   // longitud de las marcas de corte/registro (mm)

/**
 * Convierte mm del formato interno a mm del documento (pasthrough — jsPDF usa mm).
 */
const r = (v) => Math.round(v * 1000) / 1000;

// ── Helpers de dibujo ────────────────────────────────────────────────────────

/**
 * Dibuja las marcas de corte en las 4 esquinas de la caja de contenido.
 * box: { x, y, w, h } en mm (caja de contenido, sin sangrado)
 */
function drawCropMarks(doc, box, bleedMm) {
  const { x, y, w, h } = box;
  doc.setDrawColor(BLACK);
  doc.setLineWidth(0.2);

  const off = bleedMm + MARK_OFF;
  const len = MARK_LEN;

  // Superior izquierda — horizontal
  doc.line(x - off - len, y, x - off, y);
  // Superior izquierda — vertical
  doc.line(x, y - off - len, x, y - off);
  // Superior derecha — horizontal
  doc.line(x + w + off, y, x + w + off + len, y);
  // Superior derecha — vertical
  doc.line(x + w, y - off - len, x + w, y - off);
  // Inferior izquierda — horizontal
  doc.line(x - off - len, y + h, x - off, y + h);
  // Inferior izquierda — vertical
  doc.line(x, y + h + off, x, y + h + off + len);
  // Inferior derecha — horizontal
  doc.line(x + w + off, y + h, x + w + off + len, y + h);
  // Inferior derecha — vertical
  doc.line(x + w, y + h + off, x + w, y + h + off + len);
}

/**
 * Dibuja cruces de registro centradas arriba y abajo de la caja.
 */
function drawRegistrationMarks(doc, box, bleedMm) {
  const { x, y, w, h } = box;
  const cy = y + h / 2;

  // Izquierda y derecha
  const positions = [
    { cx: x - bleedMm - MARK_OFF - MARK_LEN / 2, cy },
    { cx: x + w + bleedMm + MARK_OFF + MARK_LEN / 2, cy },
  ];

  doc.setDrawColor(BLACK);
  doc.setLineWidth(0.25);

  positions.forEach(({ cx, cy: cY }) => {
    const r = 2.5;
    doc.circle(cx, cY, r, "S");
    // Cruz dentro
    doc.line(cx - r - 1, cY, cx + r + 1, cY);
    doc.line(cx, cY - r - 1, cx, cY + r + 1);
  });
}

/**
 * Dibuja la barra de control CMYK debajo de la caja.
 */
function drawColorBar(doc, box, bleedMm) {
  const { x, y, w, h } = box;
  const barY = y + h + bleedMm + MARK_OFF;
  const barH = 4;
  const slotW = w / 8;
  const cmyk = [
    [0, 188, 212],   // C
    [233, 30, 99],   // M
    [255, 235, 59],  // Y
    [20, 20, 20],    // K
    [255, 255, 255], // White
    [128, 128, 128], // 50% K
    [0, 0, 255],     // Blue
    [255, 0, 0],     // Red
  ];
  cmyk.forEach(([r, g, b], i) => {
    doc.setFillColor(r, g, b);
    doc.rect(x + i * slotW, barY, slotW, barH, "F");
  });
  doc.setDrawColor(LINE);
  doc.setLineWidth(0.2);
  doc.rect(x, barY, w, barH, "S");

  // Etiquetas mínimas
  const labels = ["C", "M", "Y", "K", "W", "50%", "B", "R"];
  doc.setFontSize(4);
  doc.setFont("helvetica", "normal");
  labels.forEach((l, i) => {
    const lx = x + i * slotW + slotW / 2;
    const col = i < 3 || i === 6 || i === 7 ? "#ffffff" : "#000000";
    doc.setTextColor(col);
    doc.text(l, lx, barY + barH - 0.8, { align: "center" });
  });
}

/**
 * Dibuja la zona de sangrado (rectángulo punteado).
 */
function drawBleedBox(doc, box, bleedMm) {
  const { x, y, w, h } = box;
  doc.setDrawColor(0, 180, 210);
  doc.setLineWidth(0.25);
  // simular punteado con líneas cortas (jsPDF no soporta nativo)
  doc.setLineDashPattern([1.5, 1], 0);
  doc.rect(x - bleedMm, y - bleedMm, w + bleedMm * 2, h + bleedMm * 2, "S");
  doc.setLineDashPattern([], 0);
}

/**
 * Dibuja la línea de plegado central.
 */
function drawFoldLine(doc, box) {
  const { x, y, w, h } = box;
  const cx = x + w / 2;
  doc.setDrawColor(220, 80, 80);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([2, 1.5], 0);
  doc.line(cx, y - 2, cx, y + h + 2);
  doc.setLineDashPattern([], 0);
}

/**
 * Dibuja la marca de alzado (barra escalonada en el lomo exterior).
 */
function drawCollationMark(doc, box, signatureNumber, sheetIndex) {
  const { x, y, h } = box;
  // posición Y escalonada por cuadernillo
  const barY = y + (signatureNumber * 6) % (h * 0.6) + h * 0.1;
  const barH = 5;
  doc.setFillColor(BLACK);
  doc.rect(x - MARK_OFF - 4, barY, 4, barH, "F");

  doc.setFontSize(4);
  doc.setTextColor("#ffffff");
  doc.text(`C${signatureNumber}`, x - MARK_OFF - 3.5, barY + 3.3);
}

/**
 * Dibuja los puntos de costura a lo largo del lomo.
 */
function drawSewingMarks(doc, box) {
  const { x, y, w, h } = box;
  const cx = x + w / 2;
  const numPuntos = 5;
  doc.setFillColor(200, 50, 50);
  for (let i = 0; i < numPuntos; i++) {
    const py = y + (h / (numPuntos + 1)) * (i + 1);
    doc.circle(cx, py, 0.8, "F");
  }
}

/**
 * Dibuja el identificador de cuadernillo/hoja.
 */
function drawSignatureId(doc, box, signatureNumber, sheetIndex, face) {
  const { x, y, w, h } = box;
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(GRAY);
  const label = `C${signatureNumber} · H${sheetIndex + 1} · ${face === "front" ? "FRENTE" : "DORSO"}`;
  doc.text(label, x + w - 1, y + h + BLEED_MM + 2.5, { align: "right" });
}

// ── Encabezado de sección por cuadernillo ───────────────────────────────────

function drawSignatureHeader(doc, signature, W, H, pageW, pageH) {
  // Banda superior estrecha con info del cuadernillo
  doc.setFillColor(BRAND);
  doc.rect(0, 0, W, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor("#ffffff");
  doc.text(`${signature.label}  ·  Págs. ${signature.pageRange.first}–${signature.pageRange.last}`, 6, 5.2);
  doc.setFont("helvetica", "normal");
  doc.text(`Hoja física: ${pageW}×${pageH} mm (imponiendo ${signature.sheets.length} págs. ${signature.printSides === "double" ? "dúplex" : "símplex"})`, W - 6, 5.2, { align: "right" });
}

// ── Render de una cara de hoja completa ────────────────────────────────────

/**
 * Dibuja una cara (frente o dorso) de una hoja física en la página PDF actual.
 *
 * @param {jsPDF} doc
 * @param {object} sheet  — objeto sheet del motor de imposición
 * @param {string} face   — "front" | "back"
 * @param {object} signature
 * @param {object} marksConfig
 * @param {object} physicalPageSize — { width, height } de la hoja física en mm
 */
function renderSheetFace(doc, sheet, face, signature, marksConfig, physicalPageSize) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const faceData = face === "front" ? sheet.front : sheet.back;
  if (!faceData) return;

  // ── Cabecera de cuadernillo
  drawSignatureHeader(doc, signature, W, H, physicalPageSize.width, physicalPageSize.height);

  // ── Caja de contenido de la hoja impuesta
  // La hoja impuesta = 2 páginas del libro lado a lado
  // Margen para marcas: BLEED_MM + MARK_OFF + MARK_LEN + gap
  const safeMargin = BLEED_MM + MARK_OFF + MARK_LEN + 4;
  const headerH = 10;

  const boxW = W - safeMargin * 2;
  const boxH = H - safeMargin * 2 - headerH;
  const boxX = safeMargin;
  const boxY = safeMargin + headerH;

  // ── Fondo de hoja
  doc.setFillColor(255, 255, 255);
  doc.rect(boxX, boxY, boxW, boxH, "F");
  doc.setDrawColor(LINE);
  doc.setLineWidth(0.3);
  doc.rect(boxX, boxY, boxW, boxH, "S");

  // ── División central (lomo)
  const cx = boxX + boxW / 2;
  doc.setDrawColor(GRAY);
  doc.setLineWidth(0.15);
  doc.setLineDashPattern([1, 1.5], 0);
  doc.line(cx, boxY + 2, cx, boxY + boxH - 2);
  doc.setLineDashPattern([], 0);

  // ── Compensación de creep: banda en el margen interior de cada página
  if (sheet.creep > 0) {
    const creepWidth = Math.min(sheet.creep * 2, boxW * 0.08); // escalar a mm del PDF
    doc.setFillColor(66, 133, 244, 0.08); // azul suave semitransparente
    // Izquierda: margen interior derecho
    doc.setFillColor(235, 242, 255);
    doc.rect(cx - creepWidth, boxY, creepWidth, boxH, "F");
    // Derecha: margen interior izquierdo
    doc.rect(cx, boxY, creepWidth, boxH, "F");
  }

  // ── Páginas (izquierda y derecha)
  const pages = [
    { page: faceData.left,  x: boxX,        w: boxW / 2, pos: "IZQ", align: "right"  },
    { page: faceData.right, x: boxX + boxW / 2, w: boxW / 2, pos: "DER", align: "left" },
  ];

  pages.forEach(({ page, x, w, pos, align }) => {
    const centerX = x + w / 2;
    const centerY = boxY + boxH / 2;

    if (!page || page.isBlank) {
      // Página en blanco
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(200, 210, 225);
      doc.text("BLANCO", centerX, centerY, { align: "center" });
      doc.setFontSize(6);
      doc.text(pos, centerX, centerY + 6, { align: "center" });
    } else {
      // Número de página grande
      doc.setFont("helvetica", "bold");
      doc.setFontSize(42);
      doc.setTextColor(30, 40, 65);
      doc.text(page.label, centerX, centerY + 7, { align: "center" });

      // Posición
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(GRAY);
      doc.text(pos, centerX, centerY + 15, { align: "center" });

      // Indicador de creep en el margen interior
      if (sheet.creep > 0) {
        const creepX = pos === "IZQ" ? cx - 1.5 : cx + 1.5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5);
        doc.setTextColor(BRAND);
        doc.text(`◂ ${sheet.creep}mm`, creepX, boxY + 6, { align: pos === "IZQ" ? "right" : "left" });
      }
    }
  });

  // ── Marcas técnicas ──────────────────────────────────────────────────────
  const box = { x: boxX, y: boxY, w: boxW, h: boxH };

  if (marksConfig?.bleed)        drawBleedBox(doc, box, BLEED_MM);
  if (marksConfig?.crop)         drawCropMarks(doc, box, BLEED_MM);
  if (marksConfig?.registration) drawRegistrationMarks(doc, box, BLEED_MM);
  if (marksConfig?.fold)         drawFoldLine(doc, box);
  if (marksConfig?.collation)    drawCollationMark(doc, box, signature.signatureNumber, sheet.sheetIndex);
  if (marksConfig?.sewing)       drawSewingMarks(doc, box);
  if (marksConfig?.color_bar)    drawColorBar(doc, box, BLEED_MM);
  if (marksConfig?.signature_id) drawSignatureId(doc, box, signature.signatureNumber, sheet.sheetIndex, face);

  // ── Etiqueta de cara (frente/dorso)
  const faceLabel = face === "front" ? "FRENTE" : "DORSO";
  const faceColor = face === "front" ? [59, 90, 138] : [180, 100, 30];
  doc.setFillColor(...faceColor);
  doc.rect(boxX, boxY, 20, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor("#ffffff");
  doc.text(faceLabel, boxX + 10, boxY + 3.4, { align: "center" });

  // ── Info de hoja en esquina
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(GRAY);
  const sheetInfo = `Hoja ${sheet.sheetIndex + 1}${sheet.rotated ? " · ROT" : ""}${sheet.creep > 0 ? ` · creep ${sheet.creep}mm` : ""}`;
  doc.text(sheetInfo, boxX + boxW, boxY + 3.4, { align: "right" });
}

// ── Footer de página ─────────────────────────────────────────────────────────

function addFooter(doc, projectName, pageNum, totalPagesCount) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setDrawColor(LINE);
  doc.setLineWidth(0.25);
  doc.line(10, H - 8, W - 10, H - 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(GRAY);
  doc.text(`Imposición Editorial · PDF de preimpresión · ${projectName}`, 12, H - 4.5);
  doc.text(`Pág. ${pageNum} / ${totalPagesCount}`, W - 12, H - 4.5, { align: "right" });
}

// ── Portada ──────────────────────────────────────────────────────────────────

function renderCoverPage(doc, config, imposition, summary, marksConfig) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Banda superior
  doc.setFillColor(BRAND);
  doc.rect(0, 0, W, 40, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor("#ffffff");
  doc.text("PDF DE PREIMPRESIÓN", W / 2, 16, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(config.name || "Proyecto sin nombre", W / 2, 26, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor("#ccd6e8");
  const dateStr = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  doc.text(dateStr, W / 2, 34, { align: "center" });

  // Resumen en tarjetas
  let y = 52;
  const stats = [
    ["Total páginas originales", config.totalPages],
    ["Páginas con blancos", summary.totalWithBlanks],
    ["Cuadernillos", summary.totalSignatures],
    ["Hojas físicas totales", summary.totalSheets],
    ["Hojas por cuadernillo", summary.sheetsPerSignature],
    ["Creep total acumulado", `${summary.totalCreepMm} mm`],
    ["Grosor de papel", `${config.paperThickness} mm`],
    ["Encuadernación", BINDING_METHODS[config.bindingMethod]?.label ?? config.bindingMethod],
    ["Impresión", config.printSides === "double" ? "Dúplex" : "Símplex"],
    ["Formato de pliego", PAGE_FORMATS[config.pageFormat]?.label ?? config.pageFormat],
  ];

  doc.setFillColor(245, 248, 252);
  doc.roundedRect(10, y - 4, W - 20, stats.length * 9 + 8, 2, 2, "F");

  stats.forEach(([label, value], i) => {
    const rowY = y + i * 9;
    if (i % 2 === 0) {
      doc.setFillColor(235, 241, 250);
      doc.rect(10, rowY - 3, W - 20, 9, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(GRAY);
    doc.text(label, 16, rowY + 3);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(BLACK);
    doc.text(String(value), W - 16, rowY + 3, { align: "right" });
  });

  y += stats.length * 9 + 12;

  // Marcas activas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(BRAND);
  doc.text("MARCAS TÉCNICAS INCLUIDAS", 16, y);
  y += 7;

  const activeMarks = Object.entries(marksConfig).filter(([, v]) => v);
  activeMarks.forEach(([key], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const mx = 16 + col * ((W - 32) / 3);
    const my = y + row * 8;
    doc.setFillColor(59, 90, 138, 0.1);
    doc.setFillColor(235, 241, 250);
    doc.roundedRect(mx, my - 3, (W - 32) / 3 - 3, 7, 1.5, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(BRAND);
    doc.text(`✓  ${TECHNICAL_MARKS[key]?.label ?? key}`, mx + 2, my + 2);
  });

  y += Math.ceil(activeMarks.length / 3) * 8 + 8;

  // Advertencia preimpresión
  doc.setFillColor(255, 248, 225);
  doc.setDrawColor(245, 200, 66);
  doc.setLineWidth(0.3);
  doc.roundedRect(10, y, W - 20, 20, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor("#7a5a00");
  doc.text("⚠  Instrucciones de impresión", 15, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor("#5a4200");
  const warn = `Imprimir este archivo respetando el orden de páginas del PDF. Las marcas de corte indican la caja de sangrado. Verificar alineación de registro antes de tirada larga. Creep calculado para papel de ${config.paperThickness}mm de grosor.`;
  const warnLines = doc.splitTextToSize(warn, W - 34);
  doc.text(warnLines, 15, y + 13.5);
}

// ── Exportador principal ─────────────────────────────────────────────────────

/**
 * Genera el PDF de preimpresión completo.
 * @param {object} params
 * @param {object} params.config       — configuración del proyecto
 * @param {object} params.imposition   — resultado de calculateImposition()
 * @param {object} params.summary      — resultado de getImpositionSummary()
 * @param {object} params.marksConfig  — { crop: bool, fold: bool, … }
 */
export async function generatePrepressPDF({ config, imposition, summary, marksConfig, exportOptions = {} }) {
  const {
    pageFormat = "a3",
    orientation = "landscape",
    includeCover = true,
    includeBack = true,
    bleedMm = BLEED_MM,
    colorMode = "color",
    useCustomMarks = false,
    marks: customMarks,
  } = exportOptions;

  // Marcas efectivas: personalizadas o globales
  const effectiveMarks = useCustomMarks && customMarks ? customMarks : marksConfig;

  // Filtro de color: si grayscale/bw, envuelve colores de texto/fill en escala
  // (jsPDF renderiza en RGB; el modo se embebe en el nombre del archivo como referencia)
  const doc = new jsPDF({ unit: "mm", format: pageFormat, orientation });

  const projectName = config.name || "proyecto";
  const physicalPageSize = config.pageSize === "Custom"
    ? { width: config.customWidth ?? 210, height: config.customHeight ?? 297 }
    : PAGE_SIZES[config.pageSize] ?? PAGE_SIZES["A4"];

  // ── Portada
  if (includeCover) {
    renderCoverPage(doc, config, imposition, summary, effectiveMarks);
  }

  // ── Una página PDF por cada cara de cada hoja de cada cuadernillo
  let firstSheet = !includeCover; // si no hay portada, la primera página ya existe
  for (const signature of imposition.signatures) {
    for (const sheet of signature.sheets) {
      if (firstSheet) {
        firstSheet = false;
      } else {
        doc.addPage();
      }
      renderSheetFace(doc, sheet, "front", signature, effectiveMarks, physicalPageSize);

      // Dorso
      if (includeBack && sheet.printSides !== "single" && sheet.back) {
        doc.addPage();
        renderSheetFace(doc, sheet, "back", signature, effectiveMarks, physicalPageSize);
      }
    }
  }

  // ── Footer en todas las páginas
  const totalPDFPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPDFPages; p++) {
    doc.setPage(p);
    addFooter(doc, projectName, p, totalPDFPages);
  }

  // ── Descargar
  const colorSuffix = colorMode !== "color" ? `-${colorMode}` : "";
  const filename = `preimpresion-${projectName.replace(/\s+/g, "-").toLowerCase()}${colorSuffix}-${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
}