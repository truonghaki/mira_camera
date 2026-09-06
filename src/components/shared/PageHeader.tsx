import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h1 className="text-2xl font-bold leading-tight text-ink">{title}</h1>{description ? <p className="mt-1 text-sm text-[#7A6C76]">{description}</p> : null}</div>{action}</header>;
}

export function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-pine px-4 text-sm font-semibold text-white transition-colors hover:bg-pine-dark">{children}</Link>;
}