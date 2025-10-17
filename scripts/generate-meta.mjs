import fs from "node:fs";
import path from "node:path";

// --- Helper --------------------------------------------------------------
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf-8"));
const outDir = "dist";
fs.mkdirSync(outDir, { recursive: true });

const dataPath = path.resolve("src/data/data.json");
const data = readJSON(dataPath);

const siteUrl = (data?.seo?.siteUrl || "").replace(/\/$/, "");
const basePath = data?.seo?.basePath || process.env.VITE_BASE || "/";
const canonical = siteUrl ? new URL(basePath, siteUrl).toString() : basePath || "/";

const abs = (maybePath) => {
  try {
    return new URL(maybePath, canonical).toString();
  } catch {
    return maybePath || canonical;
  }
};

// XML escape
const x = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const urls = [
  {
    loc: canonical,
    changefreq: "weekly",
    priority: "0.8",
    lastmod: new Date().toISOString(),
  },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${x(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${x(u.lastmod)}</lastmod>` : ""}
    ${u.changefreq ? `<changefreq>${x(u.changefreq)}</changefreq>` : ""}
    ${u.priority ? `<priority>${x(u.priority)}</priority>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;
fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
console.log("✓ sitemap.xml generated");

const blog = data?.blog || {};
const siteTitle = data?.seo?.title || data?.personal?.name || "Portfolio";
const siteDesc =
  data?.seo?.description || data?.personal?.tagline || "A fast, modern, tech portfolio.";
const ogImage = data?.seo?.image ? abs(data.seo.image) : abs("/og-image.png");

const rawPosts = Array.isArray(blog.posts)
  ? blog.posts
  : Array.isArray(blog.items)
    ? blog.items
    : [];

const items = rawPosts
  .map((p) => {
    const title = p.title || p.name || "Untitled";
    const pathLike = p.url || p.link || p.slug || p.path || "";
    const link = pathLike ? abs(pathLike) : canonical;
    const dateRaw = p.date || p.publishedAt || p.pubDate || p.createdAt || null;
    const desc = p.excerpt || p.description || "";
    const pubDate = dateRaw ? new Date(dateRaw) : null;
    return {
      title,
      link,
      guid: link,
      pubDate: pubDate ? pubDate.toUTCString() : new Date().toUTCString(),
      description: desc,
    };
  })
  .sort((a, b) => (new Date(b.pubDate).getTime() || 0) - (new Date(a.pubDate).getTime() || 0));

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${x(siteTitle)}</title>
    <link>${x(canonical)}</link>
    <description>${x(siteDesc)}</description>
    <language>${x(data?.seo?.locale || "en")}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${x(ogImage)}</url>
      <title>${x(siteTitle)}</title>
      <link>${x(canonical)}</link>
    </image>
${items
  .map(
    (it) => `    <item>
      <title>${x(it.title)}</title>
      <link>${x(it.link)}</link>
      <guid isPermaLink="true">${x(it.guid)}</guid>
      <pubDate>${x(it.pubDate)}</pubDate>
      ${
        it.description
          ? `<description><![CDATA[${String(it.description).slice(0, 2000)}]]></description>`
          : ""
      }
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;
fs.writeFileSync(path.join(outDir, "feed.xml"), rss);
console.log(`✓ feed.xml generated (${items.length} item${items.length !== 1 ? "s" : ""})`);

// --- Robots.txt ---------------------------------------------------------
const robots = `User-agent: *
Allow: /

Sitemap: ${abs("/sitemap.xml")}
`;
fs.writeFileSync(path.join(outDir, "robots.txt"), robots);
console.log("✓ robots.txt generated");

// --- Summary ----------------------------------------------------------
console.log("\nDone. Files in dist/: sitemap.xml, feed.xml, robots.txt");
if (!siteUrl) {
  console.warn(
    "⚠️  data.seo.siteUrl is empty. Use the absolute URL of your production domain to ensure accurate canonical, RSS, and robots.txt."
  );
}
