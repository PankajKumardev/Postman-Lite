import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ThemeToggle } from './theme-toggle'
import { getMe, logout } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, Mail } from 'lucide-react'

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
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="cursor-pointer" onClick={() => navigate('/')}>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Postman Lite
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  API Testing Tool
                </p>
              </div>
            </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {loading ? (
              <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
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
                  className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition-all duration-200"
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