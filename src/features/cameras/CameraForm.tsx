"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveCamera } from "@/features/data/localStore";
import { CAMERA_STATUS_LABELS, type Camera, type CameraFormInput } from "@/types/domain";

export function CameraForm({ camera }: { camera?: Camera | null }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [input, setInput] = useState<CameraFormInput>({ name: camera?.name ?? "", status: camera?.status ?? "AVAILABLE", note: camera?.note ?? "" });
  function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!input.name.trim()) { setError("Tên máy bắt buộc."); return; } saveCamera(input, camera?.id); router.push("/cameras"); router.refresh(); }
  return <form onSubmit={submit} className="app-panel p-4">{error ? <div className="mb-4 rounded-xl bg-[#FFF0F5] px-3 py-2 text-sm text-[#A53A63]">{error}</div> : null}<div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-medium text-[#514650]">Tên máy *</span><input value={input.name} onChange={(event) => setInput((current) => ({ ...current, name: event.target.value }))} className="input" /></label><label className="block"><span className="mb-1.5 block text-sm font-medium text-[#514650]">Trạng thái</span><select value={input.status} onChange={(event) => setInput((current) => ({ ...current, status: event.target.value as CameraFormInput["status"] }))} className="input">{Object.entries(CAMERA_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-[#514650]">Ghi chú</span><textarea value={input.note} onChange={(event) => setInput((current) => ({ ...current, note: event.target.value }))} className="input min-h-24" /></label></div><button className="touch-target mt-5 w-full rounded-xl bg-pine px-4 text-sm font-semibold text-white shadow-sm hover:bg-pine-dark">Lưu máy</button></form>;
}