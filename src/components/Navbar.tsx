
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LogIn, 
  User, 
  Menu, 
  X, 
  GraduationCap,
  LogOut,
  UserCog
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 px-6 md:px-10",
        isScrolled 
          ? "bg-white/80 backdrop-blur-lg shadow-sm" 
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-primary font-medium text-xl transition-opacity hover:opacity-80"
        >
          <GraduationCap className="w-6 h-6" />
          <span className="hidden sm:inline">Student Portal</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex space-x-1">
            <NavLink to="/" label="Home" />
            <NavLink to="/about" label="About" />
            <NavLink to="/features" label="Features" />
            <NavLink to="/contact" label="Contact" />
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to={isAdmin ? "/dashboard" : "/profile"} className="flex items-center gap-1">
                    {isAdmin ? (
                      <><UserCog className="w-4 h-4" /><span>Dashboard</span></>
                    ) : (
                      <><User className="w-4 h-4" /><span>Profile</span></>
                    )}
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => signOut()}>
                  <LogOut className="w-4 h-4 mr-1" />
                  <span>Log out</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login" className="flex items-center gap-1">
                    <LogIn className="w-4 h-4" />
                    <span>Log in</span>
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register" className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 top-16 bg-background z-40 flex flex-col md:hidden transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col p-6 space-y-6">
          <MobileNavLink to="/" label="Home" icon={<GraduationCap className="w-5 h-5" />} />
          <MobileNavLink to="/about" label="About" />
          <MobileNavLink to="/features" label="Features" />
          <MobileNavLink to="/contact" label="Contact" />
          
          <div className="border-t pt-6 flex flex-col gap-3">
            {user ? (
              <>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to={isAdmin ? "/dashboard" : "/profile"} className="flex items-center gap-2">
                    {isAdmin ? (
                      <><UserCog className="w-5 h-5" /><span>Dashboard</span></>
                    ) : (
                      <><User className="w-5 h-5" /><span>Profile</span></>
                    )}
                  </Link>
                </Button>
                <Button onClick={() => signOut()} className="w-full justify-start">
                  <LogOut className="w-5 h-5 mr-2" />
                  <span>Log out</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link to="/login" className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    <span>Log in</span>
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link to="/register" className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span>Register</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive 
          ? "text-primary" 
          : "text-foreground hover:text-primary hover:bg-primary/5"
      )}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  );
};

const MobileNavLink = ({ 
  to, 
  label, 
  icon 
}: { 
  to: string; 
  label: string; 
  icon?: React.ReactNode 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-2 py-2 rounded-md text-base font-medium transition-colors",
        isActive 
          ? "text-primary bg-primary/5" 
          : "text-foreground hover:text-primary hover:bg-primary/5"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
