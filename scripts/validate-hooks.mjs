import fs from "node:fs";

const HTML_PATH = "page.html";

const requiredPatterns = [
  { name: "language toggle", pattern: /data-action="toggle-language"/ },
  { name: "whatsapp contact hook", pattern: /data-contact="whatsapp"/ },
  { name: "phone contact hook", pattern: /data-contact="phone"/ },
  { name: "services list hook", pattern: /data-list="services"/ },
  { name: "benefits list hook", pattern: /data-list="benefits"/ },
  { name: "testimonials list hook", pattern: /data-list="testimonials"/ },
  { name: "about image hook", pattern: /data-about-image/ },
  { name: "app module script", pattern: /<script\s+type="module"\s+src="js\/app\.js"><\/script>/ }
];

function fail(message) {
  console.error(`[hooks-check] ${message}`);
  process.exitCode = 1;
}

function run() {
  let html = "";
  try {
    html = fs.readFileSync(HTML_PATH, "utf8");
  } catch (error) {
    fail(`Cannot read ${HTML_PATH}: ${error.message}`);
    process.exit(process.exitCode || 1);
  }

  for (const entry of requiredPatterns) {
    if (!entry.pattern.test(html)) {
      fail(`Missing ${entry.name}`);
    }
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  console.log("[hooks-check] OK");
}

run();
