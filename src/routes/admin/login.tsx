import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ALLOWED_ADMIN_EMAIL = "mofeedzary123@gmail.com";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "تسجيل دخول المدير — ستاد TV" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalized = email.trim().toLowerCase();
      if (normalized !== ALLOWED_ADMIN_EMAIL) {
        toast.error("غير مصرح لك بالدخول");
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error) throw error;

      // Verify admin role on the server-side table
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user!.id);
      const isAdmin = roles?.some((r) => r.role === "admin") ?? false;
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error("غير مصرح لك بالدخول");
        return;
      }

      toast.success("تم تسجيل الدخول");
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err?.message ?? "بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 gradient-card p-8 shadow-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-glow">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">لوحة تحكم ستاد TV</h1>
          <p className="mt-1 text-sm text-muted-foreground">تسجيل دخول المدير</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">البريد الإلكتروني</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              dir="ltr"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">كلمة المرور</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              dir="ltr"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            دخول
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          التسجيل العام معطّل. الدخول مخصص للمدير فقط.
        </p>

        <Link to="/" className="mt-4 block text-center text-xs text-muted-foreground hover:text-foreground">← العودة للموقع</Link>
      </div>
    </div>
  );
}
