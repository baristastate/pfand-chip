// Auto-generiert via: supabase gen types typescript --local
// Manuell aktualisieren: pnpm run db:types (aus infrastructure/supabase/)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type BarrelSize = '10' | '30' | '200';
export type BarrelStatus =
  | 'CREATED'
  | 'AVAILABLE'
  | 'FILLED'
  | 'DELIVERED'
  | 'AT_CUSTOMER'
  | 'EMPTY_REPORTED'
  | 'RETURNED'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'DAMAGED'
  | 'LOST'
  | 'RETIRED';

export type MovementType =
  | 'CREATED'
  | 'FILLED'
  | 'DELIVERED'
  | 'EMPTY_REPORTED'
  | 'RETURNED'
  | 'CLEANING_START'
  | 'CLEANING_DONE'
  | 'MAINTENANCE_START'
  | 'MAINTENANCE_DONE'
  | 'DAMAGED'
  | 'LOST'
  | 'RETIRED';

export interface Database {
  public: {
    Tables: {
      barrels: {
        Row: {
          id: string;
          rfid_tag_id: string | null;
          qr_code: string | null;
          size: BarrelSize;
          status: BarrelStatus;
          current_customer_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['barrels']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['barrels']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      barrel_movements: {
        Row: {
          id: string;
          barrel_id: string;
          movement_type: MovementType;
          customer_id: string | null;
          performed_by: string | null;
          location: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['barrel_movements']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      deposit_accounts: {
        Row: {
          id: string;
          customer_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['deposit_accounts']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Pick<Database['public']['Tables']['deposit_accounts']['Row'], 'balance'>>;
      };
      deposit_transactions: {
        Row: {
          id: string;
          account_id: string;
          barrel_id: string;
          amount: number;
          transaction_type: 'CHARGE' | 'REFUND';
          movement_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['deposit_transactions']['Row'], 'id' | 'created_at'>;
        Update: never;
      };
      rfid_tags: {
        Row: {
          id: string;
          tag_epc: string;
          barrel_id: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rfid_tags']['Row'], 'id' | 'created_at'>;
        Update: Partial<Pick<Database['public']['Tables']['rfid_tags']['Row'], 'barrel_id' | 'active'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      barrel_size: BarrelSize;
      barrel_status: BarrelStatus;
      movement_type: MovementType;
    };
  };
}

// Convenience-Typen
export type Barrel = Database['public']['Tables']['barrels']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type BarrelMovement = Database['public']['Tables']['barrel_movements']['Row'];
export type DepositAccount = Database['public']['Tables']['deposit_accounts']['Row'];
export type DepositTransaction = Database['public']['Tables']['deposit_transactions']['Row'];
export type RfidTag = Database['public']['Tables']['rfid_tags']['Row'];
