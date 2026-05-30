import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HlsPlayer } from "@/components/HlsPlayer";
import { ChevronRight, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/series/$id")({
  head: () => ({ meta: [{ title: "حلقات المسلسل — ستاد TV" }] }),
  component: SeriesDetailsPage,
});

function SeriesDetailsPage() {
  const { id } = Route.useParams();

  const { data: series, isLoading } = useQuery({
    queryKey: ["series-one", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("series").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: episodes } = useQuery({
    queryKey: ["episodes", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("*")
        .eq("series_id", id)
        .order("season", { ascending: true })
        .order("episode_number", { ascending: true });
      return data ?? [];
    },
  });

  const [currentId, setCurrentId] = useState<string | null>(null);
  const current = useMemo(
    () => episodes?.find((e) => e.id === currentId) ?? episodes?.[0] ?? null,
    [episodes, currentId],
  );

  useEffect(() => {
    if (!currentId && episodes && episodes.length > 0) setCurrentId(episodes[0].id);
  }, [episodes, currentId]);

  if (isLoading) return <div className="container mx-auto p-8 text-center text-muted-foreground">جاري التحميل...</div>;
  if (!series) return <div className="container mx-auto p-8 text-center">المسلسل غير موجود</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/series" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronRight className="h-4 w-4 rotate-180" /> العودة للمسلسلات
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          {current ? (
            <>
              <HlsPlayer src={current.stream_url} poster={series.poster ?? undefined} />
              <h1 className="mt-4 text-2xl font-bold">{series.title}</h1>
              <div className="mt-1 text-sm text-muted-foreground">
                الموسم {current.season} • الحلقة {current.episode_number} — {current.title}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              لا توجد حلقات بعد لهذا المسلسل
            </div>
          )}
          {series.description && <p className="mt-3 text-sm text-muted-foreground">{series.description}</p>}
        </div>

        <aside>
          <h2 className="mb-3 text-sm font-bold text-muted-foreground">قائمة الحلقات</h2>
          <div className="space-y-2">
            {episodes?.map((e) => {
              const active = e.id === current?.id;
              return (
                <button
                  key={e.id}
                  onClick={() => setCurrentId(e.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-2 text-right transition ${
                    active ? "border-primary bg-primary/10" : "border-border/60 bg-card hover:border-primary"
                  }`}
                >
                  <PlayCircle className={`h-5 w-5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-semibold">{e.title}</div>
                    <div className="text-xs text-muted-foreground">س{e.season} • ح{e.episode_number}</div>
                  </div>
                </button>
              );
            })}
            {(!episodes || episodes.length === 0) && (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                لا توجد حلقات
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
