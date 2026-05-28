import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChannelCard } from "@/components/ChannelCard";
import { Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const search = z.object({ category: z.string().optional() });

export const Route = createFileRoute("/channels/")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "القنوات المباشرة — ستاد TV" },
      { name: "description", content: "تصفح جميع القنوات حسب التصنيف وشاهد البث المباشر." },
    ],
  }),
  component: ChannelsPage,
});

function ChannelsPage() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("visible", true).order("sort_order");
      return data ?? [];
    },
  });

  const { data: channels, isLoading } = useQuery({
    queryKey: ["channels", category ?? "all"],
    queryFn: async () => {
      let query = supabase.from("channels").select("*").eq("enabled", true).order("name");
      if (category) query = query.eq("category_slug", category);
      const { data } = await query;
      return data ?? [];
    },
  });

  const filtered = channels?.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">القنوات المباشرة</h1>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => navigate({ search: {} })}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
        >
          الكل
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate({ search: { category: cat.slug } })}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${category === cat.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="mb-8 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث في القنوات..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          لا توجد قنوات في هذا التصنيف
        </div>
      )}
    </div>
  );
}
