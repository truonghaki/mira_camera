"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { useSupabaseData } from "@/features/data/SupabaseDataProvider";
import { RentalCard } from "@/features/rentals/RentalCard";
import type { RentalStatus } from "@/types/domain";

const filters: Array<{ value: "" | RentalStatus; label: string }> = [{ value: "", label: "Tất cả" }, { value: "BOOKED", label: "Đã đặt" }, { value: "RENTING", label: "Đang thuê" }, { value: "RETURNED", label: "Đã trả" }, { value: "CANCELLED", label: "Đã hủy" }];
export function RentalHistory() {
  const { rentals: sourceRentals, loading, error } = useSupabaseData();
  const rentals = useMemo(() => sourceRentals.slice().sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()), [sourceRentals]);
  const [query, setQuery] = useState(""); const [status, setStatus] = useState<"" | RentalStatus>("");
  const filtered = useMemo(() => { const term = query.trim().toLowerCase(); return rentals.filter((rental) => (!status || rental.status === status) && (!term || rental.customer_name.toLowerCase().includes(term) || rental.camera?.name.toLowerCase().includes(term))); }, [query, rentals, status]);
  return <><PageHeader title="Lịch sử" description="Tìm lại và theo dõi tất cả đơn thuê." />{error ? <ErrorState message={error} /> : loading ? <LoadingState /> : <><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên khách hoặc máy" /><div className="-mx-4 mt-3 overflow-x-auto px-4 sm:mx-0 sm:px-0"><div className="flex min-w-max gap-2">{filters.map((filter) => <button key={filter.value} type="button" onClick={() => setStatus(filter.value)} className={`min-h-9 rounded-full px-3 text-sm font-semibold ${status === filter.value ? "bg-pine text-white" : "border border-line bg-white text-[#6F606A]"}`}>{filter.label}</button>)}</div></div><section className="mt-4">{filtered.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((rental) => <RentalCard key={rental.id} rental={rental} />)}</div> : <EmptyState title="Không có đơn thuê phù hợp." />}</section></>}</>;
}