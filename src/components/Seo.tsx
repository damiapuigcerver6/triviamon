import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://triviamon.mdlabs.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/og-image.png`;

interface SeoProps {
  title: string;
  description: string;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Actualiza title/meta de la pagina actual. No renderiza nada. */
export default function Seo({ title, description }: SeoProps) {
  const location = useLocation();

  useEffect(() => {
    const url = `${SITE_URL}${location.pathname}`;
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:site_name", "Triviamon");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", DEFAULT_OG_IMAGE);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
    setCanonical(url);
  }, [title, description, location.pathname]);

  return null;
}
