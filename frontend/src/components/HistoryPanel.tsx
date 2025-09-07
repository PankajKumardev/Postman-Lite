import { useEffect, useState } from 'react'
import { fetchSaved } from '../lib/api'

export function HistoryPanel() {
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSaved().then((r: any) => setItems(r.requests || [])).catch(() => setError('Login to view history'))
  }, [])

  return (
    <div className='space-y-2'>
      <div className='text-sm font-medium'>History (saved)</div>
      {error && <div className='text-xs text-gray-600'>{error}</div>}
      <div className='border rounded-md divide-y'>
        {items.map((r) => (
          <div key={r.id} className='p-2 text-sm flex justify-between gap-3'>
            <div className='font-mono'><span className='font-semibold'>{r.method}</span> {r.url}</div>
            {r.responseStatus != null && <div className='text-gray-600'>{r.responseStatus}</div>}
          </div>
        ))}
        {items.length === 0 && <div className='p-2 text-sm text-gray-600'>No items</div>}
      </div>
    </div>
  )
}


