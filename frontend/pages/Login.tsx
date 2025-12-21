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
    
    try {
      // IMPORTANT: Clear any stale session data before attempting login
      console.log('Clearing any existing session data before login...');
      try {
        // Clear all Supabase auth data from storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      } catch (e) {
        console.warn('Error clearing storage:', e);
      }
      
      // Sign out any existing session (even if invalid)
      await supabase.auth.signOut({ scope: 'local' });
      
      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now attempt fresh login
      console.log('Attempting fresh login...');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Login error:', error);
        toast({ 
          title: 'Login Failed', 
          description: error.message || 'Invalid email or password.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      if (!data?.session || !data?.user) {
        console.error('No session returned from login');
        toast({ 
          title: 'Login Failed', 
          description: 'Could not establish session. Please try again.',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      console.log('Login successful, user:', data.user.email);
      
      // Fetch user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role,vendor_id')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Failed to fetch profile:', profileError);
        toast({
          title: 'Warning',
          description: 'Could not fetch user profile. Redirecting to home page.',
          variant: 'destructive'
        });
      }
      
      // Navigate based on role
      const userRole = profile?.role || 'receiver';
      const targetPath = userRole === 'vendor' ? '/vendor' : 
                        userRole === 'admin' ? '/admin' : '/';
      
      console.log('User role:', userRole, '| Navigating to:', targetPath);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back${userRole !== 'receiver' ? ' to ' + userRole + ' portal' : ''}!`
      });
      
      // Use replace to prevent back button issues
      navigate(targetPath, { replace: true });
      setLoading(false);

    } catch (err: any) {
      console.error('Login error:', err);
      toast({ 
        title: 'Login Error', 
        description: err.message || 'An error occurred during login. Please try again.',
        variant: 'destructive'
      });
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    if (!email) {
      toast({ title: 'Missing email', description: 'Enter your email first' });
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        console.error('Magic link error:', error);
        toast({ 
          title: 'Error', 
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({ 
          title: 'Magic Link Sent', 
          description: 'Check your email for a sign-in link.' 
        });
      }
    } catch (err: any) {
      console.error('Magic link unexpected error:', err);
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to send magic link.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
