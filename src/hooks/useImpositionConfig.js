import { useState, useEffect } from "react";
import { TECHNICAL_MARKS } from "@/lib/imposition-engine";

const CONFIG_KEY = "imposicion_config";
const MARKS_KEY = "imposicion_marks";

export const DEFAULT_CONFIG = {
  name: "",
  totalPages: 128,
  pageSize: "A5",
  customWidth: 148,
  customHeight: 210,
  bindingMethod: "sewn",
  pagesPerSignature: 16,
  paperThickness: 0.1,
  creepFactor: 0.8,
  blankPagesStart: 0,
  blankPagesEnd: 0,
  printSides: "double",
  pageFormat: "quarto",
  alternatePage: false,
  signatureMode: "standard",
  sheetsPerSig: 2,
};

export const DEFAULT_MARKS = Object.fromEntries(
  Object.entries(TECHNICAL_MARKS).map(([key, mark]) => [key, mark.defaultEnabled])
);

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function useImpositionConfig() {
  const [config, setConfig] = useState(() => loadJSON(CONFIG_KEY, DEFAULT_CONFIG));
  const [marksConfig, setMarksConfig] = useState(() => loadJSON(MARKS_KEY, DEFAULT_MARKS));

  useEffect(() => {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(config)); } catch {}
  }, [config]);

  useEffect(() => {
    try { localStorage.setItem(MARKS_KEY, JSON.stringify(marksConfig)); } catch {}
  }, [marksConfig]);

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setMarksConfig(DEFAULT_MARKS);
  };

  return { config, setConfig, marksConfig, setMarksConfig, resetConfig };
}