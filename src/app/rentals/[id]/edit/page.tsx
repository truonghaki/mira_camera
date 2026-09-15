"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { useSupabaseData } from "@/features/data/SupabaseDataProvider";
import { RentalForm } from "@/features/rentals/RentalForm";

export default function EditRentalPage() { const params = useParams<{ id: string }>(); const { rentals, loading, error } = useSupabaseData(); if (loading) return <LoadingState />; if (error) return <ErrorState message={error} />; const rental = rentals.find((item) => item.id === params.id); if (!rental) return <EmptyState title="Không tìm thấy đơn thuê." />; return <><PageHeader title="Sửa đơn thuê" description={rental.customer_name} /><RentalForm rental={rental} /></>; }