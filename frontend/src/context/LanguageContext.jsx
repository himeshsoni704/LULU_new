import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const arabicTranslations = {
  Home: "الرئيسية", Products: "المنتجات", "What We Do": "خدماتنا", Industries: "القطاعات", About: "من نحن", Contact: "تواصل معنا",
  "Request a Quote": "اطلب عرض سعر", "Chat with us on WhatsApp": "تواصل معنا عبر واتساب", "Language: English": "اللغة: الإنجليزية", "Switch to Arabic": "التبديل إلى العربية",
  Packaging: "حلول التغليف", Solutions: "مصممة", "Built for": "مصممة من أجل", Business: "الأعمال",
  "Explore Products": "استكشف المنتجات", Scroll: "مرر", Trust: "ثقة", "Trusted by businesses across industries": "تحظى بثقة الشركات في مختلف القطاعات",
  Catalogue: "الكتالوج", "Our products": "منتجاتنا", "Browse the full catalogue": "تصفح الكتالوج الكامل", Applications: "التطبيقات", "Where our packaging goes": "أين تصل منتجات التغليف لدينا",
  "All industries": "جميع القطاعات", "Find us": "موقعنا", "Our location": "موقعنا", "Open in Google Maps": "فتح في خرائط جوجل",
  "What we do": "خدماتنا", "Packaging that works for your business": "تغليف يناسب أعمالك", "One supplier. The full range.": "مورد واحد. تشكيلة كاملة.",
  "Meet Rocky — Al Lulu Packaging Assistant": "تعرّف على روكي — مساعد اللولو للتغليف", "Not sure which product you need? Rocky will point you to the right one.": "غير متأكد من المنتج الذي تحتاجه؟ سيساعدك روكي في اختيار المنتج المناسب.",
  "Ask Rocky": "اسأل روكي", "Warehouse stock — Sharjah": "مخزون المستودع — الشارقة", "Kraft corrugated, sealed & ready": "كرتون كرافت مموج، جاهز ومغلق",
  "Reliable packaging solutions for businesses across the UAE, backed by quality, experience and dependable service.": "حلول تغليف موثوقة للشركات في جميع أنحاء الإمارات، مدعومة بالجودة والخبرة والخدمة الموثوقة.",
  "Selected names from our client register, as supplied by Al Lulu Packaging.": "أسماء مختارة من سجل عملائنا كما قدمتها شركة اللولو للتغليف.",
  "Client names shown as supplied by Al Lulu Packaging. No partnership, certification or endorsement is implied.": "أسماء العملاء معروضة كما قدمتها شركة اللولو للتغليف. لا يشير ذلك إلى شراكة أو اعتماد أو تأييد.",
  "Al Lulu Packaging supplies the full spread of industrial packaging materials from our base in Sharjah — for factories, contractors, traders and food businesses across the UAE.": "توفر شركة اللولو للتغليف مجموعة واسعة من مواد التغليف الصناعية من مقرها في الشارقة — للمصانع والمقاولين والتجار وشركات الأغذية في جميع أنحاء الإمارات.",
  "Corrugated & Paper": "الكرتون والورق", Boxes: "الصناديق", "Tapes & Strapping": "الأشرطة والربط", "Protective & Films": "الحماية والأفلام",
  All: "الكل", "Phone": "الهاتف", Email: "البريد الإلكتروني", Address: "العنوان", "Send Message": "إرسال الرسالة", "Submit Request": "إرسال الطلب",
  "Switch to English": "التبديل إلى الإنجليزية", "Language: Arabic": "اللغة: العربية", "Something went wrong": "حدث خطأ ما", Reload: "إعادة تحميل",
};

const translations = { en: {}, ar: arabicTranslations };

function translatePage() {
  if (!document.documentElement.matches('[dir="rtl"]')) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const value = node.nodeValue.trim();
    if (!value || !arabicTranslations[value] || node.parentElement?.closest("script, style, input, textarea")) return;
    node.nodeValue = node.nodeValue.replace(value, arabicTranslations[value]);
  });
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => window.localStorage.getItem("al-lulu-language") || "en");
  const isArabic = language === "ar";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    window.localStorage.setItem("al-lulu-language", language);
    if (isArabic) {
      const frame = requestAnimationFrame(translatePage);
      const observer = new MutationObserver(() => translatePage());
      observer.observe(document.body, { childList: true, subtree: true });
      return () => { cancelAnimationFrame(frame); observer.disconnect(); };
    }
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
