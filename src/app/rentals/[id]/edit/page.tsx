"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/States";
import { getRental } from "@/features/data/localStore";
import { RentalForm } from "@/features/rentals/RentalForm";

export default function EditRentalPage() {
  const params = useParams<{ id: string }>();
  const rental = getRental(params.id);
  if (!rental) return <EmptyState title="Không tìm thấy đơn thuê." />;
  return <><PageHeader title="Sửa đơn thuê" description={rental.customer_name} /><RentalForm rental={rental} /></>;
}
