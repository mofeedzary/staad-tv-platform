import { Link } from "@tanstack/react-router";
import { Home, Search, Heart, LayoutGrid, User } from "lucide-react";

type NavItem = { to: string; label: string; icon: typeof Home; exact?: boolean };
const items: NavItem[] = [
  { to: "/", label: "الرئيسية", icon: Home, exact: true },
  { to: "/channels", label: "التصنيفات", icon: LayoutGrid },
  { to: "/matches", label: "البحث", icon: Search },
  { to: "/series", label: "المفضلة", icon: Heart },
  { to: "/admin/login", label: "حسابي", icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur-xl shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.15)] md:hidden">
      <ul className="mx-auto flex max-w-xl items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.25rem)] pt-1.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex-1">
              <Link
                to={it.to}
                activeOptions={{ exact: !!it.exact }}
                className="press-scale flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium text-muted-foreground"
                activeProps={{ className: "press-scale flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold text-primary" }}
              >
                <Icon className="h-5 w-5" />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
