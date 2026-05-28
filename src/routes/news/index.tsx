import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChannelCard } from "@/components/ChannelCard";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/news/")({
  head: () => ({ meta: [{ title: "قنوات الأخبار — ستاد TV" }] }),
  component: NewsPage,
});

function NewsPage() {
  const { data } = useQuery({
    queryKey: ["news-channels"],
    queryFn: async () => (await supabase.from("channels").select("*").eq("enabled", true).eq("category_slug", "news")).data ?? [],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold"><Newspaper className="h-7 w-7 text-primary" /> قنوات الأخبار</h1>
      {data && data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {data.map((c) => <ChannelCard key={c.id} channel={c} />)}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          لا توجد قنوات أخبار حالياً. <Link to="/channels" className="text-primary hover:underline">تصفح كل القنوات</Link>
        </div>
      )}
    </div>
  );
}
