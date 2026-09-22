import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const translations = {
  en: {
    Home: "Home",
    Products: "Products",
    "What We Do": "What We Do",
    Industries: "Industries",
    About: "About",
    Contact: "Contact",
    "Request a Quote": "Request a Quote",
    "Chat with us on WhatsApp": "Chat with us on WhatsApp",
    "Language: English": "Language: English",
    "Switch to Arabic": "Switch to Arabic",
  },
  ar: {
    Home: "الرئيسية",
    Products: "المنتجات",
    "What We Do": "خدماتنا",
    Industries: "القطاعات",
    About: "من نحن",
    Contact: "تواصل معنا",
    "Request a Quote": "اطلب عرض سعر",
    "Chat with us on WhatsApp": "تواصل معنا عبر واتساب",
    "Language: English": "اللغة: الإنجليزية",
    "Switch to Arabic": "التبديل إلى العربية",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    window.localStorage.setItem("al-lulu-language", language);
  }, [language, isArabic]);

  const value = useMemo(() => ({
    language,
    isArabic,
    toggleLanguage: () => setLanguage((current) => current === "en" ? "ar" : "en"),
    t: (key) => translations[language][key] || key,
  }), [language, isArabic]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
