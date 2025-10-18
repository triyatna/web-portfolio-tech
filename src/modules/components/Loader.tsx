import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  show?: boolean;
  onDone?: () => void;
  onProgress?: (pct: number, lineIndex: number) => void;
  canFinish?: boolean;
  minDurationMs?: number;
  logs?: string[];
};

export const Loader: React.FC<Props> = ({
  show = true,
  onDone,
  onProgress,
  canFinish = true,
  minDurationMs = 1200,
  logs,
}) => {
  const isReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [pct, setPct] = useState(0);
  const [lineIdx, setLineIdx] = useState(-1);
  const startedAt = useRef<number>(performance.now());
  const doneFired = useRef(false);

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

  const mapIndexToPct = (idx: number, total: number, allowFull: boolean) => {
    if (total <= 0) return allowFull ? 100 : 99;
    const base = total + 1;
    const raw = Math.round((Math.max(0, idx + 1) / base) * 100);
    const capped = Math.min(allowFull ? 100 : 99, raw);
    if (!allowFull && idx >= total - 1) return Math.min(95, capped);
    return Math.min(99, capped);
  };

  useEffect(() => {
    if (show) {
      setPct(0);
      setLineIdx(-1);
      startedAt.current = performance.now();
      doneFired.current = false;
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    if (isReduced) {
      setLineIdx(LINES.length - 1);
      setPct(mapIndexToPct(LINES.length - 1, LINES.length, false));
      return;
    }
    const stepMs = 320;
    let t = window.setInterval(() => {
      setLineIdx((prev) => {
        const next = Math.min(prev + 1, LINES.length - 1);
        return next;
      });
    }, stepMs);
    return () => window.clearInterval(t);
  }, [show, LINES.length, isReduced]);

  useEffect(() => {
    if (!show) return;
    const p = mapIndexToPct(lineIdx, LINES.length, false);
    setPct(p);
    onProgress?.(p, Math.max(-1, lineIdx));
  }, [lineIdx, LINES.length, show]);

  useEffect(() => {
    if (!show) return;
    const allLogsShown = lineIdx >= LINES.length - 1 && LINES.length > 0;
    if (!allLogsShown) return;

    const tryFinish = () => {
      if (doneFired.current) return;
      const elapsed = performance.now() - startedAt.current;
      if (elapsed < minDurationMs) {
        const left = minDurationMs - elapsed;
        window.setTimeout(tryFinish, left);
        return;
      }
      if (!canFinish) {
        const hold = Math.max(95, mapIndexToPct(lineIdx, LINES.length, false));
        setPct(hold);
        onProgress?.(hold, lineIdx);
        return;
      }
      doneFired.current = true;
      setPct(100);
      onProgress?.(100, lineIdx);
      onDone?.();
    };

    const id = window.setTimeout(tryFinish, isReduced ? 0 : 280);
    return () => window.clearTimeout(id);
  }, [show, lineIdx, LINES.length, minDurationMs, canFinish, isReduced, onDone, onProgress]);

  if (!show) return null;
  const prettyPct = Math.floor(pct);
  const shownCount = Math.max(0, lineIdx + 1);

  return (
    <AnimatePresence>
      <motion.div
        key="loader-shell"
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
                {LINES.slice(0, shownCount).map((l, idx) => (
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
                  style={{
                    width: `${prettyPct}%`,
                    transition: "width .35s ease",
                  }}
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
        .loader-backdrop { backdrop-filter: blur(12px) saturate(1.05); }
        .hl-bg{
          background:
            radial-gradient(60% 100% at 50% 100%, color-mix(in oklch, var(--accent) 20%, transparent) 0%, transparent 70%),
            linear-gradient(180deg, color-mix(in oklch, var(--bg) 0%, transparent) 0%, transparent 50%);
        }
        .hl-scan{
          background-image: linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.0) 60%);
          background-size: 100% 200%;
          animation: hlScan 3.2s linear infinite;
          mix-blend-mode: overlay; pointer-events: none;
        }
        @keyframes hlScan { 0% { background-position-y: 0%; } 100% { background-position-y: 200%; } }
        .hl-terminal{
          box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--accent) 8%, transparent), 0 10px 30px -15px rgba(0,0,0,.5);
        }
        .hl-bar{ background-size: 200% 100%; animation: hlShine 1.6s linear infinite; }
        @keyframes hlShine { 0% { background-position-x: 0%; } 100% { background-position-x: 200%; } }
        @media (prefers-reduced-motion: reduce) { .hl-scan, .hl-bar { animation: none !important; } }
      `}</style>
    </AnimatePresence>
  );
};
