import { Link } from "@tanstack/react-router";
import { Tv, Trophy, Film, Clapperboard, Newspaper, Home, ShieldCheck } from "lucide-react";

const navItems = [
  { to: "/", label: "الرئيسية", icon: Home },
  { to: "/channels", label: "القنوات", icon: Tv },
  { to: "/matches", label: "المباريات", icon: Trophy },
  { to: "/movies", label: "الأفلام", icon: Film },
  { to: "/series", label: "المسلسلات", icon: Clapperboard },
  { to: "/news", label: "الأخبار", icon: Newspaper },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-glow">
            <Tv className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="text-lg font-extrabold tracking-tight">
            ستاد <span className="text-primary">TV</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-card hover:text-foreground"
              activeProps={{ className: "rounded-lg px-3 py-2 text-sm bg-card text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/admin/login"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:inline">لوحة التحكم</span>
        </Link>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/60 px-2 py-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground"
              activeProps={{ className: "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs bg-card text-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
