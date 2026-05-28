/**
 * Motor de Imposición de Libros
 * Calcula la disposición de páginas en cuadernillos (firmas)
 * con compensación de creep y marcas técnicas.
 */

// ── Constantes de tamaños de página (en mm) ──
export const PAGE_SIZES = {
  A4: { width: 210, height: 297, label: "A4 (210×297 mm)" },
  A5: { width: 148, height: 210, label: "A5 (148×210 mm)" },
  Letter: { width: 216, height: 279, label: "Letter (216×279 mm)" },
  "Half-Letter": { width: 140, height: 216, label: "Half-Letter (140×216 mm)" },
  B5: { width: 176, height: 250, label: "B5 (176×250 mm)" },
  "Crown Quarto": { width: 189, height: 246, label: "Crown Quarto (189×246 mm)" },
  "Royal": { width: 156, height: 234, label: "Royal (156×234 mm)" },
  Custom: { width: 0, height: 0, label: "Personalizado" },
};

// ── Métodos de encuadernación ──
export const BINDING_METHODS = {
  saddle_stitch: { label: "Costura a caballete", maxPages: 96, pagesPerSignature: null },
  perfect_bind: { label: "Encuadernación perfecta (Hot-melt)", maxPages: 600, pagesPerSignature: [8, 16, 32] },
  sewn: { label: "Cosido (hilo vegetal)", maxPages: 400, pagesPerSignature: [8, 16, 32] },
  section_sewn: { label: "Cosido por secciones", maxPages: 500, pagesPerSignature: [16, 32] },
};

// ── Marcas técnicas disponibles ──
export const TECHNICAL_MARKS = {
  crop: { label: "Marcas de corte", description: "Líneas de corte en esquinas", defaultEnabled: true },
  fold: { label: "Marcas de plegado", description: "Indicadores de línea de pliegue", defaultEnabled: true },
  registration: { label: "Marcas de registro", description: "Cruces de registro para alineación", defaultEnabled: true },
  collation: { label: "Marcas de alzado", description: "Barras escalonadas en lomo para verificar orden", defaultEnabled: true },
  signature_id: { label: "Identificador de cuadernillo", description: "Número y nombre del cuadernillo", defaultEnabled: true },
  sewing: { label: "Marcas de costura", description: "Puntos de perforación para cosido", defaultEnabled: false },
  color_bar: { label: "Barra de color", description: "Barra de control de color CMYK", defaultEnabled: false },
  bleed: { label: "Zona de sangrado", description: "Área de sangrado (3mm por defecto)", defaultEnabled: true },
};

/**
 * Calcula el creep (desplazamiento hacia el lomo) para cada hoja
 * de un cuadernillo basado en el grosor del papel.
 * 
 * Fórmula: creep_i = (N - i) × grosor_papel × factor_acumulación
 * donde:
 *   N = número total de hojas en el cuadernillo
 *   i = índice de la hoja (0 = exterior, N-1 = interior)
 *   grosor_papel = grosor en mm (típicamente 0.05-0.15 mm)
 *   factor_acumulación = factor de ajuste (típicamente 0.5-1.0)
 */
export function calculateCreep(sheetIndex, totalSheets, paperThickness, accumulationFactor = 0.8) {
  return (totalSheets - 1 - sheetIndex) * paperThickness * accumulationFactor;
}

/**
 * Calcula el total de creep para un cuadernillo completo
 */
export function calculateTotalCreep(totalSheets, paperThickness, accumulationFactor = 0.8) {
  let total = 0;
  for (let i = 0; i < totalSheets; i++) {
    total += calculateCreep(i, totalSheets, paperThickness, accumulationFactor);
  }
  return total;
}

/**
 * Genera las páginas en blanco necesarias para completar un cuadernillo
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
 * Genera la imposición completa del libro
 * Retorna un array de cuadernillos, cada uno con sus hojas y páginas asignadas
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
  } = config;

  // Paso 1: Calcular páginas con blancos
  const padding = padPages(totalPages, pagesPerSignature, blankPagesStart, blankPagesEnd);
  const totalWithBlanks = padding.totalWithBlanks;

  // Paso 2: Generar array de páginas
  const pages = [];
  for (let i = 0; i < totalWithBlanks; i++) {
    const pageNum = i - padding.blankStart + 1;
    pages.push({
      index: i,
      pageNumber: pageNum,
      isBlank: i < padding.blankStart || i >= (totalWithBlanks - padding.blankEnd + blankPagesEnd - (padding.blankEnd - blankPagesEnd)),
      label: pageNum < 1 || pageNum > totalPages ? "BLANCO" : `${pageNum}`,
    });
  }

  // Simplificar la lógica de blancos
  for (let i = 0; i < pages.length; i++) {
    const pn = pages[i].pageNumber;
    pages[i].isBlank = pn < 1 || pn > totalPages;
    pages[i].label = pages[i].isBlank ? "BLANCO" : `${pn}`;
  }

  // Paso 3: Dividir en cuadernillos
  const numSignatures = totalWithBlanks / pagesPerSignature;
  const signatures = [];

  for (let sig = 0; sig < numSignatures; sig++) {
    const sigPages = pages.slice(sig * pagesPerSignature, (sig + 1) * pagesPerSignature);
    const sheetsPerSignature = pagesPerSignature / 4; // Cada hoja tiene 4 páginas (frente y dorso, 2 caras)
    const sheets = [];

    for (let sheet = 0; sheet < sheetsPerSignature; sheet++) {
      // Lógica de imposición: las páginas se emparejan de fuera hacia dentro
      // Hoja exterior: primera y última página del cuadernillo
      // Frente: [última, primera] | Dorso: [segunda, penúltima]
      const frontLeft = sigPages[pagesPerSignature - 1 - (sheet * 2)];
      const frontRight = sigPages[sheet * 2];
      const backLeft = sigPages[sheet * 2 + 1];
      const backRight = sigPages[pagesPerSignature - 2 - (sheet * 2)];

      const creepValue = calculateCreep(sheet, sheetsPerSignature, paperThickness, creepFactor);

      sheets.push({
        sheetIndex: sheet,
        creep: Math.round(creepValue * 1000) / 1000,
        front: {
          left: frontLeft,
          right: frontRight,
        },
        back: {
          left: backLeft,
          right: backRight,
        },
      });
    }

    // Marca de alzado: posición escalonada para verificar orden
    const collationOffset = sig * 4; // mm desde la parte superior del lomo

    signatures.push({
      signatureIndex: sig,
      signatureNumber: sig + 1,
      label: `Cuadernillo ${sig + 1}`,
      sheets,
      totalCreep: calculateTotalCreep(sheetsPerSignature, paperThickness, creepFactor),
      collationOffset,
      pageRange: {
        first: sigPages[0].label,
        last: sigPages[sigPages.length - 1].label,
      },
    });
  }

  return {
    config: { ...config, totalWithBlanks },
    padding,
    signatures,
    totalSignatures: numSignatures,
    totalSheets: numSignatures * (pagesPerSignature / 4),
  };
}

/**
 * Genera un resumen estadístico de la imposición
 */
export function getImpositionSummary(imposition) {
  const { signatures, config, padding } = imposition;
  const totalCreep = signatures.reduce((sum, sig) => sum + sig.totalCreep, 0);

  return {
    totalPages: config.totalPages,
    totalWithBlanks: config.totalWithBlanks,
    blankPagesAdded: padding.blankStart + padding.blankEnd,
    blankStart: padding.blankStart,
    blankEnd: padding.blankEnd,
    totalSignatures: signatures.length,
    pagesPerSignature: config.pagesPerSignature,
    sheetsPerSignature: config.pagesPerSignature / 4,
    totalSheets: imposition.totalSheets,
    totalCreepMm: Math.round(totalCreep * 100) / 100,
    avgCreepPerSheet: Math.round((totalCreep / imposition.totalSheets) * 1000) / 1000,
  };
}