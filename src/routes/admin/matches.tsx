import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, X } from "lucide-react";

export const Route = createFileRoute("/admin/matches")({
  head: () => ({ meta: [{ title: "إدارة المباريات — ستاد TV" }] }),
  component: AdminMatchesPage,
});

type MatchStatus = "upcoming" | "live" | "finished";
interface Form {
  id?: string;
  team1_name: string; team1_logo: string;
  team2_name: string; team2_logo: string;
  tournament: string;
  match_time: string;
  status: MatchStatus;
  channel_id: string;
}
const empty: Form = { team1_name: "", team1_logo: "", team2_name: "", team2_logo: "", tournament: "", match_time: "", status: "upcoming", channel_id: "" };

const statusLabel: Record<MatchStatus, string> = { upcoming: "قادمة", live: "مباشر", finished: "منتهية" };
const statusColor: Record<MatchStatus, string> = { upcoming: "bg-blue-500/20 text-blue-400", live: "bg-red-500/20 text-red-400 animate-pulse", finished: "bg-muted text-muted-foreground" };

function AdminMatchesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);

  const { data: matches } = useQuery({
    queryKey: ["admin-matches"],
    queryFn: async () => (await supabase.from("matches").select("*").order("match_time", { ascending: true })).data ?? [],
  });
  const { data: channels } = useQuery({
    queryKey: ["channels-for-matches"],
    queryFn: async () => (await supabase.from("channels").select("id,name").order("name")).data ?? [],
  });

  const save = async () => {
    try {
      const payload = {
        team1_name: form.team1_name, team1_logo: form.team1_logo || null,
        team2_name: form.team2_name, team2_logo: form.team2_logo || null,
        tournament: form.tournament || null,
        match_time: new Date(form.match_time).toISOString(),
        status: form.status,
        channel_id: form.channel_id || null,
      };
      const { error } = form.id
        ? await supabase.from("matches").update(payload).eq("id", form.id)
        : await supabase.from("matches").insert(payload);
      if (error) throw error;
      toast.success("تم الحفظ"); setOpen(false); setForm(empty);
      qc.invalidateQueries({ queryKey: ["admin-matches"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف المباراة؟")) return;
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    qc.invalidateQueries({ queryKey: ["admin-matches"] });
  };

  const changeStatus = async (id: string, status: MatchStatus) => {
    await supabase.from("matches").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-matches"] });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة المباريات</h1>
        <button onClick={() => { setForm(empty); setOpen(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> إضافة مباراة
        </button>
      </div>

      <div className="space-y-3">
        {matches?.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 gradient-card p-4 shadow-card">
            <div className="flex flex-1 items-center gap-3">
              {m.team1_logo && <img src={m.team1_logo} alt="" className="h-10 w-10 rounded-full object-contain" />}
              <span className="font-semibold">{m.team1_name}</span>
              <span className="text-muted-foreground">VS</span>
              <span className="font-semibold">{m.team2_name}</span>
              {m.team2_logo && <img src={m.team2_logo} alt="" className="h-10 w-10 rounded-full object-contain" />}
            </div>
            <div className="text-xs text-muted-foreground">{m.tournament}</div>
            <div className="text-xs text-muted-foreground">{new Date(m.match_time).toLocaleString("ar")}</div>
            <select value={m.status} onChange={(e) => changeStatus(m.id, e.target.value as MatchStatus)} className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[m.status as MatchStatus]}`}>
              {(["upcoming", "live", "finished"] as MatchStatus[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
            <button onClick={() => { setForm({ id: m.id, team1_name: m.team1_name, team1_logo: m.team1_logo ?? "", team2_name: m.team2_name, team2_logo: m.team2_logo ?? "", tournament: m.tournament ?? "", match_time: new Date(m.match_time).toISOString().slice(0, 16), status: m.status as MatchStatus, channel_id: m.channel_id ?? "" }); setOpen(true); }} className="rounded p-1.5 hover:bg-background"><Edit2 className="h-4 w-4" /></button>
            <button onClick={() => remove(m.id)} className="rounded p-1.5 text-destructive hover:bg-background"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        {(!matches || matches.length === 0) && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">لا توجد مباريات بعد</div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border gradient-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{form.id ? "تعديل مباراة" : "مباراة جديدة"}</h2><button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="الفريق الأول" value={form.team1_name} onChange={(e) => setForm({ ...form, team1_name: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                <input placeholder="شعار الفريق الأول" value={form.team1_logo} onChange={(e) => setForm({ ...form, team1_logo: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
                <input placeholder="الفريق الثاني" value={form.team2_name} onChange={(e) => setForm({ ...form, team2_name: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                <input placeholder="شعار الفريق الثاني" value={form.team2_logo} onChange={(e) => setForm({ ...form, team2_logo: e.target.value })} className="rounded-lg border border-input bg-background px-3 py-2 text-sm" dir="ltr" />
              </div>
              <input placeholder="البطولة" value={form.tournament} onChange={(e) => setForm({ ...form, tournament: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <input type="datetime-local" value={form.match_time} onChange={(e) => setForm({ ...form, match_time: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MatchStatus })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                {(["upcoming", "live", "finished"] as MatchStatus[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
              </select>
              <select value={form.channel_id} onChange={(e) => setForm({ ...form, channel_id: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="">— اختر قناة البث —</option>
                {channels?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={save} className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
