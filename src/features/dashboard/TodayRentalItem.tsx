import { Clock } from "lucide-react";
import { RentalStatusBadge } from "@/components/shared/StatusBadges";
import { formatRentalTimeRange } from "@/lib/format/date";
import type { RentalWithCamera } from "@/types/domain";

export function TodayRentalItem({ rental }: { rental: RentalWithCamera }) {
  return <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF2F6] text-pine-dark"><Clock size={17} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{rental.camera?.name ?? "Máy ảnh"}</p><p className="truncate text-xs text-[#7A6C76]">{rental.customer_name} · {formatRentalTimeRange(rental.start_time, rental.end_time)}</p></div><RentalStatusBadge status={rental.status} /></div>;
}