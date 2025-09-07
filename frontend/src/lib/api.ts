export const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000'

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : (await res.text() as any)
  if (!res.ok) throw new Error(data?.error || res.statusText)
  return data as T
}

export async function getMe() {
  try { return await api('/api/auth/me', { method: 'GET' }) } catch { return null }
}

export async function login(payload: { email: string; password: string }) {
  return api('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export async function signup(payload: { email: string; password: string; name?: string }) {
  return api('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) })
}

export async function logout() {
  return api('/api/auth/logout', { method: 'POST' })
}

export async function saveRequest(payload: any) {
  return api('/api/requests/save', { method: 'POST', body: JSON.stringify(payload) })
}

export async function fetchSaved(params?: { page?: number; limit?: number }) {
  const q = new URLSearchParams()
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  return api(`/api/requests/saved${q.size ? `?${q.toString()}` : ''}`, { method: 'GET' })
}

