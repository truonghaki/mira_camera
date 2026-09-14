"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/States";
import { RentalStatusBadge } from "@/components/shared/StatusBadges";
import { listRentalsWithCameras } from "@/features/data/localStore";
import { formatDateTime } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";
import type { RentalStatus, RentalWithCamera } from "@/types/domain";
import { useMemo, useState } from "react";

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const calendarStatus: Record<RentalStatus, string> = { BOOKED: "bg-[#FCE7F0] text-[#A53A63]", RENTING: "bg-[#FFF0D9] text-[#A55D14]", RETURNED: "bg-[#E4F5EC] text-[#207A50]", CANCELLED: "bg-[#F1EFF0] text-[#726872]" };
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function rentalMatchesDay(rental: RentalWithCamera, day: Date) { const start = new Date(rental.start_time); const end = new Date(rental.end_time); const from = new Date(day.getFullYear(), day.getMonth(), day.getDate()); const to = new Date(from); to.setDate(to.getDate() + 1); return start < to && end >= from; }
function monthCells(viewDate: Date) { const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1); const offset = (first.getDay() + 6) % 7; return Array.from({ length: 42 }, (_, index) => new Date(viewDate.getFullYear(), viewDate.getMonth(), index - offset + 1)); }

export default function CalendarPage() {
  const rentals = listRentalsWithCameras();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [query, setQuery] = useState("");
  const cells = useMemo(() => monthCells(viewDate), [viewDate]);
  const selectedItems = useMemo(() => rentals.filter((rental) => rentalMatchesDay(rental, selectedDate)), [rentals, selectedDate]);
  const searched = useMemo(() => { const term = query.trim().toLowerCase(); return term ? rentals.filter((rental) => rental.camera?.name.toLowerCase().includes(term) || rental.customer_name.toLowerCase().includes(term)) : null; }, [query, rentals]);
  const monthName = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(viewDate);
  const changeMonth = (amount: number) => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const jumpToday = () => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDate(today); };

  return <><PageHeader title="Lịch thuê" description="Theo dõi lịch nhận, trả và tình trạng máy." /><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm khách hoặc máy" />{searched ? <RentalList title="Kết quả tìm kiếm" rentals={searched} /> : <><section className="app-panel mt-4 p-3 sm:p-4"><div className="mb-4 flex items-center justify-between gap-2"><button type="button" onClick={() => changeMonth(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-pine-dark hover:bg-[#FFF2F6]" aria-label="Tháng trước"><ChevronLeft size={21} /></button><div className="text-center"><h2 className="text-sm font-bold capitalize text-ink sm:text-base">{monthName}</h2><button type="button" onClick={jumpToday} className="mt-1 text-xs font-semibold text-pine-dark">Hôm nay</button></div><button type="button" onClick={() => changeMonth(1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-pine-dark hover:bg-[#FFF2F6]" aria-label="Tháng sau"><ChevronRight size={21} /></button></div><div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#8C7B85] sm:gap-2">{weekDays.map((day) => <span key={day} className="pb-1">{day}</span>)}</div><div className="grid grid-cols-7 gap-1 sm:gap-2">{cells.map((day) => { const key = dateKey(day); const items = rentals.filter((rental) => rentalMatchesDay(rental, day)); const currentMonth = day.getMonth() === viewDate.getMonth(); const selected = key === dateKey(selectedDate); const isToday = key === dateKey(today); return <button type="button" key={key} onClick={() => setSelectedDate(day)} className={`min-h-[68px] overflow-hidden rounded-lg p-1 text-left transition-all sm:min-h-[94px] sm:p-2 ${selected ? "bg-[#FFE8F0] ring-1 ring-[#E85D8E]" : isToday ? "bg-[#FFF4F8] ring-1 ring-[#F3C5D5]" : currentMonth ? "bg-[#FFFCFD] hover:bg-[#FFF6F9]" : "bg-transparent text-[#C8BBC2]"}`}><span className={`mb-1 block text-center text-xs font-bold sm:text-sm ${isToday ? "text-pine-dark" : ""}`}>{day.getDate()}</span><span className="block space-y-1">{items.slice(0, 2).map((item) => <span key={item.id} className={`block truncate rounded px-1 py-0.5 text-[8px] font-semibold leading-tight sm:text-[11px] ${calendarStatus[item.status]}`}>{item.camera?.name ?? "Máy ảnh"}</span>)}{items.length > 2 ? <span className="block truncate px-1 text-[8px] font-semibold text-[#7A6C76] sm:text-[11px]">+{items.length - 2} lịch khác</span> : null}</span></button>; })}</div><div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#F8E7EE] pt-3 text-[11px] text-[#7A6C76]"><Legend status="BOOKED" label="Đã đặt" /><Legend status="RENTING" label="Đang thuê" /><Legend status="RETURNED" label="Đã trả" /><Legend status="CANCELLED" label="Đã hủy" /></div></section><RentalList title={`Lịch ngày ${new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(selectedDate)}`} rentals={selectedItems} /></>}</>;
}

function Legend({ status, label }: { status: RentalStatus; label: string }) { return <span className="inline-flex items-center gap-1.5"><i className={`h-2 w-2 rounded-full ${status === "BOOKED" ? "bg-pine" : status === "RENTING" ? "bg-amber" : status === "RETURNED" ? "bg-[#3FAE7A]" : "bg-[#A89DA4]"}`} />{label}</span>; }
function RentalList({ title, rentals }: { title: string; rentals: RentalWithCamera[] }) { return <section className="mt-5"><div className="mb-3 flex items-center justify-between"><h2 className="app-section-heading">{title}</h2><span className="text-sm text-[#7A6C76]">{rentals.length} đơn</span></div>{rentals.length === 0 ? <EmptyState title="Không có lịch thuê trong thời gian này." /> : <div className="grid gap-3 lg:grid-cols-2">{rentals.map((rental) => <Link key={rental.id} href={`/rentals/${rental.id}`} className="app-card block p-4 shadow-[0_5px_16px_rgba(86,48,65,0.06)]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-lg font-bold text-ink">{rental.camera?.name ?? "Máy ảnh"}</h3><p className="mt-1 text-sm text-[#7A6C76]">{rental.customer_name}</p></div><RentalStatusBadge status={rental.status} /></div><dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><Item label="Nhận máy" value={formatDateTime(rental.start_time)} /><Item label="Trả máy" value={formatDateTime(rental.end_time)} /><Item label="Tiền thuê" value={formatMoney(rental.rental_price)} /><Item label="Tiền cọc" value={rental.deposit_info ?? "Chưa ghi nhận"} /></dl></Link>)}</div>}</section>; }
function Item({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-[#8A7B84]">{label}</dt><dd className="mt-1 font-semibold text-ink">{value}</dd></div>; }