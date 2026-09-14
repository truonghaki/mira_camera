import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h1 className="text-[25px] font-semibold leading-tight tracking-[0.01em] text-ink">{title}</h1>{description ? <p className="mt-1.5 text-sm text-[#7A6C76]">{description}</p> : null}</div>{action}</header>;
}

export function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-pine px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(216,78,127,0.2)] transition-all active:scale-[0.98] hover:bg-pine-dark">{children}</Link>;
}