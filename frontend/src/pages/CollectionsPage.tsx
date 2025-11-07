import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import {
  FolderPlus,
  Folder,
  FileText,
  Plus,
  MoreHorizontal,
  Edit,
  Trash,
  Play,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  Search,
  CheckSquare,
  Square,
  Zap,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  createCollection,
  getCollections,
  deleteCollection,
  createCollectionRequest,
  getCollectionRequests,
  updateCollection,
  deleteCollectionRequest,
  updateCollectionRequest,
  executeCollectionRequest,
  exportCollection,
  importCollection,
  bulkExecuteCollectionRequests,
  bulkDeleteCollectionRequests,
  bulkUpdateCollectionRequests,
} from '../lib/api';
import { ResponsePreview } from '../components/ResponsePreview';

interface Collection {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  _count?: {
    collectionRequests: number;
  };
}

interface Request {
  id: number;
  name: string;
  method: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface CollectionWithRequests extends Collection {
  requests: Request[];
  isExpanded: boolean;
}

export function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionWithRequests[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionWithRequests | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isEditCollectionOpen, setIsEditCollectionOpen] = useState(false);
  const [isEditRequestOpen, setIsEditRequestOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  // Response state for request execution
  const [response, setResponse] = useState<{
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    data?: unknown;
    error?: string;
  }>({});
  const [executing, setExecuting] = useState(false);

  // Bulk execution state
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [bulkExecuting, setBulkExecuting] = useState(false);
  const [bulkResults, setBulkResults] = useState<any[]>([]);
  const [selectedBulkResult, setSelectedBulkResult] = useState<any>(null);

  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Request editing state
  const [editRequestData, setEditRequestData] = useState({
    name: '',
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '' }],
    body: '',
  });

  // Bulk edit state
  const [bulkEditData, setBulkEditData] = useState({
    name: '',
    method: '',
    url: '',
    headers: [{ key: '', value: '' }],
    body: '',
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const data = await getCollections();
      // Expand with request data
      const collectionsWithRequests = await Promise.all(
        (data ?? []).map(async (collection: Collection) => {
          const requests = await getCollectionRequests(collection.id);
          return {
            ...collection,
            requests: requests ?? [],
            isExpanded: false,
          };
        })
      );
      setCollections(collectionsWithRequests);
      setError('');
    } catch (err: any) {
      setError('Failed to load collections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const newCollection = await createCollection({
        name: newCollectionName,
        description: newCollectionDescription,
      });

      setCollections([
        {
          ...newCollection,
          requests: [],
          isExpanded: false,
        },
        ...collections,
      ]);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setIsCreating(false);
    } catch (err: any) {
      setError('Failed to create collection');
      console.error(err);
    }
  };

  const handleDeleteCollection = async (id: number) => {
    try {
      await deleteCollection(id);
      setCollections(collections.filter((collection) => collection.id !== id));
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
        setSelectedRequest(null);
      }
    } catch (err: any) {
      setError('Failed to delete collection');
      console.error(err);
    }
  };

  const handleEditCollection = async (collection: CollectionWithRequests) => {
    try {
      await updateCollection(collection.id, {
        name: collection.name,
        description: collection.description,
      });
      setIsEditCollectionOpen(false);
    } catch (err: any) {
      setError('Failed to update collection');
      console.error(err);
    }
  };

  const handleCreateRequest = async () => {
    if (!selectedCollection || !editRequestData.name.trim()) return;

    try {
      const newRequest = await createCollectionRequest(selectedCollection.id, {
        name: editRequestData.name,
        method: editRequestData.method,
        url: editRequestData.url,
        headers: Object.fromEntries(
          editRequestData.headers
            .filter((h) => h.key && h.value)
            .map((h) => [h.key, h.value])
        ),
        body: editRequestData.body || undefined,
      });

      const updatedCollections = (collections ?? []).map((col) =>
        col.id === selectedCollection.id
          ? { ...col, requests: [...col.requests, newRequest] }
          : col
      );
      setCollections(updatedCollections);
      setIsEditRequestOpen(false);
    } catch (err: any) {
      setError('Failed to create request');
      console.error(err);
    }
  };

  const handleEditRequest = async () => {
    if (!selectedCollection || !selectedRequest) return;

    try {
      await updateCollectionRequest(selectedCollection.id, selectedRequest.id, {
        name: editRequestData.name,
        method: editRequestData.method,
        url: editRequestData.url,
        headers: Object.fromEntries(
          editRequestData.headers
            .filter((h) => h.key && h.value)
            .map((h) => [h.key, h.value])
        ),
        body: editRequestData.body || undefined,
      });

      const updatedCollections = (collections ?? []).map((col) =>
        col.id === selectedCollection.id
          ? {
              ...col,
              requests: (col.requests ?? []).map((req) =>
                req.id === selectedRequest.id
                  ? { ...req, ...editRequestData }
                  : req
              ),
            }
          : col
      );
      setCollections(updatedCollections);
      setIsEditRequestOpen(false);
    } catch (err: any) {
      setError('Failed to update request');
      console.error(err);
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    if (!selectedCollection) return;

    try {
      await deleteCollectionRequest(selectedCollection.id, requestId);
      const updatedCollections = (collections ?? []).map((col) =>
        col.id === selectedCollection.id
          ? {
              ...col,
              requests: col.requests.filter((req) => req.id !== requestId),
            }
          : col
      );
      setCollections(updatedCollections);
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
      }
    } catch (err: any) {
      setError('Failed to delete request');
      console.error(err);
    }
  };

  const handleExecuteRequest = async (request: Request) => {
    try {
      setExecuting(true);
      setResponse({}); // Clear previous response
      const result = await executeCollectionRequest(
        selectedCollection!.id,
        request.id
      );

      // Set the response data to display
      setResponse({
        status: result.status,
        statusText: result.statusText,
        headers: result.headers,
        data: result.data,
        error: result.error,
      });
    } catch (err: any) {
      setResponse({ error: err.message || 'Failed to execute request' });
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  const handleExportCollection = async (collection: CollectionWithRequests) => {
    try {
      const exportData = await exportCollection(collection.id);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collection.name.replace(/\s+/g, '_')}_collection.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to export collection');
      console.error(err);
    }
  };

  const handleImportCollection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      const newCollection = await importCollection({
        data: importData,
        name: importData.name || file.name.replace('.json', ''),
      });

      setCollections([
        {
          ...newCollection,
          requests: importData.requests || [],
          isExpanded: false,
        },
        ...collections,
      ]);
      setIsImportOpen(false);
    } catch (err: any) {
      setError('Failed to import collection');
      console.error(err);
    }
  };

  const toggleRequestSelection = (requestId: number) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const selectAllRequests = () => {
    if (!selectedCollection) return;
    setSelectedRequests(
      (selectedCollection.requests ?? []).map((req) => req.id)
    );
  };

  const clearSelection = () => {
    setSelectedRequests([]);
    setBulkResults([]);
    setSelectedBulkResult(null);
  };

  const handleBulkExecute = async () => {
    if (!selectedCollection || selectedRequests.length === 0) return;

    try {
      setBulkExecuting(true);
      setBulkResults([]);
      setSelectedBulkResult(null);

      const result = await bulkExecuteCollectionRequests(
        selectedCollection.id,
        selectedRequests
      );
      setBulkResults(result.results);
    } catch (err: any) {
      setError('Failed to execute requests');
      console.error(err);
    } finally {
      setBulkExecuting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedCollection || selectedRequests.length === 0) return;

    try {
      await bulkDeleteCollectionRequests(
        selectedCollection.id,
        selectedRequests
      );

      // Update the collections state
      const updatedCollections = (collections ?? []).map((col) =>
        col.id === selectedCollection.id
          ? {
              ...col,
              requests: (col.requests ?? []).filter(
                (req) => !selectedRequests.includes(req.id)
              ),
            }
          : col
      );
      setCollections(updatedCollections);

      // Clear selection and close dialog
      clearSelection();
      setIsDeleteConfirmOpen(false);

      // Clear selected request if it was deleted
      if (selectedRequest && selectedRequests.includes(selectedRequest.id)) {
        setSelectedRequest(null);
        setResponse({});
      }
    } catch (err: any) {
      setError('Failed to delete requests');
      console.error(err);
    }
  };

  const handleBulkEdit = async () => {
    if (!selectedCollection || selectedRequests.length === 0) return;

    try {
      // Prepare updates object with only non-empty fields
      const updates: any = {};
      if (bulkEditData.name.trim()) updates.name = bulkEditData.name;
      if (bulkEditData.method && bulkEditData.method !== 'KEEP_EXISTING') {
        updates.method = bulkEditData.method;
      }
      if (bulkEditData.url.trim()) updates.url = bulkEditData.url;
      if (bulkEditData.headers.some((h) => h.key && h.value)) {
        updates.headers = Object.fromEntries(
          bulkEditData.headers
            .filter((h) => h.key && h.value)
            .map((h) => [h.key, h.value])
        );
      }
      if (bulkEditData.body.trim()) updates.body = bulkEditData.body;

      await bulkUpdateCollectionRequests(
        selectedCollection.id,
        selectedRequests,
        updates
      );

      // Update the collections state
      const updatedCollections = collections.map((col) =>
        col.id === selectedCollection.id
          ? {
              ...col,
              requests: col.requests.map((req) =>
                selectedRequests.includes(req.id)
                  ? { ...req, ...updates, updatedAt: new Date().toISOString() }
                  : req
              ),
            }
          : col
      );
      setCollections(updatedCollections);

      // Clear selection and close dialog
      clearSelection();
      setIsBulkEditOpen(false);

      // Clear bulk edit data
      setBulkEditData({
        name: '',
        method: '',
        url: '',
        headers: [{ key: '', value: '' }],
        body: '',
      });
    } catch (err: any) {
      setError('Failed to update requests');
      console.error(err);
    }
  };

  const toggleCollectionExpanded = (collectionId: number) => {
    setCollections(
      (collections ?? []).map((col) =>
        col.id === collectionId ? { ...col, isExpanded: !col.isExpanded } : col
      )
    );
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

  const filteredCollections = (collections ?? []).filter((collection) => {
    const name = collection.name ?? '';
    const desc = collection.description ?? '';
    const term = searchTerm ?? '';
    return (
      name.toLowerCase().includes(term.toLowerCase()) ||
      desc.toLowerCase().includes(term.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Collections</h1>
          <p className="text-muted-foreground">
            Organize your API requests into collections for better management
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="hover:bg-[hsl(var(--muted))] transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Collection</DialogTitle>
                <DialogDescription>
                  Import a Postman collection JSON file
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-file">Select JSON file</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportCollection}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.6)] text-[hsl(var(--secondary-foreground))] transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            New Collection
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md">{error}</div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Collection</CardTitle>
            <CardDescription>
              Group related API requests together for better organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="e.g., User Management APIs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-description">Description</Label>
              <Textarea
                id="collection-description"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Brief description of this collection"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreating(false)}
                className="hover:bg-[hsl(var(--muted))] transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCollection}
                className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.9)] text-[hsl(var(--destructive-foreground))] transition-colors"
              >
                Create Collection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Collections Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-background border border-border">
            <CardHeader className="bg-muted/50 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Folder className="h-5 w-5 text-[hsl(var(--foreground))]" />
                Collections (
                {filteredCollections ? filteredCollections.length : 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(filteredCollections?.length ?? 0) === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No collections found</p>
                </div>
              ) : (
                (filteredCollections ?? []).map((collection) => (
                  <div key={collection.id} className="space-y-1">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedCollection?.id === collection.id
                          ? 'bg-muted'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedCollection(collection);
                        setSelectedRequest(null);
                        setResponse({}); // Clear response when selecting a collection
                        clearSelection(); // Clear bulk selection
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCollectionExpanded(collection.id);
                          }}
                        >
                          {collection.isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Folder className="h-4 w-4 text-[hsl(var(--foreground))]" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {collection.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {collection.requests?.length ?? 0} requests
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleExportCollection(collection)}
                            className="hover:bg-[hsl(var(--muted))] transition-colors"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setIsEditCollectionOpen(true)}
                            className="hover:bg-[hsl(var(--muted))] transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeleteCollection(collection.id)
                            }
                            className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.1)] transition-colors"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {collection.isExpanded && (
                      <div className="ml-6 space-y-1">
                        <div className="text-xs text-muted-foreground mb-2">
                          {collection.requests?.length ?? 0} requests
                        </div>
                        {(collection.requests ?? [])
                          .slice(0, 3)
                          .map((request) => (
                            <div
                              key={request.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors ${
                                selectedRequest?.id === request.id
                                  ? 'bg-muted'
                                  : ''
                              }`}
                              onClick={() => {
                                setSelectedRequest(request);
                                setResponse({}); // Clear previous response when selecting a new request
                              }}
                            >
                              <Badge
                                variant={getMethodVariant(request.method)}
                                className="text-xs"
                              >
                                {request.method}
                              </Badge>
                              <span className="text-sm truncate flex-1">
                                {request.name}
                              </span>
                            </div>
                          ))}
                        {(collection.requests?.length ?? 0) > 3 && (
                          <div className="text-xs text-muted-foreground px-2">
                            +{(collection.requests?.length ?? 0) - 3} more...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request Details */}
        <div className="lg:col-span-2">
          {selectedCollection && selectedRequest ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {selectedRequest.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant={getMethodVariant(selectedRequest.method)}>
                        {selectedRequest.method}
                      </Badge>
                      <span className="font-mono text-sm">
                        {selectedRequest.url}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditRequestData({
                          name: selectedRequest.name,
                          method: selectedRequest.method,
                          url: selectedRequest.url,
                          headers: [{ key: '', value: '' }],
                          body: '',
                        });
                        setIsEditRequestOpen(true);
                      }}
                      className="hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecuteRequest(selectedRequest)}
                      disabled={executing}
                      className="hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      {executing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mr-2" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRequest(selectedRequest.id)}
                      className="hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Created:{' '}
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </div>
                    <div>
                      Updated:{' '}
                      {new Date(selectedRequest.updatedAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Response Section */}
                  {response.status || response.error ? (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold mb-3">Response</h4>
                      <ResponsePreview
                        data={response.data}
                        headers={response.headers}
                        status={response.status}
                        statusText={response.statusText}
                      />
                      {response.error && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                          <p className="text-red-700 dark:text-red-400 text-sm">
                            <strong>Error:</strong> {response.error}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-6 text-center py-8 text-muted-foreground">
                      <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        Click "Run" to execute this request and see the response
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : selectedCollection ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="h-5 w-5" />
                      {selectedCollection.name}
                    </CardTitle>
                    {selectedCollection.description && (
                      <CardDescription>
                        {selectedCollection.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsEditRequestOpen(true)}
                      size="sm"
                      className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.9)] text-[hsl(var(--destructive-foreground))] transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Request
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Bulk Actions */}
                  {(selectedCollection.requests?.length ?? 0) > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={selectAllRequests}
                            disabled={
                              selectedRequests.length ===
                              (selectedCollection.requests?.length ?? 0)
                            }
                            className="hover:bg-[hsl(var(--muted))] transition-colors"
                          >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Select All (
                            {selectedCollection.requests?.length ?? 0})
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearSelection}
                            disabled={selectedRequests.length === 0}
                            className="hover:bg-[hsl(var(--muted))] transition-colors"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            Clear ({selectedRequests.length})
                          </Button>
                        </div>
                        <Button
                          onClick={handleBulkExecute}
                          disabled={
                            selectedRequests.length === 0 || bulkExecuting
                          }
                          className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.6)] text-[hsl(var(--secondary-foreground))] transition-colors"
                        >
                          {bulkExecuting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Running {selectedRequests.length}...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-2" />
                              Run Selected ({selectedRequests.length})
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Selected Requests Actions */}
                      {selectedRequests.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-muted/50 border border-[hsl(var(--border))] rounded-lg">
                          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                            {selectedRequests.length} request
                            {selectedRequests.length > 1 ? 's' : ''} selected
                          </span>
                          <div className="flex gap-2 ml-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsBulkEditOpen(true)}
                              className="border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Selected
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsDeleteConfirmOpen(true)}
                              className="border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.1)] transition-colors"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Selected
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bulk Results */}
                  {(bulkResults?.length ?? 0) > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold">
                        Bulk Execution Results
                      </h4>
                      <div className="space-y-2">
                        {bulkResults.map((result, index) => (
                          <div
                            key={result.requestId || index}
                            className={`group p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                              selectedBulkResult?.requestId === result.requestId
                                ? 'ring-2 ring-primary'
                                : ''
                            } ${
                              result.success
                                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                            }`}
                            onClick={() => setSelectedBulkResult(result)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={getMethodVariant(
                                    result.requestMethod
                                  )}
                                >
                                  {result.requestMethod}
                                </Badge>
                                <span className="font-medium">
                                  {result.requestName}
                                </span>
                              </div>
                              {result.success ? (
                                <Badge
                                  variant="default"
                                  className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                                >
                                  {result.status} {result.statusText}
                                </Badge>
                              ) : (
                                <Badge variant="destructive">Failed</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {result.requestUrl}
                            </div>
                            {result.error && (
                              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                                Error: {result.error}
                              </div>
                            )}
                            <div className="mt-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view full response
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Bulk Result Response */}
                  {selectedBulkResult && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-semibold">
                          Response: {selectedBulkResult.requestName}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBulkResult(null)}
                          className="hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getMethodVariant(
                              selectedBulkResult.requestMethod
                            )}
                          >
                            {selectedBulkResult.requestMethod}
                          </Badge>
                          <span className="font-mono text-sm">
                            {selectedBulkResult.requestUrl}
                          </span>
                        </div>
                        {selectedBulkResult.success ? (
                          <ResponsePreview
                            data={selectedBulkResult.data}
                            headers={selectedBulkResult.headers}
                            status={selectedBulkResult.status}
                            statusText={selectedBulkResult.statusText}
                          />
                        ) : (
                          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-700 dark:text-red-400 font-medium">
                              Request Failed
                            </p>
                            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                              {selectedBulkResult.error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Request List */}
                  <div className="space-y-2">
                    {(selectedCollection.requests ?? []).map((request) => (
                      <div
                        key={request.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedRequest?.id === request.id
                            ? 'bg-muted border-[hsl(var(--border))]'
                            : ''
                        }`}
                        onClick={() => {
                          setSelectedRequest(request);
                          setResponse({}); // Clear previous response when selecting a new request
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRequestSelection(request.id);
                            }}
                          >
                            {selectedRequests.includes(request.id) ? (
                              <CheckSquare className="h-4 w-4 text-[hsl(var(--foreground))]" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                          <Badge
                            variant={getMethodVariant(request.method)}
                            className="text-xs"
                          >
                            {request.method}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {request.name}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono truncate">
                            {request.url}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={executing}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteRequest(request);
                          }}
                        >
                          {executing ? (
                            <div className="w-4 h-4 border border-muted-foreground border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {selectedCollection.requests.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No requests in this collection</p>
                      <Button
                        className="mt-4 bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.9)] text-[hsl(var(--destructive-foreground))] transition-colors"
                        onClick={() => setIsEditRequestOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Request
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a collection to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Collection Dialog */}
      <Dialog
        open={isEditCollectionOpen}
        onOpenChange={setIsEditCollectionOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          {selectedCollection && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-collection-name">Name</Label>
                <Input
                  id="edit-collection-name"
                  value={selectedCollection.name}
                  onChange={(e) =>
                    setSelectedCollection({
                      ...selectedCollection,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-collection-description">Description</Label>
                <Textarea
                  id="edit-collection-description"
                  value={selectedCollection.description || ''}
                  onChange={(e) =>
                    setSelectedCollection({
                      ...selectedCollection,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditCollectionOpen(false)}
                  className="hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleEditCollection(selectedCollection)}
                  className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.9)] text-[hsl(var(--destructive-foreground))] transition-colors"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={isEditRequestOpen} onOpenChange={setIsEditRequestOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest ? 'Edit Request' : 'Create New Request'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="request-name">Request Name</Label>
                <Input
                  id="request-name"
                  value={editRequestData.name}
                  onChange={(e) =>
                    setEditRequestData({
                      ...editRequestData,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Get User Profile"
                />
              </div>
              <div>
                <Label htmlFor="request-method">Method</Label>
                <Select
                  value={editRequestData.method}
                  onValueChange={(value) =>
                    setEditRequestData({
                      ...editRequestData,
                      method: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="HEAD">HEAD</SelectItem>
                    <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="request-url">URL</Label>
              <Input
                id="request-url"
                value={editRequestData.url}
                onChange={(e) =>
                  setEditRequestData({
                    ...editRequestData,
                    url: e.target.value,
                  })
                }
                placeholder="https://api.example.com/users"
              />
            </div>
            <div>
              <Label>Headers</Label>
              <div className="space-y-2">
                {editRequestData.headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) => {
                        const newHeaders = [...editRequestData.headers];
                        newHeaders[index].key = e.target.value;
                        setEditRequestData({
                          ...editRequestData,
                          headers: newHeaders,
                        });
                      }}
                    />
                    <Input
                      placeholder="Header value"
                      value={header.value}
                      onChange={(e) => {
                        const newHeaders = [...editRequestData.headers];
                        newHeaders[index].value = e.target.value;
                        setEditRequestData({
                          ...editRequestData,
                          headers: newHeaders,
                        });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newHeaders = editRequestData.headers.filter(
                          (_, i) => i !== index
                        );
                        setEditRequestData({
                          ...editRequestData,
                          headers: newHeaders,
                        });
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditRequestData({
                      ...editRequestData,
                      headers: [
                        ...editRequestData.headers,
                        { key: '', value: '' },
                      ],
                    });
                  }}
                  className="hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Header
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="request-body">Body (JSON)</Label>
              <Textarea
                id="request-body"
                value={editRequestData.body}
                onChange={(e) =>
                  setEditRequestData({
                    ...editRequestData,
                    body: e.target.value,
                  })
                }
                placeholder='{\n  "key": "value"\n}'
                rows={10}
                className="font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditRequestOpen(false)}
                className="hover:bg-[hsl(var(--muted))] transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={
                  selectedRequest ? handleEditRequest : handleCreateRequest
                }
                className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.9)] text-[hsl(var(--destructive-foreground))] transition-colors"
              >
                {selectedRequest ? 'Update Request' : 'Create Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Selected Requests ({selectedRequests.length})
            </DialogTitle>
            <DialogDescription>
              Update the selected requests. Leave fields empty to keep existing
              values.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-request-name">
                  Request Name (optional)
                </Label>
                <Input
                  id="bulk-request-name"
                  value={bulkEditData.name}
                  onChange={(e) =>
                    setBulkEditData({ ...bulkEditData, name: e.target.value })
                  }
                  placeholder="Leave empty to keep existing names"
                />
              </div>
              <div>
                <Label htmlFor="bulk-request-method">Method (optional)</Label>
                <Select
                  value={bulkEditData.method}
                  onValueChange={(value) =>
                    setBulkEditData({ ...bulkEditData, method: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Keep existing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KEEP_EXISTING">Keep existing</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="HEAD">HEAD</SelectItem>
                    <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="bulk-request-url">URL (optional)</Label>
              <Input
                id="bulk-request-url"
                value={bulkEditData.url}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, url: e.target.value })
                }
                placeholder="Leave empty to keep existing URLs"
              />
            </div>
            <div>
              <Label>Headers (optional)</Label>
              <div className="space-y-2">
                {bulkEditData.headers.map((header, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) => {
                        const newHeaders = [...bulkEditData.headers];
                        newHeaders[index].key = e.target.value;
                        setBulkEditData({
                          ...bulkEditData,
                          headers: newHeaders,
                        });
                      }}
                    />
                    <Input
                      placeholder="Header value"
                      value={header.value}
                      onChange={(e) => {
                        const newHeaders = [...bulkEditData.headers];
                        newHeaders[index].value = e.target.value;
                        setBulkEditData({
                          ...bulkEditData,
                          headers: newHeaders,
                        });
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newHeaders = bulkEditData.headers.filter(
                          (_, i) => i !== index
                        );
                        setBulkEditData({
                          ...bulkEditData,
                          headers: newHeaders,
                        });
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkEditData({
                      ...bulkEditData,
                      headers: [
                        ...bulkEditData.headers,
                        { key: '', value: '' },
                      ],
                    });
                  }}
                  className="hover:bg-[hsl(var(--muted))] transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Header
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="bulk-request-body">Body (optional)</Label>
              <Textarea
                id="bulk-request-body"
                value={bulkEditData.body}
                onChange={(e) =>
                  setBulkEditData({ ...bulkEditData, body: e.target.value })
                }
                placeholder="Leave empty to keep existing bodies or enter JSON"
                rows={8}
                className="font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBulkEditOpen(false)}
                className="hover:bg-[hsl(var(--muted))] transition-colors"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkEdit}
                className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.9)] text-[hsl(var(--destructive-foreground))] transition-colors"
              >
                Update {selectedRequests.length} Request
                {selectedRequests.length > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Requests</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedRequests.length} request
              {selectedRequests.length > 1 ? 's' : ''}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="hover:bg-[hsl(var(--muted))] transition-colors"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="bg-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.9)] text-[hsl(var(--destructive-foreground))] transition-colors"
            >
              Delete {selectedRequests.length} Request
              {selectedRequests.length > 1 ? 's' : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
