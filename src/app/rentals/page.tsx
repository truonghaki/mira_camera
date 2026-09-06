"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { HeaderLink, PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/States";
import { listRentalsWithCameras } from "@/features/data/localStore";
import { RentalCard } from "@/features/rentals/RentalCard";
import type { RentalStatus } from "@/types/domain";

const filters: Array<{ value: "" | RentalStatus; label: string }> = [{ value: "", label: "Tất cả" }, { value: "BOOKED", label: "Đã đặt" }, { value: "RENTING", label: "Đang thuê" }, { value: "RETURNED", label: "Đã trả" }, { value: "CANCELLED", label: "Đã hủy" }];

export default function RentalsPage() {
  const rentals = listRentalsWithCameras();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | RentalStatus>("");
  const filtered = useMemo(() => { const term = query.trim().toLowerCase(); return rentals.filter((rental) => { const matchesText = !term || rental.customer_name.toLowerCase().includes(term) || rental.customer_phone?.toLowerCase().includes(term) || rental.camera?.name.toLowerCase().includes(term); return matchesText && (!status || rental.status === status); }); }, [query, rentals, status]);
  return <><PageHeader title="Đơn thuê" description={`${rentals.length} đơn trong hệ thống`} action={<HeaderLink href="/rentals/new"><Plus className="mr-2" size={18} />Tạo đơn</HeaderLink>} /><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên khách, SĐT, máy" /><div className="-mx-4 mt-3 overflow-x-auto px-4 sm:mx-0 sm:px-0"><div className="flex min-w-max gap-2">{filters.map((filter) => <button key={filter.value} type="button" onClick={() => setStatus(filter.value)} className={`min-h-9 rounded-full px-3 text-sm font-semibold transition-colors ${status === filter.value ? "bg-pine text-white" : "border border-line bg-white text-[#6F606A] hover:bg-[#FFF4F8]"}`}>{filter.label}</button>)}</div></div><section className="mt-4">{filtered.length === 0 ? <EmptyState title="Chưa có đơn thuê phù hợp." /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((rental) => <RentalCard key={rental.id} rental={rental} />)}</div>}</section></>;
}