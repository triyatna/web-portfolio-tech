import React, { useEffect, useMemo, useState } from "react";
import data from "../data/data.json";
import { SEO } from "../modules/components/SEO";
import { useTheme } from "../modules/hooks/useTheme";
import { MatrixRain } from "../modules/components/MatrixRain";
import { ThemeToggle } from "../modules/components/ThemeToggle";
import { Hero } from "../modules/sections/Hero";
import { About } from "../modules/sections/About";
import { Resume } from "../modules/sections/Resume";
import { Tech } from "../modules/sections/Tech";
import { Projects } from "../modules/sections/Projects";
import { Contact } from "../modules/sections/Contact";
import type { ContactConfig } from "../modules/sections/Contact";
import { Footer } from "../modules/sections/Footer";
import { Portfolio } from "../modules/sections/Portfolio";
import { Loader } from "../modules/components/Loader";

const Section: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <section id={id} className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24">
    {children}
  </section>
);

const ALLOWED_MODES = ["mailto", "formspree", "disabled"] as const;
type Mode = (typeof ALLOWED_MODES)[number];
function normalizeMode(x: unknown, fallback: Mode = "mailto"): Mode {
  return (ALLOWED_MODES as readonly string[]).includes(String(x)) ? (x as Mode) : fallback;
}

export default function App() {
  const [boot, setBoot] = useState(true);
  const { theme } = useTheme();
  const [active, setActive] = useState<string>("hero");

  const contactCfg: ContactConfig = useMemo(() => {
    const raw = data.contact ?? { form: { mode: "mailto" } };
    const mode = normalizeMode(raw.form?.mode);
    return {
      enabled: Boolean(raw.enabled ?? true),
      form: {
        mode,
        to: raw.form?.to || "",
        formspreeId: raw.form?.formspreeId || "",
      },
      contact_me: {
        address: raw.contact_me?.address || "",
        email: raw.contact_me?.email || raw.form?.to || "",
        website: raw.contact_me?.website || "",
      },
    };
  }, []);

  const navItems = useMemo(
    () =>
      [
        { id: "hero", label: "Home", show: true },
        { id: "about", label: "About", show: Boolean(data.about?.enabled) },
        { id: "resume", label: "Resume", show: Boolean(data.resume?.enabled) },
        { id: "tech", label: "Tech", show: Boolean(data.techStack?.enabled) },
        { id: "projects", label: "Projects", show: true },
        { id: "portfolio", label: "Portfolio", show: Boolean(data.portfolio?.enabled) },
        { id: "contact", label: "Contact", show: true },
      ].filter((n) => n.show),
    []
  );

  useEffect(() => {
    const wait = Promise.all([
      (document as any).fonts?.ready?.catch(() => {}) ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 1000)),
    ]);
    wait.finally(() => setBoot(false));

    if (import.meta.env.PROD) {
      fetch("/data.json")
        .then((res) => {
          if (res.ok) console.warn("[SECURITY] /data.json should NOT be publicly accessible.");
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sections = navItems
      .map((n) => document.getElementById(n.id))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { root: null, rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [navItems]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <>
      {data.useLoader !== false && (
        <Loader
          show={boot}
          onDone={() => setBoot(false)}
          minDurationMs={2000}
          logs={[
            "[BOOT] mounting modules…",
            "[OK]   core:init ✓",
            "[OK]   shaders:compile (3 targets) ✓",
            "[OK]   assets:prefetch (svg, png, json) ✓",
            "[SEC]  CSP ok | sandbox ok",
            "[NET]  github api dns-resolve",
            "[NET]  github api handshake",
            "[SYS]  cache primed | delta-ready",
          ]}
        />
      )}

      <div className="min-h-screen selection:bg-black/10 selection:text-current">
        <MatrixRain />
        <SEO />

        <header className="sticky top-4 z-40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between rounded-2xl border border-subtle bg-[color:var(--bg)]/55 backdrop-blur-xl shadow-md pl-3 pr-2 py-2">
              <a
                href="#hero"
                className="flex items-center gap-2 font-semibold tracking-tight focus-ring rounded"
              >
                <img
                  src={data.personal?.logo_path || "./apple-touch-icon.png"}
                  alt={`${data.personal?.name || "Logo"}`}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="brand-text hidden sm:inline">
                  {data.personal?.name || "My Portfolio"}
                </span>
              </a>

              <nav className="hidden md:flex items-center gap-1 text-sm">
                {navItems.map((n) => {
                  const isActive = active === n.id;
                  return (
                    <a
                      key={n.id}
                      href={`#${n.id}`}
                      onClick={() => setActive(n.id)}
                      className={`nav-link relative inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition focus-ring
                        ${isActive ? "nav-active" : "text-muted hover:text-[color:var(--accent)]"}
                      `}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="nav-led" aria-hidden="true" />
                      <span
                        className={`nav-bracket ${isActive ? "opacity-100" : "opacity-0"}`}
                        aria-hidden="true"
                      >
                        [&nbsp;
                      </span>
                      <span className="truncate">{n.label}</span>
                      <span
                        className={`nav-bracket ${isActive ? "opacity-100" : "opacity-0"}`}
                        aria-hidden="true"
                      >
                        &nbsp;]
                      </span>
                    </a>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main>
          <Section id="hero">
            <Hero data={data} />
          </Section>

          {data.about?.enabled && (
            <Section id="about">
              <About markdown={data.about.markdown} />
            </Section>
          )}

          {data.resume?.enabled && (
            <Section id="resume">
              <Resume resume={data.resume} />
            </Section>
          )}

          {data.techStack?.enabled && (
            <Section id="tech">
              <Tech badges={data.techStack.badges || []} />
            </Section>
          )}

          <Section id="projects">
            <Projects config={data.projects} />
          </Section>

          {data.portfolio?.enabled && (
            <Section id="portfolio">
              <Portfolio config={data.portfolio} />
            </Section>
          )}

          <Section id="contact">
            <Contact config={contactCfg} />
          </Section>
        </main>

        <Footer socials={data.personal?.socials || {}} />
      </div>

      <style>{`
        .brand-text {
          background: linear-gradient(90deg,
            color-mix(in oklch, var(--text) 100%, transparent) 0%,
            color-mix(in oklch, var(--accent) 70%, var(--text)) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .nav-link { position: relative; }
        .nav-led {
          position: absolute;
          left: 6px; top: 50%;
          transform: translateY(-50%) scaleY(.6);
          width: 2px; height: 60%;
          background: var(--accent);
          border-radius: 999px;
          opacity: 0;
          transition: opacity .18s ease, transform .18s ease;
          box-shadow: 0 0 12px color-mix(in oklch, var(--accent) 60%, transparent);
        }
        .nav-bracket {
          color: color-mix(in oklch, var(--accent) 75%, var(--text));
          transition: opacity .18s ease;
        }
        .nav-active {
          color: var(--accent);
          background: color-mix(in oklch, var(--accent) 10%, transparent);
          box-shadow:
            0 0 0 1px color-mix(in oklch, var(--accent) 25%, transparent) inset,
            0 8px 22px -14px color-mix(in oklch, var(--accent) 50%, transparent);
        }
        .nav-active .nav-led { opacity: 1; transform: translateY(-50%) scaleY(1); }
        .nav-active::after {
          content: "";
          position: absolute; left: 12%; right: 12%; bottom: 2px;
          height: 2px; border-radius: 999px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: .9; animation: navScan 2.2s linear infinite;
        }
        @keyframes navScan { 0% { transform: translateX(-8%); } 100% { transform: translateX(8%); } }
        @media (prefers-reduced-motion: reduce) { .nav-active::after { animation: none !important; } }
      `}</style>
    </>
  );
}
