"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { HeaderLink, PageHeader } from "@/components/shared/PageHeader";
import { ErrorState, EmptyState, LoadingState } from "@/components/shared/States";
import { SearchInput } from "@/components/shared/SearchInput";
import { CameraCard } from "@/features/cameras/CameraCard";
import { deleteOrDeactivateCamera } from "@/features/data/supabaseData";
import { useSupabaseData } from "@/features/data/SupabaseDataProvider";

export default function CamerasPage() {
  const { cameras, rentals, loading, error, refresh } = useSupabaseData();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => cameras.filter((camera) => camera.name.toLowerCase().includes(query.toLowerCase())), [cameras, query]);
  const noteFor = (cameraId: string) => { const renting = rentals.find((rental) => rental.camera_id === cameraId && rental.status === "RENTING"); if (renting) return `Đang thuê · ${renting.customer_name}`; const booked = rentals.filter((rental) => rental.camera_id === cameraId && rental.status === "BOOKED" && new Date(rental.start_time) >= new Date()).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]; return booked ? `Đặt lịch · ${new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(new Date(booked.start_time))}` : "Đang rảnh"; };
  async function remove(id: string) { try { const result = await deleteOrDeactivateCamera(id); await refresh(); window.alert(result === "deleted" ? "Đã xóa máy ảnh." : "Máy có lịch sử thuê nên đã chuyển sang Ngừng dùng."); } catch (err) { window.alert(err instanceof Error ? err.message : "Không thể xóa máy ảnh."); } }
  return <><PageHeader title="Máy ảnh" description={`${cameras.length} máy đang quản lý`} action={<HeaderLink href="/cameras/new"><Plus className="mr-2" size={18} />Thêm máy</HeaderLink>} />{error ? <ErrorState message={error} /> : loading ? <LoadingState /> : <><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm máy" /><section className="mt-4">{filtered.length === 0 ? <EmptyState title="Chưa có máy ảnh nào." /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((camera) => <CameraCard key={camera.id} camera={camera} scheduleNote={noteFor(camera.id)} onDelete={() => void remove(camera.id)} />)}</div>}</section></>}</>;
}