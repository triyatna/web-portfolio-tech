import React, { useEffect } from "react";
import siteData from "../../data/data.json";

type SEOData = {
  siteUrl?: string;
  basePath?: string;
  title?: string;
  description?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  siteName?: string;
  locale?: string;
  twitter?: string; // @handle
  keywords?: string[];
  robots?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  yandexSiteVerification?: string;
  alternates?: Record<string, string>; // { "en": "/en/", "id": "/" }
  rss?: string;
  preconnect?: string[];
};

function q<K extends keyof HTMLElementTagNameMap>(sel: string) {
  return document.head.querySelector(sel) as HTMLElement | null;
}

function ensureAltSitemap(href: string) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="sitemap"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "sitemap";
    document.head.appendChild(el);
  }
  el.href = href;
}

function ensureMeta(name: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function ensurePropMeta(property: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function ensureLink(rel: string, href: string, attrs: Record<string, string> = {}) {
  if (!href) return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

function ensureJsonLd(id: string, data: any) {
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

function hostFromUrl(u?: string) {
  try {
    return u ? new URL(u).origin : "";
  } catch {
    return "";
  }
}

export const SEO: React.FC = () => {
  useEffect(() => {
    const p = siteData.personal || {};
    const s: SEOData = siteData.seo || {};

    const siteUrl = (s.siteUrl || "").replace(/\/$/, "");
    const baseFromVite = (import.meta as any).env?.BASE_URL || "/";
    const basePath = s.basePath || baseFromVite || "/";
    const canonical = absoluteUrl(siteUrl || window.location.origin, basePath);
    const sitemapHref = new URL("/sitemap.xml", siteUrl || window.location.origin).toString();

    const title = s.title || `${p.name ?? "Portfolio"}`;
    const desc = s.description || p.tagline || "A fast, modern, programmer-themed portfolio.";
    const imageAbs = absoluteUrl(canonical, s.image || "/og-image.png");
    const imageW = s.imageWidth || 1200;
    const imageH = s.imageHeight || 630;
    const siteName = s.siteName || p.name || "Portfolio";
    const locale = s.locale || "en_US";
    const twitter = s.twitter || "";
    const robots =
      s.robots || "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";
    const keywords = (s.keywords || []).join(", ");

    document.title = title;

    ensureMeta("description", desc);
    if (keywords) ensureMeta("keywords", keywords);
    ensureMeta("robots", robots);
    ensureMeta(
      "theme-color",
      (getComputedStyle(document.documentElement).getPropertyValue("--bg") || "#0D1117").trim()
    );
    ensureLink("canonical", canonical);
    ensureAltSitemap(sitemapHref);
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

    ensureMeta("twitter:card", "summary_large_image");
    ensureMeta("twitter:title", title);
    ensureMeta("twitter:description", desc);
    ensureMeta("twitter:image", imageAbs);
    if (twitter) {
      ensureMeta("twitter:site", twitter);
      ensureMeta("twitter:creator", twitter);
    }

    ensureMeta("googlebot", robots);

    if (s.googleSiteVerification) ensureMeta("google-site-verification", s.googleSiteVerification);
    if (s.bingSiteVerification) ensureMeta("msvalidate.01", s.bingSiteVerification);
    if (s.yandexSiteVerification) ensureMeta("yandex-verification", s.yandexSiteVerification);

    if (s.rss) {
      ensureLink("alternate", absoluteUrl(canonical, s.rss), {
        type: "application/rss+xml",
        title: `${p.name || "Feed"} RSS`,
      });
    }

    if (s.alternates) {
      Object.entries(s.alternates).forEach(([lang, href]) => {
        const abs = absoluteUrl(siteUrl || window.location.origin, href);
        const sel = `link[rel="alternate"][hreflang="${lang}"]`;
        let el = document.head.querySelector(sel) as HTMLLinkElement | null;
        if (!el) {
          el = document.createElement("link");
          el.rel = "alternate";
          el.hreflang = lang;
          document.head.appendChild(el);
        }
        el.href = abs;
      });
      let xd = document.head.querySelector(
        'link[rel="alternate"][hreflang="x-default"]'
      ) as HTMLLinkElement | null;
      if (!xd) {
        xd = document.createElement("link");
        xd.rel = "alternate";
        xd.hreflang = "x-default";
        document.head.appendChild(xd);
      }
      xd.href = canonical;
    }

    const hosts = new Set<string>();
    const avatarHost = hostFromUrl(p.avatarUrl);
    if (avatarHost) hosts.add(avatarHost);
    (s.preconnect || []).forEach((h) => hosts.add(h));
    hosts.add(siteUrl || window.location.origin);

    hosts.forEach((h) => {
      const origin = hostFromUrl(h) || h;
      if (!origin) return;
      ensureLink("dns-prefetch", origin);
      ensureLink("preconnect", origin, { crossOrigin: "" });
    });

    const sameAs = Object.values(p.socials || {}).filter(Boolean);
    const person = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: p.name || siteName,
      email: p.email || undefined,
      url: canonical,
      jobTitle: "Web Developer",
      image: absoluteUrl(canonical, p.avatarUrl || "/apple-touch-icon.png"),
      sameAs,
    };
    ensureJsonLd("ld-person", person);

    const website = {
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
    ensureJsonLd("ld-website", website);

    const crumbs = [
      { name: "Home", href: basePath },
      ...(siteData.about?.enabled ? [{ name: "About", href: "#about" }] : []),
      ...(siteData.projects ? [{ name: "Projects", href: "#projects" }] : []),
      ...(siteData.portfolio?.enabled ? [{ name: "Portfolio", href: "#portfolio" }] : []),
      ...(siteData.contact ? [{ name: "Contact", href: "#contact" }] : []),
    ].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@id": absoluteUrl(canonical, c.href), name: c.name },
    }));
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs,
    };
    ensureJsonLd("ld-breadcrumb", breadcrumb);

    const obs = new MutationObserver(() => {
      const tc = getComputedStyle(document.documentElement).getPropertyValue("--bg") || "#0D1117";
      ensureMeta("theme-color", tc.trim());
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });
    return () => obs.disconnect();
  }, []);

  return null;
};
