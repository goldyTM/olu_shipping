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
    let fallbackTimer: NodeJS.Timeout;

    // Timeout fallback: if auth check hangs, try a single reload to recover
    const setupFallbackTimer = () => {
      fallbackTimer = setTimeout(() => {
        if (!mounted) return;
        try {
          const reloadKey = 'authReloadAttempted';
          const attempted = sessionStorage.getItem(reloadKey);
          const lastAttempt = sessionStorage.getItem('authReloadTimestamp');
          const now = Date.now();
          
          // Only reload if we haven't attempted in the last 10 seconds
          if (!attempted || (lastAttempt && now - parseInt(lastAttempt) > 10000)) {
            console.warn('Auth check fallback: attempting reload to recover auth state');
            sessionStorage.setItem(reloadKey, '1');
            sessionStorage.setItem('authReloadTimestamp', now.toString());
            window.location.reload();
          } else {
            console.warn('Auth check fallback: recent reload detected, clearing loading state');
            setLoading(false);
            setAuthenticated(false);
          }
        } catch (err) {
          console.warn('Auth check fallback error', err);
          setLoading(false);
        }
      }, 5000);
    };

    async function check() {
      try {
        console.log('ProtectedRoute: Starting auth check...');
        const { data, error } = await supabase.auth.getSession();
        console.log('ProtectedRoute: Auth check result:', { hasSession: !!data?.session, error });

        if (!mounted) return;

        const isAuth = !!data?.session;
        setAuthenticated(isAuth);
        
        // Clear reload markers on successful auth check
        if (isAuth) {
          try {
            sessionStorage.removeItem('authReloadAttempted');
            sessionStorage.removeItem('authReloadTimestamp');
          } catch (_) {}
        }
      } catch (e) {
        console.error('ProtectedRoute: Auth check error:', e);
        if (mounted) setAuthenticated(false);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(fallbackTimer);
        }
      }
    }

    setupFallbackTimer();
    check();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('ProtectedRoute: Auth state changed:', event, '| Session:', !!session);
      if (mounted) {
        setAuthenticated(!!session);
        setLoading(false);
        clearTimeout(fallbackTimer);
        
        // Clear reload markers on auth state change
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          try {
            sessionStorage.removeItem('authReloadAttempted');
            sessionStorage.removeItem('authReloadTimestamp');
          } catch (_) {}
        }
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
