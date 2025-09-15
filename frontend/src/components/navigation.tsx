import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import { getMe, logout } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Zap } from 'lucide-react'

export function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  function handleLogin() {
    navigate('/login')
  }

  return (
    <nav className="relative z-50 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="max-w-full mx-auto px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">Postman Lite</span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {loading ? (
              <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="h-9 flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
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
    </nav>
  )
}