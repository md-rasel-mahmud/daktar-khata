import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import en from "./en.json"
import bn from "./bn.json"

const getSavedLanguage = () => {
  if (typeof window === "undefined") {
    return "en"
  }

  return localStorage.getItem("language") || "en"
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: getSavedLanguage(),
  supportedLngs: ["en", "bn"],
  fallbackLng: "en",
  debug: false,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
