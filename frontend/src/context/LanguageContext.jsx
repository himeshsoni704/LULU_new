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
  "Product Catalogue": "كتالوج المنتجات", "Everything for the dispatch floor.": "كل ما تحتاجه لمنطقة الشحن.",
  "The Al Lulu catalogue — corrugated products, boxes, tapes, protective films and accessories, supplied by quotation.": "كتالوج اللولو — منتجات الكرتون المموج والصناديق والأشرطة والأفلام الواقية والملحقات، متوفرة حسب عرض السعر.",
  "Product categories": "فئات المنتجات", "Search products…": "ابحث عن المنتجات…", "Search products": "البحث عن المنتجات", "Clear search": "مسح البحث",
  "No products match your search": "لا توجد منتجات تطابق بحثك", "Try a different term, or clear the filters to see the full catalogue.": "جرب كلمة أخرى أو امسح الفلاتر لعرض الكتالوج الكامل.", "Reset filters": "إعادة تعيين الفلاتر",
  "About Al Lulu Packaging": "عن اللولو للتغليف", "Packaging experience built around business needs.": "خبرة في التغليف مصممة حول احتياجات الأعمال.",
  "The company": "الشركة", "Complete packaging, from Sharjah industry.": "تغليف متكامل من المنطقة الصناعية في الشارقة.", "Our facility": "منشأتنا", "Our operations": "عملياتنا", "Goods in, goods out": "استلام البضائع وتسليمها",
  "Dependable supply": "توريد موثوق", "The complete catalogue": "الكتالوج المتكامل", "Business-to-business, always": "دائماً من شركة إلى شركة",
  "What We Do": "ماذا نقدم", "Packaging that works for your business.": "حلول تغليف تناسب أعمالك.", "Capabilities": "قدراتنا", "Four families of packaging supply": "أربع فئات من مستلزمات التغليف", "Browse range": "تصفح المجموعة", "How quoting works": "كيف يعمل التسعير", "From enquiry to supply": "من الاستفسار إلى التوريد",
  "Tell us what you pack": "أخبرنا بما تقوم بتغليفه", "We prepare a formal quotation": "نجهز عرض سعر رسمي", "You confirm, we supply": "تؤكد الطلب ونحن نوفره",
  Contact: "تواصل معنا", "Talk to the team.": "تحدث مع فريقنا.", "Contact": "تواصل", "Address": "العنوان", "Phone & Fax": "الهاتف والفاكس", "WhatsApp": "واتساب", "Email": "البريد الإلكتروني", "Send a message": "أرسل رسالة", "We'll get back to you": "سنعاود التواصل معك", "Message received": "تم استلام الرسالة", "Thank you. Our team will get back to you shortly.": "شكراً لك. سيتواصل معك فريقنا قريباً.", "Continue browsing": "متابعة التصفح", "Your name": "اسمك", "How can we help?": "كيف يمكننا مساعدتك؟", "Sending…": "جارٍ الإرسال…",
};

const translations = { en: {}, ar: arabicTranslations };
const originalText = new WeakMap();
const originalAttributes = new WeakMap();

function translatePage() {
  const isArabic = document.documentElement.matches('[dir="rtl"]');
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    if (node.parentElement?.closest("script, style, input, textarea")) return;
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const source = originalText.get(node);
    const normalized = source.trim().replace(/\s+/g, " ");
    if (!normalized) return;
    const translated = isArabic ? arabicTranslations[normalized] : undefined;
    const nextValue = isArabic && translated ? source.replace(normalized, translated) : source;
    if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
  });

  document.querySelectorAll("[aria-label], [title], input[placeholder], textarea[placeholder]").forEach((element) => {
    ["aria-label", "title", "placeholder"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value == null) return;
      if (!originalAttributes.has(element)) originalAttributes.set(element, {});
      const attributes = originalAttributes.get(element);
      if (!(attribute in attributes)) attributes[attribute] = value;
      const source = attributes[attribute];
      const normalized = source.replace(/\s+/g, " ");
      const translated = isArabic ? arabicTranslations[normalized] : undefined;
      element.setAttribute(attribute, isArabic && translated ? translated : source);
    });
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
    toggleLanguage: () => {
      const nextLanguage = language === "en" ? "ar" : "en";
      window.localStorage.setItem("al-lulu-language", nextLanguage);
      window.location.reload();
    },
    t: (key) => translations[language][key] || key,
  }), [language, isArabic]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
