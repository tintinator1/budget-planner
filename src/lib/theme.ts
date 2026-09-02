export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function subscribeToTheme(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function saveTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
  saveTheme(theme);
  notifyListeners();
}

export function toggleTheme() {
  setTheme(getThemeSnapshot() === "dark" ? "light" : "dark");
}

export function initThemeFromStorage() {
  const theme = getStoredTheme() ?? getSystemTheme();
  applyTheme(theme);
}
