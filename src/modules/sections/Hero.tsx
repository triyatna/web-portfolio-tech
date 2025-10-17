import React, { Suspense, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { TerminalTyper } from "../components/TerminalTyper";

type Data = typeof import("../../data/data.json");
const ThreeHero = React.lazy(() => import("../components/ThreeHero"));

export const Hero: React.FC<{ data: Data }> = ({ data }) => {
  const t = data.hero?.terminal;
  const p = data.personal;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rX = useSpring(useTransform(my, [-50, 50], [10, -10]), { stiffness: 140, damping: 15 });
  const rY = useSpring(useTransform(mx, [-50, 50], [-10, 10]), { stiffness: 140, damping: 15 });
  const scale = useSpring(1, { stiffness: 180, damping: 18 });
  const shadow = useMotionTemplate`
    0px 25px 60px rgba(0,0,0,0.35),
    0 0 40px color-mix(in oklab, var(--accent) 35%, transparent)
  `;

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mx.set(((x / rect.width) * 2 - 1) * 50);
    my.set(((y / rect.height) * 2 - 1) * 50);
    el.style.setProperty("--px", `${x}px`);
    el.style.setProperty("--py", `${y}px`);
  };

  const onPointerLeave = () => {
    mx.set(0);
    my.set(0);
    scale.set(1);
  };

  return (
    <div className="grid items-center gap-10 md:grid-cols-2">
      <div className="relative">
        <div className="flex flex-col items-center text-center gap-4">
          <motion.div
            ref={cardRef}
            className="relative mx-auto h-56 w-56 sm:h-60 sm:w-60 rounded-3xl will-change-transform cursor-grab active:cursor-grabbing"
            style={{ rotateX: rX, rotateY: rY, scale, boxShadow: shadow }}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            onHoverStart={() => scale.set(1.02)}
            onHoverEnd={() => scale.set(1)}
            drag
            dragMomentum
            dragElastic={0.15}
            dragConstraints={{ left: -28, right: 28, top: -28, bottom: 28 }}
          >
            <div className="absolute inset-0 rounded-3xl p-[2px]">
              <div
                className="absolute inset-0 rounded-3xl opacity-70"
                style={{ backgroundImage: "linear-gradient(135deg, #1F6FEB, #2D9CDB)" }}
              />
              <div className="absolute inset-[2px] rounded-[1.35rem] bg-[color:var(--surface)] border border-subtle" />
            </div>

            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(600px at var(--px, 50%) var(--py, 50%), color-mix(in oklab, var(--accent) 35%, transparent), transparent 60%)",
                transition: "background 120ms ease-out",
              }}
            />

            <motion.img
              src={p.avatarUrl}
              alt={`${p.name} avatar`}
              className="avatar-img relative z-10 h-full w-full rounded-3xl object-cover"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              draggable={false}
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl mix-blend-overlay opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "100% 6px",
                animation: "scan 9s linear infinite",
              }}
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-15 mix-blend-overlay"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
          </motion.div>

          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            <span className="hero-title-text">{p.name}</span>
            <span aria-hidden className="hero-title-underline" />
          </h1>

          <p className="hero-tagline mt-3 max-w-xl text-base md:text-lg">{p.tagline}</p>
        </div>

        <style>
          {`
  .avatar-img{
  border-radius: 1.5rem;            
  transition: filter .35s ease, box-shadow .35s ease, transform .25s ease;
  will-change: filter, box-shadow, transform;
}
  [data-theme="light"] .avatar-img{
  filter: saturate(1.05) contrast(1.02) brightness(1.02);
  box-shadow:
    0 0 0 1px color-mix(in oklch, var(--accent) 10%, transparent) inset,
    0 16px 30px rgba(0,0,0,.08);
}
       [data-theme="dark"] .avatar-img{
  filter:
    grayscale(.85)      /* redupkan warna asli */
    saturate(.9)        /* jaga natural */
    contrast(1.06)      /* tambah ketegasan */
    brightness(.92)     /* sedikit lebih gelap agar sesuai dark bg */
    hue-rotate(-8deg);  /* hint cool tone */
  box-shadow:
    0 0 0 1px color-mix(in oklch, var(--accent) 22%, transparent) inset,
    0 10px 30px rgba(0,0,0,.55),
    0 0 28px color-mix(in oklch, var(--accent) 22%, transparent);
}

.avatar-img:hover{
  transform: translateY(-1px) scale(1.005);
}
         .hero-title-text{
    background: linear-gradient(90deg,
      color-mix(in oklch, var(--text) 100%, transparent) 0%,
      color-mix(in oklch, var(--accent) 70%, var(--text)) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    /* glow subtle agar tetap kebaca di atas visual 3D */
    filter: drop-shadow(0 0 18px color-mix(in oklch, var(--accent) 25%, transparent));
  }
  [data-theme="light"] .hero-title-text{
    filter: drop-shadow(0 1px 0 rgba(255,255,255,.35))
            drop-shadow(0 8px 24px rgba(0,0,0,.08));
  }

  .hero-title-underline{
    display:block;
    height: 3px;
    margin-top: .5rem;
    border-radius: 999px;
    background: linear-gradient(90deg,
      transparent 0%,
      color-mix(in oklch, var(--accent) 45%, transparent) 30%,
      color-mix(in oklch, var(--accent) 75%, transparent) 70%,
      transparent 100%
    );
  }

  .hero-tagline{
    font-family: "Saira", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
    color: var(--text);
    background:
      linear-gradient(to right,
        color-mix(in oklch, var(--bg) 78%, transparent) 0%,
        color-mix(in oklch, var(--bg) 60%, transparent) 100%);
    border: 1px solid var(--subtle);
    border-radius: .9rem;
    padding: .55rem .8rem;
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    backdrop-filter: saturate(1.1) blur(8px);
    box-shadow:
      0 2px 10px color-mix(in oklch, var(--bg) 65%, transparent),
      0 0 0 1px color-mix(in oklch, var(--accent) 7%, transparent) inset;
  }
  [data-theme="dark"] .hero-tagline{
    /* sedikit lebih terang agar tidak tenggelam di background */
    background:
      linear-gradient(to right,
        color-mix(in oklch, var(--bg) 65%, transparent) 0%,
        color-mix(in oklch, var(--bg) 45%, transparent) 100%);
    box-shadow:
      0 10px 30px -15px rgba(0,0,0,.7),
      0 0 0 1px color-mix(in oklch, var(--accent) 10%, transparent) inset;
  }
  [data-theme="light"] .hero-tagline{
    box-shadow:
      0 10px 24px -12px rgba(0,0,0,.22),
      0 0 0 1px color-mix(in oklch, var(--accent) 6%, transparent) inset;
  }

  .hero-tagline-dot{
    width: .5rem;
    height: .5rem;
    border-radius: 999px;
    background: var(--accent);
    box-shadow: 0 0 18px color-mix(in oklch, var(--accent) 45%, transparent);
    display: inline-block;
    animation: heroDot 2s ease-in-out infinite;
    flex: none;
  }
  @keyframes heroDot{
    0%, 100% { transform: translateY(0); opacity: .95; }
    50% { transform: translateY(-1px); opacity: .7; }
  }`}
        </style>
      </div>

      <div className="absolute inset-0 -z-10">
        <Suspense fallback={null}>
          <ThreeHero />
        </Suspense>
      </div>

      {/* Kanan: Terminal */}
      <div className="relative">
        {t && (
          <div className="mt-6 aspect-video">
            <TerminalTyper
              lines={t.lines}
              typeSpeedMs={t.typeSpeedMs ?? 40}
              backspaceSpeedMs={t.backspaceSpeedMs ?? 24}
              loop={!!t.loop}
              pauseBetweenLoopsMs={t.pauseBetweenLoopsMs ?? 1200}
              cursor={!!t.cursor}
            />
          </div>
        )}
      </div>
    </div>
  );
};
