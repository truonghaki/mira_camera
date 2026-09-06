import type { RentalWithCamera } from "@/types/domain";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameCalendarDay(value: string, date: Date) {
  const item = new Date(value);
  return item.getFullYear() === date.getFullYear() && item.getMonth() === date.getMonth() && item.getDate() === date.getDate();
}

function isInRange(value: string, from: Date, to: Date) {
  const date = new Date(value);
  return date >= from && date < to;
}

export function getDashboardMetrics(rentals: RentalWithCamera[], now = new Date()) {
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const nextWeekStart = new Date(weekStart);
  nextWeekStart.setDate(weekStart.getDate() + 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const returned = rentals.filter((rental) => rental.status === "RETURNED");
  const revenueFor = (from: Date, to: Date) => returned.filter((rental) => isInRange(rental.end_time, from, to)).reduce((total, rental) => total + rental.rental_price, 0);
  const todayPickups = rentals.filter((rental) => rental.status !== "CANCELLED" && isSameCalendarDay(rental.start_time, today));
  const todayReturns = rentals.filter((rental) => rental.status !== "CANCELLED" && isSameCalendarDay(rental.end_time, today));

  const sevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + index);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    return {
      date,
      amount: revenueFor(date, nextDate),
    };
  });

  return {
    revenueWeek: revenueFor(weekStart, nextWeekStart),
    revenueMonth: revenueFor(monthStart, nextMonthStart),
    returnedThisMonth: returned.filter((rental) => isInRange(rental.end_time, monthStart, nextMonthStart)).length,
    rentalsThisMonth: rentals.filter((rental) => rental.status !== "CANCELLED" && isInRange(rental.start_time, monthStart, nextMonthStart)).length,
    currentlyRenting: rentals.filter((rental) => rental.status === "RENTING").length,
    todayPickups: todayPickups.length,
    todayReturns: todayReturns.length,
    todayRentals: rentals.filter((rental) => rental.status !== "CANCELLED" && (isSameCalendarDay(rental.start_time, today) || isSameCalendarDay(rental.end_time, today))),
    sevenDays,
  };
}