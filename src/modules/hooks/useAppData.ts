import { useEffect, useMemo, useState } from "react";
import fallback from "../../data/data.json";

export type SiteData = typeof fallback;

export function useAppData() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  const defaultUrl = `${base}/data/data.json`;

  const dataUrl = useMemo(() => String(import.meta.env.VITE_DATA_URL || defaultUrl), [defaultUrl]);

  const [data, setData] = useState<SiteData>(fallback);
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

      let json: SiteData;
      try {
        json = JSON.parse(text) as SiteData;
      } catch (err: any) {
        throw new Error(`Invalid JSON: ${err?.message || "Parse error"}`);
      }

      setData(json);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message || "Failed to fetch data.json");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [dataUrl]);

  const reload = () => load();

  return { data, loading, error, reload, dataUrl };
}
