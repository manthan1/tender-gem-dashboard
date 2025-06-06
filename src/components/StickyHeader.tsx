import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const StickyHeader: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path: string) => {
    if (!isAuthenticated && (path === '/dashboard' || path === '/documents')) {
      navigate('/login');
      return;
    }
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { label: 'Tenders', path: '/dashboard' },
    { label: 'About Us', path: '#about' },
    { label: 'GeM Registration', path: '#gem' },
    { label: 'Company Insights', path: '#insights' }
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-white border-b border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold text-lg font-inter">
              TENDER<span className="bg-accent px-1 ml-1 rounded">AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className="text-muted-foreground hover:text-primary transition-colors font-medium font-inter"
              >
                {item.label}
              </button>
            ))}
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-2 font-medium font-inter">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-2 font-medium font-inter">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <div className="flex flex-col h-full pt-6">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-primary text-primary-foreground px-3 py-2 rounded-lg font-bold text-sm font-inter">
                      TENDER<span className="bg-accent px-1 ml-1 rounded">AI</span>
                    </div>
                  </div>
                  
                  <nav className="space-y-4 flex-1">
                    {navigationItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleNavigation(item.path)}
                        className="w-full text-left px-4 py-3 text-muted-foreground hover:text-primary hover:bg-gray-50 rounded-lg transition-colors font-medium font-inter"
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {isAuthenticated ? (
                      <Button 
                        onClick={() => handleNavigation('/dashboard')}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 font-medium font-inter"
                      >
                        Dashboard
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleNavigation('/login')}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 font-medium font-inter"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StickyHeader;