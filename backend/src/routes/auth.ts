import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

// Zod validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Helper function to create JWT token
const createToken = (userId: string, email: string) => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not defined');
  }
  return jwt.sign({ userId, email }, secret, { expiresIn: '7d' });
};

// EMAIL/PASSWORD AUTHENTICATION

// 1. Signup endpoint
router.post('/signup', async (req: any, res: any) => {
  try {
    // Validate request body
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.issues 
      });
    }

    const { email, password, name } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name: name || null 
      },
    });

    // Create JWT token and set HttpOnly cookie
    const token = createToken(user.id, user.email);
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ 
      id: user.id, 
      email: user.email, 
      name: user.name 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Login endpoint
router.post('/login', async (req: any, res: any) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.issues 
      });
    }

    const { email, password } = validationResult.data;
    
    // Find user and verify password
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token and set HttpOnly cookie
    const token = createToken(user.id, user.email);
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Logout endpoint
router.post('/logout', (req: any, res: any) => {
  res.clearCookie('auth-token');
  res.json({ message: 'Logged out successfully' });
});

// 4. Check auth status endpoint
router.get('/me', async (req: any, res: any) => {
  try {
    const token = req.cookies['auth-token'];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Authentication configuration error' });
    }

    const decoded = jwt.verify(token, secret) as { userId: string; email: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// GOOGLE OAUTH

// OAuth providers status
router.get('/providers', async (req: any, res: any) => {
  try {
    const providers = {
      google: {
        enabled: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
        name: 'Google',
        icon: 'google',
        color: '#4285F4',
        url: '/api/auth/google'
      }
    };

    res.json({ providers });
  } catch (error) {
    console.error('Error getting OAuth providers:', error);
    res.status(500).json({ error: 'Failed to get OAuth providers' });
  }
});

// Google OAuth initiation
router.get('/google', (req: any, res: any) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const scope = 'email profile';
  
  if (!clientId) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  res.redirect(authUrl);
});

// Google OAuth callback
router.get('/google/callback', async (req: any, res: any) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect('http://localhost:5173/login?error=oauth_failed');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/google/callback`,
      }),
    });

    const tokens = await tokenResponse.json() as any;

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', tokens);
      return res.redirect('http://localhost:5173/login?error=oauth_failed');
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userResponse.json() as any;

    if (!userResponse.ok) {
      console.error('Google user info failed:', userInfo);
      return res.redirect('http://localhost:5173/login?error=oauth_failed');
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        accounts: {
          some: {
            provider: 'google',
            providerAccountId: userInfo.id,
          },
        },
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          image: userInfo.picture,
          emailVerified: new Date(),
          accounts: {
            create: {
              type: 'oauth',
              provider: 'google',
              providerAccountId: userInfo.id,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expires_at: Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600),
              token_type: 'Bearer',
              scope: 'email profile',
            },
          },
        },
      });
    } else {
      // Update existing account tokens
      await prisma.account.updateMany({
        where: {
          userId: user.id,
          provider: 'google',
          providerAccountId: userInfo.id,
        },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600),
        },
      });
    }

    // Create JWT token
    const token = createToken(user.id, user.email);
    
    // Set HttpOnly cookie
    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend dashboard
    res.redirect('http://localhost:5173/dashboard');
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect('http://localhost:5173/login?error=oauth_failed');
  }
});

export default router;
