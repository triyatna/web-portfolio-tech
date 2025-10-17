import React, { useEffect, useRef } from "react";

export const MatrixRain: React.FC = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let visible = true;

    const isReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setupSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const wCss = window.innerWidth;
      const hCss = window.innerHeight;

      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.width = Math.max(1, Math.floor(wCss * dpr));
      canvas.height = Math.max(1, Math.floor(hCss * dpr));

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      return { wCss, hCss, dpr };
    };

    let { wCss, hCss } = setupSize();

    const fontSize = 16;
    const colWidth = fontSize;
    let columns = Math.max(1, Math.floor(wCss / colWidth));
    let drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -20));

    ctx.font = `14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
    ctx.textBaseline = "top";

    const chars = ["0", "1"];

    const readVar = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const draw = () => {
      const bg = readVar("--bg") || "#0D1117";
      ctx.fillStyle = bg;
      ctx.globalAlpha = 0.06;
      ctx.fillRect(0, 0, wCss, hCss);
      ctx.globalAlpha = 1;

      const accent = readVar("--accent") || "#58a6ffaa";
      ctx.fillStyle = accent;

      for (let i = 0; i < columns; i++) {
        const x = i * colWidth;
        const y = drops[i] * fontSize;

        const ch = chars[(Math.random() * 2) | 0];
        ctx.fillText(ch, x, y);

        if (y > hCss && Math.random() > 0.975) {
          drops[i] = Math.floor(-20 * Math.random());
        } else {
          drops[i] += 1;
        }
      }

      if (!isReduced && visible) raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      ({ wCss, hCss } = setupSize());
      columns = Math.max(1, Math.floor(wCss / colWidth));
      drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -20));
    };

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      if (visible && !isReduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    if (!isReduced) raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas id="matrix-canvas" ref={ref} aria-hidden="true" />;
};
