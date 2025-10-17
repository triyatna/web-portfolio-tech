import React from "react";

export const About: React.FC<{ markdown: string }> = ({ markdown }) => {
  const html = markdown
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/`([^`]+)`/gim, "<code>$1</code>")
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\n/g, "<br />");

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-2">About Me</h2>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-30 blur-2xl"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(31,111,235,.55), rgba(45,156,219,.35))",
        }}
      />
      <article
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace',
        }}
        className="about mx-auto rounded-3xl border border-subtle bg-[color:var(--bg)]/55 backdrop-blur-xl shadow-lg p-6 sm:p-8"
      >
        <div className="typography" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <style>{`
        .about .typography {
          color: var(--text);
          font-size: 13px;
          line-height: 1.75;
        }
        .about .typography h1,
        .about .typography h2,
        .about .typography h3 {
          margin: 0.6em 0 0.35em;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--text);
        }
        .about .typography h1 { font-size: clamp(1.5rem, 2vw + 0.9rem, 2.4rem); }
        .about .typography h2 { font-size: clamp(1.3rem, 1.1vw + 0.9rem, 1.7rem); }
        .about .typography h3 { font-size: clamp(1rem, 0.9vw + 0.8rem, 1rem); }

        .about .typography p { margin: 0.6em 0; }

        .about .typography a {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .about .typography a:hover {
          opacity: .9;
        }

        .about .typography code {
          background: color-mix(in oklab, var(--surface) 92%, transparent);
          border: 1px solid var(--border);
          padding: .15rem .35rem;
          border-radius: .4rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .about .typography strong { color: var(--text); }

        .about .typography ul { padding-left: 1.2rem; margin: .6em 0; list-style: disc; }
        .about .typography ol { padding-left: 1.2rem; margin: .6em 0; list-style: decimal; }
        .about .typography li { margin: .25em 0; }

        .about .typography h2::after,
        .about .typography h3::after {
          content: "";
          display: block;
          height: 2px;
          margin-top: .35rem;
          border-radius: 999px;
          background-image: var(--gradient);
          opacity: .25;
        }

        .about::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
        }

        @media (min-width: 640px) {
          .about .typography { font-size: 1.05rem; line-height: 1.85; }
        }
        @media (min-width: 1024px) {
          .about .typography { font-size: 1.08rem; }
        }
      `}</style>
    </div>
  );
};
