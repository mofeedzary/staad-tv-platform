import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X } from "lucide-react";

export const Route = createFileRoute("/admin/channels")({
  head: () => ({ meta: [{ title: "إدارة القنوات — ستاد TV" }] }),
  component: AdminChannelsPage,
});

interface Form {
  id?: string;
  name: string;
  stream_url: string;
  logo: string;
  category_slug: string;
  enabled: boolean;
}

const empty: Form = { name: "", stream_url: "", logo: "", category_slug: "channels", enabled: true };

function AdminChannelsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const { data: channels } = useQuery({
    queryKey: ["admin-channels"],
    queryFn: async () => (await supabase.from("channels").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const save = async () => {
    try {
      if (form.id) {
        const { error } = await supabase.from("channels").update({
          name: form.name, stream_url: form.stream_url, logo: form.logo || null,
          category_slug: form.category_slug, enabled: form.enabled,
        }).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("channels").insert({
          name: form.name, stream_url: form.stream_url, logo: form.logo || null,
          category_slug: form.category_slug, enabled: form.enabled,
        });
        if (error) throw error;
      }
      toast.success("تم الحفظ");
      setOpen(false); setForm(empty);
      qc.invalidateQueries({ queryKey: ["admin-channels"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const { error } = await supabase.from("channels").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["admin-channels"] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة القنوات</h1>
        <button onClick={() => { setForm(empty); setOpen(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> إضافة قناة
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 gradient-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-background/40 text-xs text-muted-foreground">
            <tr><th className="p-3">الاسم</th><th className="p-3">القسم</th><th className="p-3">الحالة</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {channels?.map((c) => (
              <tr key={c.id} className="border-t border-border/60">
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.category_slug}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${c.enabled ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>{c.enabled ? "مفعّل" : "معطّل"}</span></td>
                <td className="p-3"><div className="flex gap-2">
                  <button onClick={() => { setForm({ id: c.id, name: c.name, stream_url: c.stream_url, logo: c.logo ?? "", category_slug: c.category_slug ?? "channels", enabled: c.enabled }); setOpen(true); }} className="rounded p-1.5 hover:bg-background"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => remove(c.id)} className="rounded p-1.5 text-destructive hover:bg-background"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
            {(!channels || channels.length === 0) && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد قنوات بعد</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border gradient-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{form.id ? "تعديل قناة" : "قناة جديدة"}</h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="اسم القناة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input placeholder="رابط البث (m3u8 / mp4)" value={form.stream_url} onChange={(e) => setForm({ ...form, stream_url: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
              <input placeholder="رابط الشعار" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
              <select value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {categories?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> مفعّلة</label>
              <button onClick={save} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
