import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { loadLang, saveLang, type Lang } from "../data/language";
import { STRINGS_ES, STRINGS_EN, type Strings } from "./strings";

interface LanguageCtx {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Strings;
}

const LanguageContext = createContext<LanguageCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(next: Lang) {
    setLangState(next);
    saveLang(next);
  }

  const t = lang === "en" ? STRINGS_EN : STRINGS_ES;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageCtx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  return ctx;
}
