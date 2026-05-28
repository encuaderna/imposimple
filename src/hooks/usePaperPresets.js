import { useState, useEffect } from "react";

const STORAGE_KEY = "imposicion_paper_presets";

export const DEFAULT_PRESETS = [
  { id: "offset_80",    name: "Offset 80",         gsm: 80,  thickness: 0.10, note: "Papel de oficina estándar" },
  { id: "offset_90",    name: "Offset 90",         gsm: 90,  thickness: 0.11, note: "Mayor blancura y opacidad" },
  { id: "book_70",      name: "Papel libro 70",    gsm: 70,  thickness: 0.09, note: "Ligero para novelas largas" },
  { id: "coated_115",   name: "Estucado 115",      gsm: 115, thickness: 0.12, note: "Fotografía e ilustración" },
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRESETS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PRESETS;
  }
}

function save(presets) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(presets)); } catch {}
}

export function usePaperPresets() {
  const [presets, setPresets] = useState(load);

  useEffect(() => { save(presets); }, [presets]);

  const add = (preset) => {
    const newPreset = { ...preset, id: `custom_${Date.now()}` };
    setPresets((prev) => [...prev, newPreset]);
    return newPreset;
  };

  const remove = (id) => setPresets((prev) => prev.filter((p) => p.id !== id));

  const update = (id, data) =>
    setPresets((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));

  const reset = () => setPresets(DEFAULT_PRESETS);

  return { presets, add, remove, update, reset };
}