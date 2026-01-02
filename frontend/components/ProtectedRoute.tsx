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
    let authCheckCompleted = false;

    async function checkAuth() {
      try {
        console.log('ProtectedRoute: Checking authentication...');
        
        // Quick check of localStorage first to see if we have a session
        const storageKey = `sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`;
        const hasStoredSession = localStorage.getItem(storageKey);
        
        if (!hasStoredSession) {
          console.log('ProtectedRoute: No stored session found in localStorage');
          authCheckCompleted = true;
          if (mounted) {
            setAuthenticated(false);
            setLoading(false);
          }
          return;
        }
        
        // Use getSession which reads from localStorage
        const { data: { session }, error } = await supabase.auth.getSession();
        
        authCheckCompleted = true;
        
        if (!mounted) return;
        
        if (error) {
          console.error('ProtectedRoute: Session check error:', error);
          setAuthenticated(false);
        } else if (session) {
          console.log('ProtectedRoute: Valid session found for user:', session.user.email);
          setAuthenticated(true);
        } else {
          console.log('ProtectedRoute: No valid session');
          setAuthenticated(false);
        }
        
        setLoading(false);
      } catch (e) {
        console.error('ProtectedRoute: Auth check error:', e);
        authCheckCompleted = true;
        if (mounted) {
          setAuthenticated(false);
          setLoading(false);
        }
      }
    }

    // Start auth check immediately
    checkAuth();

    // Set a backup timeout - increased to 5 seconds
    const timeoutId = setTimeout(() => {
      if (!authCheckCompleted && mounted) {
        console.warn('ProtectedRoute: Auth check timeout, proceeding with current state');
        setAuthenticated(false);
        setLoading(false);
      }
    }, 5000);

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('ProtectedRoute: Auth state changed -', event);
      if (mounted) {
        if (event === 'SIGNED_OUT') {
          console.log('ProtectedRoute: User signed out');
          setAuthenticated(false);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('ProtectedRoute: User signed in');
          setAuthenticated(true);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('ProtectedRoute: Token refreshed');
          setAuthenticated(true);
        } else if (session) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (listener?.subscription?.unsubscribe) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }
  
  if (!authenticated) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}
