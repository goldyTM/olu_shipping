import React from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '@/supabaseClient';

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
};

export default function ProtectedRoute({ children, redirectTo = '/login' }: Props) {
  const [loading, setLoading] = React.useState(true);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    // Timeout fallback: if auth check hangs, try a single reload to recover
    const fallbackTimer = setTimeout(() => {
      if (!mounted) return;
      try {
        const reloadKey = 'authReloadAttempted';
        const attempted = sessionStorage.getItem(reloadKey);
        if (!attempted) {
          console.warn('Auth check fallback: attempting a single reload to recover auth state');
          sessionStorage.setItem(reloadKey, '1');
          // reload page to let client re-init auth flows
          window.location.reload();
        } else {
          // already attempted reload once — stop blocking UI
          console.warn('Auth check fallback: reload already attempted, clearing loading state');
          setLoading(false);
        }
      } catch (err) {
        console.warn('Auth check fallback error', err);
        setLoading(false);
      }
    }, 5000);

    async function check() {
      try {
        console.log('Starting auth check...');
        const { data, error } = await supabase.auth.getSession();
        console.log('Auth check result:', { hasSession: !!data?.session, error });

        if (!mounted) return;

        setAuthenticated(!!data?.session);
      } catch (e) {
        console.error('Auth check error:', e);
        if (mounted) setAuthenticated(false);
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(fallbackTimer);
      }
    }

    check();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      if (mounted) {
        setAuthenticated(!!session);
        setLoading(false);
        clearTimeout(fallbackTimer);
        // clear reload attempt marker on successful auth state change
        try { sessionStorage.removeItem('authReloadAttempted'); } catch (_) {}
      }
    });

    return () => {
      mounted = false;
      clearTimeout(fallbackTimer);
      if (listener && typeof listener.subscription?.unsubscribe === 'function') {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-pulse text-gray-600 mb-2">Checking authentication...</div>
          <div className="text-xs text-gray-400">If this takes too long, refresh the page</div>
        </div>
      </div>
    );
  }
  
  if (!authenticated) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}
