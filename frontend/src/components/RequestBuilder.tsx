import { useMemo, useState } from 'react'
import { saveRequest } from '../lib/api'
import { API_BASE } from '../lib/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

type HeaderRow = { id: string; key: string; value: string }

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

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
      setSaveMsg('Saved!')
      setTimeout(() => setSaveMsg(''), 1500)
    } catch (e: any) {
      setSaveMsg(e?.message || 'Save failed')
      setTimeout(() => setSaveMsg(''), 2500)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select value={method} onChange={e => setMethod(e.target.value as HttpMethod)} className="border rounded-md px-2 py-2">
          {METHODS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com" className="flex-1 border rounded-md px-3 py-2" />
        <button onClick={send} disabled={sending} className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50">{sending ? 'Sending…' : 'Send'}</button>
        <button type="button" onClick={onSave} className='px-3 py-2 rounded-md border'>Save</button>
        {saveMsg && <span className='text-sm text-gray-600'>{saveMsg}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="text-sm font-medium">Headers</div>
          <div className="space-y-2">
            {headers.map(h => (
              <div key={h.id} className="flex gap-2">
                <input value={h.key} onChange={e => updateHeader(h.id, 'key', e.target.value)} placeholder="Header" className="border rounded-md px-2 py-2 w-1/2" />
                <input value={h.value} onChange={e => updateHeader(h.id, 'value', e.target.value)} placeholder="Value" className="border rounded-md px-2 py-2 w-1/2" />
                <button onClick={() => removeHeader(h.id)} className="px-3 rounded-md border">×</button>
              </div>
            ))}
            <button onClick={addHeader} className="px-3 py-1 rounded-md border">Add header</button>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Body (JSON)</div>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} className="w-full border rounded-md p-2 font-mono text-sm" placeholder='{"key":"value"}' />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Response</div>
          <div className="text-sm text-gray-600">Status: {response.status} {response.statusText}</div>
          <pre className="border rounded-md p-3 bg-input overflow-auto max-h-[480px] text-xs">{pretty(response)}</pre>
        </div>
      </div>
    </div>
  )
}

function safeParseJSON(input: string): any | undefined {
  try { return JSON.parse(input) } catch { return undefined }
}

function pretty(obj: unknown) {
  try { return JSON.stringify(obj, null, 2) } catch { return String(obj) }
}


