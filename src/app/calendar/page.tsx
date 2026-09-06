"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/States";
import { RentalStatusBadge } from "@/components/shared/StatusBadges";
import { RentalDetailSheet } from "@/features/rentals/RentalDetailSheet";
import { listRentalsWithCameras } from "@/features/data/localStore";
import { formatDate, formatRentalTimeRange } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";
import type { RentalWithCamera, RentalStatus } from "@/types/domain";

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const dotColors: Record<RentalStatus, string> = { BOOKED: "bg-pine", RENTING: "bg-amber", RETURNED: "bg-[#3FAE7A]", CANCELLED: "bg-[#B1A9AF]" };

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function rentalMatchesDay(rental: RentalWithCamera, day: Date) { const start = new Date(rental.start_time); const end = new Date(rental.end_time); const from = new Date(day.getFullYear(), day.getMonth(), day.getDate()); const to = new Date(from); to.setDate(from.getDate() + 1); return start < to && end >= from; }
function monthCells(viewDate: Date) { const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1); const offset = (first.getDay() + 6) % 7; return Array.from({ length: 42 }, (_, index) => new Date(viewDate.getFullYear(), viewDate.getMonth(), index - offset + 1)); }

export default function CalendarPage() {
  const rentals = listRentalsWithCameras().filter((rental) => rental.status !== "CANCELLED");
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<RentalWithCamera | null>(null);
  const cells = useMemo(() => monthCells(viewDate), [viewDate]);
  const selectedItems = useMemo(() => rentals.filter((rental) => rentalMatchesDay(rental, selectedDate)), [rentals, selectedDate]);
  const results = useMemo(() => { const term = query.trim().toLowerCase(); return term ? rentals.filter((rental) => rental.customer_name.toLowerCase().includes(term) || rental.customer_phone?.toLowerCase().includes(term) || rental.camera?.name.toLowerCase().includes(term)) : []; }, [query, rentals]);
  const monthName = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(viewDate);
  const changeMonth = (amount: number) => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));

  return <><PageHeader title="Lịch thuê" /><SearchInput className="mb-4" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm khách, SĐT, máy" />{query ? <SearchResults items={results} onPick={setDetail} /> : <><section className="app-panel p-3"><div className="mb-4 flex items-center justify-between gap-2"><button type="button" onClick={() => changeMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-pine-dark hover:bg-[#FFF2F6]" aria-label="Tháng trước"><ChevronLeft size={21} /></button><button type="button" onClick={() => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today); }} className="text-sm font-bold capitalize text-ink">{monthName}</button><button type="button" onClick={() => changeMonth(1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-pine-dark hover:bg-[#FFF2F6]" aria-label="Tháng sau"><ChevronRight size={21} /></button></div><div className="grid grid-cols-7 text-center text-xs font-semibold text-[#8C7B85]">{weekDays.map((day) => <span key={day} className="pb-2">{day}</span>)}</div><div className="grid grid-cols-7 gap-y-1">{cells.map((day) => { const key = dateKey(day); const items = rentals.filter((rental) => rentalMatchesDay(rental, day)); const currentMonth = day.getMonth() === viewDate.getMonth(); const selected = key === dateKey(selectedDate); const isToday = key === dateKey(today); return <button type="button" key={key} onClick={() => setSelectedDate(day)} className={`relative flex aspect-square min-w-0 flex-col items-center justify-center rounded-xl text-sm transition-colors ${selected ? "bg-blush font-bold text-pine-dark" : isToday ? "font-bold text-pine-dark" : currentMonth ? "text-ink" : "text-[#C8BBC2]"}`}><span>{day.getDate()}</span>{items.length > 0 ? <span className="mt-1 flex h-1.5 items-center gap-0.5">{items.slice(0, 3).map((item) => <i key={item.id} className={`h-1.5 w-1.5 rounded-full ${dotColors[item.status]}`} />)}{items.length > 3 ? <i className="text-[9px] not-italic text-[#7A6C76]">+</i> : null}</span> : <span className="mt-1 h-1.5" />}</button>; })}</div><div className="mt-4 flex flex-wrap gap-3 border-t border-[#F8E7EE] pt-3 text-[11px] text-[#7A6C76]"><Legend color="bg-pine" label="Đã đặt" /><Legend color="bg-amber" label="Đang thuê" /><Legend color="bg-[#3FAE7A]" label="Đã trả" /></div></section><section className="mt-5"><h2 className="text-lg font-bold text-ink">Lịch ngày {formatDate(selectedDate)}</h2><div className="mt-3">{selectedItems.length === 0 ? <EmptyState title="Không có lịch thuê trong ngày này." /> : <div className="grid gap-3 md:grid-cols-2">{selectedItems.map((rental) => <button type="button" key={rental.id} onClick={() => setDetail(rental)} className="app-card w-full p-4 text-left"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold text-ink">{rental.camera?.name}</p><p className="mt-1 text-sm text-[#7A6C76]">{rental.customer_name}</p></div><RentalStatusBadge status={rental.status} /></div><p className="mt-3 text-sm text-[#7A6C76]">{formatRentalTimeRange(rental.start_time, rental.end_time)}</p><p className="mt-2 font-bold text-pine-dark">{formatMoney(rental.rental_price)}</p></button>)}</div>}</div></section></>}<RentalDetailSheet rental={detail} onClose={() => setDetail(null)} /></>;
}

function Legend({ color, label }: { color: string; label: string }) { return <span className="inline-flex items-center gap-1.5"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>; }
function SearchResults({ items, onPick }: { items: RentalWithCamera[]; onPick: (rental: RentalWithCamera) => void }) { return <section><h2 className="mb-3 text-lg font-bold text-ink">Kết quả tìm kiếm</h2>{items.length === 0 ? <EmptyState title="Không tìm thấy lịch thuê phù hợp." /> : <div className="grid gap-3 md:grid-cols-2">{items.map((rental) => <button type="button" key={rental.id} onClick={() => onPick(rental)} className="app-card p-4 text-left"><div className="flex justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold text-ink">{rental.camera?.name}</p><p className="mt-1 text-sm text-[#7A6C76]">{rental.customer_name}</p></div><RentalStatusBadge status={rental.status} /></div><p className="mt-3 text-xs text-[#7A6C76]">{formatDate(rental.start_time)} · {formatRentalTimeRange(rental.start_time, rental.end_time)}</p></button>)}</div>}</section>; }