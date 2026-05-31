import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Film } from "lucide-react";
import { useRealtimeInvalidate } from "@/hooks/useRealtimeInvalidate";

export const Route = createFileRoute("/movies/")({
  head: () => ({ meta: [{ title: "الأفلام — ستاد TV" }] }),
  component: MoviesPage,
});

function MoviesPage() {
  useRealtimeInvalidate("movies", [["movies"]]);
  const { data: movies } = useQuery({
    queryKey: ["movies"],
    queryFn: async () => (await supabase.from("movies").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold"><Film className="h-7 w-7 text-primary" /> الأفلام</h1>
      {movies && movies.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movies.map((m) => (
            <Link
              key={m.id}
              to="/movies/$id"
              params={{ id: m.id }}
              className="block overflow-hidden rounded-xl border border-border/60 gradient-card shadow-card transition hover:border-primary hover:scale-[1.02]"
            >
              {m.poster && <img src={m.poster} alt={m.title} className="aspect-[2/3] w-full object-cover" loading="lazy" />}
              <div className="p-3"><div className="line-clamp-1 text-sm font-semibold">{m.title}</div></div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          لا توجد أفلام بعد. أضفها من لوحة التحكم.
        </div>
      )}
    </div>
  );
}
