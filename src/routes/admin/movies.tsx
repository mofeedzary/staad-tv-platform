import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/movies")({ component: () => <Stub title="إدارة الأفلام" /> });
function Stub({ title }: { title: string }) {
  return <div><h1 className="mb-4 text-2xl font-bold">{title}</h1><div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">قريباً — استخدم استيراد M3U لإضافة محتوى البث.</div></div>;
}
