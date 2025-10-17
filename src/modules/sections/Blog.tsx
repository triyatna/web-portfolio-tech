import React, { useEffect, useState } from "react";

type BlogConfig = { enabled: boolean; rssJson: string; max: number };

export const Blog: React.FC<{ config: BlogConfig }> = ({ config }) => {
  const [items, setItems] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch(config.rssJson, { signal: controller.signal });
        const json = await res.json();
        const arr = json?.items || [];
        setItems(arr.slice(0, config.max || 6));
      } catch (e) {
        setError("Failed to load blog feed.");
      }
    }
    load();
    return () => controller.abort();
  }, [config.rssJson, config.max]);

  if (error || !items || items.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-semibold">Blog</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <a key={i} href={p.link} target="_blank" rel="noreferrer"
             className="rounded-xl border border-subtle bg-surface p-4 hover:shadow-md focus-ring block">
            <h3 className="font-medium">{p.title}</h3>
            <p className="mt-2 text-sm text-muted line-clamp-3">{p.description?.replace(/<[^>]+>/g, "")}</p>
            <span className="mt-3 block text-xs text-muted">{new Date(p.pubDate).toLocaleDateString()}</span>
          </a>
        ))}
      </div>
    </div>
  );
};
