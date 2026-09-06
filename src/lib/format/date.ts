export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return `${formatDate(value)} ${formatTime(value)}`;
}

export function formatRentalTimeRange(startValue: string | Date, endValue: string | Date) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  const sameDay = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate();
  if (sameDay) return `${formatTime(start)} → ${formatTime(end)}`;
  const shortDate = (value: Date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(value);
  return `${shortDate(start)} · ${formatTime(start)} → ${shortDate(end)} · ${formatTime(end)}`;
}

export function toDateTimeLocalValue(value: string | Date) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}