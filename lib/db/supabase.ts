import { createClient } from "@supabase/supabase-js";
import { env, requireEnv } from "@/lib/config/env";
import type { Database } from "@/lib/db/types";

function normalizeSupabaseUrl(value: string) {
  const url = new URL(value);
  return url.origin;
}

export function getPublicSupabase() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  return createClient<Database>(
    normalizeSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL),
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
}

export function getServiceSupabase() {
  return createClient<Database>(
    normalizeSupabaseUrl(requireEnv("NEXT_PUBLIC_SUPABASE_URL")),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
}
