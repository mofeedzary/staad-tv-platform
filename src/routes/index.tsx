import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChannelCard } from "@/components/ChannelCard";
import { Tv, Trophy, Film, Clapperboard, Newspaper, Baby, PlayCircle, ChevronLeft, Radio, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ستاد TV — بث مباشر للقنوات والرياضة" },
      { name: "description", content: "شاهد القنوات العربية والمباريات والأفلام والمسلسلات بجودة عالية مباشرة على ستاد TV." },
    ],
  }),
  component: HomePage,
});

const sectionMeta: Record<string, { icon: typeof Tv; gradient: string }> = {
  channels: { icon: Tv, gradient: "from-blue-500 to-blue-700" },
  sports: { icon: Trophy, gradient: "from-orange-400 to-orange-600" },
  news: { icon: Newspaper, gradient: "from-rose-500 to-rose-700" },
  movies: { icon: Film, gradient: "from-violet-500 to-violet-700" },
  series: { icon: Clapperboard, gradient: "from-fuchsia-500 to-fuchsia-700" },
  kids: { icon: Baby, gradient: "from-emerald-400 to-emerald-600" },
  docs: { icon: BookOpen, gradient: "from-cyan-500 to-cyan-700" },
};

const quickSections = [
  { label: "القنوات الرياضية", to: "/channels", search: { category: "sports" }, icon: Trophy, gradient: "from-[#FF9800] to-[#FF5722]" },
  { label: "القنوات الإخبارية", to: "/channels", search: { category: "news" }, icon: Newspaper, gradient: "from-[#EF4444] to-[#B91C1C]" },
  { label: "الأفلام", to: "/movies", icon: Film, gradient: "from-[#1565C0] to-[#42A5F5]" },
  { label: "المسلسلات", to: "/series", icon: Clapperboard, gradient: "from-[#7C3AED] to-[#A855F7]" },
  { label: "الأطفال", to: "/channels", search: { category: "kids" }, icon: Baby, gradient: "from-[#10B981] to-[#059669]" },
  { label: "الوثائقيات", to: "/channels", icon: BookOpen, gradient: "from-[#0891B2] to-[#0E7490]" },
] as const;

function useBanners() {
  const { data } = useQuery({
    queryKey: ["home-banners"],
    queryFn: async () => {
      const [{ data: matches }, { data: movies }] = await Promise.all([
        supabase.from("matches").select("id, team1_name, team2_name, team1_logo, team2_logo, tournament, status, match_time").in("status", ["live", "upcoming"]).order("match_time").limit(3),
        supabase.from("movies").select("id, title, poster, description").order("created_at", { ascending: false }).limit(3),
      ]);
      const items: Array<{ key: string; kind: "match" | "movie"; title: string; subtitle: string; image?: string | null; cta: string; to: string; params?: Record<string, string>; badge?: string }> = [];
      (matches ?? []).forEach((m) => items.push({
        key: `m-${m.id}`, kind: "match",
        title: `${m.team1_name} × ${m.team2_name}`,
        subtitle: m.tournament ?? "مباراة قادمة",
        image: m.team1_logo ?? m.team2_logo ?? null,
        cta: m.status === "live" ? "شاهد الآن" : "تذكيري",
        to: "/matches",
        badge: m.status === "live" ? "مباشر" : "قريباً",
      }));
      (movies ?? []).forEach((mv) => items.push({
        key: `mv-${mv.id}`, kind: "movie",
        title: mv.title, subtitle: mv.description?.slice(0, 90) ?? "فيلم جديد",
        image: mv.poster, cta: "مشاهدة", to: "/movies/$id", params: { id: mv.id }, badge: "جديد",
      }));
      return items;
    },
  });
  return data ?? [];
}

function BannerSlider() {
  const banners = useBanners();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="gradient-hero relative h-48 overflow-hidden rounded-3xl shadow-glow md:h-64">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-accent live-pulse" /> بث مباشر الآن
          </div>
          <h2 className="mt-3 text-2xl font-black md:text-4xl">أهلاً بك في ستاد TV</h2>
          <p className="mt-1 text-sm opacity-90">منصة البث المباشر العربية الأولى</p>
        </div>
      </div>
    );
  }

  const b = banners[i];
  const Wrapper: any = b.params ? Link : Link;
  return (
    <div className="relative">
      <Link to={b.to as any} params={b.params as any} className="block">
        <div className="relative h-48 overflow-hidden rounded-3xl shadow-glow md:h-64">
          {b.image ? (
            <img src={b.image} alt={b.title} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-l from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-white md:p-7">
            {b.badge && (
              <span className={`mb-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${b.badge === "مباشر" ? "bg-live text-white" : "bg-accent text-accent-foreground"}`}>
                {b.badge === "مباشر" && <span className="h-1.5 w-1.5 rounded-full bg-white live-pulse" />}
                {b.badge}
              </span>
            )}
            <h2 className="line-clamp-1 text-xl font-black drop-shadow md:text-3xl">{b.title}</h2>
            <p className="mt-1 line-clamp-1 text-xs opacity-90 md:text-sm">{b.subtitle}</p>
            <div className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-primary shadow-card">
              <PlayCircle className="h-4 w-4" /> {b.cta}
            </div>
          </div>
        </div>
      </Link>
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, idx) => (
            <button key={idx} onClick={() => setI(idx)} aria-label={`شريحة ${idx + 1}`} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function HRail<T extends { id: string }>({ title, to, items, render }: { title: string; to: string; items: T[]; render: (it: T) => React.ReactNode }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mt-8">
      <div className="container mx-auto mb-3 flex items-center justify-between px-4">
        <h2 className="text-lg font-bold md:text-xl">{title}</h2>
        <Link to={to as any} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          عرض الكل <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-2">
        {items.map(render)}
      </div>
    </section>
  );
}

function HomePage() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").eq("visible", true).order("sort_order")).data ?? [],
  });
  const { data: channels } = useQuery({
    queryKey: ["channels", "featured"],
    queryFn: async () => (await supabase.from("channels").select("*").eq("enabled", true).limit(18)).data ?? [],
  });
  const { data: movies } = useQuery({
    queryKey: ["movies", "home"],
    queryFn: async () => (await supabase.from("movies").select("*").order("created_at", { ascending: false }).limit(12)).data ?? [],
  });
  const { data: series } = useQuery({
    queryKey: ["series", "home"],
    queryFn: async () => (await supabase.from("series").select("*").order("created_at", { ascending: false }).limit(12)).data ?? [],
  });
  const { data: liveMatches } = useQuery({
    queryKey: ["matches", "live-home"],
    queryFn: async () => (await supabase.from("matches").select("*, channels(id, name, logo)").eq("status", "live").order("match_time").limit(8)).data ?? [],
  });

  return (
    <div className="pb-24 md:pb-8">
      {/* Banner */}
      <section className="container mx-auto px-4 pt-4">
        <BannerSlider />
      </section>

      {/* Quick category cards */}
      <section className="container mx-auto px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold md:text-xl">الأقسام</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickSections.map((s) => {
            const Icon = s.icon;
            const linkProps = { to: s.to as any, search: (s as any).search };
            return (
              <Link
                key={s.label}
                to={linkProps.to}
                search={linkProps.search}
                className="press-scale group relative overflow-hidden rounded-3xl p-4 text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex flex-col items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-bold leading-tight">{s.label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Live matches rail */}
      {liveMatches && liveMatches.length > 0 && (
        <HRail
          title="مباريات مباشرة الآن"
          to="/matches"
          items={liveMatches}
          render={(m: any) => (
            <Link key={m.id} to="/matches" className="press-scale w-64 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition hover:border-primary">
              <div className="gradient-primary relative flex items-center justify-between p-4 text-primary-foreground">
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-live px-2 py-0.5 text-[9px] font-bold">
                  <span className="h-1 w-1 rounded-full bg-white live-pulse" /> مباشر
                </span>
                <div className="flex flex-col items-center gap-1 text-center text-xs">
                  {m.team1_logo ? <img src={m.team1_logo} alt="" className="h-10 w-10 object-contain" /> : <Radio className="h-8 w-8" />}
                  <span className="line-clamp-1 font-semibold">{m.team1_name}</span>
                </div>
                <div className="text-lg font-black">VS</div>
                <div className="flex flex-col items-center gap-1 text-center text-xs">
                  {m.team2_logo ? <img src={m.team2_logo} alt="" className="h-10 w-10 object-contain" /> : <Radio className="h-8 w-8" />}
                  <span className="line-clamp-1 font-semibold">{m.team2_name}</span>
                </div>
              </div>
              <div className="line-clamp-1 px-3 py-2 text-center text-xs text-muted-foreground">{m.tournament ?? "بث مباشر"}</div>
            </Link>
          )}
        />
      )}

      {/* Categories badges */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto mt-8 px-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold md:text-xl">تصنيفات القنوات</h2>
            <Link to="/channels" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
              عرض الكل <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const meta = sectionMeta[cat.slug] ?? { icon: Tv, gradient: "from-slate-500 to-slate-700" };
              const Icon = meta.icon;
              return (
                <Link
                  key={cat.id}
                  to="/channels"
                  search={{ category: cat.slug }}
                  className="press-scale flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-soft transition hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured channels */}
      <section className="container mx-auto mt-8 px-4">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold md:text-xl">القنوات المميزة</h2>
            <p className="mt-1 text-xs text-muted-foreground">اختر قناتك وابدأ المشاهدة فوراً</p>
          </div>
          <Link to="/channels" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            عرض الكل <ChevronLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
        {channels && channels.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {channels.map((ch) => (<ChannelCard key={ch.id} channel={ch} />))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-soft">
            <PlayCircle className="mx-auto mb-3 h-10 w-10 opacity-40" />
            لا توجد قنوات متاحة حالياً
          </div>
        )}
      </section>

      {/* Movies rail */}
      <HRail
        title="أحدث الأفلام"
        to="/movies"
        items={movies ?? []}
        render={(m: any) => (
          <Link key={m.id} to="/movies/$id" params={{ id: m.id }} className="press-scale w-32 shrink-0 sm:w-36">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition hover:border-primary hover:shadow-glow">
              {m.poster ? (
                <img src={m.poster} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground"><Film className="h-8 w-8" /></div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2">
                <div className="line-clamp-1 text-xs font-semibold text-white">{m.title}</div>
              </div>
            </div>
          </Link>
        )}
      />

      {/* Series rail */}
      <HRail
        title="أحدث المسلسلات"
        to="/series"
        items={series ?? []}
        render={(s: any) => (
          <Link key={s.id} to="/series/$id" params={{ id: s.id }} className="press-scale w-32 shrink-0 sm:w-36">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition hover:border-primary hover:shadow-glow">
              {s.poster ? (
                <img src={s.poster} alt={s.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground"><Clapperboard className="h-8 w-8" /></div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2">
                <div className="line-clamp-1 text-xs font-semibold text-white">{s.title}</div>
              </div>
            </div>
          </Link>
        )}
      />
    </div>
  );
}
