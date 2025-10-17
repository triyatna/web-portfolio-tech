import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type PortfolioItem = {
  icon: string;
  name: string;
  description?: string;
  link?: string;
};

export type PortfolioConfig = {
  enabled: boolean;
  data: PortfolioItem[];
};

export const Portfolio: React.FC<{ config: PortfolioConfig }> = ({ config }) => {
  const items = useMemo(() => (Array.isArray(config?.data) ? config.data : []), [config]);
  const [active, setActive] = useState<number | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const open = useCallback((idx: number) => setActive(idx), []);
  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length]
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close, prev, next]);

  useEffect(() => {
    if (active === null) return;
    const img = new Image();
    img.src = items[active]?.icon || "";
  }, [active, items]);

  const swipeRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;
    let x0 = 0;
    let dragging = false;
    const threshold = 48;

    const down = (e: PointerEvent) => {
      dragging = true;
      x0 = e.clientX;
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - x0;
      if (dx > threshold) prev();
      if (dx < -threshold) next();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", () => (dragging = false));
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", () => (dragging = false));
    };
  }, [prev, next]);

  if (!config?.enabled) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Portfolio</h2>
          <p className="mt-1 text-sm text-muted">Selected works & experiments</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-muted">
          No portfolio items yet. Add them to <code>data.json</code>.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, idx) => (
            <div
              key={`${it.name}-${idx}`}
              className="pf-card group relative overflow-hidden rounded-2xl border border-subtle bg-surface focus-within:ring-2 focus-within:ring-[color:var(--accent)]/50"
            >
              <button
                type="button"
                onClick={() => open(idx)}
                className="block w-full text-left"
                aria-label={`Open ${it.name}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={it.icon}
                    alt={it.name}
                    loading="lazy"
                    className="pf-img h-full w-full object-cover"
                  />
                  <div className="pf-overlay pointer-events-none absolute inset-0" />
                </div>
              </button>

              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <h3 className="font-medium leading-tight">{it.name}</h3>
                  {it.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{it.description}</p>
                  )}
                </div>
                {it.link && (
                  <a
                    href={it.link}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-lg border border-subtle bg-[color:var(--bg)]/60 px-2 py-1 text-xs hover:bg-[color:var(--accent)]/10 hover:text-[color:var(--accent)] transition"
                    aria-label={`Visit ${it.name}`}
                    title="Visit"
                  >
                    Visit
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {active !== null && items[active] && (
          <motion.div
            className="pf-backdrop fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.figure
              role="dialog"
              aria-modal="true"
              aria-label={items[active].name}
              className="pf-dialog relative mx-auto flex h-full w-full items-center justify-center p-3 sm:p-4"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.98 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.985 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div ref={swipeRef} className="pf-stage">
                <div className="pf-media">
                  <img src={items[active].icon} alt={items[active].name} className="pf-photo" />

                  <button
                    type="button"
                    className="pf-ctrl pf-prev"
                    aria-label="Previous"
                    onClick={prev}
                  >
                    <span aria-hidden>←</span>
                  </button>
                  <button
                    type="button"
                    className="pf-ctrl pf-next"
                    aria-label="Next"
                    onClick={next}
                  >
                    <span aria-hidden>→</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Close"
                    onClick={close}
                    className="pf-close"
                    title="Close"
                  >
                    ✕
                  </button>

                  <div className="pf-count" aria-hidden>
                    {active + 1} / {items.length}
                  </div>
                </div>

                <figcaption className="pf-caption">
                  <div className="min-w-0">
                    <strong className="block text-[color:var(--text)]">{items[active].name}</strong>
                    {items[active].description && (
                      <span className="mt-0.5 block text-muted">{items[active].description}</span>
                    )}
                  </div>
                  {items[active].link && (
                    <a
                      href={items[active].link}
                      target="_blank"
                      rel="noreferrer"
                      className="pf-visit"
                    >
                      Visit ↗
                    </a>
                  )}
                </figcaption>
              </div>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* ==== CARD LIST ==== */
        .pf-card .pf-img {
          transition: transform .5s cubic-bezier(.2,.7,.2,1), filter .5s;
          filter: saturate(0.9) contrast(1.02);
        }
        .pf-card:hover .pf-img { transform: scale(1.03); filter: saturate(1) contrast(1.05); }

        .pf-overlay {
          background:
            radial-gradient(80% 60% at 50% 100%, color-mix(in oklch, var(--accent) 20%, transparent) 0%, transparent 70%),
            linear-gradient(to top, rgba(0,0,0,.35), rgba(0,0,0,0));
          opacity: .18;
          transition: opacity .35s ease;
        }
        [data-theme="light"] .pf-overlay { opacity: .12; }
        .pf-card:hover .pf-overlay { opacity: .28; }

        /* ==== LIGHTBOX BACKDROP ==== */
        .pf-backdrop {
          background: color-mix(in oklch, black 70%, transparent);
          backdrop-filter: blur(6px);
        }

        /* ==== STAGE LAYOUT ==== */
        .pf-stage {
          width: min(96vw, 1200px);
          height: min(92vh, 820px);
          display: grid;
          grid-template-rows: 1fr auto;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .pf-stage { width: 100vw; height: 100svh; gap: 10px; }
        }

        .pf-media {
          position: relative;
          border: 1px solid var(--border-subtle, #30363D);
          background: color-mix(in oklch, var(--bg) 85%, transparent);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
          box-shadow: 0 10px 40px rgba(0,0,0,.35);
        }

        .pf-photo {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 14px;
          transition: transform .25s ease;
        }

        /* ==== CONTROLS ==== */
        .pf-ctrl {
          --btn: clamp(36px, 3.5vw + 18px, 56px);
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: var(--btn);
          height: var(--btn);
          display: grid;
          place-items: center;
          border-radius: 999px;
          border: 1px solid var(--border-subtle, #30363D);
          background: color-mix(in oklch, var(--bg) 70%, transparent);
          backdrop-filter: blur(8px);
          color: var(--text);
          font-weight: 600;
          transition: background .2s ease, transform .2s ease, opacity .2s ease;
          opacity: .95;
        }
        .pf-prev { left: clamp(8px, 2vw, 16px); }
        .pf-next { right: clamp(8px, 2vw, 16px); }
        .pf-ctrl:hover { transform: translateY(-50%) scale(1.03); background: color-mix(in oklch, var(--bg) 85%, transparent); }
        @media (max-width: 640px) {
          .pf-ctrl { opacity: .85; }
        }

        .pf-close {
          position: absolute;
          top: 8px;
          right: 8px;
          border-radius: 10px;
          border: 1px solid var(--border-subtle, #30363D);
          background: color-mix(in oklch, var(--bg) 80%, transparent);
          padding: 6px 10px;
          font-size: 14px;
          backdrop-filter: blur(8px);
          transition: background .2s ease, transform .2s ease;
        }
        .pf-close:hover { transform: translateY(-1px); background: color-mix(in oklch, var(--bg) 90%, transparent); }

        .pf-count {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 999px;
          border: 1px solid var(--border-subtle, #30363D);
          background: color-mix(in oklch, var(--bg) 70%, transparent);
          backdrop-filter: blur(8px);
          color: var(--text);
        }

        /* ==== CAPTION BAR ==== */
        .pf-caption {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border: 1px solid var(--border-subtle, #30363D);
          background: color-mix(in oklch, var(--bg) 80%, transparent);
          border-radius: 14px;
          padding: 10px 12px;
          backdrop-filter: blur(8px);
        }
        .pf-visit {
          white-space: nowrap;
          border: 1px solid var(--border-subtle, #30363D);
          background: color-mix(in oklch, var(--bg) 70%, transparent);
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 12px;
          transition: background .2s ease, color .2s ease;
        }
        .pf-visit:hover { background: color-mix(in oklch, var(--accent) 15%, var(--bg)); color: var(--accent); }
      `}</style>
    </div>
  );
};
