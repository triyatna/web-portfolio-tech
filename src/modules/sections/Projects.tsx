import React, { useDeferredValue, useEffect, useMemo, useState } from "react";

type GitHubConfig = {
  enabled: boolean;
  user: string;
  max: number;
  filter?: { excludeForks?: boolean; topicsIncludeAny?: string[] };
};
type Config = {
  github?: GitHubConfig;
  custom?: Array<{ name: string; icon?: string; description?: string; link?: string }>;
};

type ViewMode = "grid" | "list";
type SortKey = "stars" | "updated" | "name";
type SortDir = "asc" | "desc";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description?: string;
  stargazers_count: number;
  updated_at: string;
  language?: string;
  fork?: boolean;
  topics?: string[];
};

export const Projects: React.FC<{ config: Config }> = ({ config }) => {
  const gh = config.github;
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [sortKey, setSortKey] = useState<SortKey>("stars");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    if (!gh?.enabled || !gh.user) return;
    const controller = new AbortController();

    (async () => {
      try {
        setError(null);
        setRepos(null);

        const res = await fetch(
          `https://api.github.com/users/${encodeURIComponent(gh.user)}/repos?per_page=100`,
          { headers: { Accept: "application/vnd.github+json" }, signal: controller.signal }
        );

        if (!res.ok) {
          if (res.status === 403) {
            setError("GitHub rate limit reached. Try again later.");
            return;
          }
          setError(`GitHub error: ${res.status}`);
          return;
        }

        const json = (await res.json()) as unknown;
        let items: Repo[] = Array.isArray(json) ? (json as Repo[]) : [];

        if (gh.filter?.excludeForks) items = items.filter((r) => !r.fork);

        const topics = gh.filter?.topicsIncludeAny ?? [];
        if (topics.length) {
          const want = topics.map((t) => t.toLowerCase());
          items = items.filter(
            (r) =>
              Array.isArray(r.topics) &&
              r.topics.some((t) => want.includes(String(t).toLowerCase()))
          );
        }

        items.sort(
          (a, b) =>
            b.stargazers_count - a.stargazers_count ||
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        setRepos(items);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError("Failed to load GitHub repositories.");
      }
    })();

    return () => controller.abort();
  }, [
    gh?.enabled,
    gh?.user,
    gh?.filter?.excludeForks,
    JSON.stringify(gh?.filter?.topicsIncludeAny),
  ]);

  const filtered = useMemo(() => {
    if (!repos) return null;

    const query = dq.trim().toLowerCase();

    let items = repos.filter((r) => {
      if (!query) return true;
      const hay =
        `${r.name ?? ""} ${r.description ?? ""} ${r.language ?? ""} ${(r.topics || []).join(" ")}`.toLowerCase();
      return hay.includes(query);
    });

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "stars":
          cmp = (a.stargazers_count || 0) - (b.stargazers_count || 0);
          break;
        case "updated":
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    const max = gh?.max ?? 9;
    return items.slice(0, max);
  }, [repos, dq, sortKey, sortDir, gh?.max]);

  return (
    <div className="space-y-10">
      {gh?.enabled && (
        <div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-2xl font-semibold">GitHub Projects</h2>
            {filtered && (
              <span className="text-xs text-muted">
                Showing {filtered.length} of {repos?.length ?? 0}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <label htmlFor="repo-search" className="sr-only">
                Search repositories
              </label>
              <div className="relative">
                <input
                  id="repo-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search repositories (name, description, language, topics)"
                  className="w-full rounded-xl border border-subtle bg-[color:var(--bg)]/60 backdrop-blur px-3 py-2 text-sm focus-ring"
                  type="search"
                  autoComplete="off"
                />
                <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-muted">
                  ⌘K
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="repo-sort" className="sr-only">
                  Sort
                </label>
                <select
                  id="repo-sort"
                  value={`${sortKey}:${sortDir}`}
                  onChange={(e) => {
                    const [k, d] = e.target.value.split(":") as [SortKey, SortDir];
                    setSortKey(k);
                    setSortDir(d);
                  }}
                  className="rounded-xl border border-subtle bg-[color:var(--bg)]/60 backdrop-blur px-3 py-2 text-sm focus-ring"
                >
                  <option value="stars:desc">Stars (high → low)</option>
                  <option value="stars:asc">Stars (low → high)</option>
                  <option value="updated:desc">Updated (new → old)</option>
                  <option value="updated:asc">Updated (old → new)</option>
                  <option value="name:asc">Name (A → Z)</option>
                  <option value="name:desc">Name (Z → A)</option>
                </select>
              </div>

              <div className="inline-flex rounded-xl border border-subtle bg-[color:var(--bg)]/60 backdrop-blur p-0.5">
                <button
                  type="button"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                  className={`h-9 w-9 rounded-lg focus-ring transition cursor-pointer  ${
                    view === "grid" ? "bg-[color:var(--bg)]/70" : "hover:bg-[color:var(--bg)]/90"
                  }`}
                  title="Grid view"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="mx-auto h-5 w-5 text-[color:var(--text)]"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  className={`h-9 w-9 rounded-lg focus-ring transition cursor-pointer ${
                    view === "list" ? "bg-[color:var(--bg)]/70" : "hover:bg-[color:var(--bg)]/90"
                  }`}
                  title="List view"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="mx-auto h-5 w-5 text-[color:var(--text)]"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {!filtered && !error && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl border border-subtle bg-surface/60 backdrop-blur animate-pulse"
                />
              ))}
            </div>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {filtered && filtered.length === 0 && (
            <p className="text-muted mt-2">No repositories found for your filters.</p>
          )}

          {filtered &&
            filtered.length > 0 &&
            (view === "grid" ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((r) => (
                  <a
                    key={r.id}
                    href={r.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-subtle bg-surface p-4 hover:shadow-md focus-ring block"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{r.name}</h3>
                      <span aria-label="stars" title="Stars" className="text-sm text-muted">
                        ★ {r.stargazers_count}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted min-h-[2.5rem]">
                      {r.description || "No description"}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                      <span>Updated {new Date(r.updated_at).toLocaleDateString()}</span>
                      {r.language && <span>• {r.language}</span>}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-[var(--border)] rounded-xl border border-subtle bg-surface">
                {filtered.map((r) => (
                  <li key={r.id} className="p-4">
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between focus-ring rounded"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-medium">{r.name}</h3>
                          {r.language && (
                            <span className="rounded-md border border-subtle bg-[color:var(--bg)] px-2 py-0.5 text-xs">
                              {r.language}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                          {r.description || "No description"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
                        <span title="Stars">★ {r.stargazers_count}</span>
                        <span>Updated {new Date(r.updated_at).toLocaleDateString()}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      )}

      {config.custom && config.custom.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold">My Projects</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.custom.map((p, i) => (
              <a
                key={i}
                href={p.link || "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-subtle bg-surface p-4 hover:shadow-md focus-ring block"
              >
                <div className="flex items-center gap-3">
                  {p.icon && <img src={p.icon} alt="" className="h-8 w-8 rounded" />}
                  <h3 className="font-medium">{p.name}</h3>
                </div>
                <p className="mt-2 text-sm text-muted">{p.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
