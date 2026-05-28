import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/import")({
  head: () => ({ meta: [{ title: "استيراد M3U — ستاد TV" }] }),
  component: ImportPage,
});

interface ParsedChannel { name: string; url: string; logo?: string; group?: string }

function parseM3U(text: string): ParsedChannel[] {
  const lines = text.split(/\r?\n/);
  const channels: ParsedChannel[] = [];
  let current: Partial<ParsedChannel> = {};
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("#EXTINF")) {
      const logo = line.match(/tvg-logo="([^"]+)"/)?.[1];
      const group = line.match(/group-title="([^"]+)"/)?.[1];
      const name = line.split(",").slice(1).join(",").trim();
      current = { name, logo, group };
    } else if (line && !line.startsWith("#")) {
      if (current.name) {
        channels.push({ name: current.name, url: line, logo: current.logo, group: current.group });
        current = {};
      }
    }
  }
  return channels;
}

const groupMap: Record<string, string> = {
  sports: "sports", sport: "sports",
  news: "news",
  movies: "movies", movie: "movies",
  series: "series",
  kids: "kids", kid: "kids",
};

function mapGroup(g?: string): string {
  if (!g) return "channels";
  const k = g.toLowerCase();
  return groupMap[k] ?? "channels";
}

function ImportPage() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<ParsedChannel[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUrl = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch(url);
      const t = await res.text();
      setText(t);
      setPreview(parseM3U(t));
      toast.success(`تم تحليل ${parseM3U(t).length} قناة`);
    } catch (e: any) { toast.error("تعذر جلب الرابط (CORS؟). الصق المحتوى يدوياً."); }
    finally { setLoading(false); }
  };

  const analyze = () => {
    const parsed = parseM3U(text);
    setPreview(parsed);
    toast.success(`تم تحليل ${parsed.length} قناة`);
  };

  const importAll = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    try {
      const rows = preview.map((p) => ({
        name: p.name, stream_url: p.url, logo: p.logo ?? null, category_slug: mapGroup(p.group),
      }));
      // chunk insert
      const chunks: typeof rows[] = [];
      for (let i = 0; i < rows.length; i += 100) chunks.push(rows.slice(i, i + 100));
      for (const ch of chunks) {
        const { error } = await supabase.from("channels").insert(ch);
        if (error) throw error;
      }
      toast.success(`تمت إضافة ${rows.length} قناة`);
      setPreview([]); setText(""); setUrl("");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold"><Upload className="h-6 w-6 text-primary" /> استيراد M3U</h1>

      <div className="mb-4 rounded-xl border border-border/60 gradient-card p-5">
        <label className="mb-2 block text-sm font-semibold">رابط M3U</label>
        <div className="flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/playlist.m3u" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
          <button onClick={fetchUrl} disabled={loading} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} جلب
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-border/60 gradient-card p-5">
        <label className="mb-2 block text-sm font-semibold">أو الصق محتوى M3U</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} className="w-full rounded-lg border border-input bg-background p-3 text-xs font-mono" dir="ltr" placeholder="#EXTM3U..." />
        <button onClick={analyze} className="mt-3 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold">تحليل</button>
      </div>

      {preview.length > 0 && (
        <div className="rounded-xl border border-border/60 gradient-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-semibold">معاينة ({preview.length} قناة)</div>
            <button onClick={importAll} disabled={loading} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} استيراد الكل
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-border/60">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-background"><tr><th className="p-2">الاسم</th><th className="p-2">القسم</th></tr></thead>
              <tbody>
                {preview.slice(0, 200).map((p, i) => (
                  <tr key={i} className="border-t border-border/40"><td className="p-2">{p.name}</td><td className="p-2 text-muted-foreground">{mapGroup(p.group)}</td></tr>
                ))}
              </tbody>
            </table>
            {preview.length > 200 && <div className="p-2 text-center text-xs text-muted-foreground">... و {preview.length - 200} قناة أخرى</div>}
          </div>
        </div>
      )}
    </div>
  );
}
