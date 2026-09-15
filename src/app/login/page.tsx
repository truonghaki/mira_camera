"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) { setMessage("Thiếu cấu hình Supabase trên môi trường này."); return; }
    setLoading(true); setMessage("");
    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (result.error) setMessage(result.error.message);
    else if (mode === "signup" && !result.data.session) setMessage("Đã tạo tài khoản. Hãy xác nhận email rồi đăng nhập.");
    else router.replace("/calendar");
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-mist px-5 py-8"><section className="w-full max-w-sm rounded-[24px] border border-line bg-white p-6 shadow-[0_14px_36px_rgba(67,38,51,0.1)]"><div className="mb-7 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0F5] text-pine-dark"><Camera size={23} /></div><h1 className="mt-4 text-2xl font-semibold text-ink">Mira Camera</h1><p className="mt-1.5 text-sm text-[#7A6C76]">Đăng nhập để quản lý lịch thuê.</p></div><form onSubmit={submit} className="space-y-4"><label className="block"><span className="app-field-label">Email</span><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input" /></label><label className="block"><span className="app-field-label">Mật khẩu</span><input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="input" /></label>{message ? <p className="rounded-xl bg-[#FFF0F5] px-3 py-2 text-sm text-[#A53A63]">{message}</p> : null}<button disabled={loading} className="touch-target w-full rounded-2xl bg-pine px-4 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(216,78,127,0.2)] disabled:opacity-60">{loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button></form><button type="button" onClick={() => { setMode((current) => current === "login" ? "signup" : "login"); setMessage(""); }} className="mt-5 w-full text-sm font-medium text-pine-dark">{mode === "login" ? "Tạo tài khoản quản trị" : "Đã có tài khoản? Đăng nhập"}</button></section></main>;
}