import { createFileRoute, Outlet, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Tv, Film, Clapperboard, Trophy, FolderTree, Upload, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    // allow /admin/login through
    if (location.pathname === "/admin/login") return;
  },
  component: AdminLayout,
});

const adminNav = [
  { to: "/admin", label: "الإحصائيات", icon: LayoutDashboard, exact: true },
  { to: "/admin/channels", label: "القنوات", icon: Tv },
  { to: "/admin/movies", label: "الأفلام", icon: Film },
  { to: "/admin/series", label: "المسلسلات", icon: Clapperboard },
  { to: "/admin/matches", label: "المباريات", icon: Trophy },
  { to: "/admin/categories", label: "الأقسام", icon: FolderTree },
  { to: "/admin/import", label: "استيراد M3U", icon: Upload },
];

function AdminLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/admin/login" });
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const admin = roles?.some((r) => r.role === "admin") ?? false;
      if (!admin) {
        // auto-grant admin to the first signup
        const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true });
        if ((count ?? 0) === 0) {
          await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
          setIsAdmin(true);
        } else {
          navigate({ to: "/admin/login" });
          return;
        }
      } else {
        setIsAdmin(true);
      }
      setChecking(false);
    };
    check();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (checking) {
    return <div className="container mx-auto p-12 text-center text-muted-foreground">جاري التحقق من الصلاحيات...</div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl border border-border/60 gradient-card p-3 shadow-card">
          <div className="mb-3 px-2 py-1 text-xs font-bold uppercase text-muted-foreground">لوحة التحكم</div>
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-background hover:text-foreground"
                  activeProps={{ className: "flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-primary text-primary-foreground" }}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
            <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-background">
              <LogOut className="h-4 w-4" /> تسجيل الخروج
            </button>
          </nav>
        </div>
      </aside>
      <div><Outlet /></div>
    </div>
  );
}
