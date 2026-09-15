"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Camera, History, LogOut, Plus, WalletCards } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { SupabaseDataProvider } from "@/features/data/SupabaseDataProvider";
import { supabase } from "@/lib/supabase/client";

const desktopNavigation = [
  { href: "/calendar", label: "Lịch thuê", icon: CalendarDays },
  { href: "/history", label: "Lịch sử", icon: History },
  { href: "/cameras", label: "Máy ảnh", icon: Camera },
  { href: "/revenue", label: "Doanh thu", icon: WalletCards },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";
  const [checkingSession, setCheckingSession] = useState(!isLogin);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    if (isLogin) { setCheckingSession(false); return; }
    if (!supabase) { setConfigured(false); setCheckingSession(false); return; }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) router.replace("/login");
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [isLogin, router]);

  if (isLogin) return <>{children}</>;
  if (!configured) return <main className="flex min-h-screen items-center justify-center bg-mist p-5"><div className="app-panel max-w-md p-6 text-center"><h1 className="text-lg font-semibold text-ink">Thiếu cấu hình Supabase</h1><p className="mt-2 text-sm text-[#7A6C76]">Thêm NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY vào biến môi trường rồi deploy lại.</p></div></main>;
  if (checkingSession) return <main className="flex min-h-screen items-center justify-center bg-mist"><p className="text-sm text-[#7A6C76]">Đang kiểm tra phiên đăng nhập...</p></main>;
  return <SupabaseDataProvider><ShellContent pathname={pathname}>{children}</ShellContent></SupabaseDataProvider>;
}

function ShellContent({ children, pathname }: { children: ReactNode; pathname: string }) {
  async function signOut() { await supabase?.auth.signOut(); }
  return <div className="min-h-screen bg-mist">
    <aside className="fixed inset-y-0 left-0 hidden w-[244px] border-r border-line bg-white/90 px-4 py-6 backdrop-blur-xl lg:block">
      <Link href="/calendar" className="mb-9 block px-3"><div className="text-lg font-semibold tracking-[0.01em] text-ink">Mira Camera</div><div className="mt-1 text-sm text-[#7A6C76]">Lịch thuê & vận hành</div></Link>
      <nav className="space-y-1" aria-label="Điều hướng chính">{desktopNavigation.map((item) => { const Icon = item.icon; const active = pathname === item.href || pathname.startsWith(`${item.href}/`); return <Link key={item.href} href={item.href} className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors ${active ? "bg-[#FFF0F5] text-pine-dark" : "text-[#6F606A] hover:bg-[#FFF7FA] hover:text-ink"}`}><Icon size={18} strokeWidth={active ? 2.5 : 2} />{item.label}</Link>; })}</nav>
      <Link href="/rentals/new" className="mt-8 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-pine px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(216,78,127,0.2)] transition-transform active:scale-[0.98] hover:bg-pine-dark"><Plus size={18} />Tạo lịch thuê</Link>
      <button type="button" onClick={() => void signOut()} className="mt-4 flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl text-sm font-medium text-[#7A6C76] hover:bg-[#FFF4F8]"><LogOut size={17} />Đăng xuất</button>
    </aside>
    <main className="min-h-screen px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:ml-[244px] lg:px-9 lg:pb-9 lg:pt-8"><div className="mx-auto max-w-[1180px]">{children}</div></main>
    <MobileBottomNav pathname={pathname} />
  </div>;
}

function MobileBottomNav({ pathname }: { pathname: string }) { return <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-[#EDDFE5] bg-white/85 px-2 pt-1.5 backdrop-blur-xl lg:hidden" aria-label="Điều hướng chính"><div className="mx-auto grid max-w-md grid-cols-5 items-end"><MobileNavItem href="/calendar" label="Lịch thuê" icon={CalendarDays} active={pathname === "/calendar"} /><MobileNavItem href="/history" label="Lịch sử" icon={History} active={pathname === "/history"} /><Link href="/rentals/new" aria-label="Tạo lịch thuê" className="mb-3 flex h-[52px] w-[52px] items-center justify-center justify-self-center rounded-full bg-pine text-white shadow-[0_10px_24px_rgba(216,78,127,0.3)] transition-transform active:scale-90"><Plus size={25} strokeWidth={2.5} /></Link><MobileNavItem href="/cameras" label="Máy" icon={Camera} active={pathname.startsWith("/cameras")} /><MobileNavItem href="/revenue" label="Doanh thu" icon={WalletCards} active={pathname === "/revenue"} /></div></nav>; }
function MobileNavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof CalendarDays; active: boolean }) { return <Link href={href} className={`flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors ${active ? "text-pine-dark" : "text-[#8A7B84]"}`}><Icon size={20} strokeWidth={active ? 2.5 : 2} /><span className="leading-none">{label}</span></Link>; }