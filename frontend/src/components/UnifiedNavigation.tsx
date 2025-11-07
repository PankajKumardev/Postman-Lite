import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, FileText, Zap, ChevronDown } from 'lucide-react';

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
      ];
    } else {
      return [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Docs', href: '#docs' },
      ];
    }
  };

  const navigationLinks = getNavigationLinks();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground hover:text-primary"
        >
          <span className="text-lg leading-tight font-medium">
            Postman Lite
          </span>
        </Button>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1">
            {navigationLinks.map((link) => {
              const isAnchor = link.href.startsWith('#');
              const isActive = !isAnchor && location.pathname === link.href;

              if (isAnchor) {
                return (
                  <Button
                    key={link.href}
                    size="sm"
                    className="text-sm font-medium px-3 py-2 rounded-md transition-colors"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#111827';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'inherit';
                    }}
                    onClick={() => {
                      const element = document.querySelector(link.href);
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {link.icon}
                      {link.label}
                    </span>
                  </Button>
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
    </header>
  );
}
