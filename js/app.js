import { siteConfig } from "./site-config.js";

const STORAGE_KEY = "site.lang";
const SUPPORTED_LANGS = ["en", "ar"];
const FALLBACK_LANG = "en";
const warnedMessages = new Set();

let currentLang = FALLBACK_LANG;
let siteContent = null;

function warnOnce(message) {
  if (warnedMessages.has(message)) {
    return;
  }

  warnedMessages.add(message);
  console.warn(message);
}

function normalizeLang(input) {
  if (typeof input !== "string") {
    return null;
  }

  const value = input.toLowerCase().trim();
  if (value.startsWith("ar")) {
    return "ar";
  }

  if (value.startsWith("en")) {
    return "en";
  }

  return null;
}

function pickLocalized(value, lang, label) {
  if (typeof value === "string") {
    return value;
  }

  if (!value || typeof value !== "object") {
    warnOnce(`[content] Invalid localized field: ${label}`);
    return "";
  }

  const localized = value[lang];
  if (typeof localized === "string" && localized.trim().length > 0) {
    return localized;
  }

  const fallback = value[FALLBACK_LANG];
  if (typeof fallback === "string" && fallback.trim().length > 0) {
    warnOnce(`[content] Missing ${lang} value for ${label}. Fallback ${FALLBACK_LANG} used.`);
    return fallback;
  }

  warnOnce(`[content] Missing localized values for ${label}.`);
  return "";
}

function getInitialLanguage() {
  let stored = null;
  try {
    stored = normalizeLang(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    warnOnce("[i18n] localStorage is unavailable. Browser language will be used.");
  }

  if (stored && SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }

  const browser = normalizeLang(navigator.language || "");
  if (browser && SUPPORTED_LANGS.includes(browser)) {
    return browser;
  }

  const configured = normalizeLang(siteConfig.defaultLang);
  if (configured && SUPPORTED_LANGS.includes(configured)) {
    return configured;
  }

  return FALLBACK_LANG;
}

async function loadContent() {
  const path = (siteConfig.contentPath || "content/site-content.json").trim();

  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    warnOnce(`[content] Failed to load ${path}. ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
}

function setMetaContent(selector, content) {
  const node = document.querySelector(selector);
  if (!node) {
    warnOnce(`[seo] Missing meta tag: ${selector}`);
    return;
  }

  node.setAttribute("content", content);
}

function getRuntimeSiteUrl() {
  const contentSiteUrl = (siteContent?.settings?.siteUrl || "").trim();
  if (contentSiteUrl) {
    return contentSiteUrl;
  }

  const fallbackSiteUrl = (siteConfig.seo?.siteUrl || "").trim();
  if (fallbackSiteUrl) {
    return fallbackSiteUrl;
  }

  return "https://example.com/";
}

function getRuntimeGa4MeasurementId() {
  const contentGa4 = (siteContent?.settings?.ga4MeasurementId || "").trim();
  if (contentGa4) {
    return contentGa4;
  }

  return (siteConfig.analytics?.ga4MeasurementId || "").trim();
}

function buildTranslationMap(lang) {
  if (!siteContent) {
    return {};
  }

  return {
    "header.logo": pickLocalized(siteContent.branding?.logo, lang, "branding.logo"),
    "header.lang": pickLocalized(siteContent.branding?.languageToggle, lang, "branding.languageToggle"),
    "hero.title": pickLocalized(siteContent.hero?.title, lang, "hero.title"),
    "hero.subtitle": pickLocalized(siteContent.hero?.subtitle, lang, "hero.subtitle"),
    "hero.cta": pickLocalized(siteContent.hero?.cta, lang, "hero.cta"),
    "about.title": pickLocalized(siteContent.about?.title, lang, "about.title"),
    "about.text1": pickLocalized(siteContent.about?.text1, lang, "about.text1"),
    "about.text2": pickLocalized(siteContent.about?.text2, lang, "about.text2"),
    "services.title": pickLocalized(siteContent.services?.title, lang, "services.title"),
    "benefits.title": pickLocalized(siteContent.benefits?.title, lang, "benefits.title"),
    "testimonials.title": pickLocalized(siteContent.testimonials?.title, lang, "testimonials.title"),
    "contact.title": pickLocalized(siteContent.contact?.title, lang, "contact.title"),
    "contact.text": pickLocalized(siteContent.contact?.text, lang, "contact.text"),
    "contact.whatsapp": pickLocalized(siteContent.contact?.whatsapp, lang, "contact.whatsapp"),
    "contact.call": pickLocalized(siteContent.contact?.call, lang, "contact.call"),
    "contact.hours": pickLocalized(siteContent.contact?.hours, lang, "contact.hours"),
    "contact.location": pickLocalized(siteContent.contact?.location, lang, "contact.location"),
    "footer.copyright": pickLocalized(siteContent.footer?.copyright, lang, "footer.copyright"),
    "footer.disclaimer": pickLocalized(siteContent.footer?.disclaimer, lang, "footer.disclaimer")
  };
}

function applyTextTranslations(lang) {
  const map = buildTranslationMap(lang);
  const nodes = document.querySelectorAll("[data-i18n]");

  nodes.forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) {
      return;
    }

    if (!Object.prototype.hasOwnProperty.call(map, key)) {
      warnOnce(`[i18n] No mapped content for key: ${key}`);
      return;
    }

    node.textContent = map[key];
  });
}

function applyDocumentDirection(lang) {
  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === "ar" ? "rtl" : "ltr";
}

function renderServices(lang) {
  const container = document.querySelector('[data-list="services"]');
  const items = siteContent?.services?.items;

  if (!container || !Array.isArray(items)) {
    warnOnce("[content] Services list is missing.");
    return;
  }

  container.replaceChildren();

  const openDetailsLabel =
    pickLocalized(siteContent?.services?.detailsButtonOpen, lang, "services.detailsButtonOpen") ||
    (lang === "ar" ? "عرض التفاصيل" : "View details");
  const closeDetailsLabel =
    pickLocalized(siteContent?.services?.detailsButtonClose, lang, "services.detailsButtonClose") ||
    (lang === "ar" ? "إخفاء التفاصيل" : "Hide details");
  const durationLabel =
    pickLocalized(siteContent?.services?.durationLabel, lang, "services.durationLabel") ||
    (lang === "ar" ? "المدة" : "Duration");
  const priceLabel =
    pickLocalized(siteContent?.services?.priceLabel, lang, "services.priceLabel") ||
    (lang === "ar" ? "السعر" : "Price");

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "service-card";
    card.dataset.expanded = "false";

    const title = document.createElement("h3");
    title.className = "service-card__title";
    title.textContent = pickLocalized(item?.title, lang, `services.items[${index}].title`);

    const desc = document.createElement("p");
    desc.className = "service-card__desc";
    desc.textContent = pickLocalized(item?.desc, lang, `services.items[${index}].desc`);

    const detailsText = pickLocalized(item?.details, lang, `services.items[${index}].details`);
    const durationText = pickLocalized(item?.duration, lang, `services.items[${index}].duration`);
    const priceText = pickLocalized(item?.price, lang, `services.items[${index}].price`);
    const hasExpandableData = Boolean(detailsText || durationText || priceText);

    card.append(title, desc);

    if (hasExpandableData) {
      const detailsId = `service-details-${index}`;

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "service-card__toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", detailsId);
      toggle.textContent = openDetailsLabel;

      const details = document.createElement("div");
      details.className = "service-card__details";
      details.id = detailsId;

      if (detailsText) {
        const fullDescription = document.createElement("p");
        fullDescription.className = "service-card__full";
        fullDescription.textContent = detailsText;
        details.appendChild(fullDescription);
      }

      if (durationText || priceText) {
        const meta = document.createElement("dl");
        meta.className = "service-card__meta";

        if (durationText) {
          const durationItem = document.createElement("div");
          durationItem.className = "service-card__meta-item";

          const durationTitle = document.createElement("dt");
          durationTitle.textContent = durationLabel;

          const durationValue = document.createElement("dd");
          durationValue.textContent = durationText;

          durationItem.append(durationTitle, durationValue);
          meta.appendChild(durationItem);
        }

        if (priceText) {
          const priceItem = document.createElement("div");
          priceItem.className = "service-card__meta-item";

          const priceTitle = document.createElement("dt");
          priceTitle.textContent = priceLabel;

          const priceValue = document.createElement("dd");
          priceValue.textContent = priceText;

          priceItem.append(priceTitle, priceValue);
          meta.appendChild(priceItem);
        }

        details.appendChild(meta);
      }

      toggle.addEventListener("click", () => {
        const isOpen = card.classList.toggle("is-open");
        card.dataset.expanded = isOpen ? "true" : "false";
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        toggle.textContent = isOpen ? closeDetailsLabel : openDetailsLabel;
      });

      card.append(toggle, details);
    }

    container.appendChild(card);
  });
}

function renderBenefits(lang) {
  const container = document.querySelector('[data-list="benefits"]');
  const items = siteContent?.benefits?.items;

  if (!container || !Array.isArray(items)) {
    warnOnce("[content] Benefits list is missing.");
    return;
  }

  container.replaceChildren();

  items.forEach((item, index) => {
    const benefit = document.createElement("li");
    benefit.className = "benefits__item";
    benefit.textContent = pickLocalized(item, lang, `benefits.items[${index}]`);
    container.appendChild(benefit);
  });
}

function renderTestimonials(lang) {
  const container = document.querySelector('[data-list="testimonials"]');
  const items = siteContent?.testimonials?.items;

  if (!container || !Array.isArray(items)) {
    warnOnce("[content] Testimonials list is missing.");
    return;
  }

  container.replaceChildren();

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "testimonial";

    const text = document.createElement("p");
    text.className = "testimonial__text";
    text.textContent = pickLocalized(item?.text, lang, `testimonials.items[${index}].text`);

    const author = document.createElement("cite");
    author.className = "testimonial__author";
    author.textContent = pickLocalized(item?.author, lang, `testimonials.items[${index}].author`);

    card.append(text, author);
    container.appendChild(card);
  });
}

function renderAboutImage(lang) {
  const container = document.querySelector("[data-about-image]");
  if (!container) {
    warnOnce("[content] About image container is missing.");
    return;
  }

  container.replaceChildren();

  const imageUrl = (siteContent?.about?.imageUrl || "").trim();
  if (!imageUrl) {
    return;
  }

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = pickLocalized(siteContent?.about?.imageAlt, lang, "about.imageAlt");
  image.loading = "lazy";
  image.decoding = "async";
  container.appendChild(image);
}

function applySeo(lang) {
  if (!siteContent) {
    setMetaContent('meta[property="og:url"]', getRuntimeSiteUrl());
    return;
  }

  const title = pickLocalized(siteContent.meta?.title, lang, "meta.title") || "Relax Massage Egypt";
  const description = pickLocalized(siteContent.meta?.description, lang, "meta.description");
  const ogTitle = pickLocalized(siteContent.meta?.ogTitle, lang, "meta.ogTitle") || title;
  const ogDescription = pickLocalized(siteContent.meta?.ogDescription, lang, "meta.ogDescription") || description;
  const locale = lang === "ar" ? "ar_EG" : "en_US";

  document.title = title;
  setMetaContent('meta[name="description"]', description);
  setMetaContent('meta[property="og:title"]', ogTitle);
  setMetaContent('meta[property="og:description"]', ogDescription);
  setMetaContent('meta[property="og:url"]', getRuntimeSiteUrl());
  setMetaContent('meta[property="og:locale"]', locale);
}

function applyLanguageToggleAccessibility(lang) {
  const button = document.querySelector('[data-action="toggle-language"]');
  if (!button) {
    warnOnce('[i18n] Missing language toggle: [data-action="toggle-language"]');
    return;
  }

  const label = siteContent
    ? pickLocalized(siteContent.branding?.languageToggleAria, lang, "branding.languageToggleAria")
    : "Toggle language";

  button.setAttribute("aria-label", label || "Toggle language");
}

function sanitizePhone(phone) {
  if (typeof phone !== "string") {
    return "";
  }

  return phone.replace(/[^\d+]/g, "");
}

function applyContacts() {
  const contentContacts = siteContent?.contacts || {};
  const fallbackContacts = siteConfig.contacts || {};

  const whatsapp = (contentContacts.whatsapp || fallbackContacts.whatsapp || "").trim();
  const phoneRaw = (contentContacts.phone || fallbackContacts.phone || "").trim();
  const phoneSanitized = sanitizePhone(phoneRaw);
  const phoneHref = phoneSanitized ? `tel:${phoneSanitized}` : "#";

  document.querySelectorAll('[data-contact="whatsapp"]').forEach((node) => {
    node.setAttribute("href", whatsapp || "#");
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  });

  document.querySelectorAll('[data-contact="phone"]').forEach((node) => {
    node.setAttribute("href", phoneHref);
  });
}

function persistLanguage(lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch (error) {
    warnOnce("[i18n] localStorage is unavailable. Language preference is not persisted.");
  }
}

function applyLanguage(lang) {
  const normalized = normalizeLang(lang) || FALLBACK_LANG;
  currentLang = normalized;

  applyDocumentDirection(currentLang);

  if (siteContent) {
    renderServices(currentLang);
    renderBenefits(currentLang);
    renderTestimonials(currentLang);
    renderAboutImage(currentLang);
    applyTextTranslations(currentLang);
  }

  applyLanguageToggleAccessibility(currentLang);
  applySeo(currentLang);
  applyContacts();
  persistLanguage(currentLang);
}

function setupLanguageToggle() {
  const button = document.querySelector('[data-action="toggle-language"]');
  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const nextLang = currentLang === "en" ? "ar" : "en";
    applyLanguage(nextLang);
  });
}

function initAnalytics() {
  const measurementId = getRuntimeGa4MeasurementId();
  if (!measurementId) {
    return;
  }

  if (document.querySelector(`script[data-ga4-id="${measurementId}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.ga4Id = measurementId;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  window.gtag("js", new Date());
  window.gtag("config", measurementId);
}

async function init() {
  siteContent = await loadContent();
  setupLanguageToggle();
  applyLanguage(getInitialLanguage());
  initAnalytics();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  void init();
}
