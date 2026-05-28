import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X } from "lucide-react";

export const Route = createFileRoute("/admin/movies")({
  head: () => ({ meta: [{ title: "إدارة الأفلام — ستاد TV" }] }),
  component: AdminMoviesPage,
});

interface Form {
  id?: string;
  title: string;
  poster: string;
  stream_url: string;
  description: string;
  category_slug: string;
}
const empty: Form = { title: "", poster: "", stream_url: "", description: "", category_slug: "movies" };

function AdminMoviesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [q, setQ] = useState("");

  const { data: items } = useQuery({
    queryKey: ["admin-movies"],
    queryFn: async () => (await supabase.from("movies").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const filtered = items?.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    try {
      const payload = {
        title: form.title, poster: form.poster || null, stream_url: form.stream_url,
        description: form.description || null, category_slug: form.category_slug,
      };
      const { error } = form.id
        ? await supabase.from("movies").update(payload).eq("id", form.id)
        : await supabase.from("movies").insert(payload);
      if (error) throw error;
      toast.success("تم الحفظ"); setOpen(false); setForm(empty);
      qc.invalidateQueries({ queryKey: ["admin-movies"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف الفيلم؟")) return;
    const { error } = await supabase.from("movies").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["admin-movies"] });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">إدارة الأفلام</h1>
        <div className="flex gap-2">
          <input placeholder="بحث..." value={q} onChange={(e) => setQ(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          <button onClick={() => { setForm(empty); setOpen(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> إضافة فيلم
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered?.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-xl border border-border/60 gradient-card shadow-card">
            <div className="aspect-[2/3] bg-background">
              {m.poster ? <img src={m.poster} alt={m.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">بدون صورة</div>}
            </div>
            <div className="p-3">
              <div className="line-clamp-1 text-sm font-semibold">{m.title}</div>
              <div className="text-xs text-muted-foreground">{m.category_slug}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => { setForm({ id: m.id, title: m.title, poster: m.poster ?? "", stream_url: m.stream_url, description: m.description ?? "", category_slug: m.category_slug ?? "movies" }); setOpen(true); }} className="flex-1 rounded bg-background py-1 text-xs"><Edit2 className="mx-auto h-3 w-3" /></button>
                <button onClick={() => remove(m.id)} className="flex-1 rounded bg-background py-1 text-xs text-destructive"><Trash2 className="mx-auto h-3 w-3" /></button>
              </div>
            </div>
          </div>
        ))}
        {(!filtered || filtered.length === 0) && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">لا توجد أفلام بعد</div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border gradient-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{form.id ? "تعديل فيلم" : "فيلم جديد"}</h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="اسم الفيلم" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input placeholder="رابط البوستر" value={form.poster} onChange={(e) => setForm({ ...form, poster: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
              <input placeholder="رابط الفيديو (m3u8/mp4)" value={form.stream_url} onChange={(e) => setForm({ ...form, stream_url: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
              <textarea placeholder="وصف الفيلم" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input placeholder="التصنيف" value={form.category_slug} onChange={(e) => setForm({ ...form, category_slug: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
              <button onClick={save} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
