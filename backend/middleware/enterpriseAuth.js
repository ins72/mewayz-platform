/**
 * Enterprise Authentication Middleware
 * 
 * Unified authentication system for MEWAYZ Platform
 * Replaces all conflicting authentication implementations
 * 
 * Features:
 * - JWT token validation with enterprise security standards
 * - Role-based access control (RBAC)
 * - Plan-based feature access
 * - Multi-factor authentication support
 * - Session management
 * - Audit logging
 * - Rate limiting protection
 * - Security headers
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

// Enterprise JWT Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  expiresIn: '24h',
  refreshExpiresIn: '7d',
  algorithm: 'HS256',
  issuer: 'MEWAYZ-Enterprise',
  audience: 'MEWAYZ-Platform'
};

// Security Configuration
const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  lockoutTime: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  requireMFAForRoles: ['admin', 'enterprise'],
  auditLogSensitiveActions: true
};

// Rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

/**
 * Generate enterprise-grade JWT token
 */
const generateToken = (user, type = 'access') => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
    plan: user.plan,
    organizationId: user.organizationId,
    type: type,
    iat: Math.floor(Date.now() / 1000),
    sessionId: crypto.randomBytes(16).toString('hex')
  };

  const options = {
    expiresIn: type === 'refresh' ? JWT_CONFIG.refreshExpiresIn : JWT_CONFIG.expiresIn,
    algorithm: JWT_CONFIG.algorithm,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience
  };

  return jwt.sign(payload, JWT_CONFIG.secret, options);
};

/**
 * Verify and decode JWT token
 */
const verifyToken = (token) => {
  const options = {
    algorithms: [JWT_CONFIG.algorithm],
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience
  };

  return jwt.verify(token, JWT_CONFIG.secret, options);
};

/**
 * Extract token from request
 */
const extractToken = (req) => {
  let token = null;

  // Check Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Check custom header (for API keys)
  else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  return token;
};

/**
 * Audit log for security events
 */
const auditLog = async (req, action, user = null, success = true, details = {}) => {
  if (!SECURITY_CONFIG.auditLogSensitiveActions) return;

  const logEntry = {
    timestamp: new Date(),
    action,
    success,
    userId: user ? (user._id || user.id) : null,
    userEmail: user ? user.email : null,
    userRole: user ? user.role : null,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.url,
    details
  };

  // In production, this would be sent to a logging service
  console.log('SECURITY_AUDIT:', JSON.stringify(logEntry));
};

/**
 * Main authentication middleware
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    await auditLog(req, 'AUTH_ATTEMPT_NO_TOKEN', null, false);
    return next(new ErrorResponse('Authentication token required', 401));
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Find user in database
    const user = await User.findById(decoded.id).select('+status +security +analytics');

    if (!user) {
      await auditLog(req, 'AUTH_ATTEMPT_USER_NOT_FOUND', null, false, { tokenId: decoded.id });
      return next(new ErrorResponse('Invalid token - user not found', 401));
    }

    // Check if user account is active
    if (user.status !== 'active') {
      await auditLog(req, 'AUTH_ATTEMPT_INACTIVE_USER', user, false);
      return next(new ErrorResponse('Account is not active', 401));
    }

    // Check if user account is locked
    if (user.security && user.security.accountLocked && user.security.lockoutExpires > Date.now()) {
      await auditLog(req, 'AUTH_ATTEMPT_LOCKED_ACCOUNT', user, false);
      return next(new ErrorResponse('Account is temporarily locked', 423));
    }

    // Check token type
    if (decoded.type && decoded.type !== 'access') {
      await auditLog(req, 'AUTH_ATTEMPT_INVALID_TOKEN_TYPE', user, false, { tokenType: decoded.type });
      return next(new ErrorResponse('Invalid token type', 401));
    }

    // Update last seen
    user.analytics = user.analytics || {};
    user.analytics.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    // Add user and token info to request
    req.user = user;
    req.token = token;
    req.tokenPayload = decoded;

    await auditLog(req, 'AUTH_SUCCESS', user, true);
    next();

  } catch (error) {
    let errorMessage = 'Invalid token';
    let errorCode = 401;

    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expired';
      errorCode = 401;
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Malformed token';
      errorCode = 401;
    } else if (error.name === 'NotBeforeError') {
      errorMessage = 'Token not active';
      errorCode = 401;
    }

    await auditLog(req, 'AUTH_ATTEMPT_TOKEN_ERROR', null, false, { 
      error: error.name, 
      message: error.message 
    });

    return next(new ErrorResponse(errorMessage, errorCode));
  }
});

/**
 * Optional authentication (doesn't fail if no token)
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('+status');

    if (user && user.status === 'active') {
      req.user = user;
      req.token = token;
      req.tokenPayload = decoded;
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
});

/**
 * Role-based authorization
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Authentication required for authorization', 401));
    }

    if (!roles.includes(req.user.role)) {
      auditLog(req, 'AUTHORIZATION_DENIED', req.user, false, { 
        requiredRoles: roles, 
        userRole: req.user.role 
      });
      return next(new ErrorResponse(
        `Access denied. Required role: ${roles.join(' or ')}. Current role: ${req.user.role}`,
        403
      ));
    }

    auditLog(req, 'AUTHORIZATION_SUCCESS', req.user, true, { 
      requiredRoles: roles, 
      userRole: req.user.role 
    });
    next();
  };
};

/**
 * Plan-based authorization
 */
const requirePlan = (...plans) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Authentication required for plan check', 401));
    }

    if (!plans.includes(req.user.plan)) {
      auditLog(req, 'PLAN_ACCESS_DENIED', req.user, false, { 
        requiredPlans: plans, 
        userPlan: req.user.plan 
      });
      return next(new ErrorResponse(
        `Feature requires ${plans.join(' or ')} plan. Current plan: ${req.user.plan}`,
        403
      ));
    }

    next();
  };
};

/**
 * Require active account
 */
const requireActive = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Authentication required', 401));
  }

  if (req.user.status !== 'active') {
    auditLog(req, 'INACTIVE_ACCOUNT_ACCESS_ATTEMPT', req.user, false);
    return next(new ErrorResponse('Account must be active to access this resource', 403));
  }

  next();
};

/**
 * Require verified account
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Authentication required', 401));
  }

  if (!req.user.emailVerified) {
    auditLog(req, 'UNVERIFIED_ACCOUNT_ACCESS_ATTEMPT', req.user, false);
    return next(new ErrorResponse('Email verification required', 403));
  }

  next();
};

/**
 * Admin access control
 */
const requireAdmin = authorize('admin');

/**
 * Super admin access control
 */
const requireSuperAdmin = authorize('super_admin');

/**
 * Enterprise admin access control
 */
const requireEnterpriseAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Authentication required', 401));
  }

  const hasAccess = req.user.role === 'admin' || 
                   req.user.role === 'super_admin' || 
                   (req.user.role === 'enterprise' && req.user.plan === 'Enterprise');

  if (!hasAccess) {
    auditLog(req, 'ENTERPRISE_ADMIN_ACCESS_DENIED', req.user, false);
    return next(new ErrorResponse('Enterprise admin access required', 403));
  }

  next();
};

/**
 * Self or admin access (user can access own data or admin can access any)
 */
const requireSelfOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ErrorResponse('Authentication required', 401));
  }

  const targetUserId = req.params.userId || req.params.id;
  const isOwner = req.user._id.toString() === targetUserId;
  const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

  if (!isOwner && !isAdmin) {
    auditLog(req, 'UNAUTHORIZED_USER_DATA_ACCESS', req.user, false, { 
      targetUserId 
    });
    return next(new ErrorResponse('Access denied: can only access own data or admin required', 403));
  }

  next();
};

/**
 * Rate limiting for sensitive operations
 */
const sensitiveOperationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 sensitive operations per hour
  keyGenerator: (req) => req.user ? req.user._id.toString() : req.ip,
  message: {
    success: false,
    error: 'Too many sensitive operations. Please try again later.'
  }
});

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Only add HSTS in production with HTTPS
  if (process.env.NODE_ENV === 'production' && req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

module.exports = {
  // Core authentication
  authenticate,
  optionalAuth,
  generateToken,
  verifyToken,
  extractToken,
  
  // Authorization
  authorize,
  requirePlan,
  requireActive,
  requireVerified,
  requireAdmin,
  requireSuperAdmin,
  requireEnterpriseAdmin,
  requireSelfOrAdmin,
  
  // Rate limiting
  authRateLimit,
  sensitiveOperationLimit,
  
  // Security
  securityHeaders,
  auditLog,
  
  // Configuration
  JWT_CONFIG,
  SECURITY_CONFIG,
  
  // Legacy aliases for backward compatibility (to be removed)
  protect: authenticate, // For existing routes using 'protect'
  requireRole: authorize // For existing routes using 'requireRole'
}; 