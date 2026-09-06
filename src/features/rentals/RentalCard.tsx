import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { RentalStatusBadge } from "@/components/shared/StatusBadges";
import { formatDateTime } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";
import type { RentalWithCamera } from "@/types/domain";

export function RentalCard({ rental }: { rental: RentalWithCamera }) {
  return <Link href={`/rentals/${rental.id}`} className="app-card block p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-[15px] font-bold text-ink">{rental.camera?.name ?? "Không rõ máy"}</h3><p className="mt-1 truncate text-sm text-[#514650]">{rental.customer_name}</p>{rental.customer_phone ? <p className="mt-0.5 text-xs text-[#7A6C76]">{rental.customer_phone}</p> : null}</div><RentalStatusBadge status={rental.status} /></div><div className="mt-3 flex gap-2 text-xs leading-5 text-[#7A6C76]"><CalendarDays className="mt-0.5 shrink-0 text-pine-dark" size={15} /><span>Nhận: {formatDateTime(rental.start_time)}<br />Trả: {formatDateTime(rental.end_time)}</span></div><div className="mt-3 flex items-center justify-between border-t border-[#F8E8EE] pt-3"><span className="text-xs text-[#7A6C76]">Tiền thuê</span><span className="text-base font-bold text-pine-dark">{formatMoney(rental.rental_price)}</span></div></Link>;
}