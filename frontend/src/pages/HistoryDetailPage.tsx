import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSaved } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { X, Code2, Braces, ArrowLeft } from 'lucide-react';
import { ResponsePreview } from '../components/ResponsePreview';

interface SavedRequest {
  id?: number;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown> | Array<unknown> | null;
  responseStatus?: number;
  responseBody?: string | Record<string, unknown> | Array<unknown> | null;
  responseHeaders?: Record<string, string>;
  createdAt?: string;
}

interface FetchSavedResponse {
  requests: SavedRequest[];
}

export function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<SavedRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'request' | 'response'>('request');
  const [requestView, setRequestView] = useState<'headers' | 'body'>('headers');
  const [responseView, setResponseView] = useState<'headers' | 'body'>('body');

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      const response: FetchSavedResponse = await fetchSaved();
      const foundRequest = response.requests.find(
        (r: SavedRequest) => r.id === parseInt(id || '0')
      );

      if (foundRequest) {
        setRequest(foundRequest);
      } else {
        setError('Request not found');
      }
    } catch (err: unknown) {
      setError('Failed to load request details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

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

  const getMethodVariant = (
    method: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (method) {
      case 'GET':
        return 'default';
      case 'POST':
        return 'default';
      case 'PUT':
        return 'secondary';
      case 'DELETE':
        return 'destructive';
      case 'PATCH':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center space-y-4">
            <div className="text-destructive mb-2">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-destructive font-medium">
              {error || 'Request not found'}
            </p>
            <Button
              onClick={() => navigate('/app/history')}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.9)]"
            >
              Back to History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/app/history')}
            variant="ghost"
            size="icon"
            className="h-9 w-9 hover:bg-[hsl(var(--muted)/.7)]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Request Details</h1>
            <p className="text-sm text-muted-foreground">
              View request and response details
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/app/history')}
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-[hsl(var(--muted)/.7)]"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Card className="flex-1 flex flex-col border-border bg-card">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={getMethodVariant(request.method)}
              className="text-sm font-medium"
            >
              {request.method}
            </Badge>
            <span className="font-mono text-sm text-foreground break-all">
              {request.url}
            </span>
          </div>
          {request.responseStatus && (
            <div
              className={`text-sm font-mono ${getStatusColor(
                request.responseStatus
              )}`}
            >
              Status: {request.responseStatus}
            </div>
          )}
          {request.createdAt && (
            <div className="text-xs text-muted-foreground">
              {new Date(request.createdAt).toLocaleString()}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex border-b border-border bg-muted/30">
            <Button
              variant="ghost"
              className={`rounded-none px-6 py-2.5 font-medium transition-all ${
                activeTab === 'request'
                  ? 'text-foreground bg-background border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('request')}
            >
              Request
            </Button>
            <Button
              variant="ghost"
              className={`rounded-none px-6 py-2.5 font-medium transition-all ${
                activeTab === 'response'
                  ? 'text-foreground bg-background border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('response')}
            >
              Response
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'request' ? (
              <div className="space-y-4">
                <div className="flex gap-2 pb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${
                      requestView === 'headers'
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setRequestView('headers')}
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    Headers
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${
                      requestView === 'body'
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setRequestView('body')}
                  >
                    <Braces className="h-4 w-4 mr-2" />
                    Body
                  </Button>
                </div>

                {requestView === 'headers' ? (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Request Headers
                    </h4>
                    {request.headers &&
                    Object.keys(request.headers).length > 0 ? (
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
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Request Body
                    </h4>
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
                <div className="flex gap-2 pb-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${
                      responseView === 'headers'
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setResponseView('headers')}
                  >
                    <Code2 className="h-4 w-4 mr-2" />
                    Headers
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`${
                      responseView === 'body'
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setResponseView('body')}
                  >
                    <Braces className="h-4 w-4 mr-2" />
                    Body
                  </Button>
                </div>

                {responseView === 'headers' ? (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Response Headers
                    </h4>
                    {request.responseHeaders &&
                    Object.keys(request.responseHeaders).length > 0 ? (
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
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Response Body
                    </h4>
                    {request.responseBody !== undefined &&
                    request.responseBody !== null ? (
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
  );
}
