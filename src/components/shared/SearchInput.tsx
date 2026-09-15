import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export function SearchInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <label className={`relative block ${className}`}><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8A94]" size={18} aria-hidden="true" /><input {...props} type="text" inputMode="search" autoComplete="off" className="input search-input" /></label>;
}