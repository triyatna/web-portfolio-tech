import React, { useEffect } from "react";
import type { SiteData } from "../hooks/useAppData";

type SEOData = {
  siteUrl?: string;
  basePath?: string;

  // Basic
  title?: string;
  description?: string;
  keywords?: string[];
  robots?: string;
  locale?: string; // ex: "en_US"
  siteName?: string;
  appName?: string; // <meta name="application-name">
  generator?: string; // <meta name="generator">
  notranslate?: boolean;

  // Icons & manifest
  favicons?: {
    icon?: string; // "/favicon.svg"
    apple?: string; // "/apple-touch-icon.png"
    shortcut?: string; // "/favicon.ico"
    maskIconHref?: string; // "/safari-pinned-tab.svg"
    maskIconColor?: string; // "#0D1117"
  };
  manifest?: string; // "/site.webmanifest"
  themeColorLight?: string; // "#ffffff"
  themeColorDark?: string; // "#0D1117"

  // OG / Twitter
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  twitter?: string;
  twitterId?: string;
  facebookAppId?: string;
  facebookAdmins?: string[];
  fbPageId?: string;

  // Alternates & feeds
  alternates?: Record<string, string>; // hreflang -> href
  rss?: string;

  // Verifications
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  yandexSiteVerification?: string;

  // Connections
  preconnect?: string[]; // list origins

  // Advanced
  updatedAt?: string; // ISO
  seeAlso?: string[]; // og:see_also[]
  articleTags?: string[]; // article:tag[]
  localeAlternates?: string[]; // og:locale:alternate[]

  // Organization (opsional)
  organization?: {
    name: string;
    legalName?: string;
    url?: string;
    logo?: string;
    sameAs?: string[];
  };
};

function ensureMeta(name: string, content?: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function ensureThemeColor(content: string, media?: string) {
  const sel = media
    ? `meta[name="theme-color"][media="${media}"]`
    : `meta[name="theme-color"]:not([media])`;
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "theme-color");
    if (media) el.setAttribute("media", media);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function ensurePropMeta(property: string, content?: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function ensureLinkSingle(rel: string, href?: string, attrs: Record<string, string> = {}) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

function ensureLinkMulti(rel: string, href?: string, attrs: Record<string, string> = {}) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][href="${href}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    el.href = href;
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

function ensureJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function absoluteUrl(base: string, path?: string) {
  if (!path) return base;
  try {
    return new URL(path, base).toString();
  } catch {
    return path;
  }
}

function originOf(u?: string) {
  try {
    return u ? new URL(u).origin : "";
  } catch {
    return "";
  }
}

export const SEO: React.FC<{ data: SiteData }> = ({ data }) => {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const p = data.personal || {};
    const s: SEOData = (data as any).seo || {};

    // Base/canonical
    const siteUrl = (s.siteUrl || "").replace(/\/$/, "");
    const currentOrigin = window.location.origin;
    const baseFromVite = (import.meta as any).env?.BASE_URL || "/";
    const basePath = s.basePath || baseFromVite || "/";
    const base = siteUrl || currentOrigin;

    const canonical = absoluteUrl(base, basePath);
    const sitemapHref = absoluteUrl(base, "/sitemap.xml");

    // Title/desc
    const title = s.title || p.name || "Portfolio";
    const desc = s.description || p.tagline || "A fast, modern, programmer-themed portfolio.";
    const siteName = s.siteName || p.name || "Portfolio";
    const appName = s.appName || siteName;
    const generator = s.generator || "Vite + React";
    const locale = s.locale || "en_US";

    // Images
    const imageAbs = absoluteUrl(canonical, s.image || "./assets/images/og-image.png");
    const imageW = s.imageWidth ?? 1200;
    const imageH = s.imageHeight ?? 630;

    // Robots/keywords
    const robots =
      s.robots || "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
    const keywords = (s.keywords || []).join(", ");

    // Twitter
    let twitter = (s.twitter || "").trim();
    if (twitter && !twitter.startsWith("@")) twitter = `@${twitter}`;
    const twitterId = (s.twitterId || "").trim();

    // Theme color (live & scheme)
    const themeVar = (
      getComputedStyle(document.documentElement).getPropertyValue("--bg") || "#0D1117"
    ).trim();

    const safeTitle: string = (s.title ?? p.name ?? "Portfolio") as string;
    const safeLang: string = ((s.locale ?? "en_US").split("_")[0] || "en") as string;

    document.title = safeTitle;
    document.documentElement.lang = safeLang;

    ensureMeta("description", desc);
    if (keywords) ensureMeta("keywords", keywords);
    ensureMeta("robots", robots);
    ensureMeta("googlebot", robots);
    ensureMeta("application-name", appName);
    ensureMeta("generator", generator);
    if (s.notranslate) ensureMeta("google", "notranslate");
    ensureThemeColor(themeVar);
    ensureLinkSingle("canonical", canonical);
    ensureLinkSingle("sitemap", sitemapHref);

    function inferMime(p: string | undefined) {
      const f = (p || "").toLowerCase();
      if (f.endsWith(".svg")) return "image/svg+xml";
      if (f.endsWith(".png")) return "image/png";
      if (f.endsWith(".jpg") || f.endsWith(".jpeg")) return "image/jpeg";
      if (f.endsWith(".ico")) return "image/x-icon";
      return "";
    }

    const fav = s.favicons || {};
    const FALL = {
      svg: "./assets/images/favicon.svg",
      ico: "./assets/images/favicon.ico",
      png96: "./assets/images/favicon-96x96.png",
      apple180: "./assets/images/apple-touch-icon.png",
      mask: "./assets/images/safari-pinned-tab.svg",
    };
    if (fav.icon) {
      ensureLinkSingle("icon", fav.icon, {
        type: fav.icon.toLowerCase().endsWith(".svg") ? "image/svg+xml" : "image/x-icon",
      });
    }
    const svgHref = fav.icon || FALL.svg;
    ensureLinkMulti("icon", svgHref, { type: inferMime(svgHref) });

    const png96 = (fav as any).png96 || FALL.png96;
    ensureLinkMulti("icon", png96, { type: "image/png", sizes: "96x96" });

    const shortcutIco = fav.shortcut || FALL.ico;
    ensureLinkSingle("shortcut icon", shortcutIco);

    const apple180 = fav.apple || FALL.apple180;
    ensureLinkMulti("apple-touch-icon", apple180, { sizes: "180x180" });

    if (fav.maskIconHref || FALL.mask) {
      ensureLinkMulti("mask-icon", fav.maskIconHref || FALL.mask, {
        color: fav.maskIconColor || "#0D1117",
      });
    }

    if (s.themeColorLight) ensureThemeColor(s.themeColorLight, "(prefers-color-scheme: light)");
    if (s.themeColorDark) ensureThemeColor(s.themeColorDark, "(prefers-color-scheme: dark)");

    // ---- Open Graph
    ensurePropMeta("og:type", "website");
    ensurePropMeta("og:site_name", siteName);
    ensurePropMeta("og:title", title);
    ensurePropMeta("og:description", desc);
    ensurePropMeta("og:url", canonical);
    ensurePropMeta("og:image", imageAbs);
    ensurePropMeta("og:image:width", String(imageW));
    ensurePropMeta("og:image:height", String(imageH));
    ensurePropMeta("og:image:alt", title);
    ensurePropMeta("og:locale", locale);

    if (s.updatedAt) ensurePropMeta("og:updated_time", new Date(s.updatedAt).toISOString());
    (s.seeAlso || []).forEach((u) => ensurePropMeta("og:see_also", u));
    (s.localeAlternates || []).forEach((loc) => ensurePropMeta("og:locale:alternate", loc));

    if (s.facebookAppId) ensurePropMeta("fb:app_id", s.facebookAppId);
    if (s.fbPageId) ensurePropMeta("fb:pages", s.fbPageId);
    (s.facebookAdmins || []).forEach((id) => ensurePropMeta("fb:admins", id));

    // ---- Twitter
    ensureMeta("twitter:card", "summary_large_image");
    ensureMeta("twitter:title", title);
    ensureMeta("twitter:description", desc);
    ensureMeta("twitter:image", imageAbs);
    if (twitter) {
      ensureMeta("twitter:site", twitter);
      ensureMeta("twitter:creator", twitter);
    }
    if (twitterId) {
      ensureMeta("twitter:site:id", twitterId);
      ensureMeta("twitter:creator:id", twitterId);
    }
    try {
      ensureMeta("twitter:domain", new URL(canonical).hostname);
    } catch {}

    // ---- Verifications
    if (s.googleSiteVerification) ensureMeta("google-site-verification", s.googleSiteVerification);
    if (s.bingSiteVerification) ensureMeta("msvalidate.01", s.bingSiteVerification);
    if (s.yandexSiteVerification) ensureMeta("yandex-verification", s.yandexSiteVerification);

    // ---- RSS
    const rssUrl = s.rss || (data as any)?.blog?.rssJson;
    if (rssUrl) {
      ensureLinkMulti("alternate", absoluteUrl(base, rssUrl), {
        type: "application/rss+xml",
        title: `${p.name || "Feed"} RSS`,
      });
    }

    // ---- Hreflang
    if (s.alternates) {
      Object.entries(s.alternates).forEach(([lang, href]) => {
        ensureLinkMulti("alternate", absoluteUrl(base, href), { hreflang: lang });
      });
      ensureLinkMulti("alternate", canonical, { hreflang: "x-default" });
    }

    // ---- Preconnect/DNS
    const hosts = new Set<string>();
    const avatarHost = originOf((p as any).avatarUrl);
    if (avatarHost) hosts.add(avatarHost);
    (s.preconnect || []).forEach((h) => hosts.add(h));
    hosts.add(base);
    hosts.forEach((h) => {
      const origin = originOf(h) || h;
      if (!origin) return;
      ensureLinkMulti("dns-prefetch", origin);
      ensureLinkMulti("preconnect", origin, { crossorigin: "" });
    });

    // ---- JSON-LD Person
    const sameAs = Object.values(p.socials || {}).filter(Boolean) as string[];
    const jobTitle = ((p as any)?.jobTitle as string | undefined) || "Web Developer"; // <= fix: tanpa ubah tipe SiteData
    ensureJsonLd("ld-person", {
      "@context": "https://schema.org",
      "@type": "Person",
      name: p.name || siteName,
      email: p.email || undefined,
      url: canonical,
      jobTitle,
      image: absoluteUrl(base, (p as any)?.avatarUrl || "./assets/images/apple-touch-icon.png"),
      sameAs,
    });

    // ---- JSON-LD Organization (opsional)
    if (s.organization?.name) {
      ensureJsonLd("ld-org", {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: s.organization.name,
        legalName: s.organization.legalName || undefined,
        url: s.organization.url || canonical,
        logo: s.organization.logo ? absoluteUrl(base, s.organization.logo) : undefined,
        sameAs: s.organization.sameAs || undefined,
      });
    }

    // ---- JSON-LD WebSite + SearchAction
    ensureJsonLd("ld-website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: canonical,
      potentialAction: {
        "@type": "SearchAction",
        target: `${canonical}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });

    // ---- JSON-LD WebPage
    ensureJsonLd("ld-webpage", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: canonical,
      isPartOf: { "@type": "WebSite", url: canonical, name: siteName },
      description: desc,
      inLanguage: (s.locale || "en_US").split("_")[0],
      dateModified: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined,
    });

    // ---- JSON-LD Breadcrumb (section dinamis)
    const crumbsSrc = [
      { name: "Home", href: basePath },
      ...(data.about?.enabled ? [{ name: "About", href: "#about" }] : []),
      ...(data.projects ? [{ name: "Projects", href: "#projects" }] : []),
      ...(data.portfolio?.enabled ? [{ name: "Portfolio", href: "#portfolio" }] : []),
      ...(data.contact ? [{ name: "Contact", href: "#contact" }] : []),
    ];
    ensureJsonLd("ld-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbsSrc.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@id": absoluteUrl(base, c.href), name: c.name },
      })),
    });

    // ---- OG article:tag (opsional)
    (s.articleTags || []).forEach((tag) => ensurePropMeta("article:tag", tag));

    // ---- Live theme color saat toggle
    const obs = new MutationObserver(() => {
      const tc = getComputedStyle(document.documentElement).getPropertyValue("--bg") || "#0D1117";
      ensureThemeColor(tc.trim());
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });

    return () => obs.disconnect();
  }, [data]);

  return null;
};
