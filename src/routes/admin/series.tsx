import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X, ChevronDown, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/admin/series")({
  head: () => ({ meta: [{ title: "إدارة المسلسلات — ستاد TV" }] }),
  component: AdminSeriesPage,
});

interface SForm { id?: string; title: string; poster: string; description: string; category_slug: string }
interface EForm { id?: string; series_id: string; title: string; stream_url: string; season: number; episode_number: number }
const sEmpty: SForm = { title: "", poster: "", description: "", category_slug: "series" };
const eEmpty: EForm = { series_id: "", title: "", stream_url: "", season: 1, episode_number: 1 };

function AdminSeriesPage() {
  const qc = useQueryClient();
  const [sOpen, setSOpen] = useState(false);
  const [eOpen, setEOpen] = useState(false);
  const [sForm, setSForm] = useState<SForm>(sEmpty);
  const [eForm, setEForm] = useState<EForm>(eEmpty);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: series } = useQuery({
    queryKey: ["admin-series"],
    queryFn: async () => (await supabase.from("series").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: episodes } = useQuery({
    queryKey: ["admin-episodes"],
    queryFn: async () => (await supabase.from("episodes").select("*").order("season").order("episode_number")).data ?? [],
  });

  const saveSeries = async () => {
    try {
      const payload = { title: sForm.title, poster: sForm.poster || null, description: sForm.description || null, category_slug: sForm.category_slug };
      const { error } = sForm.id
        ? await supabase.from("series").update(payload).eq("id", sForm.id)
        : await supabase.from("series").insert(payload);
      if (error) throw error;
      toast.success("تم الحفظ"); setSOpen(false); setSForm(sEmpty);
      qc.invalidateQueries({ queryKey: ["admin-series"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const removeSeries = async (id: string) => {
    if (!confirm("حذف المسلسل وجميع حلقاته؟")) return;
    await supabase.from("episodes").delete().eq("series_id", id);
    const { error } = await supabase.from("series").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["admin-series"] });
    qc.invalidateQueries({ queryKey: ["admin-episodes"] });
  };

  const saveEpisode = async () => {
    try {
      const payload = { series_id: eForm.series_id, title: eForm.title, stream_url: eForm.stream_url, season: eForm.season, episode_number: eForm.episode_number };
      const { error } = eForm.id
        ? await supabase.from("episodes").update(payload).eq("id", eForm.id)
        : await supabase.from("episodes").insert(payload);
      if (error) throw error;
      toast.success("تم الحفظ"); setEOpen(false); setEForm(eEmpty);
      qc.invalidateQueries({ queryKey: ["admin-episodes"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const removeEpisode = async (id: string) => {
    if (!confirm("حذف الحلقة؟")) return;
    await supabase.from("episodes").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-episodes"] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المسلسلات</h1>
        <button onClick={() => { setSForm(sEmpty); setSOpen(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> إضافة مسلسل
        </button>
      </div>

      <div className="space-y-3">
        {series?.map((s) => {
          const eps = episodes?.filter((e) => e.series_id === s.id) ?? [];
          const seasons = Array.from(new Set(eps.map((e) => e.season))).sort();
          const isOpen = expanded === s.id;
          return (
            <div key={s.id} className="rounded-xl border border-border/60 gradient-card">
              <div className="flex items-center gap-3 p-4">
                <button onClick={() => setExpanded(isOpen ? null : s.id)} className="rounded p-1 hover:bg-background">
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
                {s.poster && <img src={s.poster} alt="" className="h-12 w-12 rounded object-cover" />}
                <div className="flex-1">
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{eps.length} حلقة · {seasons.length} موسم</div>
                </div>
                <button onClick={() => { setEForm({ ...eEmpty, series_id: s.id }); setEOpen(true); }} className="rounded-lg bg-secondary px-3 py-1.5 text-xs">+ حلقة</button>
                <button onClick={() => { setSForm({ id: s.id, title: s.title, poster: s.poster ?? "", description: s.description ?? "", category_slug: s.category_slug ?? "series" }); setSOpen(true); }} className="rounded p-1.5 hover:bg-background"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => removeSeries(s.id)} className="rounded p-1.5 text-destructive hover:bg-background"><Trash2 className="h-4 w-4" /></button>
              </div>
              {isOpen && (
                <div className="border-t border-border/60 p-4">
                  {seasons.length === 0 && <div className="text-center text-xs text-muted-foreground">لا توجد حلقات</div>}
                  {seasons.map((sea) => (
                    <div key={sea} className="mb-3">
                      <div className="mb-2 text-sm font-bold">الموسم {sea}</div>
                      <div className="space-y-1">
                        {eps.filter((e) => e.season === sea).map((e) => (
                          <div key={e.id} className="flex items-center gap-2 rounded bg-background/40 px-3 py-2 text-sm">
                            <span className="w-12 text-xs text-muted-foreground">EP {e.episode_number}</span>
                            <span className="flex-1">{e.title}</span>
                            <button onClick={() => { setEForm({ id: e.id, series_id: e.series_id, title: e.title, stream_url: e.stream_url, season: e.season, episode_number: e.episode_number }); setEOpen(true); }} className="rounded p-1 hover:bg-background"><Edit2 className="h-3 w-3" /></button>
                            <button onClick={() => removeEpisode(e.id)} className="rounded p-1 text-destructive hover:bg-background"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {(!series || series.length === 0) && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">لا توجد مسلسلات بعد</div>
        )}
      </div>

      {sOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSOpen(false)}>
          <div onClick={(ev) => ev.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border gradient-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{sForm.id ? "تعديل مسلسل" : "مسلسل جديد"}</h2><button onClick={() => setSOpen(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <input placeholder="اسم المسلسل" value={sForm.title} onChange={(e) => setSForm({ ...sForm, title: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input placeholder="رابط الغلاف" value={sForm.poster} onChange={(e) => setSForm({ ...sForm, poster: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
              <textarea placeholder="الوصف" value={sForm.description} onChange={(e) => setSForm({ ...sForm, description: e.target.value })} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <button onClick={saveSeries} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">حفظ</button>
            </div>
          </div>
        </div>
      )}

      {eOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setEOpen(false)}>
          <div onClick={(ev) => ev.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border gradient-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{eForm.id ? "تعديل حلقة" : "حلقة جديدة"}</h2><button onClick={() => setEOpen(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <input placeholder="اسم الحلقة" value={eForm.title} onChange={(e) => setEForm({ ...eForm, title: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input placeholder="رابط الفيديو" value={eForm.stream_url} onChange={(e) => setEForm({ ...eForm, stream_url: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="الموسم" value={eForm.season} onChange={(e) => setEForm({ ...eForm, season: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                <input type="number" placeholder="رقم الحلقة" value={eForm.episode_number} onChange={(e) => setEForm({ ...eForm, episode_number: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <button onClick={saveEpisode} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
