import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();

// Middleware to verify JWT token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.cookies['auth-token'];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Authentication configuration error' });
    }

    const decoded = jwt.verify(token, secret) as { userId: string; email: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Zod validation schemas
const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const updateCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
});

const createCollectionRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  method: z.string().min(1, 'Method is required'),
  url: z.string().url('Invalid URL format'),
  headers: z.record(z.string(), z.string()).optional().default({}),
  body: z.any().optional(),
});

// Create a new collection
router.post('/', verifyToken, async (req: any, res: any) => {
  try {
    const validationResult = createCollectionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues
      });
    }

    const { name, description } = validationResult.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        userId: req.userId,
      },
    });

    res.status(201).json(collection);
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
});

// Get all collections for user
router.get('/', verifyToken, async (req: any, res: any) => {
  try {
    const collections = await prisma.collection.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: { collectionRequests: true }
        }
      }
    });

    res.json(collections);
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// Get a specific collection
router.get('/:id', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const collectionId = parseInt(id);

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
      include: {
        collectionRequests: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    res.json(collection);
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

// Update a collection
router.put('/:id', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const collectionId = parseInt(id);

    const validationResult = updateCollectionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues
      });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const updatedCollection = await prisma.collection.update({
      where: {
        id: collectionId,
      },
      data: validationResult.data,
    });

    res.json(updatedCollection);
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
});

// Delete a collection
router.delete('/:id', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const collectionId = parseInt(id);

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    await prisma.collection.delete({
      where: {
        id: collectionId,
      },
    });

    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
});

// Create a request in a collection
router.post('/:id/requests', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const collectionId = parseInt(id);

    const validationResult = createCollectionRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues
      });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const { name, method, url, headers, body } = validationResult.data;

    const collectionRequest = await prisma.collectionRequest.create({
      data: {
        name,
        method: method.toUpperCase(),
        url,
        headers: headers as any,
        body: body as any,
        collectionId,
      },
    });

    res.status(201).json(collectionRequest);
  } catch (error) {
    console.error('Create collection request error:', error);
    res.status(500).json({ error: 'Failed to create collection request' });
  }
});

// Get all requests in a collection
router.get('/:id/requests', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const collectionId = parseInt(id);

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const requests = await prisma.collectionRequest.findMany({
      where: {
        collectionId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(requests);
  } catch (error) {
    console.error('Get collection requests error:', error);
    res.status(500).json({ error: 'Failed to fetch collection requests' });
  }
});

// Update a request in a collection
router.put('/:id/requests/:requestId', verifyToken, async (req: any, res: any) => {
  try {
    const { id, requestId } = req.params;
    const collectionId = parseInt(id);
    const collectionRequestId = parseInt(requestId);

    const validationResult = createCollectionRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues
      });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const collectionRequest = await prisma.collectionRequest.findFirst({
      where: {
        id: collectionRequestId,
        collectionId,
      },
    });

    if (!collectionRequest) {
      return res.status(404).json({ error: 'Collection request not found' });
    }

    const { name, method, url, headers, body } = validationResult.data;

    const updatedRequest = await prisma.collectionRequest.update({
      where: {
        id: collectionRequestId,
      },
      data: {
        name,
        method: method.toUpperCase(),
        url,
        headers: headers as any,
        body: body as any,
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Update collection request error:', error);
    res.status(500).json({ error: 'Failed to update collection request' });
  }
});

// Delete a request from a collection
router.delete('/:id/requests/:requestId', verifyToken, async (req: any, res: any) => {
  try {
    const { id, requestId } = req.params;
    const collectionId = parseInt(id);
    const collectionRequestId = parseInt(requestId);

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const collectionRequest = await prisma.collectionRequest.findFirst({
      where: {
        id: collectionRequestId,
        collectionId,
      },
    });

    if (!collectionRequest) {
      return res.status(404).json({ error: 'Collection request not found' });
    }

    await prisma.collectionRequest.delete({
      where: {
        id: collectionRequestId,
      },
    });

    res.json({ message: 'Collection request deleted successfully' });
  } catch (error) {
    console.error('Delete collection request error:', error);
    res.status(500).json({ error: 'Failed to delete collection request' });
  }
});

// Execute a collection request
router.post('/:id/requests/:requestId/execute', verifyToken, async (req: any, res: any) => {
  try {
    const { id, requestId } = req.params;
    const collectionId = parseInt(id);
    const collectionRequestId = parseInt(requestId);

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const collectionRequest = await prisma.collectionRequest.findFirst({
      where: {
        id: collectionRequestId,
        collectionId,
      },
    });

    if (!collectionRequest) {
      return res.status(404).json({ error: 'Collection request not found' });
    }

    // Execute the request directly using the proxy logic
    const isLocalhostUrl = (url: string) => {
      try {
        const parsed = new URL(url);
        return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
      } catch {
        return false;
      }
    };

    let result: any = {};
    
    try {
      if (isLocalhostUrl(collectionRequest.url)) {
        // Direct fetch for localhost URLs
        const response = await fetch(collectionRequest.url, {
          method: collectionRequest.method,
          headers: { Accept: 'application/json', ...(collectionRequest.headers as Record<string, string>) },
          body: collectionRequest.body ? JSON.stringify(collectionRequest.body) : undefined,
        });
        
        const data = response.headers.get('content-type')?.includes('application/json') 
          ? await response.json() 
          : await response.text();
        
        const headers: Record<string, string> = {};
        response.headers.forEach((v, k) => (headers[k] = v));
        
        result = { 
          status: response.status, 
          statusText: response.statusText, 
          headers, 
          data 
        };
      } else {
        // Use proxy for remote URLs
        const proxyResponse = await fetch(`${process.env.API_BASE || 'http://localhost:3000'}/api/proxy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: collectionRequest.url,
            method: collectionRequest.method,
            headers: collectionRequest.headers,
            body: collectionRequest.body,
          }),
        });

        if (proxyResponse.ok) {
          result = await proxyResponse.json();
        } else {
          result = { error: 'Proxy request failed' };
        }
      }
    } catch (error) {
      result = { error: error instanceof Error ? error.message : 'Request failed' };
    }
    
    res.json({
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
      data: result.data,
      error: result.error,
      request: {
        id: collectionRequest.id,
        name: collectionRequest.name,
        method: collectionRequest.method,
        url: collectionRequest.url,
      }
    });
  } catch (error) {
    console.error('Execute collection request error:', error);
    res.status(500).json({ error: 'Failed to execute collection request' });
  }
});

// Duplicate a collection request
router.post('/:id/requests/:requestId/duplicate', verifyToken, async (req: any, res: any) => {
  try {
    const { id, requestId } = req.params;
    const collectionId = parseInt(id);
    const collectionRequestId = parseInt(requestId);

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const originalRequest = await prisma.collectionRequest.findFirst({
      where: {
        id: collectionRequestId,
        collectionId,
      },
    });

    if (!originalRequest) {
      return res.status(404).json({ error: 'Collection request not found' });
    }

    const duplicatedRequest = await prisma.collectionRequest.create({
      data: {
        name: `${originalRequest.name} (Copy)`,
        method: originalRequest.method,
        url: originalRequest.url,
        headers: originalRequest.headers as any,
        body: originalRequest.body as any,
        collectionId,
      },
    });

    res.status(201).json(duplicatedRequest);
  } catch (error) {
    console.error('Duplicate collection request error:', error);
    res.status(500).json({ error: 'Failed to duplicate collection request' });
  }
});

// Export collection
router.get('/:id/export', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const collectionId = parseInt(id);

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
      include: {
        collectionRequests: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    const exportData = {
      name: collection.name,
      description: collection.description,
      createdAt: collection.createdAt,
      requests: collection.collectionRequests.map(request => ({
        name: request.name,
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
      })),
    };

    res.json(exportData);
  } catch (error) {
    console.error('Export collection error:', error);
    res.status(500).json({ error: 'Failed to export collection' });
  }
});

// Import collection
router.post('/import', verifyToken, async (req: any, res: any) => {
  try {
    const { data, name } = req.body;

    if (!data || !data.requests) {
      return res.status(400).json({ error: 'Invalid collection data' });
    }

    const collection = await prisma.collection.create({
      data: {
        name: name || data.name || 'Imported Collection',
        description: data.description || '',
        userId: req.userId,
      },
    });

    const requests = await Promise.all(
      data.requests.map((requestData: any) =>
        prisma.collectionRequest.create({
          data: {
            name: requestData.name,
            method: requestData.method,
            url: requestData.url,
            headers: requestData.headers || {},
            body: requestData.body,
            collectionId: collection.id,
          },
        })
      )
    );

    res.status(201).json({
      ...collection,
      requests,
    });
  } catch (error) {
    console.error('Import collection error:', error);
    res.status(500).json({ error: 'Failed to import collection' });
  }
});

// Get collection statistics
router.get('/stats', verifyToken, async (req: any, res: any) => {
  try {
    const stats = await prisma.collection.aggregate({
      where: {
        userId: req.userId,
      },
      _count: {
        id: true,
      },
    });

    const requestsCount = await prisma.collectionRequest.count({
      where: {
        collection: {
          userId: req.userId,
        },
      },
    });

    res.json({
      totalCollections: stats._count.id,
      totalRequests: requestsCount,
    });
  } catch (error) {
    console.error('Get collection stats error:', error);
    res.status(500).json({ error: 'Failed to get collection statistics' });
  }
});

// Execute multiple requests in a collection
router.post('/:id/requests/bulk-execute', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { requestIds } = req.body;
    const collectionId = parseInt(id);

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ error: 'Request IDs array is required' });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Get all the requests to execute
    const requests = await prisma.collectionRequest.findMany({
      where: {
        id: { in: requestIds },
        collectionId,
      },
    });

    if (requests.length === 0) {
      return res.status(404).json({ error: 'No requests found' });
    }

    // Execute all requests in parallel
    const executeRequest = async (request: any) => {
      const isLocalhostUrl = (url: string) => {
        try {
          const parsed = new URL(url);
          return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
        } catch {
          return false;
        }
      };

      try {
        let result: any = {};
        
        if (isLocalhostUrl(request.url)) {
          // Direct fetch for localhost URLs
          const response = await fetch(request.url, {
            method: request.method,
            headers: { Accept: 'application/json', ...(request.headers as Record<string, string>) },
            body: request.body ? JSON.stringify(request.body) : undefined,
          });
          
          const data = response.headers.get('content-type')?.includes('application/json') 
            ? await response.json() 
            : await response.text();
          
          const headers: Record<string, string> = {};
          response.headers.forEach((v, k) => (headers[k] = v));
          
          result = { 
            status: response.status, 
            statusText: response.statusText, 
            headers, 
            data 
          };
        } else {
          // Use proxy for remote URLs
          const proxyResponse = await fetch(`${process.env.API_BASE || 'http://localhost:3000'}/api/proxy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: request.url,
              method: request.method,
              headers: request.headers,
              body: request.body,
            }),
          });

          if (proxyResponse.ok) {
            result = await proxyResponse.json();
          } else {
            result = { error: 'Proxy request failed' };
          }
        }

        return {
          requestId: request.id,
          requestName: request.name,
          requestUrl: request.url,
          requestMethod: request.method,
          success: true,
          ...result
        };
      } catch (error) {
        return {
          requestId: request.id,
          requestName: request.name,
          requestUrl: request.url,
          requestMethod: request.method,
          success: false,
          error: error instanceof Error ? error.message : 'Request failed'
        };
      }
    };

    const results = await Promise.all(requests.map(executeRequest));

    res.json({
      collectionId,
      totalRequests: requests.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    console.error('Bulk execute error:', error);
    res.status(500).json({ error: 'Failed to execute requests' });
  }
});

// Delete multiple requests in a collection
router.delete('/:id/requests/bulk-delete', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { requestIds } = req.body;
    const collectionId = parseInt(id);

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ error: 'Request IDs array is required' });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Delete all the requests
    const deleteResult = await prisma.collectionRequest.deleteMany({
      where: {
        id: { in: requestIds },
        collectionId,
      },
    });

    res.json({
      collectionId,
      deletedCount: deleteResult.count,
      deletedRequestIds: requestIds
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete requests' });
  }
});

// Update multiple requests in a collection
router.put('/:id/requests/bulk-update', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { requestIds, updates } = req.body;
    const collectionId = parseInt(id);

    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ error: 'Request IDs array is required' });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Updates object is required' });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: req.userId,
      },
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Update all the requests
    const updateResult = await prisma.collectionRequest.updateMany({
      where: {
        id: { in: requestIds },
        collectionId,
      },
      data: updates,
    });

    // Get the updated requests
    const updatedRequests = await prisma.collectionRequest.findMany({
      where: {
        id: { in: requestIds },
        collectionId,
      },
    });

    res.json({
      collectionId,
      updatedCount: updateResult.count,
      updatedRequests
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update requests' });
  }
});

export default router;