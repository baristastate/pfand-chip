import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export function createSupabaseClient(
  url: string,
  anonKey: string
): SupabaseClient<Database> {
  return createClient<Database>(url, anonKey);
}

// Singleton für Browser-Umgebungen (Vite apps)
let _client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!_client) {
    const url = (
      typeof import.meta !== 'undefined'
        ? (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL
        : process.env.SUPABASE_URL
    ) ?? 'http://localhost:54321';

    const key = (
      typeof import.meta !== 'undefined'
        ? (import.meta as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY
        : process.env.SUPABASE_ANON_KEY
    ) ?? '';

    _client = createSupabaseClient(url, key);
  }
  return _client;
}

export { SupabaseClient };
