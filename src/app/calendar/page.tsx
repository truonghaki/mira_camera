"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { PageHeader } from "@/components/shared/PageHeader";
import { RentalStatusBadge } from "@/components/shared/StatusBadges";
import { SearchInput } from "@/components/shared/SearchInput";
import { useSupabaseData } from "@/features/data/SupabaseDataProvider";
import { RentalTiming } from "@/features/rentals/RentalTiming";
import { formatMoney } from "@/lib/format/money";
import type { RentalStatus, RentalWithCamera } from "@/types/domain";

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const calendarStatuses: RentalStatus[] = ["BOOKED", "RENTING"];

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const rentalMatchesDay = (rental: RentalWithCamera, day: Date) => {
  const start = new Date(rental.start_time);
  const end = new Date(rental.end_time);
  const from = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const to = new Date(from);
  to.setDate(to.getDate() + 1);

  return start < to && end >= from;
};

function monthCells(viewDate: Date): Array<Date | null> {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0,
  ).getDate();
  const cellCount = Math.ceil((offset + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const dayNumber = index - offset + 1;

    return dayNumber >= 1 && dayNumber <= daysInMonth
      ? new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNumber)
      : null;
  });
}

const shortCameraName = (name?: string) =>
  (name ?? "Máy ảnh")
    .replace(/^(FUJIFILM|FUJI|CANON|SONY|NIKON|PANASONIC)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

export default function CalendarPage() {
  const { rentals, loading, error } = useSupabaseData();
  const today = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(today);
  const [query, setQuery] = useState("");

  const cells = useMemo(() => monthCells(viewDate), [viewDate]);
  const calendarRentals = useMemo(
    () => rentals.filter((rental) => calendarStatuses.includes(rental.status)),
    [rentals],
  );
  const selectedItems = useMemo(
    () =>
      calendarRentals.filter((rental) =>
        rentalMatchesDay(rental, selectedDate),
      ),
    [calendarRentals, selectedDate],
  );
  const searched = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return null;
    }

    return calendarRentals.filter(
      (rental) =>
        rental.camera?.name.toLowerCase().includes(term) ||
        rental.customer_name.toLowerCase().includes(term),
    );
  }, [calendarRentals, query]);

  const monthName = new Intl.DateTimeFormat("vi-VN", {
    month: "long",
    year: "numeric",
  }).format(viewDate);

  const changeMonth = (amount: number) => {
    setViewDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  const jumpToday = () => {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Lịch thuê" description="Các lịch đã đặt và đang thuê." />
        <LoadingState />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Lịch thuê" description="Các lịch đã đặt và đang thuê." />
        <ErrorState message={error} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Lịch thuê" description="Các lịch đã đặt và đang thuê." />
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm khách hoặc máy"
      />

      {searched ? (
        <RentalList title="Kết quả tìm kiếm" rentals={searched} />
      ) : (
        <>
          <section className="app-panel calendar-panel mt-4 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="calendar-month-control"
                aria-label="Tháng trước"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-center">
                <h2 className="text-sm font-semibold capitalize text-ink sm:text-base">
                  {monthName}
                </h2>
                <button
                  type="button"
                  onClick={jumpToday}
                  className="mt-0.5 text-xs font-medium text-pine-dark"
                >
                  Hôm nay
                </button>
              </div>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="calendar-month-control"
                aria-label="Tháng sau"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#8C7B85] sm:gap-2 sm:text-[11px]">
              {weekDays.map((day) => (
                <span key={day} className="pb-1">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {cells.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="calendar-cell-empty"
                      aria-hidden="true"
                    />
                  );
                }

                const key = dateKey(day);
                const items = calendarRentals.filter((rental) =>
                  rentalMatchesDay(rental, day),
                );
                const selected = key === dateKey(selectedDate);
                const isToday = key === dateKey(today);

                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setSelectedDate(day)}
                    aria-pressed={selected}
                    className={`calendar-cell ${selected ? "calendar-cell-selected" : ""} ${isToday ? "calendar-cell-today" : ""}`}
                  >
                    <span className="calendar-day-number">{day.getDate()}</span>
                    <span className="calendar-bookings">
                      {items.slice(0, 2).map((item) => (
                        <span
                          key={item.id}
                          className={`calendar-booking ${item.status === "BOOKED" ? "calendar-booking-booked" : "calendar-booking-renting"}`}
                        >
                          {shortCameraName(item.camera?.name)}
                        </span>
                      ))}
                      {items.length > 2 ? (
                        <span className="calendar-more">+{items.length - 2} máy</span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center gap-4 border-t border-[#F4E7EC] pt-3 text-[11px] text-[#7A6C76]">
              <Legend status="BOOKED" label="Đã đặt" />
              <Legend status="RENTING" label="Đang thuê" />
            </div>
          </section>

          <RentalList
            title={`Lịch ngày ${new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(selectedDate)}`}
            rentals={selectedItems}
          />
        </>
      )}
    </>
  );
}

function Legend({
  status,
  label,
}: {
  status: "BOOKED" | "RENTING";
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i
        className={`h-2 w-2 rounded-full ${status === "BOOKED" ? "bg-pine" : "bg-amber"}`}
      />
      {label}
    </span>
  );
}

function RentalList({
  title,
  rentals,
}: {
  title: string;
  rentals: RentalWithCamera[];
}) {
  return (
    <section className="mt-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="app-section-heading">{title}</h2>
        <span className="text-sm text-[#7A6C76]">{rentals.length} đơn</span>
      </div>

      {rentals.length === 0 ? (
        <EmptyState title="Không có lịch thuê trong ngày này." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {rentals.map((rental) => (
            <Link
              key={rental.id}
              href={`/rentals/${rental.id}`}
              className="app-card rental-card-premium block p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[17px] font-semibold leading-snug text-ink">
                    {rental.camera?.name ?? "Máy ảnh"}
                  </h3>
                  <p className="mt-1 text-sm text-[#6F626B]">
                    {rental.customer_name}
                  </p>
                </div>
                <RentalStatusBadge status={rental.status} />
              </div>

              <RentalTiming
                startTime={rental.start_time}
                endTime={rental.end_time}
              />

              <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#F5E7EC] pt-3">
                <div>
                  <p className="text-xs text-[#8A7B84]">Tiền thuê</p>
                  <p className="mt-1 text-base font-semibold text-pine-dark">
                    {formatMoney(rental.rental_price)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <p className="text-xs text-[#8A7B84]">
                    Cọc: {rental.deposit_info ?? "Chưa ghi nhận"}
                  </p>
                  <ArrowRight size={18} className="text-[#BE95A5]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
