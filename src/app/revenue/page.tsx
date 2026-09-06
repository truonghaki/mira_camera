"use client";

import { useMemo, useState } from "react";
import { CalendarRange, WalletCards } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/States";
import { listRentalsWithCameras } from "@/features/data/localStore";
import { formatDateTime } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";

export default function RevenuePage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(monthEnd);
  const returned = listRentalsWithCameras().filter((rental) => rental.status === "RETURNED");
  const filtered = useMemo(() => returned.filter((rental) => rental.end_time.slice(0, 10) >= from && rental.end_time.slice(0, 10) <= to), [from, returned, to]);
  const total = filtered.reduce((sum, rental) => sum + rental.rental_price, 0);
  return <><PageHeader title="Doanh thu" description="Chỉ tính các đơn đã trả máy." /><section className="rounded-2xl bg-gradient-to-br from-[#E85D8E] to-[#C94775] p-5 text-white shadow-[0_14px_32px_rgba(201,71,117,0.22)]"><div className="flex items-center justify-between"><div><p className="text-sm text-white/80">Tổng doanh thu</p><p className="mt-2 text-3xl font-bold">{formatMoney(total)}</p></div><div className="rounded-xl bg-white/15 p-3"><WalletCards size={23} /></div></div></section><section className="mt-4 app-panel p-4"><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#514650]"><CalendarRange size={16} />Từ ngày</span><input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="input" /></label><label><span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#514650]"><CalendarRange size={16} />Đến ngày</span><input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="input" /></label></div></section><section className="mt-5">{filtered.length === 0 ? <EmptyState title="Chưa có doanh thu trong khoảng ngày này." /> : <div className="space-y-3">{filtered.map((rental) => <article key={rental.id} className="flex items-start justify-between gap-4 app-panel p-4"><div className="min-w-0"><p className="font-bold text-ink">{rental.customer_name}</p><p className="mt-1 truncate text-sm text-[#7A6C76]">{rental.camera?.name} · {formatDateTime(rental.end_time)}</p></div><p className="shrink-0 font-bold text-pine-dark">{formatMoney(rental.rental_price)}</p></article>)}</div>}</section></>;
}