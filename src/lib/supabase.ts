// Supabase client for client portal authentication
// Required environment variables in .env file:
// VITE_SUPABASE_URL=your_supabase_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logFailure } from '@/utils/safeLog';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables and create client
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  logFailure('supabase', 'operation_failed');

  // Create a placeholder client that will throw helpful errors when used
  // This allows the app to load but will fail gracefully when Supabase is accessed
  supabase = {
    auth: {
      getSession: () => {
        throw new Error(
          'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
        );
      },
      signInWithPassword: () => {
        throw new Error(
          'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
        );
      },
      updateUser: () => {
        throw new Error(
          'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
        );
      },
      verifyOtp: () => {
        throw new Error(
          'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
        );
      },
      signOut: () => {
        throw new Error(
          'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
        );
      },
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  } as unknown as SupabaseClient;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-auth',
    },
  });
}

export { supabase };
