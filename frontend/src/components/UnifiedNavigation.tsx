import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import { getMe, logout } from '../lib/api'
import { useNavigate, useLocation } from 'react-router-dom'
import { User, LogOut, Zap, Settings, FileText, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface NavigationLink {
  label: string
  href: string
  icon?: React.ReactNode
}

interface UnifiedNavigationProps {
  variant?: 'homepage' | 'app'
}

export function UnifiedNavigation({ variant = 'homepage' }: UnifiedNavigationProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    getMe()
      .then((r: any) => {
        setUser(r?.user || null)
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogout() {
    try {
      await logout()
      setUser(null)
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getNavigationLinks = (): NavigationLink[] => {
    if (variant === 'app') {
      return [
        { label: 'Requests', href: '/app', icon: <Zap className="w-4 h-4" /> },
        { label: 'Collections', href: '/app/collections', icon: <FileText className="w-4 h-4" /> },
        { label: 'Settings', href: '/app/settings', icon: <Settings className="w-4 h-4" /> },
      ]
    } else {
      return [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Docs', href: '#docs' },
      ]
    }
  }

  const navigationLinks = getNavigationLinks()

  return (
    <nav className="relative z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="max-w-full mx-auto px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Postman Lite
            </span>
          </div>
          
          {/* Navigation Links & Actions */}
          <div className="flex items-center space-x-6">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navigationLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    if (link.href.startsWith('#')) {
                      // Handle anchor links for homepage
                      const element = document.querySelector(link.href)
                      element?.scrollIntoView({ behavior: 'smooth' })
                    } else {
                      // Handle route navigation for app
                      navigate(link.href)
                    }
                  }}
                  className={`text-sm transition-colors flex items-center space-x-2 px-3 py-2 rounded-md ${
                    location.pathname === link.href
                      ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              
              {!loading && user ? (
                <div className="flex items-center space-x-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center space-x-2 h-9 px-3 hover:bg-muted/50"
                      >
                        <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="hidden sm:flex flex-col items-start text-left">
                          <p className="text-sm font-medium text-foreground leading-none">{user.name || user.email}</p>
                          <p className="text-xs text-muted-foreground leading-none mt-0.5">{user.email}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : variant === 'homepage' ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-sm hover:bg-muted/50 h-9 px-3"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/app')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-9 px-4"
                  >
                    Get Started
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  className="h-9 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  size="sm"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}