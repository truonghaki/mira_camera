import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { RentalStatusBadge } from "@/components/shared/StatusBadges";
import { formatRentalTimeRange } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";
import type { RentalWithCamera } from "@/types/domain";

export function RentalCard({ rental }: { rental: RentalWithCamera }) {
  return <Link href={`/rentals/${rental.id}`} className="app-card rental-card-premium block p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-[16px] font-semibold leading-snug text-ink">{rental.camera?.name ?? "Không rõ máy"}</h3>
        <p className="mt-1 text-sm text-[#6F626B]">{rental.customer_name}</p>
      </div>
      <RentalStatusBadge status={rental.status} />
    </div>
    <div className="mt-4 flex gap-2 text-[13px] font-medium leading-5 text-[#655862]">
      <CalendarDays className="mt-0.5 shrink-0 text-pine-dark" size={16} />
      <span>{formatRentalTimeRange(rental.start_time, rental.end_time)}</span>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-[#F5E7EC] pt-3">
      <div><p className="text-xs text-[#8A7B84]">Tiền thuê</p><p className="mt-1 text-base font-semibold text-pine-dark">{formatMoney(rental.rental_price)}</p></div>
      <ChevronRight size={19} className="text-[#BE95A5]" />
    </div>
  </Link>;
}