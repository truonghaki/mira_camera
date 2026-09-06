import { CAMERA_STATUS_LABELS, RENTAL_STATUS_LABELS, type CameraStatus, type RentalStatus } from "@/types/domain";

const rentalClasses: Record<RentalStatus, string> = {
  BOOKED: "bg-[#FCE7F0] text-[#A53A63]",
  RENTING: "bg-[#FFF0D9] text-[#A55D14]",
  RETURNED: "bg-[#E4F5EC] text-[#207A50]",
  CANCELLED: "bg-[#F1EFF0] text-[#726872]",
};

const cameraClasses: Record<CameraStatus, string> = {
  AVAILABLE: "bg-[#E4F5EC] text-[#207A50]",
  RENTED: "bg-[#FFF0D9] text-[#A55D14]",
  MAINTENANCE: "bg-[#FCE7F0] text-[#A53A63]",
  INACTIVE: "bg-[#F1EFF0] text-[#726872]",
};

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  return <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${rentalClasses[status]}`}>{RENTAL_STATUS_LABELS[status]}</span>;
}

export function CameraStatusBadge({ status }: { status: CameraStatus }) {
  return <span className={`inline-flex shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${cameraClasses[status]}`}>{CAMERA_STATUS_LABELS[status]}</span>;
}