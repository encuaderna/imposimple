import { useMemo } from "react";
import { PAGE_SIZES, BINDING_METHODS } from "@/lib/imposition-engine";

/**
 * Hook que valida la configuración de la imposición en tiempo real.
 * Retorna un array de validaciones con avisos y errores.
 */
export function useImpositionValidation(config, imposition, summary) {
  return useMemo(() => {
    const issues = [];

    // Sin configuración: no validar
    if (!config || !config.totalPages) return issues;

    // ── 1. Total de páginas insuficientes ──────────────────────────────
    if (config.totalPages < 4) {
      issues.push({
        type: "error",
        icon: "AlertTriangle",
        title: "Páginas insuficientes",
        message: "Necesitas mínimo 4 páginas para una imposición válida.",
      });
    }

    // ── 2. Páginas no divisibles por cuadernillo ──────────────────────
    if (config.totalPages >= 4 && !imposition) {
      issues.push({
        type: "error",
        icon: "AlertTriangle",
        title: "Configuración incompleta",
        message: "Completa los parámetros de formato y encuadernación.",
      });
    }

    if (imposition && summary) {
      // ── 3. Validación de creep ───────────────────────────────────────
      const totalCreep = summary.totalCreepMm;
      const pageSize = config.pageSize === "Custom"
        ? { width: config.customWidth, height: config.customHeight }
        : PAGE_SIZES[config.pageSize];

      const bleedEstimate = 3; // mm (estimado)
      const safeMargin = 5; // mm mínimo para marcas

      // Margen interior disponible en la hoja doblada (mitad del ancho)
      const interiorMargin = (pageSize.width / 2) - (bleedEstimate + safeMargin);

      if (totalCreep > interiorMargin * 0.8) {
        issues.push({
          type: "warning",
          icon: "AlertCircle",
          title: "Creep alto",
          message: `Creep acumulado (${totalCreep}mm) consume mucho margen. Riesgo de solapamiento en márgenes interiores.`,
        });
      }

      // ── 4. Grosor de papel fuera de rango ─────────────────────────────
      const paperThickness = config.paperThickness;
      if (paperThickness < 0.05) {
        issues.push({
          type: "warning",
          icon: "AlertCircle",
          title: "Papel muy fino",
          message: "Papel < 0.05mm es poco común. Verifica que sea correcto.",
        });
      }
      if (paperThickness > 0.3) {
        issues.push({
          type: "warning",
          icon: "AlertCircle",
          title: "Papel muy grueso",
          message: "Papel > 0.3mm (cartón) puede dificultar doblado y cosido.",
        });
      }

      // ── 5. Encuadernación incompatible ────────────────────────────────
      const numSignatures = summary.totalSignatures;
      const bindingMethod = config.bindingMethod;

      if (bindingMethod === "saddle_stitch" && numSignatures > 8) {
        issues.push({
          type: "warning",
          icon: "AlertCircle",
          title: "Grapado con muchos cuadernillos",
          message: `${numSignatures} cuadernillos es muy para grapado central. Recomendamos cosido o perfecta.`,
        });
      }

      if (bindingMethod === "perfect_bind" && numSignatures > 20) {
        issues.push({
          type: "warning",
          icon: "AlertCircle",
          title: "Demasiados cuadernillos para pegado",
          message: `${numSignatures} cuadernillos: el pegado puede no resistir. Considera cosido.`,
        });
      }

      // ── 6. Hojas por cuadernillo no estándar ──────────────────────────
      const pagesPerSig = config.pagesPerSignature;
      if (![8, 16, 32].includes(pagesPerSig) && config.signatureMode !== "custom") {
        issues.push({
          type: "info",
          icon: "Info",
          title: "Configuración no estándar",
          message: `${pagesPerSig} páginas por cuadernillo. Lo estándar es 8, 16 o 32.`,
        });
      }

      // ── 7. Creep vs grosor de papel ──────────────────────────────────
      // El creep esperado es ~grosor * factor
      const expectedCreepPerSheet = config.paperThickness * config.creepFactor * 0.1; // mm aproximado
      const actualCreepPerSheet = summary.avgCreepPerSheet;

      if (actualCreepPerSheet > expectedCreepPerSheet * 2) {
        issues.push({
          type: "info",
          icon: "Info",
          title: "Creep alto para este grosor",
          message: `Creep promedio (${actualCreepPerSheet}mm/hoja) superior a lo esperado. Aumenta grosor o reduce factor.`,
        });
      }

      // ── 8. Sangrado vs creep ──────────────────────────────────────────
      // Si sangrado < creep total, habrá problemas al recortar
      if (bleedEstimate < totalCreep * 0.5) {
        issues.push({
          type: "warning",
          icon: "AlertCircle",
          title: "Sangrado insuficiente",
          message: `Creep de ${totalCreep}mm requiere sangrado mayor. Aumenta sangrado en exportación a ≥${Math.ceil(totalCreep + 2)}mm.`,
        });
      }

      // ── 9. Cuadernillos imposibles ───────────────────────────────────
      // Si páginas totales no es divisible por páginas por cuadernillo
      const remainingPages = config.totalPages % config.pagesPerSignature;
      if (remainingPages !== 0 && config.blankPagesEnd === 0 && config.blankPagesStart === 0) {
        const blanksNeeded = config.pagesPerSignature - remainingPages;
        issues.push({
          type: "warning",
          icon: "AlertCircle",
          title: "Páginas en blanco necesarias",
          message: `${config.totalPages} págs no es múltiplo de ${config.pagesPerSignature}. Necesitas ${blanksNeeded} págs en blanco al final.`,
        });
      }

      // ── 10. Factor creep muy alto ────────────────────────────────────
      if (config.creepFactor > 1) {
        issues.push({
          type: "info",
          icon: "Info",
          title: "Factor creep elevado",
          message: "Factor > 1.0 es conservador. Estándar es 0.8.",
        });
      }
    }

    return issues;
  }, [config, imposition, summary]);
}