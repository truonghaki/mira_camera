"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { HeaderLink, PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/States";
import { CameraCard } from "@/features/cameras/CameraCard";
import { deleteOrDeactivateCamera, listCameras } from "@/features/data/localStore";

export default function CamerasPage() {
  const router = useRouter();
  const cameras = listCameras();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => cameras.filter((camera) => camera.name.toLowerCase().includes(query.toLowerCase())), [cameras, query]);
  const remove = (id: string) => { const result = deleteOrDeactivateCamera(id); window.alert(result === "deleted" ? "Đã xóa máy ảnh." : "Máy có lịch sử thuê nên đã chuyển sang Ngừng dùng."); router.refresh(); };
  return <><PageHeader title="Máy ảnh" description={`${cameras.length} máy đang quản lý`} action={<HeaderLink href="/cameras/new"><Plus className="mr-2" size={18} />Thêm máy</HeaderLink>} /><SearchInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm máy" /><section className="mt-4">{filtered.length === 0 ? <EmptyState title="Chưa có máy ảnh nào." /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((camera) => <CameraCard key={camera.id} camera={camera} onDelete={() => remove(camera.id)} />)}</div>}</section></>;
}