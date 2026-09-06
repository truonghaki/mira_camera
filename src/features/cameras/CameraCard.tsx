import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { CameraStatusBadge } from "@/components/shared/StatusBadges";
import type { Camera } from "@/types/domain";

export function CameraCard({ camera, onDelete }: { camera: Camera; onDelete: () => void }) {
  return <article className="app-card p-4"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><h2 className="truncate text-[15px] font-bold text-ink">{camera.name}</h2><div className="mt-2"><CameraStatusBadge status={camera.status} /></div></div><details className="relative shrink-0"><summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg text-[#7A6C76] hover:bg-[#FFF1F6]" aria-label={`Thao tác với ${camera.name}`}><MoreHorizontal size={20} /></summary><div className="absolute right-0 top-10 z-10 w-28 rounded-xl border border-line bg-white p-1 shadow-[0_8px_20px_rgba(86,48,65,0.12)]"><Link href={`/cameras/${camera.id}/edit`} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-[#FFF4F8]">Sửa</Link><button type="button" onClick={onDelete} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose hover:bg-[#FFF4F8]">Xóa</button></div></details></div>{camera.note ? <p className="mt-3 line-clamp-2 text-sm leading-5 text-[#7A6C76]">{camera.note}</p> : null}</article>;
}