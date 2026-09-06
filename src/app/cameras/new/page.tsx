import { PageHeader } from "@/components/shared/PageHeader";
import { CameraForm } from "@/features/cameras/CameraForm";

export default function NewCameraPage() {
  return <><PageHeader title="Thêm máy" description="Nhập tên máy và trạng thái vận hành." /><CameraForm /></>;
}
