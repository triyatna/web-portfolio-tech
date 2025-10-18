import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ContactConfig = {
  enabled: boolean;
  form: { mode: "mailto" | "formspree" | "disabled"; to?: string; formspreeId?: string };
  contact_me?: { address?: string; email?: string; website?: string };
};

export const Contact: React.FC<{ config: ContactConfig; displayName?: string }> = ({
  config,
  displayName,
}) => {
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [execOut, setExecOut] = useState<string | null>(null);
  if (config.form.mode === "disabled" || !config.enabled) return null;

  const name = (displayName ?? "").trim() || "Anonymous";
  const email = (config.contact_me?.email ?? config.form.to ?? "").trim();
  const website = (config.contact_me?.website ?? "").trim();

  const esc = (v?: string) =>
    (v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const highlightPy = (code: string) => {
    let s = esc(code);
    s = s.replace(/f?("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/g, '<span class="tok-string">$1</span>');
    s = s.replace(/(#.*)$/gm, '<span class="tok-comment">$1</span>');
    const kw = [
      "from",
      "import",
      "def",
      "class",
      "return",
      "None",
      "True",
      "False",
      "if",
      "else",
      "elif",
      "for",
      "while",
      "in",
      "with",
      "pass",
    ];
    s = s.replace(new RegExp(`\\b(${kw.join("|")})\\b`, "g"), '<span class="tok-kw">$1</span>');
    s = s.replace(/\b([A-Z][A-Za-z0-9_]*)\b/g, '<span class="tok-type">$1</span>');
    s = s.replace(/\b(print)\b/g, '<span class="tok-fn">$1</span>');
    return s;
  };

  const pyCode = useMemo(() => {
    const n = name.replace(/"/g, '\\"');
    const e = email.replace(/"/g, '\\"');
    const w = website.replace(/"/g, '\\"');
    return [
      "import sys",
      "",
      "def hello(n, e=None, w=None):",
      '    msg = f"Hello! my name {n}"',
      "    tail = []",
      '    if e: tail.append(f"reach me at {e}")',
      '    if w: tail.append(f"or {w}")',
      '    return msg + (", " + " ".join(tail) if tail else "")',
      "",
      `print(hello("${n}", "${e}", "${w}"))`,
    ].join("\n");
  }, [name, email, website]);

  const onExecute = () => {
    let msg = `Hello! my name ${name}`;
    const tail: string[] = [];
    if (email) tail.push(`reach me at ${email}`);
    if (website) tail.push(`or ${website}`);
    if (tail.length) msg += `, ${tail.join(" ")}`;
    setExecOut(msg);
    window.clearTimeout((onExecute as any)._t);
    (onExecute as any)._t = window.setTimeout(() => setExecOut(null), 60000);
  };

  const codePaneRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null); // ← kontainer constraints
  const rowRefs = useRef<HTMLDivElement[]>([]);
  const lines = useMemo(() => pyCode.split("\n"), [pyCode]);
  const [wrapCounts, setWrapCounts] = useState<number[]>([]);

  useEffect(() => {
    const el = codePaneRef.current;
    if (!el) return;
    const measure = () => {
      const lh = 24;
      const counts = rowRefs.current.map((r) => {
        if (!r) return 1;
        const h = r.getBoundingClientRect().height;
        return Math.max(1, Math.ceil(h / lh));
      });
      setWrapCounts(counts);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    rowRefs.current.forEach((r) => r && ro.observe(r));
    measure();
    document.fonts?.ready?.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [lines]);

  const visualNumbers = useMemo(() => {
    const nums: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      const times = wrapCounts[i] ?? 1;
      for (let k = 0; k < times; k++) nums.push(i + 1);
    }
    return nums;
  }, [lines, wrapCounts]);

  const mailtoHref = (subject: string, body: string) => {
    const to = config.form.to || "";
    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setStatus(null);
    setSending(true);
    const fd = new FormData(e.currentTarget);
    const fromName = String(fd.get("name") || "");
    const fromEmail = String(fd.get("email") || "");
    const message = String(fd.get("message") || "");

    if (config.form.mode === "mailto") {
      const subject = `Portfolio contact from ${fromName}`;
      const body = `Name: ${fromName}\nEmail: ${fromEmail}\n\n${message}`;
      window.location.href = mailtoHref(subject, body);
      setSending(false);
      setStatus("Opening your mail client…");
      return;
    }

    if (config.form.mode === "formspree") {
      const id = config.form.formspreeId?.trim();
      if (!id) {
        setStatus("Missing Formspree ID.");
        setSending(false);
        return;
      }
      try {
        const res = await fetch(`https://formspree.io/f/${id}`, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(e.currentTarget),
        });
        setSending(false);
        if (res.ok) {
          setStatus("Message sent!");
          e.currentTarget.reset();
        } else setStatus("Failed to send.");
      } catch {
        setSending(false);
        setStatus("Network error.");
      }
      return;
    }

    setSending(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1.1fr_.9fr]">
      <div
        ref={cardRef}
        className="relative rounded-2xl border border-subtle bg-[color:var(--bg)]/55 backdrop-blur-xl shadow-lg"
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-subtle">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-muted">contact.py</span>
          <div className="ml-auto">
            <button
              type="button"
              onClick={onExecute}
              className="rounded-md border border-subtle bg-[color:var(--bg)]/60 px-2 py-1 text-xs hover:bg-[color:var(--bg)]/75 focus-ring"
              aria-label="Execute"
              title="Execute"
            >
              Execute
            </button>
          </div>
        </div>

        <div
          ref={codePaneRef}
          className="code-pane grid grid-cols-[auto_1fr] gap-x-3 px-4 py-4 font-mono text-sm leading-[24px]"
        >
          <ol className="select-none text-right text-xs text-muted pr-2 leading-[24px]">
            {visualNumbers.map((n, i) => (
              <li key={i} className="tabular-nums">
                {n}
              </li>
            ))}
          </ol>
          <div className="space-y-0">
            {lines.map((ln, i) => (
              <div
                key={i}
                ref={(el) => {
                  if (el) rowRefs.current[i] = el;
                }}
                className="ow-anywhere whitespace-pre-wrap break-words"
              >
                <code dangerouslySetInnerHTML={{ __html: highlightPy(ln || " ") }} />
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {execOut && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto absolute right-3 top-3 z-10 max-w-xs rounded-xl border border-subtle bg-[color:var(--bg)]/80 backdrop-blur px-3 py-2 text-sm shadow-lg touch-none select-none"
              role="status"
              aria-live="polite"
              drag
              dragConstraints={cardRef}
              dragMomentum={false}
              dragElastic={0.12}
              whileDrag={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-[color:var(--accent)]" />
                <div className="min-w-0 break-words">
                  <strong className="block text-[color:var(--text)]">Output</strong>
                  <span className="text-muted">{execOut}</span>
                </div>
                <button
                  onClick={() => setExecOut(null)}
                  className="ml-auto rounded-md border border-subtle bg-[color:var(--bg)]/60 px-1.5 py-0.5 text-xs hover:bg-[color:var(--bg)]/75"
                  aria-label="Close"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-subtle bg-[color:var(--bg)]/55 backdrop-blur-xl shadow-lg p-6 sm:p-8 space-y-4"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Send a message</h3>
          {config.form.mode === "mailto" && (
            <span className="text-xs text-muted">Mode: mailto</span>
          )}
          {config.form.mode === "formspree" && (
            <span className="text-xs text-muted">Mode: Formspree</span>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Name</span>
            <input
              required
              name="name"
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-subtle bg-[color:var(--bg)]/60 px-3 py-2 focus-ring"
              placeholder="Your name"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Email</span>
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-subtle bg-[color:var(--bg)]/60 px-3 py-2 focus-ring"
              placeholder="you@example.com"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-muted">Message</span>
          <textarea
            required
            name="message"
            rows={5}
            className="mt-1 w-full rounded-lg border border-subtle bg-[color:var(--bg)]/60 px-3 py-2 focus-ring"
            placeholder="Tell me a bit about your project…"
          />
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={sending}
            className="cursor-pointer group relative inline-flex items-center rounded-xl p-[2px] focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span
              className="
                contact-btn relative inline-flex items-center gap-2 rounded-[0.65rem]
                px-4 py-2 text-sm font-medium transition
                shadow-[0_4px_18px_rgba(0,0,0,0.15)]
                group-hover:shadow-[0_10px_30px_rgba(88,166,255,0.35)]
                group-hover:-translate-y-0.5 active:translate-y-0
              "
            >
              {sending ? (
                <>
                  <span
                    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    aria-hidden="true"
                  />
                  Sending…
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-[18px] w-[18px]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 2L11 13" />
                    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Send
                </>
              )}
            </span>
          </button>

          {status && (
            <p className="text-sm text-muted" role="status" aria-live="polite">
              {status}
            </p>
          )}
        </div>
      </form>

      <style>{`
        .tok-kw{color:#c678dd}.tok-string{color:#98c379}.tok-type{color:#e5c07b}.tok-fn{color:#61afef}.tok-comment{color:#7f848e}
        :root:not(.dark)[data-theme="light"] .tok-comment{color:#6b7280}
        :root:not(.dark)[data-theme="light"] .tok-kw{color:#a626a4}
        :root:not(.dark)[data-theme="light"] .tok-string{color:#22863a}
        :root:not(.dark)[data-theme="light"] .tok-type{color:#b08800}
        :root:not(.dark)[data-theme="light"] .tok-fn{color:#005cc5}
        .code-pane code,.code-pane div{white-space:pre-wrap;word-break:break-word}.ow-anywhere{overflow-wrap:anywhere}
        .btn-rot{background:conic-gradient(from 0deg,color-mix(in oklch,var(--accent) 80%,transparent),transparent 20% 60%,color-mix(in oklch,var(--accent) 80%,transparent));filter:blur(8px);opacity:.65;animation:rot 3.5s linear infinite}
        @keyframes rot{to{transform:rotate(360deg)}}
        .contact-btn{background:var(--accent);color:#fff;
          box-shadow:0 0 0 1px color-mix(in oklch,var(--accent) 18%,transparent) inset,0 8px 22px -14px color-mix(in oklch,var(--accent) 50%,transparent)}
        [data-theme="light"] .contact-btn{background:color-mix(in oklch,var(--accent) 94%,white);color:#f0f0f0}
      `}</style>
    </div>
  );
};
