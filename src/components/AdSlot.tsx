import { useEffect, useRef } from "react";
import { adsenseEnabled } from "../ads/loadAdsense";
import "./AdSlot.css";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface Props {
  slot: string;
  className?: string;
}

/** Hueco de anuncio manual. No renderiza nada mientras no haya un client ID de AdSense configurado. */
export default function AdSlot({ slot, className }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!adsenseEnabled() || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // El script de AdSense aun no cargo (o un bloqueador de anuncios lo impidio).
    }
  }, []);

  if (!adsenseEnabled()) return null;

  return (
    <ins
      className={`adsbygoogle ad-slot ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
