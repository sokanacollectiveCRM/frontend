// Supabase client for client portal authentication
// Required environment variables in .env file:
// VITE_SUPABASE_URL=your_supabase_url
// VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables and create client
let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    '⚠️ Supabase environment variables are not set!\n\n' +
    'Please add the following to your .env file:\n' +
    'VITE_SUPABASE_URL=your_supabase_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_supabase_anon_key\n\n' +
    'Get these values from your Supabase project settings.';
  console.warn(errorMessage);
  
  // Create a placeholder client that returns empty results instead of throwing
  // This allows the app to load but client portal features will be disabled
  supabase = {
    auth: {
      getSession: async () => {
        return {
          data: { session: null },
          error: null,
        };
      },
      signInWithPassword: async () => {
        return {
          data: { user: null, session: null },
          error: {
            message: 'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
          },
        };
      },
      updateUser: async () => {
        return {
          data: { user: null },
          error: {
            message: 'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
          },
        };
      },
      verifyOtp: async () => {
        return {
          data: { user: null, session: null },
          error: {
            message: 'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
          },
        };
      },
      signOut: async () => {
        return { error: null };
      },
      onAuthStateChange: () => {
        // Return a subscription object that does nothing
        return {
          data: { subscription: null },
          unsubscribe: () => {},
        };
      },
    },
  } as unknown as SupabaseClient;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };

