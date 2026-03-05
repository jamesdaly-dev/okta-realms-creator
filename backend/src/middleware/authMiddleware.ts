import { Request, Response, NextFunction } from 'express';
import OktaJwtVerifier from '@okta/jwt-verifier';

let oktaJwtVerifier: OktaJwtVerifier | null = null;

function getJwtVerifier(): OktaJwtVerifier {
  if (!oktaJwtVerifier) {
    oktaJwtVerifier = new OktaJwtVerifier({
      issuer: `https://${process.env.OKTA_DOMAIN}/oauth2/default`,
    });
  }
  return oktaJwtVerifier;
}

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email?: string;
        groups?: string[];
      };
    }
  }
}

/**
 * Middleware to verify JWT access tokens from Okta
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header missing' });
      return;
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      res.status(401).json({ error: 'Invalid authorization format. Expected: Bearer <token>' });
      return;
    }

    // Verify the JWT
    const jwt = await getJwtVerifier().verifyAccessToken(token, 'api://default');

    // Extract user information from token
    req.user = {
      sub: jwt.claims.sub as string,
      email: jwt.claims.email as string,
      groups: jwt.claims.groups as string[] || [],
    };

    console.log(`✓ Authenticated user: ${req.user.email || req.user.sub}`);
    next();
  } catch (error: any) {
    console.error('Token verification failed:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has realm admin permissions
 * Checks for specific group membership or admin role
 */
export const requireRealmAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userGroups = req.user.groups || [];

    // Check if user is in any admin group
    // Customize these group names based on your Okta configuration
    const adminGroups = [
      'RealmAdmins',
      'Administrators',
    ];

    const isAdmin = adminGroups.some(group => userGroups.includes(group));

    if (!isAdmin) {
      console.warn(`⚠️ Unauthorized access attempt by user: ${req.user.email || req.user.sub}`);
      res.status(403).json({
        error: 'Insufficient permissions. Realm management requires administrator role.',
        requiredGroups: adminGroups.filter(g => g !== 'Everyone'),
      });
      return;
    }

    console.log(`✓ Authorized user: ${req.user.email || req.user.sub}`);
    next();
  } catch (error: any) {
    console.error('Authorization check failed:', error.message);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};
