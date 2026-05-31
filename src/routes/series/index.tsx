import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clapperboard } from "lucide-react";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";

export const Route = createFileRoute("/series/")({
  head: () => ({ meta: [{ title: "المسلسلات — ستاد TV" }] }),
  component: SeriesPage,
});

function SeriesPage() {
  useRealtimeInvalidate("series", [["series"]]);
  const { data: series } = useQuery({
    queryKey: ["series"],
    queryFn: async () => (await supabase.from("series").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold"><Clapperboard className="h-7 w-7 text-primary" /> المسلسلات</h1>
      {series && series.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {series.map((s) => (
            <Link
              key={s.id}
              to="/series/$id"
              params={{ id: s.id }}
              className="block overflow-hidden rounded-xl border border-border/60 gradient-card shadow-card transition hover:border-primary hover:scale-[1.02]"
            >
              {s.poster && <img src={s.poster} alt={s.title} className="aspect-[2/3] w-full object-cover" loading="lazy" />}
              <div className="p-3"><div className="line-clamp-1 text-sm font-semibold">{s.title}</div></div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          لا توجد مسلسلات بعد.
        </div>
      )}
    </div>
  );
}
