import { useEffect, useState } from 'react'
import { getMe, login, logout, signup } from '../lib/api'

export function AuthPanel() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')

  useEffect(() => {
    getMe().then((r: any) => setUser(r?.user || null)).catch(() => {})
  }, [])

  async function onLogin(e: any) {
    e.preventDefault()
    setError('')
    try {
      const r = await login({ email, password })
      setUser(r.user)
      setEmail(''); setPassword('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function onSignup(e: any) {
    e.preventDefault()
    setError('')
    try {
      await signup({ email, password, name })
      const r = await login({ email, password })
      setUser(r.user)
      setEmail(''); setPassword(''); setName('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function onLogout() {
    await logout()
    setUser(null)
  }

  if (user) {
    return (
      <div className='flex items-center gap-3'>
        <div className='text-sm text-gray-700'>Signed in as {user.email}</div>
        <button onClick={onLogout} className='border rounded-md px-3 py-1'>Logout</button>
      </div>
    )
  }

  return (
    <form onSubmit={mode === 'login' ? onLogin : onSignup} className='flex items-center gap-2'>
      {mode === 'signup' && (
        <input value={name} onChange={e => setName(e.target.value)} placeholder='Name' className='border rounded-md px-2 py-1' />
      )}
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder='Email' className='border rounded-md px-2 py-1' />
      <input type='password' value={password} onChange={e => setPassword(e.target.value)} placeholder='Password' className='border rounded-md px-2 py-1' />
      <button type='submit' className='bg-black text-white rounded-md px-3 py-1'>{mode === 'login' ? 'Login' : 'Sign up'}</button>
      <button type='button' onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className='text-sm underline'>{mode === 'login' ? 'Create account' : 'Have account? Login'}</button>
      {error && <div className='text-red-600 text-sm ml-2'>{error}</div>}
    </form>
  )
}


