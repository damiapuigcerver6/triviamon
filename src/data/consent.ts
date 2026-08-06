export type ConsentChoice = "accepted" | "rejected";

const KEY = "triviamon:cookie-consent";

export function loadConsent(): ConsentChoice | null {
  const raw = localStorage.getItem(KEY);
  return raw === "accepted" || raw === "rejected" ? raw : null;
}

export function saveConsent(choice: ConsentChoice): void {
  localStorage.setItem(KEY, choice);
}

/** Si hay que pedir anuncios personalizados a Google (solo relevante cuando AdSense este activo). */
export function hasAdConsent(): boolean {
  return loadConsent() === "accepted";
}
