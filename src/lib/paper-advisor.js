/**
 * Asesor de papel: sugiere gramaje y tipo ideal según encuadernación y páginas.
 * Basado en estándares editoriales de la industria gráfica.
 */

// Rangos de páginas para cada encuadernación (máx. razonables)
// saddle_stitch: hasta ~96 págs — cuadernillo completo
// perfect_bind / unsewn: cualquier cantidad, lomo requiere mínimo grosor
// sewn / section_sewn: clásico, ideal 80–400 págs

const PAPER_DB = [
  // { id, label, gsm, type, thickness, description, pros, cons }
  { id: "offset_80",   gsm: 80,  type: "Offset estándar",   thickness: 0.10, description: "El papel de oficina habitual" },
  { id: "offset_90",   gsm: 90,  type: "Offset mejorado",   thickness: 0.11, description: "Ligeramente más rígido y blanco" },
  { id: "offset_100",  gsm: 100, type: "Offset superior",   thickness: 0.12, description: "Mayor opacidad, menos transparencia" },
  { id: "book_70",     gsm: 70,  type: "Papel libro",       thickness: 0.09, description: "Ligero y económico, para novelas largas" },
  { id: "book_60",     gsm: 60,  type: "Papel libro fino",  thickness: 0.08, description: "Muy ligero, ideal para biblias y diccionarios" },
  { id: "coated_90",   gsm: 90,  type: "Estucado mate",     thickness: 0.10, description: "Superficie suave, ideal para fotografía" },
  { id: "coated_115",  gsm: 115, type: "Estucado brillante",thickness: 0.12, description: "Alta fidelidad de color, catálogos" },
  { id: "coated_135",  gsm: 135, type: "Estucado pesado",   thickness: 0.14, description: "Revistas y libros de arte premium" },
  { id: "recycled_80", gsm: 80,  type: "Reciclado 80",      thickness: 0.11, description: "Sostenible, tono cálido ligeramente amarillento" },
  { id: "uncoated_120",gsm: 120, type: "Offset grueso",     thickness: 0.14, description: "Para libros infantiles o de tapa dura" },
];

/**
 * Devuelve una recomendación con nivel de alerta, sugerencias de gramaje y notas.
 *
 * @param {string} bindingMethod   — clave de BINDING_METHODS
 * @param {number} totalPages      — total de páginas del documento
 * @param {number} pagesPerSignature — páginas por cuadernillo
 * @returns {{ level: "ok"|"warning"|"error", title, message, suggestions: [], note }}
 */
export function getPaperRecommendation(bindingMethod, totalPages, pagesPerSignature = 16) {
  if (!bindingMethod || !totalPages || totalPages < 4) return null;

  const sheetsPerSig = pagesPerSignature / 4;

  switch (bindingMethod) {

    case "saddle_stitch": {
      // Grapado — máx 96 págs, mínimo grosor para no reventar la grapa
      if (totalPages > 96) {
        return {
          level: "error",
          title: "Demasiadas páginas para grapado",
          message: `Con ${totalPages} páginas el grapado a caballete no es viable (máx. recomendado: 96 págs). El lomo se abrirá y las grapas no aguantarán.`,
          suggestions: [
            { ...PAPER_DB.find(p => p.id === "offset_80"), reason: "Mínimo posible para reducir grosor del lomo" },
            { ...PAPER_DB.find(p => p.id === "book_70"), reason: "Papel libro ligero para minimizar problemas" },
          ],
          note: "Considera cambiar a encuadernación perfecta o cosido.",
          suggestedThickness: 0.09,
        };
      }
      if (totalPages > 64) {
        return {
          level: "warning",
          title: "Cerca del límite para grapado",
          message: `${totalPages} páginas es posible pero ajustado para grapado. Usa papel fino para evitar que el lomo reviente.`,
          suggestions: [
            { ...PAPER_DB.find(p => p.id === "book_70"), reason: "Ideal: ligero y manejable para grapado grueso" },
            { ...PAPER_DB.find(p => p.id === "book_60"), reason: "Máxima ligereza si el libro tiene imagen en cada página" },
          ],
          note: "Papel de 70–80 g/m² es el más recomendado.",
          suggestedThickness: 0.09,
        };
      }
      return {
        level: "ok",
        title: "Grapado viable",
        message: `${totalPages} páginas es un tamaño ideal para grapado a caballete.`,
        suggestions: [
          { ...PAPER_DB.find(p => p.id === "offset_90"), reason: "Estándar para folletos y revistas finas" },
          { ...PAPER_DB.find(p => p.id === "coated_90"), reason: "Si incluye fotografías o ilustraciones" },
          { ...PAPER_DB.find(p => p.id === "offset_80"), reason: "Opción económica, muy habitual" },
        ],
        note: null,
        suggestedThickness: 0.10,
      };
    }

    case "perfect_bind":
    case "unsewn": {
      // Encuadernación perfecta — necesita lomo mínimo de ~3 mm
      const spineEstimatedMm = (totalPages / 2) * 0.10; // estimado con 80 gsm
      if (totalPages < 48) {
        return {
          level: "warning",
          title: "Lomo demasiado delgado para perfecta",
          message: `Con ${totalPages} páginas el lomo estimado es ~${spineEstimatedMm.toFixed(1)} mm, insuficiente para encuadernación perfecta (mínimo recomendado: 5 mm / ~100 págs).`,
          suggestions: [
            { ...PAPER_DB.find(p => p.id === "coated_115"), reason: "Mayor grosor por hoja para aumentar el lomo" },
            { ...PAPER_DB.find(p => p.id === "uncoated_120"), reason: "Papel grueso para lomo más sólido" },
          ],
          note: "Considera grapado a caballete para documentos tan cortos.",
          suggestedThickness: 0.12,
        };
      }
      if (totalPages > 400) {
        return {
          level: "warning",
          title: "Libro muy pesado para encuadernación perfecta",
          message: `Con ${totalPages} páginas el libro puede ser demasiado pesado. El pegamento hot-melt puede fallar con el tiempo.`,
          suggestions: [
            { ...PAPER_DB.find(p => p.id === "book_60"), reason: "Mínimo gramaje para reducir peso y grosor del lomo" },
            { ...PAPER_DB.find(p => p.id === "book_70"), reason: "Balance óptimo peso/opacidad" },
          ],
          note: "Para libros >400 páginas se recomienda cosido (sewn).",
          suggestedThickness: 0.09,
        };
      }
      return {
        level: "ok",
        title: "Encuadernación perfecta viable",
        message: `${totalPages} páginas es adecuado. Lomo estimado: ~${spineEstimatedMm.toFixed(1)} mm.`,
        suggestions: [
          { ...PAPER_DB.find(p => p.id === "offset_90"), reason: "Offset mejorado: buen balance para texto" },
          { ...PAPER_DB.find(p => p.id === "coated_90"), reason: "Para libros con imágenes o ilustraciones" },
          { ...PAPER_DB.find(p => p.id === "book_70"), reason: "Para novelas largas donde importa el peso" },
        ],
        note: null,
        suggestedThickness: 0.10,
      };
    }

    case "sewn":
    case "section_sewn": {
      // Cosido — durabilidad máxima, aguanta cualquier gramaje razonable
      if (totalPages < 32) {
        return {
          level: "warning",
          title: "Pocos cuadernillos para cosido",
          message: `Con ${totalPages} páginas hay muy pocos cuadernillos. El cosido es más eficiente y rentable con libros de más de 64 páginas.`,
          suggestions: [
            { ...PAPER_DB.find(p => p.id === "offset_100"), reason: "Papel de calidad que justifica el proceso de cosido" },
            { ...PAPER_DB.find(p => p.id === "coated_90"), reason: "Para ilustraciones premium" },
          ],
          note: "Para libros tan cortos considera grapado o perfecta.",
          suggestedThickness: 0.11,
        };
      }
      if (totalPages > 400 && sheetsPerSig > 4) {
        return {
          level: "warning",
          title: "Cuadernillos muy gruesos",
          message: `Con ${sheetsPerSig} hojas/cuadernillo y ${totalPages} páginas, cada plica puede quedar rígida y difícil de coser. Reduce a 4 hojas (16 págs) por cuadernillo.`,
          suggestions: [
            { ...PAPER_DB.find(p => p.id === "book_70"), reason: "Ligero para cuadernillos gruesos" },
            { ...PAPER_DB.find(p => p.id === "offset_80"), reason: "Estándar económico para textos largos" },
          ],
          note: "Reduce páginas por cuadernillo a 16 para mejor manejo.",
          suggestedThickness: 0.09,
        };
      }
      return {
        level: "ok",
        title: "Cosido: configuración excelente",
        message: `${totalPages} páginas cosidas es la opción más duradera. Compatible con una amplia gama de gramajes.`,
        suggestions: [
          { ...PAPER_DB.find(p => p.id === "offset_90"), reason: "El más usado en libros cosidos de calidad editorial" },
          { ...PAPER_DB.find(p => p.id === "offset_100"), reason: "Para libros de mayor presencia y opacidad" },
          { ...PAPER_DB.find(p => p.id === "coated_90"), reason: "Para libros ilustrados cosidos" },
          { ...PAPER_DB.find(p => p.id === "book_70"), reason: "Para novelas o libros de texto muy extensos" },
        ],
        note: null,
        suggestedThickness: 0.10,
      };
    }

    default:
      return null;
  }
}