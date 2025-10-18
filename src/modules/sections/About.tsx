import React, { useMemo } from "react";

export const About: React.FC<{ markdown: string }> = ({ markdown }) => {
  const html = useMemo(() => {
    if (!markdown) return "";

    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    let src = markdown.replace(/\r\n/g, "\n");
    src = esc(src);

    const codeBlocks: string[] = [];
    src = src.replace(/```([\w-]+)?\n([\s\S]*?)```/g, (_m, lang = "", code = "") => {
      const safe = esc(code);
      const idx = codeBlocks.push(
        `<pre class="md-code"><code class="lang-${lang.trim()}">${safe}</code></pre>`
      );
      return `\u0000CODE${idx - 1}\u0000`;
    });
    src = src.replace(/^>\s?(.*)$/gim, (_m, a) => `<blockquote>${a}</blockquote>`);
    src = src
      .replace(/^###\s+(.*)$/gim, "<h3>$1</h3>")
      .replace(/^##\s+(.*)$/gim, "<h2>$1</h2>")
      .replace(/^#\s+(.*)$/gim, "<h1>$1</h1>");
    const toList = (text: string) =>
      text
        .replace(/(^|\n)(\d+\.\s+.*(?:\n\d+\.\s+.*)*)/g, (m) =>
          m
            .replace(/((?:^|\n))(\d+)\.\s+(.*)/g, (_mm, br, _num, item) => `${br}<li>${item}</li>`)
            .replace(/((?:^|\n))(<li>[\s\S]*?<\/li>)/g, "$1$2")
        )
        .replace(/((?:^|\n))(?:<li>[\s\S]*?<\/li>)(?:(\n<li>[\s\S]*?<\/li>)+)/g, (m) => {
          const items = m.trim().replace(/^\n+|\n+$/g, "");
          return `\n<ol>${items.replace(/\n/g, "")}</ol>`;
        })
        .replace(/(^|\n)([-*+]\s+.*(?:\n[-*+]\s+.*)*)/g, (m) =>
          m
            .replace(/((?:^|\n))[-*+]\s+(.*)/g, (_mm, br, item) => `${br}<li>${item}</li>`)
            .replace(/((?:^|\n))(<li>[\s\S]*?<\/li>)/g, "$1$2")
        )
        .replace(/((?:^|\n))(?:<li>[\s\S]*?<\/li>)(?:(\n<li>[\s\S]*?<\/li>)+)/g, (m) => {
          const items = m.trim().replace(/^\n+|\n+$/g, "");
          return `\n<ul>${items.replace(/\n/g, "")}</ul>`;
        });

    src = toList(src);

    const safeUrl = (u: string) => {
      const dec = u.replace(/&amp;/g, "&");
      if (/^(https?:|mailto:|tel:)/i.test(dec)) return dec;
      return "#";
    };
    src = src.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_m, text, url) =>
        `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`
    );

    src = src
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^\*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);

    src = src
      .split(/\n{2,}/)
      .map((blk) =>
        /^(<h\d|<ul>|<ol>|<pre|<blockquote>)/.test(blk.trim())
          ? blk
          : `<p>${blk.replace(/\n/g, "<br/>")}</p>`
      )
      .join("\n");

    src = src.replace(/\u0000CODE(\d+)\u0000/g, (_m, i) => codeBlocks[Number(i)] || "");

    return src;
  }, [markdown]);

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-2">About Me</h2>

      <div
        aria-hidden="true"
        className="about-bg pointer-events-none absolute inset-0 -z-10 rounded-3xl opacity-30 blur-2xl"
      />

      <article className="about mx-auto rounded-3xl border border-subtle bg-[color:var(--bg)]/55 backdrop-blur-xl shadow-lg p-6 sm:p-8">
        <div className="typography" dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      <style>{`
        .about-bg {
          background-image:
            linear-gradient(135deg,
              color-mix(in oklch, var(--accent) 55%, transparent),
              color-mix(in oklch, var(--accent) 35%, transparent));
        }

        .about .typography {
          color: var(--text);
          font-size: 13px;
          line-height: 1.75;
          font-family: "Caveat", cursive;
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
        .about .typography h3 { font-size: clamp(1.05rem, 0.9vw + 0.8rem, 1.2rem); }

        .about .typography p { margin: 0.6em 0; }

        .about .typography a {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .about .typography a:hover { opacity: .9; }

        .about .typography code {
          background: color-mix(in oklch, var(--surface) 92%, transparent);
          border: 1px solid var(--border);
          padding: .15rem .35rem;
          border-radius: .4rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }

        .about .typography .md-code {
          background: color-mix(in oklch, var(--surface) 95%, transparent);
          border: 1px solid var(--border);
          padding: .75rem .9rem;
          border-radius: .7rem;
          overflow: auto;
          font-size: .925rem;
          line-height: 1.6;
          box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--accent) 6%, transparent);
        }

        .about .typography strong { color: var(--text); font-weight: 700; }
        .about .typography em { font-style: italic; }

        .about .typography ul { padding-left: 1.2rem; margin: .6em 0; list-style: disc; }
        .about .typography ol { padding-left: 1.2rem; margin: .6em 0; list-style: decimal; }
        .about .typography li { margin: .25em 0; }

        .about .typography blockquote {
          margin: .8rem 0;
          padding: .6rem .9rem;
          border-left: 3px solid color-mix(in oklch, var(--accent) 60%, transparent);
          background: color-mix(in oklch, var(--surface) 96%, transparent);
          border-radius: .5rem;
        }

        .about .typography h2::after,
        .about .typography h3::after {
          content: "";
          display: block;
          height: 2px;
          margin-top: .35rem;
          border-radius: 999px;
          background-image: linear-gradient(90deg, transparent, var(--accent), transparent);
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
