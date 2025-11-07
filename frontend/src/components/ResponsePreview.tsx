import { useState } from 'react';
import { Button } from './ui/button';
import { Eye, Code2, Globe, Copy, Check, Braces } from 'lucide-react';

interface ResponsePreviewProps {
  data: unknown;
  headers?: Record<string, string>;
  status?: number;
  statusText?: string;
}

export function ResponsePreview({
  data,
  headers,
  status,
  statusText,
}: ResponsePreviewProps) {
  const [viewMode, setViewMode] = useState<'raw' | 'preview'>('raw');
  const [copied, setCopied] = useState(false);

  const contentType = (headers?.['content-type'] || '').toLowerCase();
  const isHtml =
    contentType.includes('text/html') || contentType.includes('html');
  const isJson =
    contentType.includes('application/json') || contentType.includes('json');


  const copyToClipboard = async () => {
    try {
      const textContent =
        typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-muted-foreground';
    if (status >= 200 && status < 300)
      return 'text-green-600 dark:text-green-400';
    if (status >= 300 && status < 400)
      return 'text-yellow-600 dark:text-yellow-400';
    if (status >= 400 && status < 500)
      return 'text-orange-600 dark:text-orange-400';
    if (status >= 500) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const renderRawContent = () => {
    const content =
      typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    return (
      <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground overflow-hidden">
        {content}
      </pre>
    );
  };

  const renderPreview = () => {
    if (isHtml && typeof data === 'string') {
      return (
        <iframe
          srcDoc={data}
          className="w-full h-[600px] bg-white dark:bg-gray-900"
          sandbox="allow-same-origin allow-scripts"
          title="HTML Preview"
        />
      );
    }

    if (isJson) {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        return (
          <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground overflow-hidden">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        );
      } catch {
        return renderRawContent();
      }
    }

    return renderRawContent();
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Response</span>
          {status && (
            <div
              className={`text-sm font-mono px-2 py-1 rounded ${getStatusColor(
                status
              )}`}
            >
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
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-xs rounded-r-none ${
                viewMode === 'raw'
                  ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setViewMode('raw')}
            >
              <Code2 className="h-3 w-3 mr-1" />
              Raw
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 text-xs rounded-l-none ${
                viewMode === 'preview'
                  ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90'
                  : 'hover:bg-muted'
              }`}
              onClick={() => setViewMode('preview')}
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
        <div className="w-full">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Response Headers
          </h4>
          <div className="border rounded-md p-2 bg-muted/30 max-h-32 overflow-auto w-full">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words overflow-hidden">
              {Object.entries(headers)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n')}
            </pre>
          </div>
        </div>
      )}

      {/* Response Body */}
      <div className="w-full">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">
          Response Body
        </h4>
        {viewMode === 'preview' && isHtml ? (
          // HTML preview in iframe - full size container
          <div className="border rounded-md overflow-hidden bg-muted/30 w-full">
            <iframe
              srcDoc={typeof data === 'string' ? data : ''}
              className="w-full h-[600px] border-0 bg-white dark:bg-gray-900"
              sandbox="allow-same-origin allow-scripts"
              title="HTML Preview"
            />
          </div>
        ) : (
          // Normal container with scroll for other content
          <div className="border rounded-md p-3 bg-muted/30 max-h-96 overflow-y-auto overflow-x-hidden w-full">
            {viewMode === 'preview' ? renderPreview() : renderRawContent()}
          </div>
        )}
      </div>
    </div>
  );
}
