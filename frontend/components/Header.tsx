import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ship, Package, Search, Home, Shield, LogIn, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import React from 'react';
import supabase from '@/supabaseClient';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    
    async function loadUserData() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted || !sessionData.session) return;
      
      setUserEmail(sessionData.session.user.email ?? null);
      
      // Fetch user role from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sessionData.session.user.id)
        .single();
      
      if (mounted && profile) {
        setUserRole(profile.role);
      }
    }
    
    loadUserData();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;
      setUserEmail(session?.user?.email ?? null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (mounted && profile) {
          setUserRole(profile.role);
        }
      } else {
        setUserRole(null);
      }
    });

    return () => {
      mounted = false;
      if (listener && typeof listener.subscription?.unsubscribe === 'function') {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: 'Logout Failed',
          description: error.message || 'Unable to log out. Please try again.',
          variant: 'destructive'
        });
        return;
      }
      
      // Clear local state
      setUserEmail(null);
      setUserRole(null);
      setMobileMenuOpen(false);
      
      // Show success message
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.'
      });
      
      // Navigate to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Ship className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Olu Shipping</h1>
              <p className="text-xs text-gray-500">Precision in Every Shipment</p>
            </div>
            <h1 className="sm:hidden text-lg font-bold text-gray-900">Olu</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link to="/">
              <Button 
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Button>
            </Link>
            <Link to="/vendor">
              <Button 
                variant={location.pathname.startsWith('/vendor') ? 'default' : 'ghost'}
                className="flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Vendor Portal</span>
              </Button>
            </Link>
            <Link to="/tracking">
              <Button 
                variant={location.pathname.startsWith('/tracking') ? 'default' : 'ghost'}
                className="flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Track Shipment</span>
              </Button>
            </Link>
            {userRole === 'admin' && (
              <Link to="/admin">
                <Button 
                  variant={location.pathname.startsWith('/admin') ? 'default' : 'ghost'}
                  className="flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}
            {/* Auth links */}
            {userEmail ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-2"
                  title={userEmail}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-600 max-w-[150px] truncate hidden sm:inline">
                    {userEmail}
                  </span>
                </Button>
                <Button variant="ghost" onClick={signOut} className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant={location.pathname === '/login' ? 'default' : 'ghost'} className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant={location.pathname === '/register' ? 'default' : 'ghost'} className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Register</span>
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 space-y-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                className="w-full justify-start space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Button>
            </Link>
            <Link to="/vendor" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant={location.pathname.startsWith('/vendor') ? 'default' : 'ghost'}
                className="w-full justify-start space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Vendor Portal</span>
              </Button>
            </Link>
            <Link to="/tracking" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant={location.pathname.startsWith('/tracking') ? 'default' : 'ghost'}
                className="w-full justify-start space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Track Shipment</span>
              </Button>
            </Link>
            {userRole === 'admin' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button 
                  variant={location.pathname.startsWith('/admin') ? 'default' : 'ghost'}
                  className="w-full justify-start space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              {userEmail ? (
                <>
                  <div className="px-4 py-2 flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="truncate">{userEmail}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => { signOut(); setMobileMenuOpen(false); }}
                    className="w-full justify-start space-x-2 mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={location.pathname === '/login' ? 'default' : 'ghost'}
                      className="w-full justify-start space-x-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button 
                      variant={location.pathname === '/register' ? 'default' : 'ghost'}
                      className="w-full justify-start space-x-2 mt-2"
                    >
                      <User className="w-4 h-4" />
                      <span>Register</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
