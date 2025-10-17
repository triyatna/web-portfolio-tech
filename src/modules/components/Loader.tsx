import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  show?: boolean;
  onDone?: () => void;
  minDurationMs?: number;
  logs?: string[];
};

export const Loader: React.FC<Props> = ({ show = true, onDone, minDurationMs = 1200, logs }) => {
  const isReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [pct, setPct] = useState(0);
  const [i, setI] = useState(0);
  const startedAt = useRef<number>(performance.now());

  const LINES = useMemo(
    () =>
      (logs && logs.length
        ? logs
        : [
            "[BOOT] mounting modules…",
            "[OK]   core:init ✓",
            "[OK]   shaders:compile (3 targets) ✓",
            "[OK]   assets:prefetch (svg, png, json) ✓",
            "[SEC]  CSP ok | sandbox ok",
            "[NET]  github api dns-resolve",
            "[NET]  github api handshake",
            "[GFX]  three.js warmup",
            "[SYS]  cache primed | delta-ready",
          ]
      ).map(String),
    [logs]
  );

  useEffect(() => {
    if (show) {
      setPct(0);
      setI(0);
      startedAt.current = performance.now();
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    let raf = 0;
    const tick = () => {
      setPct((prev) => {
        if (prev >= 100) return 100;
        const step =
          prev < 40
            ? 4 + Math.random() * 6
            : prev < 85
              ? 1 + Math.random() * 3
              : Math.random() * 1.2;
        return Math.min(99, prev + step);
      });
      raf = requestAnimationFrame(tick);
    };
    if (!isReduced) raf = requestAnimationFrame(tick);
    else setPct(100);
    return () => cancelAnimationFrame(raf);
  }, [show, isReduced]);

  useEffect(() => {
    if (!show) return;
    const t = setInterval(() => setI((v) => (v + 1) % (LINES.length * 2)), 320);
    return () => clearInterval(t);
  }, [show, LINES.length]);

  useEffect(() => {
    if (!show) return;
    if (pct < 99.8) return;
    const elapsed = performance.now() - startedAt.current;
    const left = Math.max(0, minDurationMs - elapsed);
    const t = setTimeout(() => {
      setPct(100);
      onDone?.();
    }, left);
    return () => clearTimeout(t);
  }, [pct, show, minDurationMs, onDone]);

  if (!show) return null;

  const prettyPct = Math.floor(pct);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center loader-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-live="polite"
        aria-busy="true"
        role="status"
      >
        <div className="hl-bg absolute inset-0" />
        <div className="hl-scan absolute inset-0" />

        <motion.div
          className="relative w-[min(92vw,760px)] rounded-2xl border border-subtle bg-[color:var(--bg)]/70 backdrop-blur-xl shadow-2xl overflow-hidden"
          initial={{ y: 8, scale: 0.98, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 6, scale: 0.985, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-subtle">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-3 text-xs text-muted">boot@portfolio — zsh</span>
          </div>

          <div className="p-4">
            <div className="hl-terminal rounded-lg border border-subtle bg-[color:var(--bg)]/55 px-3 py-2 font-mono text-sm leading-6 overflow-hidden">
              <div className="max-h-[38vh] overflow-hidden">
                {LINES.slice(0, (i % LINES.length) + 1).map((l, idx) => (
                  <div key={`log-${idx}`} className="whitespace-pre-wrap">
                    <span className="text-[color:var(--accent)]">➜</span> {l}
                  </div>
                ))}
                <div className="opacity-80">
                  <span className="text-[color:var(--accent)]">➜</span> initializing…
                  <span className="ml-1 inline-block animate-pulse">▋</span>
                </div>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded bg-[color:var(--bg)]/60 border border-subtle">
                <div
                  className="h-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent)]/60 hl-bar"
                  style={{ width: `${prettyPct}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>loading modules</span>
                <span>{prettyPct}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        /* Blur seluruh konten di balik overlay */
        .loader-backdrop {
          backdrop-filter: blur(12px) saturate(1.05);
        }
        .hl-bg{
          background:
            radial-gradient(60% 100% at 50% 100%, color-mix(in oklch, var(--accent) 20%, transparent) 0%, transparent 70%),
            linear-gradient(180deg, color-mix(in oklch, var(--bg) 0%, transparent) 0%, transparent 50%);
        }
        .hl-scan{
          background-image: linear-gradient(
            to bottom,
            rgba(255,255,255,0.05) 0%,
            rgba(255,255,255,0.0) 60%
          );
          background-size: 100% 200%;
          animation: hlScan 3.2s linear infinite;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        @keyframes hlScan {
          0% { background-position-y: 0%; }
          100% { background-position-y: 200%; }
        }
        .hl-terminal{
          box-shadow:
            inset 0 0 0 1px color-mix(in oklch, var(--accent) 8%, transparent),
            0 10px 30px -15px rgba(0,0,0,.5);
        }
        .hl-bar{
          background-size: 200% 100%;
          animation: hlShine 1.6s linear infinite;
        }
        @keyframes hlShine {
          0% { background-position-x: 0%; }
          100% { background-position-x: 200%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hl-scan, .hl-bar { animation: none !important; }
        }
      `}</style>
    </AnimatePresence>
  );
};
