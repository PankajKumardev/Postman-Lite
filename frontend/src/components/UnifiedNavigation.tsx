import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  FileText,
  Zap,
  ChevronDown,
  Menu,
  X,
  History,
} from 'lucide-react';

import { Button } from './ui/button';
import { ThemeToggle } from './theme-toggle';
import { getMe, logout } from '../lib/api';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface NavigationLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface UnifiedNavigationProps {
  variant?: 'homepage' | 'app';
}

export function UnifiedNavigation({
  variant = 'homepage',
}: UnifiedNavigationProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getMe()
      .then((r: any) => {
        setUser(r?.user || null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    try {
      await logout();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  const getNavigationLinks = (): NavigationLink[] => {
    if (variant === 'app') {
      return [
        { label: 'Requests', href: '/app', icon: <Zap className="w-4 h-4" /> },
        {
          label: 'Collections',
          href: '/app/collections',
          icon: <FileText className="w-4 h-4" />,
        },
        {
          label: 'History',
          href: '/app/history',
          icon: <History className="w-4 h-4" />,
        },
      ];
    } else {
      return [
        { label: 'Features', href: '#features' },
        { label: 'How it works', href: '#how-it-works' },
        { label: 'FAQ', href: '#faq' },
      ];
    }
  };

  const navigationLinks = getNavigationLinks();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu button - only show for app variant */}
          {variant === 'app' && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => {
              if (variant === 'homepage') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground hover:text-primary"
          >
            <span className="text-lg leading-tight font-medium">
              Postman Lite
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1">
            {navigationLinks.map((link) => {
              const isAnchor = link.href.startsWith('#');
              const isActive = !isAnchor && location.pathname === link.href;

              if (isAnchor) {
                return (
                  <button
                    key={link.href}
                    className="text-sm font-medium px-3 py-2 rounded-md transition-colors bg-transparent hover:bg-[hsl(var(--muted))] text-foreground"
                    onClick={() => {
                      const element = document.querySelector(link.href);
                      element?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {link.icon}
                      {link.label}
                    </span>
                  </button>
                );
              }

              return (
                <Button
                  key={link.href}
                  size="sm"
                  className={cn(
                    'text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors',
                    isActive &&
                      'text-foreground bg-secondary hover:bg-secondary/80'
                  )}
                  onClick={() => navigate(link.href)}
                >
                  <span className="flex items-center gap-2 ">
                    {link.icon}
                    {link.label}
                  </span>
                </Button>
              );
            })}
          </div>

          <ThemeToggle />

          {!loading && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center gap-2 px-3 py-2 rounded-md  transition-colors">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left">
                    <span className="text-sm font-medium leading-none">
                      {user.name || user.email}
                    </span>
                    <span className="text-xs text-muted-foreground leading-none">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem onClick={() => navigate('/app/collections')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Collections
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : variant === 'homepage' ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => navigate('/login')}
                className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.8)] text-[hsl(var(--secondary-foreground))] transition-colors"
              >
                Sign in
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/app')}
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.9)] text-[hsl(var(--primary-foreground))] transition-colors"
              >
                Get started
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.9)] text-[hsl(var(--primary-foreground))] transition-colors"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && variant === 'app' && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="px-4 py-3 space-y-1">
            {navigationLinks.map((link) => {
              const isActive = location.pathname === link.href;

              return (
                <button
                  key={link.href}
                  className={cn(
                    'w-full flex justify-start items-center text-sm font-medium px-3 py-2.5 rounded-md transition-all duration-200',
                    isActive
                      ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary)/.8)] active:bg-[hsl(var(--secondary)/.7)]'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/.7)] hover:text-[hsl(var(--foreground))] active:bg-[hsl(var(--muted))] active:scale-[0.98]'
                  )}
                  onClick={() => {
                    navigate(link.href);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="flex items-center gap-3">
                    {link.icon}
                    {link.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
