import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Clock, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/matches/")({
  head: () => ({ meta: [{ title: "المباريات المباشرة — ستاد TV" }] }),
  component: MatchesPage,
});

function MatchesPage() {
  const { data: matches } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data } = await supabase.from("matches").select("*, channels(id, name, logo)").order("match_time");
      return data ?? [];
    },
  });

  const groups = {
    live: matches?.filter((m) => m.status === "live") ?? [],
    upcoming: matches?.filter((m) => m.status === "upcoming") ?? [],
    finished: matches?.filter((m) => m.status === "finished") ?? [],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 flex items-center gap-2 text-3xl font-bold">
        <Trophy className="h-7 w-7 text-primary" /> المباريات
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">المباشرة، القادمة، والمنتهية</p>

      {(["live", "upcoming", "finished"] as const).map((status) => (
        <section key={status} className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-bold">
              {status === "live" ? "المباريات المباشرة" : status === "upcoming" ? "القادمة" : "المنتهية"}
            </h2>
            {status === "live" && groups.live.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-live/20 px-2 py-0.5 text-xs font-semibold text-live">
                <span className="h-1.5 w-1.5 rounded-full bg-live live-pulse" /> {groups.live.length}
              </span>
            )}
          </div>

          {groups[status].length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              لا توجد مباريات {status === "live" ? "مباشرة" : status === "upcoming" ? "قادمة" : "منتهية"} حالياً
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {groups[status].map((m: any) => (
                <div key={m.id} className="rounded-xl border border-border/60 gradient-card p-4 shadow-card">
                  {m.tournament && (
                    <div className="mb-3 text-xs font-semibold text-primary">{m.tournament}</div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-1 flex-col items-center text-center">
                      {m.team1_logo && <img src={m.team1_logo} alt="" className="h-12 w-12 object-contain" />}
                      <div className="mt-1 text-sm font-semibold">{m.team1_name}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">VS</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(m.match_time).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col items-center text-center">
                      {m.team2_logo && <img src={m.team2_logo} alt="" className="h-12 w-12 object-contain" />}
                      <div className="mt-1 text-sm font-semibold">{m.team2_name}</div>
                    </div>
                  </div>
                  {m.status === "live" && m.channels && (
                    <Link
                      to="/channels/$id"
                      params={{ id: m.channels.id }}
                      className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      <PlayCircle className="h-4 w-4" /> مشاهدة مباشرة
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
