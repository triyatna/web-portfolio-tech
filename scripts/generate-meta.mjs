import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

/* ========== Helpers ========== */
const exists = (p) => fs.existsSync(p);
const readFile = (p) => fs.readFileSync(p, "utf8");
const writeFile = (p, s) => fs.writeFileSync(p, s);
const ensureDir = (d) => fs.mkdirSync(d, { recursive: true });

const stripBOM = (s) => s.replace(/^\uFEFF/, "");
const tryJSON = (s) => {
  const t = stripBOM(s).trim();
  if (/^\s*</.test(t)) throw new Error("Not JSON (HTML-like)");
  return JSON.parse(t);
};

const x = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const htmlAttr = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join(" ");

const tag = (name, attrs = {}, selfClose = true) =>
  `<${name}${Object.keys(attrs).length ? " " + htmlAttr(attrs) : ""}${selfClose ? " />" : ">"}`;

const originOf = (u = "") => {
  try {
    return u ? new URL(u).origin : "";
  } catch {
    return "";
  }
};
const absUrl = (base, p) => {
  if (!p) return base;
  try {
    return new URL(p, base).toString();
  } catch {
    return p;
  }
};

const inferMime = (f = "") => {
  const l = f.toLowerCase();
  if (l.endsWith(".svg")) return "image/svg+xml";
  if (l.endsWith(".png")) return "image/png";
  if (l.endsWith(".jpg") || l.endsWith(".jpeg")) return "image/jpeg";
  if (l.endsWith(".ico")) return "image/x-icon";
  return "";
};

const toWeb = (p) => `/${p.split(path.sep).join("/")}`;

function findStaticWebPath(candidates, { dist = "dist", pub = "public" } = {}) {
  for (const rel of candidates) {
    const relClean = rel.replace(/^\/+/, "");
    const inDist = path.join(dist, relClean);
    if (exists(inDist)) return toWeb(path.relative(dist, inDist));
    const inPub = path.join(pub, relClean);
    if (exists(inPub)) return toWeb(path.relative(pub, inPub));
  }
  return null;
}

/* ========== Load data.json ========== */
const findDataJson = () => {
  const candidates = [
    "public/data/data.json",
    "src/data/data.json",
    "data/data.json",
    "dist/data/data.json",
  ];
  for (const p of candidates) if (exists(p)) return p;
  throw new Error("data.json not found (public/src/dist).");
};

const dataPath = path.resolve(findDataJson());
const data = tryJSON(readFile(dataPath));
const seo = data?.seo || {};
const outDir = "dist";
ensureDir(outDir);

/* ========== Resolve base / canonical ========== */
const envBase = process.env.BASE_PATH || process.env.VITE_BASE || "/";
const fromSeoBase = seo.basePath || "/";
const basePathRaw = envBase || fromSeoBase || "/";

const normalizeBase = (b) => {
  let s = String(b || "/").trim();
  if (!s.startsWith("/")) s = "/" + s;
  if (!s.endsWith("/")) s = s + "/";
  return s;
};
const basePath = normalizeBase(basePathRaw);

const siteUrl = String(seo.siteUrl || "").replace(/\/$/, "");
const canonicalBase = siteUrl ? new URL(basePath, siteUrl).toString() : basePath;

/* ========== FEED + SITEMAP + ROBOTS ========== */
{
  const urls = [
    {
      loc: canonicalBase,
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
  writeFile(path.join(outDir, "sitemap.xml"), sitemap);

  const blog = data?.blog || {};
  const siteTitle = seo.title || data?.personal?.name || "Portfolio";
  const siteDesc = seo.description || data?.personal?.tagline || "A fast, modern, tech portfolio.";
  const ogImage = seo.image
    ? absUrl(canonicalBase, seo.image)
    : absUrl(canonicalBase, "/assets/images/og-image.png");

  const rawPosts = Array.isArray(blog.posts)
    ? blog.posts
    : Array.isArray(blog.items)
      ? blog.items
      : [];

  const items = rawPosts
    .map((p) => {
      const title = p.title || p.name || "Untitled";
      const pathLike = p.url || p.link || p.slug || p.path || "";
      const link = pathLike ? absUrl(canonicalBase, pathLike) : canonicalBase;
      const dateRaw = p.date || p.publishedAt || p.pubDate || p.createdAt || null;
      const desc = p.excerpt || p.description || "";
      const pubDate = dateRaw ? new Date(dateRaw) : new Date();
      return {
        title,
        link,
        guid: link,
        pubDate: pubDate.toUTCString(),
        description: desc,
      };
    })
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const rssLang = (seo.locale || "en_US").split("_")[0];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${x(siteTitle)}</title>
    <link>${x(canonicalBase)}</link>
    <description>${x(siteDesc)}</description>
    <language>${x(rssLang)}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image>
      <url>${x(ogImage)}</url>
      <title>${x(siteTitle)}</title>
      <link>${x(canonicalBase)}</link>
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
  writeFile(path.join(outDir, "feed.xml"), rss);

  const robots = `User-agent: *
Allow: /

Sitemap: ${absUrl(canonicalBase, "/sitemap.xml")}
`;
  writeFile(path.join(outDir, "robots.txt"), robots);

  console.log("✓ sitemap.xml, feed.xml, robots.txt");
  if (!siteUrl) {
    console.warn(
      "⚠️  seo.siteUrl kosong. Isi URL absolut domain produksi agar canonical/RSS/robots akurat."
    );
  }
}

/* ========== HEAD SEO Injection ========== */
const p = data?.personal || {};
const title = seo.title || p.name || "Portfolio";
const desc = seo.description || p.tagline || "A fast, modern, programmer-themed portfolio.";
const siteName = seo.siteName || p.name || "Portfolio";
const appName = seo.appName || siteName;
const generator = seo.generator || "Vite + React";
const locale = seo.locale || "en_US";
const keywords = (seo.keywords || []).join(", ");
let twitter = (seo.twitter || "").trim();
if (twitter && !twitter.startsWith("@")) twitter = `@${twitter}`;
const twitterId = (seo.twitterId || "").trim();
const imageAbs = absUrl(canonicalBase, seo.image || "/assets/images/og-image.png");
const imageW = seo.imageWidth ?? 1200;
const imageH = seo.imageHeight ?? 630;

const FALL = {
  svg: "/assets/images/favicon.svg",
  ico: "/assets/images/favicon.ico",
  png96: "/assets/images/favicon-96x96.png",
  apple180: "/assets/images/apple-touch-icon.png",
  mask: "/assets/images/safari-pinned-tab.svg",
};
const fav = seo.favicons || {};
const iconSvg = fav.icon || FALL.svg;
const iconPng96 = fav?.png96 || FALL.png96;
const iconIco = fav.shortcut || FALL.ico;
const apple180 = fav.apple || FALL.apple180;
const maskHref = fav.maskIconHref || FALL.mask;
const maskColor = fav.maskIconColor || "#0D1117";

const canonical = canonicalBase;
const sitemapHref = absUrl(canonicalBase, "/sitemap.xml");
const manifestHref = seo.manifest || "/site.webmanifest";
const rssUrl = seo.rss || data?.blog?.rssJson || "/feed.xml";

const preconnectHosts = new Set([
  ...(seo.preconnect || []).map(String),
  originOf(p?.avatarUrl || ""),
  originOf(canonicalBase) || canonicalBase,
]);

const alternates = seo.alternates || {};
const localeAlternates = seo.localeAlternates || [];
const sameAs = Object.values(p?.socials || {}).filter(Boolean);

const personLD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: p?.name || siteName,
  email: p?.email || undefined,
  url: canonical,
  jobTitle: p?.jobTitle || "Web Developer",
  image: absUrl(canonicalBase, p?.avatarUrl || FALL.apple180),
  sameAs,
};
const websiteLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: canonical,
  potentialAction: {
    "@type": "SearchAction",
    target: `${canonical}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};
const webpageLD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  url: canonical,
  isPartOf: { "@type": "WebSite", url: canonical, name: siteName },
  description: desc,
  inLanguage: (seo.locale || "en_US").split("_")[0],
  dateModified: seo.updatedAt ? new Date(seo.updatedAt).toISOString() : undefined,
};
const crumbs = [
  { name: "Home", href: basePath },
  ...(data?.about?.enabled ? [{ name: "About", href: "#about" }] : []),
  ...(data?.projects ? [{ name: "Projects", href: "#projects" }] : []),
  ...(data?.portfolio?.enabled ? [{ name: "Portfolio", href: "#portfolio" }] : []),
  ...(data?.contact ? [{ name: "Contact", href: "#contact" }] : []),
];
const breadcrumbLD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: { "@id": absUrl(canonicalBase, c.href), name: c.name },
  })),
};
const orgLD = seo.organization?.name
  ? {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: seo.organization.name,
      legalName: seo.organization.legalName || undefined,
      url: seo.organization.url || canonical,
      logo: seo.organization.logo ? absUrl(canonicalBase, seo.organization.logo) : undefined,
      sameAs: seo.organization.sameAs || undefined,
    }
  : null;

const HEAD_BEGIN = "<!-- seo:begin -->";
const HEAD_END = "<!-- seo:end -->";

const headFrag = [
  HEAD_BEGIN,
  tag("meta", { name: "description", content: desc }),
  keywords ? tag("meta", { name: "keywords", content: keywords }) : "",
  tag("meta", {
    name: "robots",
    content:
      seo.robots || "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  }),
  tag("meta", {
    name: "googlebot",
    content:
      seo.robots || "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  }),
  tag("meta", { name: "application-name", content: appName }),
  tag("meta", { name: "generator", content: generator }),
  seo.notranslate ? tag("meta", { name: "google", content: "notranslate" }) : "",
  tag("link", { rel: "canonical", href: canonical }),
  tag("link", { rel: "sitemap", href: sitemapHref }),
  tag("meta", { name: "theme-color", content: seo.themeColorDark || "#0D1117" }),
  seo.themeColorLight
    ? tag("meta", {
        name: "theme-color",
        content: seo.themeColorLight,
        media: "(prefers-color-scheme: light)",
      })
    : "",
  seo.themeColorDark
    ? tag("meta", {
        name: "theme-color",
        content: seo.themeColorDark,
        media: "(prefers-color-scheme: dark)",
      })
    : "",
  tag("link", { rel: "icon", href: iconSvg, type: inferMime(iconSvg) }),
  tag("link", { rel: "icon", href: iconPng96, type: "image/png", sizes: "96x96" }),
  tag("link", { rel: "shortcut icon", href: iconIco }),
  tag("link", { rel: "apple-touch-icon", href: apple180, sizes: "180x180" }),
  tag("meta", { name: "apple-mobile-web-app-title", content: appName }),
  tag("link", { rel: "manifest", href: manifestHref }),
  tag("link", { rel: "mask-icon", href: maskHref, color: maskColor }),
  tag("meta", { property: "og:type", content: "website" }),
  tag("meta", { property: "og:site_name", content: siteName }),
  tag("meta", { property: "og:title", content: title }),
  tag("meta", { property: "og:description", content: desc }),
  tag("meta", { property: "og:url", content: canonical }),
  tag("meta", { property: "og:image", content: imageAbs }),
  tag("meta", { property: "og:image:width", content: String(imageW) }),
  tag("meta", { property: "og:image:height", content: String(imageH) }),
  tag("meta", { property: "og:image:alt", content: title }),
  tag("meta", { property: "og:locale", content: locale }),
  seo.updatedAt
    ? tag("meta", { property: "og:updated_time", content: new Date(seo.updatedAt).toISOString() })
    : "",
  ...(seo.seeAlso || []).map((u) => tag("meta", { property: "og:see_also", content: u })),
  ...(localeAlternates || []).map((loc) =>
    tag("meta", { property: "og:locale:alternate", content: loc })
  ),
  seo.facebookAppId ? tag("meta", { property: "fb:app_id", content: seo.facebookAppId }) : "",
  seo.fbPageId ? tag("meta", { property: "fb:pages", content: seo.fbPageId }) : "",
  ...(seo.facebookAdmins || []).map((id) => tag("meta", { property: "fb:admins", content: id })),
  ...(seo.articleTags || []).map((tagName) =>
    tag("meta", { property: "article:tag", content: tagName })
  ),
  tag("meta", { name: "twitter:card", content: "summary_large_image" }),
  tag("meta", { name: "twitter:title", content: title }),
  tag("meta", { name: "twitter:description", content: desc }),
  tag("meta", { name: "twitter:image", content: imageAbs }),
  twitter ? tag("meta", { name: "twitter:site", content: twitter }) : "",
  twitter ? tag("meta", { name: "twitter:creator", content: twitter }) : "",
  twitterId ? tag("meta", { name: "twitter:site:id", content: twitterId }) : "",
  twitterId ? tag("meta", { name: "twitter:creator:id", content: twitterId }) : "",
  tag("meta", {
    name: "twitter:domain",
    content: (() => {
      try {
        return new URL(canonical).hostname;
      } catch {
        return "";
      }
    })(),
  }),
  rssUrl
    ? tag("link", {
        rel: "alternate",
        href: absUrl(canonicalBase, rssUrl),
        type: "application/rss+xml",
        title: `${p?.name || "Feed"} RSS`,
      })
    : "",
  ...Object.entries(alternates).map(([lang, href]) =>
    tag("link", { rel: "alternate", href: absUrl(canonicalBase, href), hreflang: lang })
  ),
  tag("link", { rel: "alternate", href: canonical, hreflang: "x-default" }),
  ...Array.from(preconnectHosts)
    .filter(Boolean)
    .map((h) => {
      const origin = originOf(h) || h;
      return [
        tag("link", { rel: "dns-prefetch", href: origin }),
        tag("link", { rel: "preconnect", href: origin, crossorigin: "" }),
      ].join("\n");
    }),
  `<script type="application/ld+json" id="ld-person">${JSON.stringify(personLD)}</script>`,
  `<script type="application/ld+json" id="ld-website">${JSON.stringify(websiteLD)}</script>`,
  `<script type="application/ld+json" id="ld-webpage">${JSON.stringify(webpageLD)}</script>`,
  `<script type="application/ld+json" id="ld-breadcrumb">${JSON.stringify(breadcrumbLD)}</script>`,
  orgLD ? `<script type="application/ld+json" id="ld-org">${JSON.stringify(orgLD)}</script>` : "",
  HEAD_END,
]
  .flat()
  .filter(Boolean)
  .join("\n");

/* ========== PWA Manifest (auto-generate / merge) ========== */
{
  const manifestWeb = (seo.manifest || "/site.webmanifest").replace(/^\/+/, "/");
  const manifestDistPath = path.join(outDir, manifestWeb.replace(/^\/+/, ""));
  ensureDir(path.dirname(manifestDistPath));

  const manifestSrcCandidates = [
    path.join("public", manifestWeb.replace(/^\/+/, "")),
    path.join(outDir, manifestWeb.replace(/^\/+/, "")),
  ];
  let baseManifest = {};
  for (const m of manifestSrcCandidates) {
    if (exists(m)) {
      try {
        baseManifest = tryJSON(readFile(m));
        break;
      } catch {}
    }
  }

  const icon192 =
    findStaticWebPath(
      [
        "/assets/images/apple-touch-icon.png",
        "/assets/images/apple-touch-icon.png",
        "/assets/images/apple-touch-icon.png",
        "/assets/images/apple-touch-icon.png",
      ],
      { dist: outDir, pub: "public" }
    ) || "/assets/images/apple-touch-icon.png";

  const icon512 =
    findStaticWebPath(
      [
        "/assets/images/web-app-manifest-512x512.png",
        "/assets/images/android-chrome-512x512.png",
        "/assets/images/icon-512.png",
      ],
      { dist: outDir, pub: "public" }
    ) || "/assets/images/web-app-manifest-512x512.png";

  const manifest = {
    name: seo.appName || seo.siteName || p?.name || "Portfolio",
    short_name:
      baseManifest.short_name ||
      (seo.appName || seo.siteName || p?.name || "Portfolio").slice(0, 12),
    display: baseManifest.display || "standalone",
    start_url: baseManifest.start_url || basePath,
    scope: baseManifest.scope || basePath,
    id: baseManifest.id || basePath,
    theme_color: baseManifest.theme_color || seo.themeColorLight || "#ffffff",
    background_color: baseManifest.background_color || seo.themeColorLight || "#ffffff",
    icons:
      baseManifest.icons && Array.isArray(baseManifest.icons) && baseManifest.icons.length
        ? baseManifest.icons
        : [
            {
              src: icon192,
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: icon512,
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
  };

  await fsp.writeFile(manifestDistPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`✓ site.webmanifest generated at ${manifestWeb}`);
}

/* ========== Inject into built HTMLs ========== */
const targets = ["index.html", "404.html"]
  .map((f) => path.join(outDir, f))
  .filter((p) => exists(p));

for (const file of targets) {
  let html = await fsp.readFile(file, "utf8");
  html = html.replace(
    /<html(?![^>]*\blang=)/i,
    `<html lang="${(seo.locale || "en_US").split("_")[0] || "en"}"`
  );
  if (/<title>.*?<\/title>/i.test(html)) {
    html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  } else {
    html = html.replace(/<\/head>/i, `  <title>${title}</title>\n</head>`);
  }

  const markerRe = new RegExp(`${HEAD_BEGIN}[\\s\\S]*?${HEAD_END}`, "m");
  if (markerRe.test(html)) {
    html = html.replace(markerRe, headFrag);
  } else {
    html = html.replace(/<\/head>/i, `${headFrag}\n</head>`);
  }

  await fsp.writeFile(file, html, "utf8");
  console.log(`✓ injected SEO into ${path.basename(file)}`);
}

console.log("✓ SEO injection complete");
