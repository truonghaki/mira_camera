import Link from "next/link";
import { X } from "lucide-react";
import { RentalStatusBadge } from "@/components/shared/StatusBadges";
import { formatDateTime } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";
import type { RentalWithCamera } from "@/types/domain";

export function RentalDetailSheet({ rental, onClose }: { rental: RentalWithCamera | null; onClose: () => void }) {
  if (!rental) return null;
  return <div className="fixed inset-0 z-30 flex items-end bg-[#2B2330]/35" role="dialog" aria-modal="true" aria-label="Chi tiết đơn thuê" onMouseDown={onClose}><section className="safe-bottom max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#E7D4DD]" /><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-ink">{rental.camera?.name ?? "Máy ảnh"}</h2><p className="mt-1 text-sm text-[#7A6C76]">{rental.customer_name}</p></div><button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#7A6C76] hover:bg-[#FFF2F6]" aria-label="Đóng"><X size={20} /></button></div><div className="mt-4"><RentalStatusBadge status={rental.status} /></div><dl className="mt-5 grid gap-4 text-sm"><Info label="Số điện thoại" value={rental.customer_phone ?? "-"} /><Info label="Địa chỉ" value={rental.customer_address ?? "-"} /><Info label="Nhận máy" value={formatDateTime(rental.start_time)} /><Info label="Trả máy" value={formatDateTime(rental.end_time)} /><Info label="Tiền thuê" value={formatMoney(rental.rental_price)} /></dl><Link href={`/rentals/${rental.id}`} className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-pine text-sm font-semibold text-white">Mở chi tiết đơn</Link></section></div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4"><dt className="text-[#7A6C76]">{label}</dt><dd className="text-right font-semibold text-ink">{value}</dd></div>; }