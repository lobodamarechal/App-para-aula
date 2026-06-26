"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para o browser (Client Components).
 * Usa a anon key — toda a segurança é garantida por Row Level Security.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
