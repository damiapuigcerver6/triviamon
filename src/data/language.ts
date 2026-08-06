export type Lang = "es" | "en";

const KEY = "triviamon:lang";

function detectBrowserLang(): Lang {
  const nav = typeof navigator !== "undefined" ? navigator.language : "es";
  return nav.toLowerCase().startsWith("es") ? "es" : "en";
}

export function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {
    // localStorage no disponible (modo privado, etc.)
  }
  return detectBrowserLang();
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // ignorar
  }
}
