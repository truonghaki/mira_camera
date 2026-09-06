"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/States";
import { CameraForm } from "@/features/cameras/CameraForm";
import { getCamera } from "@/features/data/localStore";

export default function EditCameraPage() {
  const params = useParams<{ id: string }>();
  const camera = getCamera(params.id);
  if (!camera) return <EmptyState title="Không tìm thấy máy ảnh." />;
  return <><PageHeader title="Sửa máy" description={camera.name} /><CameraForm camera={camera} /></>;
}
