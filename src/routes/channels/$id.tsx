import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HlsPlayer } from "@/components/HlsPlayer";
import { ChevronRight, Tv } from "lucide-react";

export const Route = createFileRoute("/channels/$id")({
  head: () => ({ meta: [{ title: "تشغيل القناة — ستاد TV" }] }),
  component: ChannelPlayerPage,
});

function ChannelPlayerPage() {
  const { id } = Route.useParams();

  const { data: channel, isLoading } = useQuery({
    queryKey: ["channel", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("channels").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["channels-related", channel?.category_slug],
    enabled: !!channel?.category_slug,
    queryFn: async () => {
      const { data } = await supabase.from("channels").select("*").eq("enabled", true).eq("category_slug", channel!.category_slug!).neq("id", id).limit(8);
      return data ?? [];
    },
  });

  if (isLoading) return <div className="container mx-auto p-8 text-center text-muted-foreground">جاري التحميل...</div>;
  if (!channel) return <div className="container mx-auto p-8 text-center">القناة غير موجودة</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/channels" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronRight className="h-4 w-4 rotate-180" /> العودة للقنوات
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <HlsPlayer src={channel.stream_url} poster={channel.logo ?? undefined} />
          <div className="mt-4 flex items-center gap-3">
            {channel.logo && (
              <img src={channel.logo} alt="" className="h-14 w-14 rounded-lg bg-card object-contain p-1" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{channel.name}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-live/20 px-2 py-0.5 text-xs font-semibold text-live">
                  <span className="h-1.5 w-1.5 rounded-full bg-live live-pulse" /> LIVE
                </span>
              </div>
              {channel.category_slug && (
                <div className="mt-1 text-xs text-muted-foreground">القسم: {channel.category_slug}</div>
              )}
            </div>
          </div>
        </div>

        <aside>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Tv className="h-4 w-4" /> قنوات مشابهة
          </h2>
          <div className="space-y-2">
            {related?.map((c) => (
              <Link
                key={c.id}
                to="/channels/$id"
                params={{ id: c.id }}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2 transition hover:border-primary"
              >
                {c.logo ? (
                  <img src={c.logo} alt="" className="h-10 w-10 rounded bg-background object-contain p-1" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-background"><Tv className="h-4 w-4" /></div>
                )}
                <div className="line-clamp-1 text-sm">{c.name}</div>
              </Link>
            ))}
            {(!related || related.length === 0) && (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">لا توجد قنوات مشابهة</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
