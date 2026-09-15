import { supabase } from "@/lib/supabase/client";
import { parseMoneyInput } from "@/lib/format/money";
import type { Camera, CameraFormInput, Rental, RentalFormInput, RentalStatus, RentalWithCamera } from "@/types/domain";

function client() {
  if (!supabase) throw new Error("Chưa cấu hình kết nối Supabase.");
  return supabase;
}

function normalizeRental(row: RentalWithCamera) {
  return { ...row, rental_price: Number(row.rental_price), camera: Array.isArray(row.camera) ? row.camera[0] ?? null : row.camera ?? null } as RentalWithCamera;
}

async function requireAuthenticatedSession() {
  const { data, error } = await client().auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error("Phiên đăng nhập đã hết. Hãy đăng nhập lại rồi lưu đơn.");
}

function rentalPayload(input: RentalFormInput) {
  return {
    camera_id: input.camera_id,
    customer_name: input.customer_name.trim(),
    customer_phone: input.customer_phone.trim() || null,
    customer_address: input.customer_address.trim() || null,
    start_time: new Date(input.start_time).toISOString(),
    end_time: new Date(input.end_time).toISOString(),
    rental_price: parseMoneyInput(input.rental_price),
    deposit_info: input.deposit_info.trim() || null,
    status: input.status,
    note: input.note.trim() || null,
  };
}

export function validateRentalInput(input: RentalFormInput) {
  const errors: string[] = [];
  const start = new Date(input.start_time);
  const end = new Date(input.end_time);
  const price = parseMoneyInput(input.rental_price);
  if (!input.customer_name.trim()) errors.push("Tên khách bắt buộc.");
  if (!input.camera_id) errors.push("Máy ảnh bắt buộc.");
  if (!input.start_time) errors.push("Ngày giờ nhận bắt buộc.");
  if (!input.end_time) errors.push("Ngày giờ trả bắt buộc.");
  if (input.start_time && input.end_time && end <= start) errors.push("Ngày giờ trả phải sau ngày giờ nhận.");
  if (price < 0) errors.push("Tiền thuê không được âm.");
  return errors;
}

export async function fetchCameras() {
  const { data, error } = await client().from("cameras").select("*").order("name");
  if (error) throw error;
  return (data ?? []) as Camera[];
}

export async function fetchCamera(id: string) {
  const { data, error } = await client().from("cameras").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Camera | null;
}

export async function saveCamera(input: CameraFormInput, id?: string) {
  const payload = { name: input.name.trim(), status: input.status, note: input.note.trim() || null };
  const query = id
    ? client().from("cameras").update(payload).eq("id", id).select().single()
    : client().from("cameras").insert(payload).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return data as Camera;
}

export async function deleteOrDeactivateCamera(id: string) {
  const db = client();
  const { data: rentals, error: rentalError } = await db.from("rentals").select("id").eq("camera_id", id).limit(1);
  if (rentalError) throw rentalError;
  if ((rentals?.length ?? 0) > 0) {
    const { error } = await db.from("cameras").update({ status: "INACTIVE" }).eq("id", id);
    if (error) throw error;
    return "deactivated" as const;
  }
  const { error } = await db.from("cameras").delete().eq("id", id);
  if (error) throw error;
  return "deleted" as const;
}

export async function fetchRentals() {
  const { data, error } = await client().from("rentals").select("*, camera:cameras(*)").order("start_time", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as unknown as RentalWithCamera[]).map(normalizeRental);
}

export async function fetchRental(id: string) {
  const { data, error } = await client().from("rentals").select("*, camera:cameras(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? normalizeRental(data as unknown as RentalWithCamera) : null;
}

export async function findRentalOverlaps(input: RentalFormInput, ignoreRentalId?: string) {
  let query = client()
    .from("rentals")
    .select("*, camera:cameras(*)")
    .eq("camera_id", input.camera_id)
    .neq("status", "CANCELLED")
    .lt("start_time", new Date(input.end_time).toISOString())
    .gt("end_time", new Date(input.start_time).toISOString());
  if (ignoreRentalId) query = query.neq("id", ignoreRentalId);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as RentalWithCamera[]).map(normalizeRental);
}

async function syncCameraAvailability(cameraId: string) {
  const db = client();
  const { data: camera, error: cameraError } = await db.from("cameras").select("status").eq("id", cameraId).maybeSingle();
  if (cameraError) throw cameraError;
  if (!camera || camera.status === "MAINTENANCE" || camera.status === "INACTIVE") return;
  const { data: activeRentals, error: rentalError } = await db.from("rentals").select("id").eq("camera_id", cameraId).eq("status", "RENTING").limit(1);
  if (rentalError) throw rentalError;
  const { error } = await db.from("cameras").update({ status: (activeRentals?.length ?? 0) > 0 ? "RENTED" : "AVAILABLE" }).eq("id", cameraId);
  if (error) throw error;
}

export async function saveRental(input: RentalFormInput, id?: string) {
  const db = client();
  await requireAuthenticatedSession();
  const previous = id ? await fetchRental(id) : null;
  const payload = rentalPayload(input);
  const query = id
    ? db.from("rentals").update(payload).eq("id", id).select().single()
    : db.from("rentals").insert(payload).select().single();
  const { data, error } = await query;
  if (error) throw error;
  await syncCameraAvailability(payload.camera_id);
  if (previous && previous.camera_id !== payload.camera_id) await syncCameraAvailability(previous.camera_id);
  return data as Rental;
}

export async function updateRentalStatus(id: string, status: RentalStatus, returnNote?: string) {
  const current = await fetchRental(id);
  if (!current) throw new Error("Không tìm thấy đơn thuê.");
  const note = returnNote?.trim() ? [current.note, `Trả máy: ${returnNote.trim()}`].filter(Boolean).join("\n") : current.note;
  const { error } = await client().from("rentals").update({ status, note }).eq("id", id);
  if (error) throw error;
  await syncCameraAvailability(current.camera_id);
}

export async function deleteRental(id: string) {
  const current = await fetchRental(id);
  const { error } = await client().from("rentals").delete().eq("id", id);
  if (error) throw error;
  if (current) await syncCameraAvailability(current.camera_id);
}