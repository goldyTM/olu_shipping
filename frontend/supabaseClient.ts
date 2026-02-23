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

// Add cross-tab session synchronization
if (typeof window !== 'undefined') {
  // Listen for storage changes to sync auth state across tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'supabase.auth.token' && event.newValue) {
      console.log('Auth token updated in another tab, refreshing session...');
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log('Session synchronized across tabs');
        }
      });
    }
  });

  // Broadcast auth state changes to other tabs
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      // Broadcast to other tabs
      localStorage.setItem('supabase.auth.broadcast', Date.now().toString());
      setTimeout(() => localStorage.removeItem('supabase.auth.broadcast'), 100);
    }
  });
}

export default supabase;
