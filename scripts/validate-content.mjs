import fs from "node:fs";

const CONTENT_PATH = "content/site-content.json";

function fail(message) {
  console.error(`[content-check] ${message}`);
  process.exitCode = 1;
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getContent() {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_PATH, "utf8"));
  } catch (error) {
    fail(`Cannot read ${CONTENT_PATH}: ${error.message}`);
    return null;
  }
}

function assertLocalized(root, path) {
  const value = path.split(".").reduce((acc, key) => acc?.[key], root);
  assertLocalizedValue(value, path);
}

function assertLocalizedValue(value, path) {
  if (!isObject(value)) {
    fail(`Missing localized object at "${path}"`);
    return;
  }

  if (typeof value.en !== "string" || value.en.trim().length === 0) {
    fail(`Missing EN value at "${path}.en"`);
  }

  if (typeof value.ar !== "string" || value.ar.trim().length === 0) {
    fail(`Missing AR value at "${path}.ar"`);
  }
}

function assertString(root, path) {
  const value = path.split(".").reduce((acc, key) => acc?.[key], root);
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`Missing string value at "${path}"`);
  }
}

function assertOptionalString(root, path) {
  const value = path.split(".").reduce((acc, key) => acc?.[key], root);
  if (typeof value !== "string") {
    fail(`Expected string at "${path}"`);
  }
}

function assertArray(root, path, min = 1) {
  const value = path.split(".").reduce((acc, key) => acc?.[key], root);
  if (!Array.isArray(value)) {
    fail(`Expected array at "${path}"`);
    return [];
  }

  if (value.length < min) {
    fail(`Expected at least ${min} items at "${path}"`);
  }

  return value;
}

function run() {
  const content = getContent();
  if (!content) {
    process.exit(process.exitCode || 1);
  }

  assertLocalized(content, "branding.logo");
  assertLocalized(content, "branding.languageToggle");
  assertLocalized(content, "branding.languageToggleAria");

  assertLocalized(content, "meta.title");
  assertLocalized(content, "meta.description");
  assertLocalized(content, "meta.ogTitle");
  assertLocalized(content, "meta.ogDescription");
  assertString(content, "settings.siteUrl");
  assertOptionalString(content, "settings.ga4MeasurementId");

  assertLocalized(content, "hero.title");
  assertLocalized(content, "hero.subtitle");
  assertLocalized(content, "hero.cta");

  assertLocalized(content, "about.title");
  assertLocalized(content, "about.text1");
  assertLocalized(content, "about.text2");
  assertLocalized(content, "about.imageAlt");

  assertLocalized(content, "services.title");
  assertLocalized(content, "services.detailsButtonOpen");
  assertLocalized(content, "services.detailsButtonClose");
  assertLocalized(content, "services.durationLabel");
  assertLocalized(content, "services.priceLabel");
  assertLocalized(content, "benefits.title");
  assertLocalized(content, "testimonials.title");
  assertLocalized(content, "contact.title");
  assertLocalized(content, "contact.text");
  assertLocalized(content, "contact.whatsapp");
  assertLocalized(content, "contact.call");
  assertLocalized(content, "contact.hours");
  assertLocalized(content, "contact.location");
  assertLocalized(content, "footer.copyright");
  assertLocalized(content, "footer.disclaimer");

  const serviceItems = assertArray(content, "services.items", 1);
  serviceItems.forEach((item, index) => {
    if (!isObject(item)) {
      fail(`services.items[${index}] must be an object`);
      return;
    }
    assertLocalizedValue(item.title, `services.items[${index}].title`);
    assertLocalizedValue(item.desc, `services.items[${index}].desc`);
    assertLocalizedValue(item.details, `services.items[${index}].details`);
    assertLocalizedValue(item.duration, `services.items[${index}].duration`);
    assertLocalizedValue(item.price, `services.items[${index}].price`);
  });

  const benefitsItems = assertArray(content, "benefits.items", 1);
  benefitsItems.forEach((item, index) => {
    if (!isObject(item)) {
      fail(`benefits.items[${index}] must be an object with en/ar`);
      return;
    }
    if (typeof item.en !== "string" || item.en.trim().length === 0) {
      fail(`Missing EN in benefits.items[${index}].en`);
    }
    if (typeof item.ar !== "string" || item.ar.trim().length === 0) {
      fail(`Missing AR in benefits.items[${index}].ar`);
    }
  });

  const testimonialItems = assertArray(content, "testimonials.items", 1);
  testimonialItems.forEach((item, index) => {
    if (!isObject(item)) {
      fail(`testimonials.items[${index}] must be an object`);
      return;
    }
    assertLocalizedValue(item.text, `testimonials.items[${index}].text`);
    assertLocalizedValue(item.author, `testimonials.items[${index}].author`);
  });

  assertString(content, "contacts.whatsapp");
  assertString(content, "contacts.phone");

  if (typeof content.about?.imageUrl !== "string") {
    fail(`Expected string at "about.imageUrl"`);
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  console.log("[content-check] OK");
}

run();
