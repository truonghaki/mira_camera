"use client";

import Link from "next/link";
import { AlertCircle, CalendarDays, Camera, CheckCircle2, ReceiptText } from "lucide-react";
import { DashboardRevenueCard } from "@/features/dashboard/DashboardRevenueCard";
import { DashboardStatCard } from "@/features/dashboard/DashboardStatCard";
import { RevenueChart } from "@/features/dashboard/RevenueChart";
import { TodayRentalItem } from "@/features/dashboard/TodayRentalItem";
import { getDashboardMetrics } from "@/features/data/dashboardMetrics";
import { listRentalsWithCameras } from "@/features/data/localStore";

export default function DashboardPage() {
  const rentals = listRentalsWithCameras();
  const metrics = getDashboardMetrics(rentals);
  const overdue = rentals.filter((rental) => rental.status === "RENTING" && new Date(rental.end_time) < new Date()).length;
  const attention = [overdue > 0 ? `${overdue} đơn đang quá hạn trả máy` : null, metrics.todayReturns > 0 ? `${metrics.todayReturns} lượt cần trả máy hôm nay` : null, metrics.todayPickups > 0 ? `${metrics.todayPickups} lượt nhận máy hôm nay` : null].filter(Boolean) as string[];

  return <><header className="mb-5"><p className="text-sm font-semibold text-pine-dark">Xin chào</p><p className="mt-1 text-sm text-[#7A6C76]">Quản lý cửa hàng</p><div className="mt-4 flex items-center justify-between gap-3"><h1 className="text-2xl font-bold text-ink">Tổng quan doanh thu</h1><Link href="/revenue" className="shrink-0 text-sm font-semibold text-pine-dark">Báo cáo</Link></div></header><DashboardRevenueCard label="Doanh thu tháng này" value={metrics.revenueMonth} /><div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4"><DashboardStatCard label="Doanh thu tuần" value={new Intl.NumberFormat("vi-VN").format(metrics.revenueWeek) + "đ"} icon={<ReceiptText size={18} />} /><DashboardStatCard label="Đơn đã trả tháng này" value={metrics.returnedThisMonth} icon={<CheckCircle2 size={18} />} /><DashboardStatCard label="Lượt máy thuê tháng này" value={metrics.rentalsThisMonth} icon={<Camera size={18} />} /><DashboardStatCard label="Đang thuê" value={metrics.currentlyRenting} icon={<CalendarDays size={18} />} /></div><section className={`mt-4 rounded-xl px-4 py-3 ${attention.length ? "border border-[#F6DDC1] bg-[#FFF8ED]" : "bg-[#F2FAF6]"}`}><div className="flex gap-3"><AlertCircle className={`mt-0.5 shrink-0 ${attention.length ? "text-[#B56D18]" : "text-[#34895E]"}`} size={18} /><div><h2 className="text-sm font-bold text-ink">Cần chú ý</h2><p className="mt-1 text-sm text-[#665963]">{attention.length ? attention.join(" · ") : "Mọi lịch thuê hiện đang được theo dõi ổn định."}</p></div></div></section><div className="mt-4"><RevenueChart items={metrics.sevenDays} /></div><section className="app-panel mt-4 p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="app-section-heading">Lịch hôm nay</h2><p className="mt-1 text-xs text-[#7A6C76]">Nhận {metrics.todayPickups} · Trả {metrics.todayReturns}</p></div><Link href="/calendar" className="text-sm font-semibold text-pine-dark">Xem lịch</Link></div>{metrics.todayRentals.length === 0 ? <p className="py-3 text-center text-sm text-[#7A6C76]">Hôm nay chưa có lịch nhận hoặc trả máy.</p> : <div className="divide-y divide-[#F8E8EE]">{metrics.todayRentals.map((rental) => <TodayRentalItem key={rental.id} rental={rental} />)}</div>}</section></>;
}