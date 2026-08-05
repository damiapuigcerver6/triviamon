export type Theme = "light" | "dark";

const KEY = "triviamon:theme";

export function loadTheme(): Theme {
  const stored = localStorage.getItem(KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEY, theme);
}
