import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/translation.json";
import fr from "./locales/fr/translation.json";

i18n
  .use(LanguageDetector) // optional: auto-detect language (fallback below)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // react already safe
    },
    detection: {
      // order/sources to detect language; tweak if needed
      order: ["querystring", "localStorage", "navigator", "htmlTag", "path", "subdomain"],
      caches: ["localStorage"],
    },
  });

export default i18n;