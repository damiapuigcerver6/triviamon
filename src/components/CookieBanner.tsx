import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { loadConsent, saveConsent, type ConsentChoice } from "../data/consent";
import { initAdsense } from "../ads/loadAdsense";
import "./CookieBanner.css";

export default function CookieBanner() {
  const { t } = useLanguage();
  const [choice, setChoice] = useState<ConsentChoice | null>(() => loadConsent());

  useEffect(() => {
    if (!choice) return;
    saveConsent(choice);
    if (choice === "accepted") initAdsense();
  }, [choice]);

  if (choice) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite">
      <p>
        {t.cookieBanner.message}{" "}
        <Link to="/privacidad">{t.cookieBanner.learnMore}</Link>
      </p>
      <div className="cookie-banner-actions">
        <button type="button" className="cookie-btn" onClick={() => setChoice("rejected")}>
          {t.cookieBanner.reject}
        </button>
        <button type="button" className="cookie-btn cookie-btn--primary" onClick={() => setChoice("accepted")}>
          {t.cookieBanner.accept}
        </button>
      </div>
    </div>
  );
}
