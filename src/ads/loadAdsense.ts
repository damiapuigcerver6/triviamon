import { hasAdConsent } from "../data/consent";

const CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID;

let loaded = false;

export function adsenseEnabled(): boolean {
  return Boolean(CLIENT_ID);
}

/** Inyecta el script de AdSense solo si hay un client ID configurado y el usuario acepto anuncios. */
export function initAdsense(): void {
  if (loaded || !CLIENT_ID || !hasAdConsent()) return;
  loaded = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT_ID}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}
