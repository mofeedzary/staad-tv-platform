import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, Search, Download, FolderInput, CheckSquare, Square } from "lucide-react";

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
const PAGE_SIZE = 25;

function AdminChannelsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [bulkCat, setBulkCat] = useState("");

  const { data: channels } = useQuery({
    queryKey: ["admin-channels"],
    queryFn: async () => (await supabase.from("channels").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const filtered = useMemo(() => {
    let list = channels ?? [];
    if (filterCat !== "all") list = list.filter((c) => c.category_slug === filterCat);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [channels, search, filterCat]);

  const countByCat = useMemo(() => {
    const m: Record<string, number> = {};
    (channels ?? []).forEach((c) => { const k = c.category_slug ?? "channels"; m[k] = (m[k] ?? 0) + 1; });
    return m;
  }, [channels]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allPageSelected = pageItems.length > 0 && pageItems.every((c) => selected.has(c.id));
  const toggleOne = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };
  const toggleAllPage = () => {
    const s = new Set(selected);
    if (allPageSelected) pageItems.forEach((c) => s.delete(c.id));
    else pageItems.forEach((c) => s.add(c.id));
    setSelected(s);
  };
  const selectAllFiltered = () => setSelected(new Set(filtered.map((c) => c.id)));
  const clearSelection = () => setSelected(new Set());

  const save = async () => {
    try {
      const payload = {
        name: form.name, stream_url: form.stream_url, logo: form.logo || null,
        category_slug: form.category_slug, enabled: form.enabled,
      };
      const { error } = form.id
        ? await supabase.from("channels").update(payload).eq("id", form.id)
        : await supabase.from("channels").insert(payload);
      if (error) throw error;
      toast.success("تم الحفظ"); setOpen(false); setForm(empty);
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

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`حذف ${selected.size} قناة؟`)) return;
    const ids = [...selected];
    const { error } = await supabase.from("channels").delete().in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`تم حذف ${ids.length} قناة`);
    clearSelection();
    qc.invalidateQueries({ queryKey: ["admin-channels"] });
  };

  const bulkChangeCategory = async () => {
    if (selected.size === 0 || !bulkCat) return;
    const ids = [...selected];
    const { error } = await supabase.from("channels").update({ category_slug: bulkCat }).in("id", ids);
    if (error) return toast.error(error.message);
    toast.success(`تم نقل ${ids.length} قناة`);
    clearSelection();
    qc.invalidateQueries({ queryKey: ["admin-channels"] });
  };

  const buildM3U = (list: typeof filtered) => {
    const lines = ["#EXTM3U"];
    list.forEach((c) => {
      const group = c.category_slug ?? "channels";
      const logo = c.logo ? ` tvg-logo="${c.logo}"` : "";
      lines.push(`#EXTINF:-1${logo} group-title="${group}",${c.name}`);
      lines.push(c.stream_url);
    });
    return lines.join("\n");
  };
  const downloadM3U = (list: typeof filtered, filename: string) => {
    if (list.length === 0) return toast.error("لا توجد قنوات للتصدير");
    const blob = new Blob([buildM3U(list)], { type: "audio/x-mpegurl" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`تم تصدير ${list.length} قناة`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">إدارة القنوات</h1>
          <div className="mt-1 text-xs text-muted-foreground">المجموع: {channels?.length ?? 0} قناة</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => downloadM3U(channels ?? [], "all-channels.m3u")} className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold">
            <Download className="h-4 w-4" /> تصدير الكل
          </button>
          <button onClick={() => { setForm(empty); setOpen(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Plus className="h-4 w-4" /> إضافة قناة
          </button>
        </div>
      </div>

      {/* Counts per category */}
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <button onClick={() => { setFilterCat("all"); setPage(1); }} className={`rounded-full px-3 py-1 ${filterCat === "all" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
          الكل ({channels?.length ?? 0})
        </button>
        {categories?.map((c) => (
          <button key={c.id} onClick={() => { setFilterCat(c.slug); setPage(1); }} className={`rounded-full px-3 py-1 ${filterCat === c.slug ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
            {c.name} ({countByCat[c.slug] ?? 0})
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="بحث في القنوات..." className="w-full rounded-lg border border-input bg-background py-2 pr-9 pl-3 text-sm" />
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">
          <span className="font-semibold">تم تحديد {selected.size}</span>
          <button onClick={selectAllFiltered} className="rounded bg-background px-2 py-1 text-xs">تحديد كل النتائج ({filtered.length})</button>
          <button onClick={clearSelection} className="rounded bg-background px-2 py-1 text-xs">إلغاء التحديد</button>
          <div className="mx-2 h-4 w-px bg-border" />
          <button onClick={() => downloadM3U(channels?.filter((c) => selected.has(c.id)) ?? [], "selected-channels.m3u")} className="flex items-center gap-1 rounded bg-secondary px-3 py-1.5 text-xs font-semibold">
            <Download className="h-3.5 w-3.5" /> تصدير المحدد
          </button>
          <div className="flex items-center gap-1">
            <select value={bulkCat} onChange={(e) => setBulkCat(e.target.value)} className="rounded border border-input bg-background px-2 py-1.5 text-xs">
              <option value="">— تغيير القسم —</option>
              {categories?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <button onClick={bulkChangeCategory} disabled={!bulkCat} className="flex items-center gap-1 rounded bg-secondary px-2 py-1.5 text-xs font-semibold disabled:opacity-40">
              <FolderInput className="h-3.5 w-3.5" /> نقل
            </button>
          </div>
          <button onClick={bulkDelete} className="flex items-center gap-1 rounded bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground">
            <Trash2 className="h-3.5 w-3.5" /> حذف المحدد
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border/60 gradient-card">
        <table className="w-full text-right text-sm">
          <thead className="bg-background/40 text-xs text-muted-foreground">
            <tr>
              <th className="w-10 p-3">
                <button onClick={toggleAllPage} aria-label="تحديد الكل">
                  {allPageSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                </button>
              </th>
              <th className="p-3">الاسم</th>
              <th className="p-3">القسم</th>
              <th className="p-3">الحالة</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((c) => (
              <tr key={c.id} className={`border-t border-border/60 ${selected.has(c.id) ? "bg-primary/5" : ""}`}>
                <td className="p-3">
                  <button onClick={() => toggleOne(c.id)} aria-label="تحديد">
                    {selected.has(c.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                  </button>
                </td>
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.category_slug}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${c.enabled ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>{c.enabled ? "مفعّل" : "معطّل"}</span></td>
                <td className="p-3"><div className="flex gap-2">
                  <button onClick={() => { setForm({ id: c.id, name: c.name, stream_url: c.stream_url, logo: c.logo ?? "", category_slug: c.category_slug ?? "channels", enabled: c.enabled }); setOpen(true); }} className="rounded p-1.5 hover:bg-background"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => remove(c.id)} className="rounded p-1.5 text-destructive hover:bg-background"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد نتائج</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">صفحة {currentPage} من {totalPages}</div>
          <div className="flex gap-1">
            <button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="rounded bg-secondary px-3 py-1.5 disabled:opacity-40">السابق</button>
            <button disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} className="rounded bg-secondary px-3 py-1.5 disabled:opacity-40">التالي</button>
          </div>
        </div>
      )}

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
