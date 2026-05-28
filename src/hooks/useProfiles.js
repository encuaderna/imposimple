import { useState, useCallback } from "react";

const STORAGE_KEY = "imposition_profiles";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function useProfiles() {
  const [profiles, setProfiles] = useState(load);

  const save = useCallback((name, config) => {
    const updated = [...load().filter((p) => p.name !== name), { name, config, savedAt: Date.now() }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfiles(updated);
  }, []);

  const remove = useCallback((name) => {
    const updated = load().filter((p) => p.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfiles(updated);
  }, []);

  return { profiles, save, remove };
}