import { Link } from "@tanstack/react-router";
import { PlayCircle, Tv } from "lucide-react";

interface Channel {
  id: string;
  name: string;
  logo?: string | null;
  category_slug?: string | null;
}

export function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Link
      to="/channels/$id"
      params={{ id: channel.id }}
      className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-border/60 gradient-card p-4 text-center shadow-card transition hover:-translate-y-1 hover:border-primary hover:shadow-glow"
    >
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg bg-background/50">
        {channel.logo ? (
          <img src={channel.logo} alt={channel.name} loading="lazy" className="h-full w-full object-contain p-1" onError={(e) => ((e.currentTarget.style.display = "none"))} />
        ) : (
          <Tv className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div className="line-clamp-1 text-sm font-semibold">{channel.name}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
        <PlayCircle className="h-12 w-12 text-primary" />
      </div>
    </Link>
  );
}
