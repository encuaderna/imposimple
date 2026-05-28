/**
 * Motor de Imposición de Libros
 * Calcula la disposición de páginas en cuadernillos (firmas)
 * con compensación de creep y marcas técnicas.
 */

// ── Constantes de tamaños de página (en mm) ──
export const PAGE_SIZES = {
  A4:             { width: 210,   height: 297,   label: "A4 (210×297 mm)" },
  A5:             { width: 148,   height: 210,   label: "A5 (148×210 mm)" },
  Letter:         { width: 216,   height: 279,   label: "Letter US (216×279 mm)" },
  "Half-Letter":  { width: 140,   height: 216,   label: "Half-Letter (140×216 mm)" },
  "Carta-CL":     { width: 216,   height: 279,   label: "Carta chilena (216×279 mm)" },
  "Oficio-CL":    { width: 216,   height: 330,   label: "Oficio chileno (216×330 mm)" },
  B5:             { width: 176,   height: 250,   label: "B5 (176×250 mm)" },
  "Crown Quarto": { width: 189,   height: 246,   label: "Crown Quarto (189×246 mm)" },
  "Royal":        { width: 156,   height: 234,   label: "Royal (156×234 mm)" },
  Custom:         { width: 0,     height: 0,     label: "Personalizado" },
};

// ── Formatos de pliego (imposición clásica) ──
// Folio = 2 páginas por cara de hoja → 4 págs/hoja (2 hojas por plica mínima)
// Cuarto = 4 páginas por cara → 8 págs/hoja
// Octavo = 8 páginas por cara → 16 págs/hoja
export const PAGE_FORMATS = {
  folio:  { label: "Folio (2 páginas/cara)",  pagesPerSheet: 4,  defaultSheetsPerSig: 4 },
  quarto: { label: "Cuarto (4 páginas/cara)", pagesPerSheet: 8,  defaultSheetsPerSig: 2 },
  octavo: { label: "Octavo (8 páginas/cara)", pagesPerSheet: 16, defaultSheetsPerSig: 1 },
};

// ── Métodos de encuadernación ──
export const BINDING_METHODS = {
  saddle_stitch: { label: "Costura a caballete",               maxPages: 96,  pagesPerSignature: null },
  perfect_bind:  { label: "Encuadernación perfecta (Hot-melt)", maxPages: 600, pagesPerSignature: [8, 16, 32] },
  sewn:          { label: "Cosido (hilo vegetal)",              maxPages: 400, pagesPerSignature: [8, 16, 32] },
  section_sewn:  { label: "Cosido por secciones",              maxPages: 500, pagesPerSignature: [16, 32] },
  unsewn:        { label: "Sin costura (perfect bind estándar)", maxPages: 600, pagesPerSignature: [8, 16, 32] },
};

// ── Marcas técnicas disponibles ──
export const TECHNICAL_MARKS = {
  crop:         { label: "Marcas de corte",           description: "Líneas de corte en esquinas",                       defaultEnabled: true  },
  fold:         { label: "Marcas de plegado",          description: "Indicadores de línea de pliegue",                   defaultEnabled: true  },
  registration: { label: "Marcas de registro",         description: "Cruces de registro para alineación",               defaultEnabled: true  },
  collation:    { label: "Marcas de alzado",            description: "Barras escalonadas en lomo para verificar orden",  defaultEnabled: true  },
  signature_id: { label: "Identificador de cuadernillo", description: "Número y nombre del cuadernillo",               defaultEnabled: true  },
  sewing:       { label: "Marcas de costura",           description: "Puntos de perforación para cosido",               defaultEnabled: false },
  color_bar:    { label: "Barra de color",              description: "Barra de control de color CMYK",                  defaultEnabled: false },
  bleed:        { label: "Zona de sangrado",            description: "Área de sangrado (3 mm por defecto)",             defaultEnabled: true  },
};

/**
 * Calcula el creep (desplazamiento hacia el lomo) para cada hoja
 * Fórmula: creep_i = (N - 1 - i) × grosor_papel × factor_acumulación
 */
export function calculateCreep(sheetIndex, totalSheets, paperThickness, accumulationFactor = 0.8) {
  return (totalSheets - 1 - sheetIndex) * paperThickness * accumulationFactor;
}

export function calculateTotalCreep(totalSheets, paperThickness, accumulationFactor = 0.8) {
  let total = 0;
  for (let i = 0; i < totalSheets; i++) {
    total += calculateCreep(i, totalSheets, paperThickness, accumulationFactor);
  }
  return total;
}

/**
 * Rellena con blancos para completar el último cuadernillo
 */
function padPages(totalPages, pagesPerSignature, blankStart = 0, blankEnd = 0) {
  const effectivePages = totalPages + blankStart + blankEnd;
  const remainder = effectivePages % pagesPerSignature;
  const extraBlanks = remainder === 0 ? 0 : pagesPerSignature - remainder;
  return {
    blankStart,
    blankEnd: blankEnd + extraBlanks,
    totalWithBlanks: effectivePages + extraBlanks,
  };
}

/**
 * Genera la imposición completa del libro.
 *
 * Nuevos parámetros en config:
 *   printSides       "single" | "double"   — a una o doble cara
 *   pageFormat       "folio" | "quarto" | "octavo"   — formato de pliego
 *   alternatePage    boolean               — rotación alterna (girar por el lado largo)
 *   signatureMode    "standard" | "custom" — pliegos estándar o personalizados
 *   sheetsPerSig     number                — longitud personalizada de cuadernillo (hojas/plica)
 */
export function calculateImposition(config) {
  const {
    totalPages,
    pagesPerSignature = 16,
    paperThickness = 0.1,
    creepFactor = 0.8,
    blankPagesStart = 0,
    blankPagesEnd = 0,
    bindingMethod = "sewn",
    printSides = "double",
    pageFormat = "quarto",
    alternatePage = false,
    signatureMode = "standard",
    sheetsPerSig: customSheetsPerSig,
  } = config;

  // Determinar páginas por cuadernillo según el modo
  const fmt = PAGE_FORMATS[pageFormat] || PAGE_FORMATS.quarto;

  let resolvedPagesPerSig;
  if (signatureMode === "custom" && customSheetsPerSig > 0) {
    // El usuario define cuántas hojas por plica; páginas = hojas × páginas-por-hoja
    resolvedPagesPerSig = customSheetsPerSig * fmt.pagesPerSheet;
  } else {
    // Modo estándar: usar el selector clásico de páginas/cuadernillo
    resolvedPagesPerSig = pagesPerSignature;
  }

  // Para impresión a una cara: cada hoja solo aporta la mitad de páginas visibles
  const effectivePagesPerSheet = printSides === "single" ? fmt.pagesPerSheet / 2 : fmt.pagesPerSheet;
  const adjustedPagesPerSig = printSides === "single"
    ? Math.max(4, Math.floor(resolvedPagesPerSig / 2))
    : resolvedPagesPerSig;

  // Paso 1: Páginas con blancos
  const padding = padPages(totalPages, adjustedPagesPerSig, blankPagesStart, blankPagesEnd);
  const totalWithBlanks = padding.totalWithBlanks;

  // Paso 2: Array de páginas
  const pages = [];
  for (let i = 0; i < totalWithBlanks; i++) {
    const pageNum = i - padding.blankStart + 1;
    const isBlank = pageNum < 1 || pageNum > totalPages;
    pages.push({
      index: i,
      pageNumber: pageNum,
      isBlank,
      label: isBlank ? "BLANCO" : `${pageNum}`,
    });
  }

  // Paso 3: Cuadernillos
  const numSignatures = Math.ceil(totalWithBlanks / adjustedPagesPerSig);
  const sheetsPerSignature = adjustedPagesPerSig / 4;
  const signatures = [];

  for (let sig = 0; sig < numSignatures; sig++) {
    const sigPages = pages.slice(sig * adjustedPagesPerSig, (sig + 1) * adjustedPagesPerSig);
    const sheets = [];

    for (let sheet = 0; sheet < sheetsPerSignature; sheet++) {
      const frontLeft  = sigPages[adjustedPagesPerSig - 1 - sheet * 2];
      const frontRight = sigPages[sheet * 2];
      const backLeft   = sigPages[sheet * 2 + 1];
      const backRight  = sigPages[adjustedPagesPerSig - 2 - sheet * 2];

      const creepValue = calculateCreep(sheet, sheetsPerSignature, paperThickness, creepFactor);

      // Rotación alterna: las hojas impares se marcan para rotar 180° (girar por el lado largo)
      const rotated = alternatePage && sheet % 2 === 1;

      sheets.push({
        sheetIndex: sheet,
        creep: Math.round(creepValue * 1000) / 1000,
        rotated,
        printSides,
        front: { left: frontLeft, right: frontRight },
        back: printSides === "double" ? { left: backLeft, right: backRight } : null,
      });
    }

    const collationOffset = sig * 4;

    signatures.push({
      signatureIndex: sig,
      signatureNumber: sig + 1,
      label: `Cuadernillo ${sig + 1}`,
      sheets,
      totalCreep: calculateTotalCreep(sheetsPerSignature, paperThickness, creepFactor),
      collationOffset,
      pageRange: {
        first: sigPages[0]?.label ?? "—",
        last:  sigPages[sigPages.length - 1]?.label ?? "—",
      },
      pageFormat,
      printSides,
      alternatePage,
    });
  }

  return {
    config: { ...config, totalWithBlanks, resolvedPagesPerSig: adjustedPagesPerSig },
    padding,
    signatures,
    totalSignatures: numSignatures,
    totalSheets: numSignatures * sheetsPerSignature,
    sheetsPerSignature,
    pageFormat,
    printSides,
    alternatePage,
  };
}

/**
 * Resumen estadístico de la imposición
 */
export function getImpositionSummary(imposition) {
  const { signatures, config, padding } = imposition;
  const totalCreep = signatures.reduce((sum, sig) => sum + sig.totalCreep, 0);
  const pps = config.resolvedPagesPerSig || config.pagesPerSignature;

  return {
    totalPages: config.totalPages,
    totalWithBlanks: config.totalWithBlanks,
    blankPagesAdded: padding.blankStart + padding.blankEnd,
    blankStart: padding.blankStart,
    blankEnd: padding.blankEnd,
    totalSignatures: signatures.length,
    pagesPerSignature: pps,
    sheetsPerSignature: pps / 4,
    totalSheets: imposition.totalSheets,
    totalCreepMm: Math.round(totalCreep * 100) / 100,
    avgCreepPerSheet: Math.round((totalCreep / Math.max(1, imposition.totalSheets)) * 1000) / 1000,
    pageFormat: imposition.pageFormat,
    printSides: imposition.printSides,
    alternatePage: imposition.alternatePage,
  };
}