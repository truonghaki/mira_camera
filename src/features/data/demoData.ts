import type { Camera, Rental } from "@/types/domain";

const now = new Date();
const iso = (offsetHours: number) => new Date(now.getTime() + offsetHours * 60 * 60 * 1000).toISOString();

export const demoCameras: Camera[] = [
  { id: "cam-xs20", name: "FUJIFILM XS-20", status: "AVAILABLE", note: "Body đẹp, pin tốt", created_at: iso(-240), updated_at: iso(-24) },
  { id: "cam-xs10", name: "FUJIFILM XS-10", status: "RENTED", note: "Kèm dây đeo", created_at: iso(-240), updated_at: iso(-12) },
  { id: "cam-xt20", name: "FUJIFILM XT-20", status: "AVAILABLE", note: null, created_at: iso(-240), updated_at: iso(-12) },
  { id: "cam-xa5", name: "FUJIFILM XA-5", status: "MAINTENANCE", note: "Đang kiểm tra màn hình", created_at: iso(-240), updated_at: iso(-12) },
  { id: "cam-r50", name: "CANON R50", status: "AVAILABLE", note: null, created_at: iso(-240), updated_at: iso(-12) },
  { id: "cam-m10", name: "CANON M10", status: "INACTIVE", note: "Ngừng cho thuê tạm thời", created_at: iso(-240), updated_at: iso(-12) },
];

export const demoRentals: Rental[] = [
  { id: "rent-1", camera_id: "cam-xs20", customer_name: "Nguyễn Văn A", customer_phone: "0981000001", customer_address: "Quận 1", start_time: iso(24), end_time: iso(72), rental_price: 650000, deposit_info: "1 triệu + CCCD", status: "BOOKED", note: "Khách lấy thêm 1 pin", created_at: iso(-48), updated_at: iso(-48) },
  { id: "rent-2", camera_id: "cam-xs10", customer_name: "Trần Văn B", customer_phone: "0981000002", customer_address: "Quận 3", start_time: iso(-20), end_time: iso(8), rental_price: 800000, deposit_info: "CCCD", status: "RENTING", note: "Trả máy trước 18h", created_at: iso(-72), updated_at: iso(-18) },
  { id: "rent-3", camera_id: "cam-r50", customer_name: "Lê Thị C", customer_phone: "0981000003", customer_address: "Bình Thạnh", start_time: iso(-240), end_time: iso(-190), rental_price: 1200000, deposit_info: "500k", status: "RETURNED", note: "Khách quen", created_at: iso(-260), updated_at: iso(-188) },
  { id: "rent-4", camera_id: "cam-xt20", customer_name: "Phạm Văn D", customer_phone: "0981000004", customer_address: null, start_time: iso(96), end_time: iso(120), rental_price: 500000, deposit_info: "Không cọc", status: "CANCELLED", note: "Khách hủy", created_at: iso(-24), updated_at: iso(-12) },
];