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

export default router;