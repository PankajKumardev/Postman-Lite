import { useState } from 'react'
import { Button } from './ui/button'
import { Eye, EyeOff, Code2, Globe, Copy, Check, Braces } from 'lucide-react'

interface ResponsePreviewProps {
  data: unknown
  headers?: Record<string, string>
  status?: number
  statusText?: string
}

export function ResponsePreview({ data, headers, status, statusText }: ResponsePreviewProps) {
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('raw')
  const [copied, setCopied] = useState(false)

  const contentType = headers?.['content-type'] || ''
  const isHtml = contentType.includes('text/html')
  const isJson = contentType.includes('application/json')
  const isText = contentType.includes('text/')

  const copyToClipboard = async () => {
    try {
      const textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      await navigator.clipboard.writeText(textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-muted-foreground'
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400'
    if (status >= 500) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  const renderRawContent = () => {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
    return (
      <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
        {content}
      </pre>
    )
  }

  const renderPreview = () => {
    if (isHtml && typeof data === 'string') {
      return (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <Globe className="h-3 w-3" />
            HTML Preview
          </div>
          <iframe
            srcDoc={data}
            className="w-full h-96 border border-border rounded-md bg-white"
            sandbox="allow-same-origin allow-scripts"
            title="HTML Preview"
          />
        </div>
      )
    }

    if (isJson) {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        return (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
              <Braces className="h-3 w-3" />
              Formatted JSON
            </div>
            <pre className="text-xs font-mono whitespace-pre-wrap text-foreground p-3 bg-muted/20 rounded border">
              {JSON.stringify(parsed, null, 2)}
            </pre>
          </div>
        )
      } catch {
        return renderRawContent()
      }
    }

    if (isText && typeof data === 'string') {
      return (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <Eye className="h-3 w-3" />
            Text Preview
          </div>
          <div className="text-sm whitespace-pre-wrap text-foreground p-3 bg-muted/20 rounded border font-mono">
            {data}
          </div>
        </div>
      )
    }

    // Fallback: try to format as JSON, otherwise show raw
    try {
      const parsed = JSON.parse(typeof data === 'string' ? data : JSON.stringify(data))
      return (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <Braces className="h-3 w-3" />
            Formatted Preview
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap text-foreground p-3 bg-muted/20 rounded border">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      )
    } catch {
      return renderRawContent()
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Response</span>
          {status && (
            <div className={`text-sm font-mono px-2 py-1 rounded ${getStatusColor(status)}`}>
              {status} {statusText}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
          
          {/* Always show preview toggle */}
          <div className="flex border rounded-md">
            <Button
              onClick={() => setViewMode('raw')}
              variant={viewMode === 'raw' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2 text-xs rounded-r-none"
            >
              <Code2 className="h-3 w-3 mr-1" />
              Raw
            </Button>
            <Button
              onClick={() => setViewMode('preview')}
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 px-2 text-xs rounded-l-none"
            >
              {isHtml ? (
                <>
                  <Globe className="h-3 w-3 mr-1" />
                  HTML Preview
                </>
              ) : isJson ? (
                <>
                  <Braces className="h-3 w-3 mr-1" />
                  Formatted
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Response Headers */}
      {headers && Object.keys(headers).length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Response Headers</h4>
          <div className="border rounded-md p-2 bg-muted/30 max-h-32 overflow-auto">
            <pre className="text-xs font-mono">
              {Object.entries(headers)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n')}
            </pre>
          </div>
        </div>
      )}

      {/* Response Body */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Response Body</h4>
        <div className="border rounded-md p-3 bg-muted/30 max-h-96 overflow-auto">
          {viewMode === 'preview' ? renderPreview() : renderRawContent()}
        </div>
      </div>
    </div>
  )
}