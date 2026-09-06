import { supabase } from "@/lib/supabase/client";
import type { Rental } from "@/types/domain";

export async function fetchRentalsFromSupabase() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rentals")
    .select("*, camera:cameras(*)")
    .order("start_time", { ascending: true });

  if (error) throw error;
  return data;
}

export async function findOverlappingRentals(params: {
  cameraId: string;
  startTime: string;
  endTime: string;
  ignoreRentalId?: string;
}) {
  if (!supabase) return [];

  let query = supabase
    .from("rentals")
    .select("*, camera:cameras(*)")
    .eq("camera_id", params.cameraId)
    .neq("status", "CANCELLED")
    .lt("start_time", params.endTime)
    .gt("end_time", params.startTime);

  if (params.ignoreRentalId) {
    query = query.neq("id", params.ignoreRentalId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateRentalStatusInSupabase(id: string, status: Rental["status"]) {
  if (!supabase) return;
  const { error } = await supabase.from("rentals").update({ status }).eq("id", id);
  if (error) throw error;
}
