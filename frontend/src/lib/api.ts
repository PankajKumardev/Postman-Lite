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

// Collections API
export async function createCollection(payload: { name: string; description?: string }) {
  return api('/api/collections', { method: 'POST', body: JSON.stringify(payload) })
}

export async function getCollections() {
  return api('/api/collections', { method: 'GET' })
}

export async function getCollection(id: number) {
  return api(`/api/collections/${id}`, { method: 'GET' })
}

export async function updateCollection(id: number, payload: { name?: string; description?: string }) {
  return api(`/api/collections/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deleteCollection(id: number) {
  return api(`/api/collections/${id}`, { method: 'DELETE' })
}

export async function createCollectionRequest(collectionId: number, payload: { 
  name: string; 
  method: string; 
  url: string; 
  headers?: Record<string, string>;
  body?: any;
}) {
  return api(`/api/collections/${collectionId}/requests`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function getCollectionRequests(collectionId: number) {
  return api(`/api/collections/${collectionId}/requests`, { method: 'GET' })
}

export async function updateCollectionRequest(collectionId: number, requestId: number, payload: { 
  name: string; 
  method: string; 
  url: string; 
  headers?: Record<string, string>;
  body?: any;
}) {
  return api(`/api/collections/${collectionId}/requests/${requestId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function deleteCollectionRequest(collectionId: number, requestId: number) {
  return api(`/api/collections/${collectionId}/requests/${requestId}`, { method: 'DELETE' })
}