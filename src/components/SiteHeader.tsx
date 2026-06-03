import { Link } from "@tanstack/react-router";
import { Tv, Trophy, Film, Clapperboard, Newspaper, Home, ShieldCheck, Bell, Search } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "الرئيسية", icon: Home, exact: true },
  { to: "/channels", label: "القنوات", icon: Tv, exact: false },
  { to: "/matches", label: "المباريات", icon: Trophy, exact: false },
  { to: "/movies", label: "الأفلام", icon: Film, exact: false },
  { to: "/series", label: "المسلسلات", icon: Clapperboard, exact: false },
  { to: "/news", label: "الأخبار", icon: Newspaper, exact: false },
] as const;

export function SiteHeader() {
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container mx-auto flex items-center gap-3 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Tv className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden text-lg font-extrabold tracking-tight sm:block">
            ستاد <span className="text-primary">TV</span>
          </div>
        </Link>

        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-soft focus-within:border-primary">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن قناة، مباراة، أو فيلم..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button className="press-scale relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:text-primary" aria-label="الإشعارات">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
        </button>

        <Link
          to="/admin/login"
          className="press-scale hidden h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow sm:flex"
          aria-label="الحساب"
        >
          <ShieldCheck className="h-4 w-4" />
        </Link>
      </div>

      <nav className="hidden border-t border-border/60 md:block">
        <div className="container mx-auto flex items-center gap-1 px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              activeProps={{ className: "rounded-full px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground" }}
              activeOptions={{ exact: item.exact }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
