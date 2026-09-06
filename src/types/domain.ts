export type CameraStatus = "AVAILABLE" | "RENTED" | "MAINTENANCE" | "INACTIVE";
export type RentalStatus = "BOOKED" | "RENTING" | "RETURNED" | "CANCELLED";

export type Camera = { id: string; name: string; status: CameraStatus; note: string | null; created_at: string; updated_at: string; };
export type Rental = { id: string; camera_id: string; customer_name: string; customer_phone: string | null; customer_address: string | null; start_time: string; end_time: string; rental_price: number; deposit_info: string | null; status: RentalStatus; note: string | null; created_at: string; updated_at: string; };
export type RentalWithCamera = Rental & { camera: Camera | null; };
export type RentalFormInput = { camera_id: string; customer_name: string; customer_phone: string; customer_address: string; start_time: string; end_time: string; rental_price: string; deposit_info: string; status: RentalStatus; note: string; };
export type CameraFormInput = { name: string; status: CameraStatus; note: string; };

export const CAMERA_STATUS_LABELS: Record<CameraStatus, string> = { AVAILABLE: "Có sẵn", RENTED: "Đang thuê", MAINTENANCE: "Bảo trì", INACTIVE: "Ngừng dùng" };
export const RENTAL_STATUS_LABELS: Record<RentalStatus, string> = { BOOKED: "Đã đặt", RENTING: "Đang thuê", RETURNED: "Đã trả", CANCELLED: "Đã hủy" };