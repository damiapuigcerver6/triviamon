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
    <div className="cookie-overlay" role="dialog" aria-modal="true" aria-live="polite">
      <div className="cookie-card">
        <img src="/brand/wordmark.png" alt="Triviamon" className="cookie-logo" />
        <h3 className="cookie-title">{t.cookieBanner.title}</h3>

        <ul className="cookie-purposes">
          <li>
            <span className="cookie-icon" aria-hidden="true">
              🎯
            </span>
            {t.cookieBanner.purposeAds}
          </li>
          <li>
            <span className="cookie-icon" aria-hidden="true">
              📱
            </span>
            {t.cookieBanner.purposeStorage}
          </li>
        </ul>

        <p className="cookie-detail">{t.cookieBanner.detail}</p>

        <div className="cookie-actions">
          <button type="button" className="cookie-btn" onClick={() => setChoice("rejected")}>
            {t.cookieBanner.reject}
          </button>
          <button type="button" className="cookie-btn cookie-btn--primary" onClick={() => setChoice("accepted")}>
            {t.cookieBanner.accept}
          </button>
        </div>

        <Link to="/privacidad" className="cookie-learn-more">
          {t.cookieBanner.learnMore}
        </Link>
      </div>
    </div>
  );
}
