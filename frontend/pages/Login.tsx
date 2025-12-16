import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Mail, Sparkles, LogIn } from 'lucide-react';
import supabase from '@/supabaseClient';

export default function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please provide email and password.' });
      return;
    }
    
    setLoading(true);
    
    // Fallback: if login hangs, attempt a single reload to recover auth state
    const reloadKey = 'authReloadAttempted';
    const timestampKey = 'authReloadTimestamp';
    
    const fallbackTimer = setTimeout(() => {
      try {
        const attempted = sessionStorage.getItem(reloadKey);
        const lastAttempt = sessionStorage.getItem(timestampKey);
        const now = Date.now();
        
        // Only reload if we haven't attempted in the last 10 seconds
        if (!attempted || (lastAttempt && now - parseInt(lastAttempt) > 10000)) {
          console.warn('Login fallback: reloading page to recover auth state');
          sessionStorage.setItem(reloadKey, '1');
          sessionStorage.setItem(timestampKey, now.toString());
          window.location.reload();
        } else {
          console.warn('Login fallback: recent reload detected, clearing loading state');
          setLoading(false);
        }
      } catch (err) {
        console.warn('Login fallback error', err);
        setLoading(false);
      }
    }, 7000);

    try {
      const resp = await supabase.auth.signInWithPassword({ email, password });
      console.log('signInWithPassword response:', resp);
      const { data, error } = resp as any;

      if (error) {
        console.error('Supabase signIn error:', error);
        toast({ title: 'Login error', description: error.message || JSON.stringify(error) });
        setLoading(false);
        clearTimeout(fallbackTimer);
        return;
      }

      let user = data?.user || null;
      let session = data?.session || null;

      if (!user) {
        console.warn('No user returned from signInWithPassword:', resp);
        // Try clearing any stale client session and retry once
        try {
          console.log('Attempting to clear local session and retry sign-in');
          await supabase.auth.signOut({ scope: 'local' });
          const retry = await supabase.auth.signInWithPassword({ email, password });
          console.log('Retry signIn response:', retry);
          const retryData = (retry as any)?.data;
          const retryError = (retry as any)?.error;
          if (retryError) {
            console.error('Retry signIn error:', retryError);
            toast({ title: 'Login error', description: retryError.message || JSON.stringify(retryError) });
            setLoading(false);
            try { 
              sessionStorage.removeItem(reloadKey);
              sessionStorage.removeItem(timestampKey);
            } catch (_) {}
            clearTimeout(fallbackTimer);
            return;
          }
          user = retryData?.user || null;
          session = retryData?.session || null;
          if (!user) {
            console.warn('Retry did not return a user either:', retry);
            toast({ title: 'Login failed', description: 'Sign-in did not return a user. Try clearing your browser data.' });
            setLoading(false);
            try { 
              sessionStorage.removeItem(reloadKey);
              sessionStorage.removeItem(timestampKey);
            } catch (_) {}
            clearTimeout(fallbackTimer);
            return;
          }
        } catch (e) {
          console.error('Retry signIn exception:', e);
          toast({ title: 'Login error', description: 'Unable to sign in. See console for details.' });
          setLoading(false);
          try { 
            sessionStorage.removeItem(reloadKey);
            sessionStorage.removeItem(timestampKey);
          } catch (_) {}
          clearTimeout(fallbackTimer);
          return;
        }
      }

      // Try to fetch profile to route user appropriately
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role,vendor_id')
        .eq('id', user.id)
        .single();
      
      console.log('Profile fetch result:', { profile, profileError, userId: user.id });
      
      if (profileError) {
        console.error('Failed to fetch profile:', profileError);
        toast({
          title: 'Warning',
          description: 'Could not fetch user profile. Some features may not work correctly.'
        });
      }
      
      // Navigate based on role
      const userRole = profile?.role || 'receiver';
      const targetPath = userRole === 'vendor' ? '/vendor' : 
                        userRole === 'admin' ? '/admin' : '/';
      
      console.log('User role:', userRole, '| Navigating to:', targetPath);
      
      toast({
        title: 'Login successful',
        description: 'Redirecting...'
      });
      
      setLoading(false);
      try { 
        sessionStorage.removeItem('authReloadAttempted');
        sessionStorage.removeItem('authReloadTimestamp');
      } catch (_) {}
      clearTimeout(fallbackTimer);
      navigate(targetPath, { replace: true });

    } catch (err: any) {
      console.error('Login error:', err);
      toast({ title: 'Error', description: String(err) });
      setLoading(false);
      try { 
        sessionStorage.removeItem('authReloadAttempted');
        sessionStorage.removeItem('authReloadTimestamp');
      } catch (_) {}
      clearTimeout(fallbackTimer);
    }
  }

  async function sendMagicLink() {
    if (!email) {
      toast({ title: 'Missing email', description: 'Enter your email first' });
      return;
    }
    
    setLoading(true);
    // Fallback reload similar to onSubmit
    const reloadKey = 'authReloadAttempted';
    const fallbackTimer = setTimeout(() => {
      try {
        const attempted = sessionStorage.getItem(reloadKey);
        if (!attempted) {
          sessionStorage.setItem(reloadKey, '1');
          console.warn('Magic link fallback: reloading page to recover auth state');
          window.location.reload();
        } else {
          console.warn('Magic link fallback already attempted — clearing loading state');
          setLoading(false);
        }
      } catch (err) {
        console.warn('Magic link fallback error', err);
        setLoading(false);
      }
    }, 7000);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        console.error('Magic link error:', error);
        toast({ title: 'Error', description: error.message });
      } else {
        toast({ title: 'Magic link sent', description: 'Check your email for a sign-in link.' });
      }
    } catch (err: any) {
      console.error('Magic link unexpected error:', err);
      toast({ title: 'Error', description: String(err) });
    } finally {
      setLoading(false);
      try { sessionStorage.removeItem(reloadKey); } catch (_) {}
      clearTimeout(fallbackTimer);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-2xl shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>

        <Card className="shadow-2xl border-0 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '200ms' }}>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </CardTitle>
            <CardDescription className="text-purple-100">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-purple-500" />
                  Email Address
                </label>
                <Input 
                  id="email"
                  name="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="h-11 focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-purple-500" />
                  Password
                </label>
                <Input 
                  id="password"
                  name="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-11 focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </span>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  disabled={loading} 
                  onClick={sendMagicLink} 
                  className="w-full h-12 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Send Magic Link
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
