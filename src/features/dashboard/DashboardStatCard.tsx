import type { ReactNode } from "react";

export function DashboardStatCard({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return <article className="app-card p-3.5"><div className="mb-3 inline-flex rounded-lg bg-[#FFF1F6] p-2 text-pine-dark">{icon}</div><p className="text-xs font-medium leading-4 text-[#7A6C76]">{label}</p><p className="mt-1 text-xl font-bold text-ink">{value}</p></article>;
}