import { Router } from 'express';
import axios, { AxiosResponse } from 'axios';
import { z } from 'zod';

const router = Router();

// Zod validation schema for proxy request
const proxyRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']),
  headers: z.record(z.string(), z.string()).optional().default({}),
  body: z.any().optional(),
  timeout: z.number().optional().default(30000), // 30 seconds default
});

// Proxy endpoint to bypass CORS
router.post('/', async (req: any, res: any) => {
  try {
    // Validate request body
    const validationResult = proxyRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.issues
      });
    }

    const { url, method, headers, body, timeout } = validationResult.data;

    // Prepare axios request config
    const axiosConfig: any = {
      method: method.toLowerCase() as any,
      url,
      headers: {
        'User-Agent': 'Postman-Lite/1.0',
        ...headers
      },
      timeout,
      validateStatus: () => true, // Don't throw on any status code
    };

    // Add body for methods that support it
    if (['POST', 'PUT', 'PATCH'].includes(method) && body !== undefined) {
      if (typeof body === 'string') {
        axiosConfig.data = body;
      } else {
        axiosConfig.data = body;
        axiosConfig.headers['Content-Type'] = 'application/json';
      }
    }

    console.log(`🔄 Proxying ${method} request to: ${url}`);

    // Make the request
    const response: AxiosResponse = await axios(axiosConfig);

    // Return response data
    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      config: {
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
        timeout: response.config.timeout
      }
    });

  } catch (error: any) {
    console.error('Proxy error:', error);

    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(502).json({
        error: 'Connection refused',
        message: 'Unable to connect to the target server. Please check the URL and ensure the server is running.',
        code: 'ECONNREFUSED'
      });
    }

    if (error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        error: 'Request timeout',
        message: 'The request timed out. Please try again or increase the timeout value.',
        code: 'ETIMEDOUT'
      });
    }

    if (error.code === 'ENOTFOUND') {
      return res.status(502).json({
        error: 'Host not found',
        message: 'The hostname could not be resolved. Please check the URL.',
        code: 'ENOTFOUND'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Proxy error',
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'UNKNOWN'
    });
  }
});

// Health check for proxy service
router.get('/health', (req: any, res: any) => {
  res.json({
    service: 'Proxy Service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    features: [
      'CORS bypass',
      'Request forwarding',
      'Response formatting',
      'Error handling'
    ]
  });
});

export default router;
