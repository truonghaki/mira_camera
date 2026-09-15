import { ArrowRight } from "lucide-react";
import { formatDate, formatTime } from "@/lib/format/date";

export function RentalTiming({ startTime, endTime }: { startTime: string; endTime: string }) {
  return <div className="rental-timing">
    <div><p>Nhận máy</p><strong>{formatDate(startTime)}</strong><span>{formatTime(startTime)}</span></div>
    <ArrowRight className="shrink-0 text-[#C3A5B1]" size={18} aria-hidden="true" />
    <div className="text-right"><p>Trả máy</p><strong>{formatDate(endTime)}</strong><span>{formatTime(endTime)}</span></div>
  </div>;
}