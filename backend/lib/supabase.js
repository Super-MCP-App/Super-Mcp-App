import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Client for server-side API routes (uses user's JWT for RLS)
export function createServerSupabase(authToken = null) {
  const options = authToken
    ? { global: { headers: { Authorization: `Bearer ${authToken}` } } }
    : {};
  return createClient(supabaseUrl, supabaseAnonKey, options);
}

// Public client (no auth, for non-authenticated endpoints)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
