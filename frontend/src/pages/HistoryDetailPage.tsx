import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchSaved } from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { X, Code2, Braces, ArrowLeft } from 'lucide-react'
import { ResponsePreview } from '../components/ResponsePreview'

interface SavedRequest {
  id?: number
  method: string
  url: string
  headers?: Record<string, string>
  body?: string | Record<string, unknown> | Array<unknown> | null
  responseStatus?: number
  responseBody?: string | Record<string, unknown> | Array<unknown> | null
  responseHeaders?: Record<string, string>
  createdAt?: string
}

interface FetchSavedResponse {
  requests: SavedRequest[]
}

export function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [request, setRequest] = useState<SavedRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request')
  const [requestView, setRequestView] = useState<'headers' | 'body'>('headers')
  const [responseView, setResponseView] = useState<'headers' | 'body'>('body')

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true)
      const response: FetchSavedResponse = await fetchSaved()
      const foundRequest = response.requests.find((r: SavedRequest) => r.id === parseInt(id || '0'))
      
      if (foundRequest) {
        setRequest(foundRequest)
      } else {
        setError('Request not found')
      }
    } catch (err: unknown) {
      setError('Failed to load request details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadRequest()
  }, [loadRequest])

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-muted-foreground'
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400'
    if (status >= 500) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  const getMethodVariant = (method: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (method) {
      case 'GET': return 'default'
      case 'POST': return 'default' 
      case 'PUT': return 'secondary'
      case 'DELETE': return 'destructive'
      case 'PATCH': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading request details...</p>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <X className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-red-500 font-medium">{error || 'Request not found'}</p>
          <Button 
            onClick={() => navigate('/app')} 
            className="mt-4"
          >
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate('/app')}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">Request Details</h3>
        </div>
        <Button
          onClick={() => navigate('/app')}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Card className="flex-1 flex flex-col border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={getMethodVariant(request.method)} className="text-sm font-medium">
                {request.method}
              </Badge>
              <span className="font-mono text-sm text-foreground truncate">
                {request.url}
              </span>
            </div>
            {request.responseStatus && (
              <div className={`text-sm font-mono ${getStatusColor(request.responseStatus)}`}>
                Status: {request.responseStatus}
              </div>
            )}
            {request.createdAt && (
              <div className="text-xs text-muted-foreground">
                {new Date(request.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex border-b border-border">
            <Button
              variant="ghost"
              className={`rounded-none rounded-tl-md px-4 py-2 ${activeTab === 'request' ? 'bg-blue-600 text-white shadow-none font-medium hover:bg-blue-700' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              onClick={() => setActiveTab('request')}
            >
              Request
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none px-4 py-2 ${activeTab === 'response' ? 'bg-blue-600 text-white shadow-none font-medium hover:bg-blue-700' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
              onClick={() => setActiveTab('response')}
            >
              Response
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'request' ? (
              <div className="space-y-4">
                <div className="flex border-b border-border">
                  <Button
                    variant="ghost"
                    className={`rounded-none px-4 py-2 ${requestView === 'headers' ? 'bg-gray-700 text-white shadow-none font-medium hover:bg-gray-800' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                    onClick={() => setRequestView('headers')}
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    Headers
                  </Button>
                  <Button
                    variant="ghost"
                    className={`rounded-none px-4 py-2 ${requestView === 'body' ? 'bg-gray-700 text-white shadow-none font-medium hover:bg-gray-800' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                    onClick={() => setRequestView('body')}
                  >
                    <Braces className="h-4 w-4 mr-2" />
                    Body
                  </Button>
                </div>

                {requestView === 'headers' ? (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Request Headers</h4>
                    {request.headers && Object.keys(request.headers).length > 0 ? (
                      <div className="border rounded-md p-3 bg-muted/30 max-h-64 overflow-auto">
                        <pre className="text-xs font-mono">
                          {Object.entries(request.headers)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join('\n')}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground py-4 text-center">
                        No headers
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Request Body</h4>
                    {request.body !== undefined && request.body !== null ? (
                      <div className="border rounded-md p-3 bg-muted/30 max-h-64 overflow-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {typeof request.body === 'string' 
                            ? request.body 
                            : JSON.stringify(request.body, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground py-4 text-center">
                        No body
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex border-b border-border">
                  <Button
                    variant="ghost"
                    className={`rounded-none px-4 py-2 ${responseView === 'headers' ? 'bg-gray-700 text-white shadow-none font-medium hover:bg-gray-800' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                    onClick={() => setResponseView('headers')}
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    Headers
                  </Button>
                  <Button
                    variant="ghost"
                    className={`rounded-none px-4 py-2 ${responseView === 'body' ? 'bg-gray-700 text-white shadow-none font-medium hover:bg-gray-800' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                    onClick={() => setResponseView('body')}
                  >
                    <Braces className="h-4 w-4 mr-2" />
                    Body
                  </Button>
                </div>

                {responseView === 'headers' ? (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Response Headers</h4>
                    {request.responseHeaders && Object.keys(request.responseHeaders).length > 0 ? (
                      <div className="border rounded-md p-3 bg-muted/30 max-h-64 overflow-auto">
                        <pre className="text-xs font-mono">
                          {Object.entries(request.responseHeaders)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join('\n')}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground py-4 text-center">
                        No headers
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Response Body</h4>
                    {request.responseBody !== undefined && request.responseBody !== null ? (
                      <ResponsePreview
                        data={request.responseBody}
                        headers={request.responseHeaders || {}}
                        status={request.responseStatus}
                        statusText={''}
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground py-4 text-center">
                        No response body
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}