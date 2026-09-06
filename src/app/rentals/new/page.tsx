import { PageHeader } from "@/components/shared/PageHeader";
import { RentalForm } from "@/features/rentals/RentalForm";

export default function NewRentalPage() {
  return (
    <>
      <PageHeader title="Tạo đơn thuê" description="Nhập nhanh thông tin khách, máy, thời gian và tiền thuê." />
      <RentalForm />
    </>
  );
}
