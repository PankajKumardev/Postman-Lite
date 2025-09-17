import { useEffect, useState } from 'react'
import { fetchSaved } from '../lib/api'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { History, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HistoryPanel() {
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      setLoading(true)
      const r = await fetchSaved()
      setItems(r.requests || [])
      setError('')
    } catch (err) {
      setError('Login to view history')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function getStatusColor(status?: number) {
    if (!status) return 'text-muted-foreground'
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400'
    if (status >= 500) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  function getMethodVariant(method: string): "default" | "secondary" | "destructive" | "outline" {
    switch (method) {
      case 'GET': return 'default'
      case 'POST': return 'default' 
      case 'PUT': return 'secondary'
      case 'DELETE': return 'destructive'
      case 'PATCH': return 'secondary'
      default: return 'outline'
    }
  }

  function formatUrl(url: string) {
    try {
      const parsed = new URL(url)
      return `${parsed.pathname}${parsed.search}`
    } catch {
      return url
    }
  }

  function formatTime(timestamp: string) {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return ''
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Request History
        </h3>
        <Button
          onClick={loadHistory}
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={loading}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin mr-2" />
            <span className="text-xs">Loading...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="m-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">
              No saved requests yet
            </div>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto h-full">
            {items.map((r, index) => (
              <div 
                key={r.id || index} 
                className="group p-2 border border-border/50 rounded-md hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/history/${r.id}`)}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant={getMethodVariant(r.method)} className="text-xs font-medium">
                    {r.method}
                  </Badge>
                  {r.responseStatus && (
                    <span className={`text-xs font-mono ${getStatusColor(r.responseStatus)}`}>
                      {r.responseStatus}
                    </span>
                  )}
                </div>
                
                <div className="font-mono text-xs text-foreground group-hover:text-primary transition-colors truncate" title={r.url}>
                  {formatUrl(r.url) || r.url}
                </div>
                
                {r.createdAt && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(r.createdAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}