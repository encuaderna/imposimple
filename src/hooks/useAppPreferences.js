import { useState, useEffect } from "react";

const STORAGE_KEY = "imposicion_prefs";

const DEFAULTS = {
  dyslexicFont: false,
  focusMode: false,
  highContrast: false,
  textScale: 1.0,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function save(prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

export function useAppPreferences() {
  const [prefs, setPrefs] = useState(load);

  // Persiste cada vez que cambian
  useEffect(() => {
    save(prefs);
  }, [prefs]);

  const update = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));
  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return { prefs, update, toggle };
}