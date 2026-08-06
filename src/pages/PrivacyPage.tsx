import { useLanguage } from "../i18n/LanguageContext";
import Seo from "../components/Seo";
import "./PrivacyPage.css";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const p = t.privacy;

  return (
    <div className="privacy-page">
      <Seo title={`${p.title} · Triviamon`} description={p.introBody} />
      <h1>{p.title}</h1>
      <p className="privacy-updated">{p.lastUpdated}</p>
      <p>{p.introBody}</p>

      <h2>{p.dataTitle}</h2>
      <p>{p.dataBody}</p>

      <h2>{p.cookiesTitle}</h2>
      <p>{p.cookiesBody}</p>

      <h2>{p.adsTitle}</h2>
      <p>{p.adsBody}</p>

      <h2>{p.hostingTitle}</h2>
      <p>{p.hostingBody}</p>

      <h2>{p.childrenTitle}</h2>
      <p>{p.childrenBody}</p>

      <h2>{p.changesTitle}</h2>
      <p>{p.changesBody}</p>

      <h2>{p.contactTitle}</h2>
      <p>{p.contactBody}</p>
    </div>
  );
}
