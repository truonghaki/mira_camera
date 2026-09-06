"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format/money";

export function RevenueChart({ items }: { items: Array<{ date: Date; amount: number }> }) {
  const [selected, setSelected] = useState<number | null>(null);
  const highest = Math.max(...items.map((item) => item.amount), 1);
  const active = selected === null ? null : items[selected];
  return <section className="rounded-2xl border border-line bg-white p-4 shadow-soft"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-ink">Doanh thu 7 ngày gần nhất</h2><p className="mt-1 text-xs text-[#7A6C76]">Chỉ tính đơn đã trả</p></div>{active ? <span className="text-xs font-semibold text-pine-dark">{formatMoney(active.amount)}</span> : null}</div><div className="mt-4 flex h-36 items-end gap-2" role="list" aria-label="Biểu đồ doanh thu 7 ngày">{items.map((item, index) => { const height = item.amount === 0 ? 5 : Math.max(14, Math.round((item.amount / highest) * 100)); const label = new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(item.date).replace("Thứ ", "T"); return <button key={item.date.toISOString()} type="button" onClick={() => setSelected(index)} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2" title={`${new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(item.date)}: ${formatMoney(item.amount)}`}><span className={`w-full max-w-8 rounded-t-lg transition-colors ${selected === index ? "bg-pine-dark" : "bg-[#F8BBD0] group-hover:bg-pine"}`} style={{ height: `${height}%` }} /><span className="text-[11px] text-[#7A6C76]">{label}</span></button>; })}</div></section>;
}