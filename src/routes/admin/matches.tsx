import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/matches")({ component: () => <div><h1 className="mb-4 text-2xl font-bold">إدارة المباريات</h1><div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">قريباً.</div></div> });
