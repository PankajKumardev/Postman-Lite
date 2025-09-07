import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = Router();

// Zod validation schemas
const saveRequestSchema = z.object({
  method: z.string().min(1, 'Method is required'),
  url: z.string().url('Invalid URL format'),
  headers: z.record(z.string(), z.string()).optional().default({}),
  body: z.any().optional(),
  responseStatus: z.number().optional(),
  responseBody: z.any().optional(),
  name: z.string().optional(), // Optional name for the request
});

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

// Save request to database (requires authentication)
router.post('/save', verifyToken, async (req: any, res: any) => {
  try {
    // Validate request body
    const validationResult = saveRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues
      });
    }

    const { method, url, headers, body, responseStatus, responseBody, name } = validationResult.data;

    // Create request in database
    const savedRequest = await prisma.request.create({
      data: {
        method: method.toUpperCase(),
        url,
        headers: headers as any,
        body: body as any,
        responseStatus,
        responseBody: responseBody as any,
        userId: req.userId,
      },
    });

    res.status(201).json({
      id: savedRequest.id,
      method: savedRequest.method,
      url: savedRequest.url,
      name: name || `${savedRequest.method} ${new URL(savedRequest.url).pathname}`,
      createdAt: savedRequest.createdAt,
      message: 'Request saved successfully'
    });

  } catch (error) {
    console.error('Save request error:', error);
    res.status(500).json({ error: 'Failed to save request' });
  }
});

// Get user's saved requests (requires authentication)
router.get('/saved', verifyToken, async (req: any, res: any) => {
  try {
    const { page = 1, limit = 20, method, search } = req.query;
    
    // Build where clause
    const where: any = {
      userId: req.userId
    };

    if (method) {
      where.method = method.toUpperCase();
    }

    if (search) {
      where.OR = [
        { url: { contains: search as string, mode: 'insensitive' } },
        { method: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get requests with pagination
    const requests = await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      select: {
        id: true,
        method: true,
        url: true,
        headers: true,
        body: true,
        responseStatus: true,
        responseBody: true,
        createdAt: true,
      }
    });

    // Get total count for pagination
    const totalCount = await prisma.request.count({ where });

    res.json({
      requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get saved requests error:', error);
    res.status(500).json({ error: 'Failed to fetch saved requests' });
  }
});

// Get a specific saved request (requires authentication)
router.get('/saved/:id', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const request = await prisma.request.findFirst({
      where: {
        id: Number(id),
        userId: req.userId
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Delete a saved request (requires authentication)
router.delete('/saved/:id', verifyToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const request = await prisma.request.findFirst({
      where: {
        id: Number(id),
        userId: req.userId
      }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    await prisma.request.delete({
      where: { id: Number(id) }
    });

    res.json({ message: 'Request deleted successfully' });

  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// Get request statistics (requires authentication)
router.get('/stats', verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.userId;

    // Get basic stats
    const totalRequests = await prisma.request.count({
      where: { userId }
    });

    const methodStats = await prisma.request.groupBy({
      by: ['method'],
      where: { userId },
      _count: { method: true }
    });

    const recentRequests = await prisma.request.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        method: true,
        url: true,
        responseStatus: true,
        createdAt: true
      }
    });

    res.json({
      totalRequests,
      methodBreakdown: methodStats.map((stat: any) => ({
        method: stat.method,
        count: stat._count.method
      })),
      recentRequests
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
