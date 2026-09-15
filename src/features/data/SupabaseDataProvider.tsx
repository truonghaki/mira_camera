"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCameras, fetchRentals } from "@/features/data/supabaseData";
import type { Camera, RentalWithCamera } from "@/types/domain";

type SupabaseData = {
  cameras: Camera[];
  rentals: RentalWithCamera[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
};

const DataContext = createContext<SupabaseData | null>(null);

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [rentals, setRentals] = useState<RentalWithCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [nextCameras, nextRentals] = await Promise.all([fetchCameras(), fetchRentals()]);
      setCameras(nextCameras); setRentals(nextRentals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu từ Supabase.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  const value = useMemo(() => ({ cameras, rentals, loading, error, refresh }), [cameras, rentals, loading, error, refresh]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useSupabaseData() {
  const value = useContext(DataContext);
  if (!value) throw new Error("SupabaseDataProvider chưa được khởi tạo.");
  return value;
}