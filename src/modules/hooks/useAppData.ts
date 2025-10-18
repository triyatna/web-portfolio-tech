import { useEffect, useMemo, useState } from "react";

export type SiteData = Record<string, any>;

export function useAppData() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const defaultUrl = `${base}/data/data.json`;

  const dataUrl = useMemo(() => String(import.meta.env.VITE_DATA_URL || defaultUrl), [defaultUrl]);

  const [data, setData] = useState<SiteData>({} as SiteData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(signal?: AbortSignal) {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(dataUrl, { cache: "no-store", signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const ct = res.headers.get("content-type") || "";
      const rawText = await res.text();
      const text = rawText.replace(/^\uFEFF/, "").trim();

      if (!/application\/json/i.test(ct) || /^\s*</.test(text)) {
        throw new Error("Not JSON (got HTML)");
      }

      setData(JSON.parse(text) as SiteData);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message || "Failed to fetch data.json");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [dataUrl]);

  return { data, loading, error, reload: () => load(), dataUrl };
}
