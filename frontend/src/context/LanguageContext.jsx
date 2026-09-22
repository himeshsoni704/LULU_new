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
  "Call, message on WhatsApp, or leave a note — we respond with straight answers.": "اتصل بنا أو راسلنا عبر واتساب أو اترك رسالة — سنجيبك بوضوح.", "Phone & Fax": "الهاتف والفاكس", "Chat with us on WhatsApp": "تحدث معنا عبر واتساب", "Tel:": "هاتف:", "Fax:": "فاكس:", "Send a message": "إرسال رسالة", "We’ll get back to you": "سنعاود التواصل معك", "Message received": "تم استلام رسالتك", "Thank you": "شكراً لك", "Name": "الاسم", "Phone / WhatsApp": "الهاتف / واتساب", "Message": "الرسالة", "How can we help?": "كيف يمكننا مساعدتك؟", "Submit": "إرسال", "Sending...": "جارٍ الإرسال...", "Send": "إرسال", "Get in touch": "تواصل معنا", "Learn more": "اعرف المزيد", "View products": "عرض المنتجات", "Read more": "اقرأ المزيد", "Back": "رجوع", "Next": "التالي", "Previous": "السابق", "Close": "إغلاق", "Menu": "القائمة", "Open menu": "فتح القائمة", "Close menu": "إغلاق القائمة", "Loading": "جارٍ التحميل", "Required": "مطلوب", "Please wait": "يرجى الانتظار", "Thank you for your message.": "شكراً لرسالتك.", "Industrial Area #5, Sharjah": "المنطقة الصناعية رقم 5، الشارقة", "United Arab Emirates": "الإمارات العربية المتحدة", "Sharjah": "الشارقة", "UAE": "الإمارات العربية المتحدة", "All rights reserved.": "جميع الحقوق محفوظة.", "Follow us": "تابعنا", "Quick links": "روابط سريعة", "Quality": "الجودة", "Experience": "الخبرة", "Service": "الخدمة", "Reliable": "موثوق", "Supplied by quotation": "متوفر حسب عرض السعر", "Request quote": "اطلب عرض سعر", "View catalogue": "عرض الكتالوج", "Our story": "قصتنا", "Our products": "منتجاتنا", "Our services": "خدماتنا", "Industries": "القطاعات", "Company": "الشركة", "Details": "التفاصيل", "Category": "الفئة", "Quantity": "الكمية", "Price": "السعر", "Available": "متوفر", "Inquire": "استفسر", "Submit Request": "إرسال الطلب", "Get a quote": "احصل على عرض سعر", "Contact us": "تواصل معنا",   "Thank you": "شكراً لك", "Something went wrong. Please try again.": "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  "Product categories": "فئات المنتجات", "Product Catalogue": "كتالوج المنتجات", "Everything for the dispatch floor.": "كل ما تحتاجه لمنطقة الشحن.",
  "Product categories": "فئات المنتجات", "Product categories": "فئات المنتجات", "Search": "بحث", "Clear": "مسح", "product": "منتج", "products": "منتجات", "Reset filters": "إعادة تعيين الفلاتر",
  "No products match your search": "لا توجد منتجات تطابق بحثك", "Try a different term, or clear the filters to see the full catalogue.": "جرب كلمة أخرى أو امسح الفلاتر لعرض الكتالوج الكامل.",
  "Talk to the team.": "تحدث مع فريقنا.", "Call, message on WhatsApp, or leave a note — we respond with straight answers.": "اتصل بنا أو راسلنا عبر واتساب أو اترك رسالة — سنجيبك بوضوح.",
  "Your name": "اسمك", "Phone / WhatsApp": "الهاتف / واتساب", "Message": "الرسالة", "Send": "إرسال", "Sending...": "جارٍ الإرسال...", "Sending…": "جارٍ الإرسال…", "Submit": "إرسال",
  "About Al Lulu Packaging": "عن اللولو للتغليف", "Packaging experience built around business needs.": "خبرة في التغليف مصممة حول احتياجات الأعمال.",
  "Complete packaging, from Sharjah industry.": "تغليف متكامل من المنطقة الصناعية في الشارقة.", "Goods in, goods out": "استلام البضائع وتسليمها", "The complete catalogue": "الكتالوج المتكامل", "Business-to-business, always": "دائماً من شركة إلى شركة",
  "Packaging that works for your business.": "حلول تغليف تناسب أعمالك.", "Four families of packaging supply": "أربع فئات من مستلزمات التغليف", "From enquiry to supply": "من الاستفسار إلى التوريد",
  "Tell us what you pack": "أخبرنا بما تقوم بتغليفه", "We prepare a formal quotation": "نجهز عرض سعر رسمي", "You confirm, we supply": "تؤكد الطلب ونحن نوفره",
  "Industrial packaging, supplied with confidence.": "مواد تغليف صناعية يتم توريدها بثقة.", "Built for the way you work.": "مصممة لتناسب طريقة عملك.", "Our industries": "قطاعاتنا", "Food & beverage": "الأغذية والمشروبات", "Manufacturing": "التصنيع", "Construction": "الإنشاءات", "Retail & e-commerce": "التجزئة والتجارة الإلكترونية",
  "Home": "الرئيسية", "Products": "المنتجات", "What We Do": "ماذا نقدم", "Industries": "القطاعات", "About": "من نحن", "Contact": "تواصل معنا", "Request a Quote": "اطلب عرض سعر",
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
    let nextValue = source;
    if (isArabic) {
      const phrases = Object.entries(arabicTranslations).sort(([a], [b]) => b.length - a.length);
      phrases.forEach(([english, arabic]) => {
        if (!english.trim() || !nextValue.includes(english)) return;
        nextValue = nextValue.split(english).join(arabic);
      });
    }
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
