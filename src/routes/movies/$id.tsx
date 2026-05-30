import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HlsPlayer } from "@/components/HlsPlayer";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/movies/$id")({
  head: () => ({ meta: [{ title: "تفاصيل الفيلم — ستاد TV" }] }),
  component: MovieDetailsPage,
});

function MovieDetailsPage() {
  const { id } = Route.useParams();

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("movies").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="container mx-auto p-8 text-center text-muted-foreground">جاري التحميل...</div>;
  if (!movie) return <div className="container mx-auto p-8 text-center">الفيلم غير موجود</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/movies" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronRight className="h-4 w-4 rotate-180" /> العودة للأفلام
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <HlsPlayer src={movie.stream_url} poster={movie.poster ?? undefined} />
          <h1 className="mt-4 text-2xl font-bold">{movie.title}</h1>
          {movie.description && <p className="mt-2 text-sm text-muted-foreground">{movie.description}</p>}
        </div>
        {movie.poster && (
          <aside>
            <img src={movie.poster} alt={movie.title} className="w-full rounded-xl border border-border/60 object-cover" />
          </aside>
        )}
      </div>
    </div>
  );
}
