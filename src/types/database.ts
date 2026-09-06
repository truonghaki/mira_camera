import type { Camera, Rental } from "./domain";

export type Database = {
  public: {
    Tables: {
      cameras: {
        Row: Camera;
        Insert: Omit<Camera, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Camera, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      rentals: {
        Row: Rental;
        Insert: Omit<Rental, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Rental, "id" | "created_at" | "updated_at">>;
        Relationships: [
          {
            foreignKeyName: "rentals_camera_id_fkey";
            columns: ["camera_id"];
            isOneToOne: false;
            referencedRelation: "cameras";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
