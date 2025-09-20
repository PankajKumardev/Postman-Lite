import { useMemo, useState, useEffect } from 'react'
import { saveRequest, createCollection, getCollections, createCollectionRequest, getMe } from '../lib/api'
import { API_BASE } from '../lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Alert, AlertDescription } from './ui/alert'
import { Send, Save, Plus, X, Globe, Code2, Check, AlertCircle } from 'lucide-react'
import { JsonEditor } from './JsonEditor'
import { ResponsePreview } from './ResponsePreview'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from './ui/dialog'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

type HeaderRow = { id: string; key: string; value: string }

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

const METHOD_COLORS = {
  GET: 'bg-green-500 hover:bg-green-600',
  POST: 'bg-blue-500 hover:bg-blue-600',
  PUT: 'bg-orange-500 hover:bg-orange-600',
  DELETE: 'bg-red-500 hover:bg-red-600',
  PATCH: 'bg-purple-500 hover:bg-purple-600',
  HEAD: 'bg-gray-500 hover:bg-gray-600',
  OPTIONS: 'bg-indigo-500 hover:bg-indigo-600',
}

export function RequestBuilder() {
  const [url, setUrl] = useState('https://httpbin.org/get')
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [headers, setHeaders] = useState<HeaderRow[]>([{ id: crypto.randomUUID(), key: 'Accept', value: 'application/json' }])
  const [body, setBody] = useState<string>('')
  const [sending, setSending] = useState(false)
  
  // Collection-related state
  const [collections, setCollections] = useState<any[]>([])
  const [isSaveToCollectionOpen, setIsSaveToCollectionOpen] = useState(false)
  const [selectedCollectionForSave, setSelectedCollectionForSave] = useState('')
  const [newRequestName, setNewRequestName] = useState('')
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')

  const builtHeaders = useMemo(() => {
    const out: Record<string, string> = {}
    for (const h of headers) {
      if (h.key.trim().length) out[h.key] = h.value
    }
    return out
  }, [headers])

  const [response, setResponse] = useState<{
    status?: number
    statusText?: string
    headers?: Record<string, string>
    data?: unknown
    error?: string
  }>({})
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    // Load collections for saving
    const loadCollections = async () => {
      try {
        const user = await getMe()
        if (user?.user) {
          const collectionsData = await getCollections()
          setCollections(collectionsData)
        }
      } catch (error) {
        console.error('Failed to load collections:', error)
      }
    }
    loadCollections()
  }, [])

  function updateHeader(id: string, key: 'key' | 'value', value: string) {
    setHeaders(prev => prev.map(h => (h.id === id ? { ...h, [key]: value } : h)))
  }
  function addHeader() {
    setHeaders(prev => [...prev, { id: crypto.randomUUID(), key: '', value: '' }])
  }
  function removeHeader(id: string) {
    setHeaders(prev => prev.filter(h => h.id !== id))
  }

  function isLocalhostUrl(u: string) {
    try {
      const parsed = new URL(u)
      return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)
    } catch {
      return false
    }
  }

  async function send() {
    setSending(true)
    setResponse({})
    try {
      if (isLocalhostUrl(url)) {
        // Direct browser fetch to user's local server
        const first = await fetch(url, {
          method,
          headers: { Accept: 'text/html,application/json;q=0.9,*/*;q=0.8', ...builtHeaders },
          body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body ? JSON.stringify(safeParseJSON(body) ?? body) : undefined,
        })
        let r = first
        // Fallback: many dev servers serve index.html, try explicitly if root returns 404/empty
        const contentLen = first.headers.get('content-length')
        if (method === 'GET' && first.status === 404 && (!contentLen || contentLen === '0')) {
          try {
            const u = new URL(url)
            if (u.pathname === '/' || u.pathname === '') {
              u.pathname = '/index.html'
              r = await fetch(u.toString(), { headers: { Accept: 'text/html,*/*;q=0.8' } })
            }
          } catch {}
        }
        const ct = r.headers.get('content-type') || ''
        const data = ct.includes('application/json') ? await r.json().catch(async () => (await r.text())) : await r.text()
        const hdrs: Record<string, string> = {}
        r.headers.forEach((v, k) => (hdrs[k] = v))
        setResponse({ status: r.status, statusText: r.statusText, headers: hdrs, data })
      } else {
        // Use backend proxy for remote URLs (handles CORS)
        const res = await fetch(`${API_BASE}/api/proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            url,
            method,
            headers: builtHeaders,
            body: body ? safeParseJSON(body) ?? body : undefined,
          }),
        })
        const json = await res.json()
        setResponse(json)
      }
    } catch (e: any) {
      setResponse({ error: e?.message ?? 'Request failed' })
    } finally {
      setSending(false)
    }
  }

  async function onSave() {
    setSaveMsg('')
    try {
      if (!response || response.status == null) throw new Error('Send a request first')
      const payload = {
        method,
        url,
        headers: builtHeaders,
        body: body ? safeParseJSON(body) ?? body : null,
        responseStatus: response.status,
        responseBody: response.data ?? null,
      }
      await saveRequest(payload)
      setSaveMsg('saved')
      setTimeout(() => setSaveMsg(''), 1500)
    } catch (e: any) {
      setSaveMsg('error')
      setTimeout(() => setSaveMsg(''), 2500)
    }
  }

  async function onSaveToCollection() {
    if (!selectedCollectionForSave || !newRequestName.trim()) return
    
    try {
      const collectionId = parseInt(selectedCollectionForSave)
      
      await createCollectionRequest(collectionId, {
        name: newRequestName,
        method,
        url,
        headers: builtHeaders,
        body: body ? safeParseJSON(body) ?? body : undefined,
      })

      setIsSaveToCollectionOpen(false)
      setNewRequestName('')
      setSelectedCollectionForSave('')
    } catch (e: any) {
      console.error('Failed to save to collection:', e)
    }
  }

  async function onCreateCollection() {
    if (!newCollectionName.trim()) return
    
    try {
      const newCollection = await createCollection({
        name: newCollectionName,
        description: ''
      })
      
      setCollections([...collections, newCollection])
      setSelectedCollectionForSave(newCollection.id.toString())
      setIsCreatingCollection(false)
      setNewCollectionName('')
    } catch (e: any) {
      console.error('Failed to create collection:', e)
    }
  }

  return (
    <div className="space-y-6">
      {/* Request URL Bar */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex gap-3 items-center">
            <Select value={method} onValueChange={(value) => setMethod(value as HttpMethod)}>
              <SelectTrigger className={`w-32 text-white font-medium border-0 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/20 transition-all ${METHOD_COLORS[method]}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map(m => (
                  <SelectItem key={m} value={m} className="font-medium">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex-1 relative">
              <Label htmlFor="url-input" className="sr-only">API Endpoint URL</Label>
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="url-input"
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://api.example.com/endpoint" 
                className="pl-10 h-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            
            <Button 
              onClick={send} 
              disabled={sending} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 min-w-[100px]"
            >
              {sending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending</span>
                </div>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
            
            <Button 
              onClick={onSave} 
              variant="outline"
              className="transition-all duration-200 hover:bg-muted/50"
            >
              {saveMsg === 'saved' ? (
                <Check className="mr-2 h-4 w-4 text-green-600" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saveMsg === 'saved' ? 'Saved!' : saveMsg === 'error' ? 'Error' : 'Save to History'}
            </Button>
            
            <Dialog open={isSaveToCollectionOpen} onOpenChange={setIsSaveToCollectionOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="transition-all duration-200 hover:bg-muted/50">
                  <Save className="mr-2 h-4 w-4" />
                  Save to Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Request to Collection</DialogTitle>
                  <DialogDescription>
                    Save this request to an existing collection or create a new one
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="request-name">Request Name</Label>
                    <Input
                      id="request-name"
                      value={newRequestName}
                      onChange={(e) => setNewRequestName(e.target.value)}
                      placeholder="e.g., Get User Profile"
                    />
                  </div>
                  <div>
                    <Label htmlFor="collection-select">Collection</Label>
                    <Select value={selectedCollectionForSave} onValueChange={setSelectedCollectionForSave}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id.toString()}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {isCreatingCollection && (
                    <div>
                      <Label htmlFor="new-collection-name">New Collection Name</Label>
                      <Input
                        id="new-collection-name"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="e.g., User Management APIs"
                      />
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingCollection(!isCreatingCollection)}
                    >
                      {isCreatingCollection ? 'Select Existing' : 'Create New Collection'}
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsSaveToCollectionOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={isCreatingCollection ? onCreateCollection : onSaveToCollection}
                        disabled={!newRequestName.trim() || (!selectedCollectionForSave && !isCreatingCollection)}
                      >
                        {isCreatingCollection ? 'Create & Save' : 'Save Request'}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Configuration */}
        <div className="space-y-6">
          {/* Headers */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Code2 className="mr-2 h-5 w-5" />
                Headers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {headers.map(h => (
                <div key={h.id} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <Label htmlFor={`header-key-${h.id}`} className="sr-only">Header Name</Label>
                    <Input
                      id={`header-key-${h.id}`}
                      value={h.key}
                      onChange={e => updateHeader(h.id, 'key', e.target.value)}
                      placeholder="Header name"
                      className="h-9"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`header-value-${h.id}`} className="sr-only">Header Value</Label>
                    <Input
                      id={`header-value-${h.id}`}
                      value={h.value}
                      onChange={e => updateHeader(h.id, 'value', e.target.value)}
                      placeholder="Header value"
                      className="h-9"
                    />
                  </div>
                  <Button
                    onClick={() => removeHeader(h.id)}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={addHeader}
                variant="outline"
                size="sm"
                className="w-full border-dashed hover:bg-muted/50"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Header
              </Button>
            </CardContent>
          </Card>

          {/* Request Body */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Request Body (JSON)</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonEditor
                value={body}
                onChange={setBody}
                placeholder='{\n  "key": "value",\n  "number": 42,\n  "boolean": true\n}'
                rows={12}
              />
            </CardContent>
          </Card>
        </div>

        {/* Response */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            {response.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {response.error}
                </AlertDescription>
              </Alert>
            ) : response.status ? (
              <ResponsePreview
                data={response.data}
                headers={response.headers}
                status={response.status}
                statusText={response.statusText}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Send className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Send a request to see the response</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function safeParseJSON(input: string): any | undefined {
  try { return JSON.parse(input) } catch { return undefined }
}


