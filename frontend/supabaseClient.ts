import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Supabase client may not work in the browser.');
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    // Increase session refresh timing to prevent disconnects during operations
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },
  global: {
    headers: {
      'X-Client-Info': 'olu-shipping-company-frontend',
    },
  },
  // Add retry configuration for failed requests
  db: {
    schema: 'public',
  },
  // Increase timeout for long operations like file uploads
  rest: {
    timeout: 60000, // 60 seconds
  },
});

export default supabase;
