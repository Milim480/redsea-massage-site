import fs from "node:fs";

const CONTENT_PATH = "content/site-content.json";
const ROBOTS_PATH = "robots.txt";
const SITEMAP_PATH = "sitemap.xml";

function readContent() {
  return JSON.parse(fs.readFileSync(CONTENT_PATH, "utf8"));
}

function normalizeSiteUrl(siteUrl) {
  const trimmed = (siteUrl || "").trim();
  if (!trimmed) {
    throw new Error('Missing "settings.siteUrl" in content/site-content.json');
  }

  let url;
  try {
    url = new URL(trimmed);
  } catch (error) {
    throw new Error(`Invalid settings.siteUrl: ${trimmed}`);
  }

  if (!url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  url.search = "";
  url.hash = "";
  return url.toString();
}

function toSitemapUrl(siteUrl) {
  const url = new URL(siteUrl);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/sitemap.xml`;
  return url.toString();
}

function writeRobots(siteUrl) {
  const robots = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${toSitemapUrl(siteUrl)}`
  ].join("\n");

  fs.writeFileSync(ROBOTS_PATH, robots, "utf8");
}

function writeSitemap(siteUrl) {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    `    <loc>${siteUrl}</loc>`,
    "    <changefreq>weekly</changefreq>",
    "    <priority>1.0</priority>",
    "  </url>",
    "</urlset>",
    ""
  ].join("\n");

  fs.writeFileSync(SITEMAP_PATH, xml, "utf8");
}

function run() {
  const content = readContent();
  const siteUrl = normalizeSiteUrl(content?.settings?.siteUrl);

  writeRobots(siteUrl);
  writeSitemap(siteUrl);

  console.log(`[sync-seo] Updated ${ROBOTS_PATH} and ${SITEMAP_PATH} for ${siteUrl}`);
}

run();
