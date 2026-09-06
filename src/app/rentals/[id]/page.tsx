"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/shared/ConfirmButton";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/States";
import { RentalStatusBadge } from "@/components/shared/StatusBadges";
import { deleteRental, getRental, updateRentalStatus } from "@/features/data/localStore";
import { formatDateTime } from "@/lib/format/date";
import { formatMoney } from "@/lib/format/money";

export default function RentalDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const rental = getRental(params.id);
  if (!rental) return <EmptyState title="Không tìm thấy đơn thuê." />;
  const changeStatus = (status: typeof rental.status) => { updateRentalStatus(rental.id, status); router.refresh(); };
  return <><PageHeader title="Chi tiết đơn" description={rental.customer_name} /><section className="app-panel p-4"><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-ink">{rental.camera?.name}</h2><p className="mt-1 text-sm text-[#7A6C76]">{rental.customer_phone ?? "Chưa có số điện thoại"}</p></div><RentalStatusBadge status={rental.status} /></div><dl className="grid gap-4 sm:grid-cols-2"><Info label="Khách" value={rental.customer_name} /><Info label="Địa chỉ" value={rental.customer_address ?? "-"} /><Info label="Ngày giờ nhận" value={formatDateTime(rental.start_time)} /><Info label="Ngày giờ trả" value={formatDateTime(rental.end_time)} /><Info label="Tiền thuê" value={formatMoney(rental.rental_price)} /><Info label="Thông tin cọc" value={rental.deposit_info ?? "-"} /><Info label="Ghi chú" value={rental.note ?? "-"} /></dl><div className="mt-6 grid gap-2 sm:flex sm:flex-wrap"><Link href={`/rentals/${rental.id}/edit`} className="touch-target inline-flex items-center justify-center rounded-xl border border-line px-4 text-sm font-semibold text-ink">Sửa</Link>{rental.status === "BOOKED" ? <button onClick={() => changeStatus("RENTING")} className="touch-target rounded-xl bg-amber px-4 text-sm font-semibold text-white">Bắt đầu thuê</button> : null}{rental.status === "RENTING" ? <button onClick={() => changeStatus("RETURNED")} className="touch-target rounded-xl bg-pine px-4 text-sm font-semibold text-white">Đã trả máy</button> : null}{rental.status !== "CANCELLED" ? <button onClick={() => changeStatus("CANCELLED")} className="touch-target rounded-xl border border-line px-4 text-sm font-semibold text-[#514650]">Hủy đơn</button> : null}<ConfirmButton message="Bạn có chắc muốn xóa lịch thuê này?" onConfirm={() => { deleteRental(rental.id); router.push("/rentals"); }} className="touch-target rounded-xl bg-rose px-4 text-sm font-semibold text-white">Xóa</ConfirmButton></div></section></>;
}
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-sm text-[#7A6C76]">{label}</dt><dd className="mt-1 font-semibold text-ink">{value}</dd></div>; }