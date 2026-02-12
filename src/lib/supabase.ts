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
    'Use the same Supabase project as your backend (e.g. https://xxxxx.supabase.co).\n' +
    'Get URL and anon key from Supabase Dashboard → Project Settings → API.';
  console.error(errorMessage);
  
  // Create a placeholder client that will throw helpful errors when used
  // This allows the app to load but will fail gracefully when Supabase is accessed
  supabase = {
    auth: {
      getSession: () => {
        throw new Error('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      },
      signInWithPassword: () => {
        throw new Error('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      },
      updateUser: () => {
        throw new Error('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      },
      verifyOtp: () => {
        throw new Error('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      },
      signOut: () => {
        throw new Error('Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      },
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

