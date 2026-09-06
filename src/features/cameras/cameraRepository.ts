import { supabase } from "@/lib/supabase/client";

export async function fetchCamerasFromSupabase() {
  if (!supabase) return [];

  const { data, error } = await supabase.from("cameras").select("*").order("name");
  if (error) throw error;
  return data;
}
