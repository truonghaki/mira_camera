import { WalletCards } from "lucide-react";
import { formatMoney } from "@/lib/format/money";

export function DashboardRevenueCard({ label, value }: { label: string; value: number }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#E85D8E] to-[#C94775] p-5 text-white shadow-[0_14px_32px_rgba(201,71,117,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-medium text-white/80">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight">{formatMoney(value)}</p></div>
        <div className="rounded-xl bg-white/15 p-3"><WalletCards size={23} /></div>
      </div>
    </section>
  );
}