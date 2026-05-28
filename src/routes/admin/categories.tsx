import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "إدارة الأقسام — ستاد TV" }] }),
  component: AdminCategoriesPage,
});

interface Form {
  id?: string;
  name: string;
  slug: string;
  icon: string;
  sort_order: number;
  visible: boolean;
}
const empty: Form = { name: "", slug: "", icon: "", sort_order: 0, visible: true };

function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const { data: items } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const save = async () => {
    try {
      const payload = { name: form.name, slug: form.slug, icon: form.icon || null, sort_order: form.sort_order, visible: form.visible };
      const { error } = form.id
        ? await supabase.from("categories").update(payload).eq("id", form.id)
        : await supabase.from("categories").insert(payload);
      if (error) throw error;
      toast.success("تم الحفظ"); setOpen(false); setForm(empty);
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  const toggle = async (id: string, visible: boolean) => {
    await supabase.from("categories").update({ visible: !visible }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الأقسام</h1>
        <button onClick={() => { setForm(empty); setOpen(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> إضافة قسم
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/60 gradient-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-background/40 text-xs text-muted-foreground">
            <tr><th className="p-3">الاسم</th><th className="p-3">المعرّف</th><th className="p-3">الترتيب</th><th className="p-3">الظهور</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {items?.map((c) => (
              <tr key={c.id} className="border-t border-border/60">
                <td className="p-3 font-semibold">{c.icon} {c.name}</td>
                <td className="p-3 text-muted-foreground" dir="ltr">{c.slug}</td>
                <td className="p-3">{c.sort_order}</td>
                <td className="p-3"><button onClick={() => toggle(c.id, c.visible)}>{c.visible ? <Eye className="h-4 w-4 text-green-400" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}</button></td>
                <td className="p-3"><div className="flex gap-2">
                  <button onClick={() => { setForm({ id: c.id, name: c.name, slug: c.slug, icon: c.icon ?? "", sort_order: c.sort_order, visible: c.visible }); setOpen(true); }} className="rounded p-1.5 hover:bg-background"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => remove(c.id)} className="rounded p-1.5 text-destructive hover:bg-background"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
            {(!items || items.length === 0) && (<tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد أقسام بعد</td></tr>)}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border gradient-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{form.id ? "تعديل قسم" : "قسم جديد"}</h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="اسم القسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input placeholder="المعرّف (slug)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
              <input placeholder="أيقونة (emoji أو رابط)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input type="number" placeholder="الترتيب" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} /> ظاهر</label>
              <button onClick={save} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
