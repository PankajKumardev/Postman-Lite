import { useMemo, useState } from 'react'
import { saveRequest } from '../lib/api'
import { API_BASE } from '../lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Send, Save, Plus, X, Globe, Code2, Check } from 'lucide-react'
import { JsonEditor } from './JsonEditor'
import { ResponsePreview } from './ResponsePreview'

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

  return (
    <div className="space-y-6">
      {/* Request URL Bar */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex gap-3 items-center">
            <div className="relative">
              <select 
                value={method} 
                onChange={e => setMethod(e.target.value as HttpMethod)} 
                className={`px-3 py-2 rounded-md text-white text-sm font-medium border-0 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/20 transition-all ${METHOD_COLORS[method]}`}
              >
                {METHODS.map(m => (
                  <option key={m} value={m} className="bg-background text-foreground">{m}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
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
              {saveMsg === 'saved' ? 'Saved!' : saveMsg === 'error' ? 'Error' : 'Save'}
            </Button>
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
                  <Input
                    value={h.key}
                    onChange={e => updateHeader(h.id, 'key', e.target.value)}
                    placeholder="Header name"
                    className="flex-1 h-9"
                  />
                  <Input
                    value={h.value}
                    onChange={e => updateHeader(h.id, 'value', e.target.value)}
                    placeholder="Header value"
                    className="flex-1 h-9"
                  />
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
              <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
                <strong>Error:</strong> {response.error}
              </div>
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


