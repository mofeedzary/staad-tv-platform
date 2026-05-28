import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChannelCard } from "@/components/ChannelCard";
import { Tv, Trophy, Film, Clapperboard, Newspaper, Baby, Search, PlayCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ستاد TV — بث مباشر للقنوات والرياضة" },
      { name: "description", content: "شاهد القنوات العربية والمباريات والأفلام والمسلسلات بجودة عالية مباشرة على ستاد TV." },
    ],
  }),
  component: HomePage,
});

const sectionIcons: Record<string, typeof Tv> = {
  channels: Tv, sports: Trophy, news: Newspaper, movies: Film, series: Clapperboard, kids: Baby,
};

function HomePage() {
  const [q, setQ] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").eq("visible", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: channels } = useQuery({
    queryKey: ["channels", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase.from("channels").select("*").eq("enabled", true).limit(24);
      if (error) throw error;
      return data;
    },
  });

  const filtered = channels?.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-live live-pulse" />
              بث مباشر الآن
            </div>
            <h1 className="text-balance bg-gradient-to-l from-foreground via-primary to-accent bg-clip-text text-4xl font-black leading-tight text-transparent md:text-6xl">
              ستاد TV
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
              منصتك الأولى لمشاهدة القنوات العربية، أهم المباريات، الأفلام والمسلسلات بجودة عالية وبدون انقطاع.
            </p>

            {/* Search */}
            <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-card">
              <Search className="mr-2 h-5 w-5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث عن قناة..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <Link to="/channels" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                استكشف
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">الأقسام</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {categories?.map((cat) => {
            const Icon = sectionIcons[cat.slug] ?? Tv;
            return (
              <Link
                key={cat.id}
                to="/channels"
                search={{ category: cat.slug }}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border/60 gradient-card p-6 shadow-card transition hover:-translate-y-1 hover:border-primary hover:shadow-glow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold">{cat.name}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured channels */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">القنوات المميزة</h2>
            <p className="mt-1 text-sm text-muted-foreground">اختر قناتك وابدأ المشاهدة فوراً</p>
          </div>
          <Link to="/channels" className="text-sm text-primary hover:underline">عرض الكل ←</Link>
        </div>

        {filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filtered.map((ch) => (
              <ChannelCard key={ch.id} channel={ch} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            <PlayCircle className="mx-auto mb-3 h-10 w-10 opacity-40" />
            لا توجد قنوات متاحة حالياً
          </div>
        )}
      </section>
    </div>
  );
}
