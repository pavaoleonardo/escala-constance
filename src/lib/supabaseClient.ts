import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Determine if we are in demo mode (no real Supabase keys provided)
export const isDemoMode =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project-id') ||
  supabaseAnonKey.includes('your-anon-key');

// Initialize supabase client if not in demo mode
export const supabase = !isDemoMode
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
