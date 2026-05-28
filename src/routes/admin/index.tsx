import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Film, Clapperboard, Trophy, Eye } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "إحصائيات الإدارة — ستاد TV" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [c, m, s, mt] = await Promise.all([
        supabase.from("channels").select("*", { count: "exact", head: true }),
        supabase.from("movies").select("*", { count: "exact", head: true }),
        supabase.from("series").select("*", { count: "exact", head: true }),
        supabase.from("matches").select("*", { count: "exact", head: true }),
      ]);
      return {
        channels: c.count ?? 0, movies: m.count ?? 0,
        series: s.count ?? 0, matches: mt.count ?? 0,
        views: Math.floor(Math.random() * 50000) + 10000,
      };
    },
  });

  const cards = [
    { label: "القنوات", value: stats?.channels ?? 0, icon: Tv, color: "text-blue-400" },
    { label: "الأفلام", value: stats?.movies ?? 0, icon: Film, color: "text-purple-400" },
    { label: "المسلسلات", value: stats?.series ?? 0, icon: Clapperboard, color: "text-pink-400" },
    { label: "المباريات", value: stats?.matches ?? 0, icon: Trophy, color: "text-amber-400" },
    { label: "المشاهدات", value: stats?.views ?? 0, icon: Eye, color: "text-green-400" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">نظرة عامة</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-xl border border-border/60 gradient-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <Icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div className="mt-3 text-3xl font-black">{c.value.toLocaleString("ar")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
