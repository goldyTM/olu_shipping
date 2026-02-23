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
        
        // First try to get session from localStorage directly (faster)
        const storedSession = localStorage.getItem('supabase.auth.token');
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession);
            if (sessionData?.expires_at && sessionData.expires_at * 1000 > Date.now()) {
              console.log('ProtectedRoute: Found valid stored session');
              if (mounted) {
                setAuthenticated(true);
                setLoading(false);
                authCheckCompleted = true;
                return;
              }
            }
          } catch (e) {
            console.log('ProtectedRoute: Invalid stored session data');
          }
        }
        
        // Fallback to Supabase session check
        const { data: { session }, error } = await supabase.auth.getSession();
        
        authCheckCompleted = true;
        
        if (!mounted) return;
        
        if (error) {
          console.error('ProtectedRoute: Session check error:', error);
          setAuthenticated(false);
          setLoading(false);
        } else if (session) {
          console.log('ProtectedRoute: Valid session found for user:', session.user.email);
          setAuthenticated(true);
          setLoading(false);
        } else {
          console.log('ProtectedRoute: No valid session');
          setAuthenticated(false);
          setLoading(false);
        }
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

    // Set a backup timeout - increased for cross-tab synchronization
    const timeoutId = setTimeout(() => {
      if (!authCheckCompleted && mounted) {
        console.warn('ProtectedRoute: Auth check timeout, assuming no session');
        setAuthenticated(false);
        setLoading(false);
      }
    }, 8000); // Increased to 8 seconds for cross-tab sync // Increased back to 5 seconds for reliability

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('ProtectedRoute: Auth state changed -', event, 'Session:', !!session);
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
          console.log('ProtectedRoute: Session exists, authenticated');
          setAuthenticated(true);
        } else if (event === 'INITIAL_SESSION' && !session) {
          console.log('ProtectedRoute: Initial session check - no session');
          setAuthenticated(false);
        }
        setLoading(false);
      }
    });

    // Listen for cross-tab auth broadcasts
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'supabase.auth.broadcast' && mounted) {
        console.log('ProtectedRoute: Auth broadcast received, rechecking session...');
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
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
