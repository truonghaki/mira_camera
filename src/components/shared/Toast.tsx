"use client";

import { CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";

const toastEvent = "mira:toast";

export function showSuccessToast(message: string) {
  window.dispatchEvent(new CustomEvent(toastEvent, { detail: message }));
}

export function ToastHost() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    const show = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setMessage(detail);
      window.setTimeout(() => setMessage(""), 3000);
    };
    window.addEventListener(toastEvent, show);
    return () => window.removeEventListener(toastEvent, show);
  }, []);
  if (!message) return null;
  return <div className="pointer-events-none fixed inset-x-4 bottom-[calc(104px+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm animate-[ios-sheet-in_220ms_ease-out] lg:bottom-6 lg:left-[244px]"><div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[#D7ECDC] bg-white px-4 py-3 shadow-[0_12px_30px_rgba(42,72,54,0.14)]"><CheckCircle2 className="shrink-0 text-[#268659]" size={20} /><p className="min-w-0 flex-1 text-sm font-semibold text-ink">{message}</p><button type="button" onClick={() => setMessage("")} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#7A6C76]" aria-label="Đóng thông báo"><X size={17} /></button></div></div>;
}