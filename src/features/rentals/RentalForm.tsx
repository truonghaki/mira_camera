"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { ErrorState } from "@/components/shared/States";
import { fetchCameras, findRentalOverlaps, saveRental, validateRentalInput } from "@/features/data/supabaseData";
import { formatDateTime, toDateTimeLocalValue } from "@/lib/format/date";
import { RENTAL_STATUS_LABELS, type Camera, type RentalFormInput, type RentalWithCamera } from "@/types/domain";
import { useSupabaseData } from "@/features/data/SupabaseDataProvider";
import { showSuccessToast } from "@/components/shared/Toast";

const blankInput: RentalFormInput = { camera_id: "", customer_name: "", customer_phone: "", customer_address: "", start_time: "", end_time: "", rental_price: "", deposit_info: "", status: "BOOKED", note: "" };

export function RentalForm({ rental }: { rental?: RentalWithCamera | null }) {
  const router = useRouter();
  const { refresh } = useSupabaseData();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loadingCameras, setLoadingCameras] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [overlaps, setOverlaps] = useState<RentalWithCamera[]>([]);
  const [saving, setSaving] = useState(false);
  const [input, setInput] = useState<RentalFormInput>(() => rental ? { camera_id: rental.camera_id, customer_name: rental.customer_name, customer_phone: rental.customer_phone ?? "", customer_address: rental.customer_address ?? "", start_time: toDateTimeLocalValue(rental.start_time), end_time: toDateTimeLocalValue(rental.end_time), rental_price: String(rental.rental_price), deposit_info: rental.deposit_info ?? "", status: rental.status, note: rental.note ?? "" } : blankInput);

  useEffect(() => { fetchCameras().then((items) => setCameras(items.filter((camera) => camera.status !== "INACTIVE"))).catch((err) => setErrors([err instanceof Error ? err.message : "Không thể tải danh sách máy."])).finally(() => setLoadingCameras(false)); }, []);
  function update<K extends keyof RentalFormInput>(key: K, value: RentalFormInput[K]) { setInput((current) => ({ ...current, [key]: value })); setErrors([]); setOverlaps([]); }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateRentalInput(input);
    if (validationErrors.length > 0) { setErrors(validationErrors); return; }
    setSaving(true); setErrors([]);
    try {
      const overlapItems = await findRentalOverlaps(input, rental?.id);
      if (overlapItems.length > 0) { setOverlaps(overlapItems); setErrors([`${overlapItems[0].camera?.name ?? "Máy ảnh"} đã có lịch thuê trong khoảng thời gian này.`]); return; }
      const saved = await saveRental(input, rental?.id);
      await refresh();
      showSuccessToast(rental ? "Đã cập nhật lịch thuê." : "Đã tạo lịch thuê thành công.");
      router.push(`/rentals/${saved.id}`); router.refresh();
    } catch (err) { const message = err instanceof Error ? err.message : "Không thể lưu đơn thuê. Vui lòng thử lại."; setErrors([message.includes("row-level security") ? "Bạn chưa có quyền lưu đơn. Hãy đăng xuất, đăng nhập lại rồi thử lại." : message]); } finally { setSaving(false); }
  }

  return <form onSubmit={submit} className="app-panel space-y-0 p-4">{errors.length > 0 ? <ErrorState message={errors.join(" ")} /> : null}{overlaps.length > 0 ? <div className="mt-4 rounded-2xl border border-[#F6D7B6] bg-[#FFF8E9] p-4 text-sm text-[#875012]"><div className="font-semibold">Lịch đang bị trùng</div><div className="mt-2 space-y-1">{overlaps.map((item) => <p key={item.id}>{item.customer_name} · {formatDateTime(item.start_time)} → {formatDateTime(item.end_time)}</p>)}</div></div> : null}<Section title="Khách hàng"><Field label="Tên khách *"><input value={input.customer_name} onChange={(event) => update("customer_name", event.target.value)} className="input" /></Field><Field label="Số điện thoại"><input inputMode="tel" value={input.customer_phone} onChange={(event) => update("customer_phone", event.target.value)} className="input" /></Field><Field label="Địa chỉ" className="sm:col-span-2"><input value={input.customer_address} onChange={(event) => update("customer_address", event.target.value)} className="input" /></Field></Section><Section title="Máy thuê"><Field label="Chọn máy *"><select disabled={loadingCameras} value={input.camera_id} onChange={(event) => update("camera_id", event.target.value)} className="input"><option value="">{loadingCameras ? "Đang tải máy..." : "Chọn máy ảnh"}</option>{cameras.map((camera) => <option key={camera.id} value={camera.id}>{camera.name}</option>)}</select></Field></Section><Section title="Thời gian"><Field label="Ngày giờ nhận *"><input type="datetime-local" value={input.start_time} onChange={(event) => update("start_time", event.target.value)} className="input" /></Field><Field label="Ngày giờ trả *"><input type="datetime-local" value={input.end_time} onChange={(event) => update("end_time", event.target.value)} className="input" /></Field></Section><Section title="Chi phí"><Field label="Tiền thuê *"><input inputMode="numeric" placeholder="Ví dụ: 800000" value={input.rental_price} onChange={(event) => update("rental_price", event.target.value)} className="input" /></Field><Field label="Thông tin cọc"><input value={input.deposit_info} onChange={(event) => update("deposit_info", event.target.value)} className="input" /></Field></Section><Section title="Khác"><Field label="Ghi chú"><textarea value={input.note} onChange={(event) => update("note", event.target.value)} className="input min-h-24" /></Field><Field label="Trạng thái"><select value={input.status} onChange={(event) => update("status", event.target.value as RentalFormInput["status"])} className="input">{Object.entries(RENTAL_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field></Section><Button disabled={saving || loadingCameras} className="mt-4 w-full" type="submit">{saving ? "Đang lưu..." : "Lưu đơn"}</Button></form>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="border-t border-[#F3E3E9] py-4 first:border-t-0 first:pt-0"><h2 className="mb-4 text-base font-bold text-ink">{title}</h2><div className="grid gap-4 sm:grid-cols-2">{children}</div></section>; }
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) { return <label className={`block ${className}`}><span className="mb-1.5 block text-sm font-medium text-[#514650]">{label}</span>{children}</label>; }