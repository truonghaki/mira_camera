"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { CameraForm } from "@/features/cameras/CameraForm";
import { useSupabaseData } from "@/features/data/SupabaseDataProvider";

export default function EditCameraPage() {
  const params = useParams<{ id: string }>();
  const { cameras, loading, error } = useSupabaseData();
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  const camera = cameras.find((item) => item.id === params.id);
  if (!camera) return <EmptyState title="Không tìm thấy máy ảnh." />;
  return <><PageHeader title="Sửa máy" description={camera.name} /><CameraForm camera={camera} /></>;
}