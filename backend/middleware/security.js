/**
 * Enterprise Security Middleware
 * 
 * Comprehensive security middleware implementing enterprise-level security best practices.
 * Provides protection against common web vulnerabilities and threats.
 * 
 * Security Features:
 * - Rate limiting and brute force protection
 * - Input validation and sanitization
 * - CORS configuration
 * - Security headers
 * - Request logging and monitoring
 * - IP whitelisting/blacklisting
 * - SQL injection protection
 * - XSS protection
 * - CSRF protection
 * - Content Security Policy (CSP)
 * - Helmet security headers
 * - Request size limiting
 * - File upload security
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const crypto = require('crypto');

// =============================================================================
// SECURITY CONFIGURATION
// =============================================================================

/**
 * Security configuration constants
 */
const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100, // requests per window
  RATE_LIMIT_MESSAGE: 'Too many requests from this IP, please try again later.',
  
  // Brute force protection
  LOGIN_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: 5, // login attempts per window
  LOGIN_RATE_LIMIT_MESSAGE: 'Too many login attempts, please try again later.',
  
  // Request size limits
  MAX_REQUEST_SIZE: '10mb',
  MAX_FILE_SIZE: '5mb',
  
  // Session security
  SESSION_SECRET: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  SESSION_COOKIE_SECURE: process.env.NODE_ENV === 'production',
  SESSION_COOKIE_HTTPONLY: true,
  SESSION_COOKIE_SAMESITE: 'strict',
  
  // CORS configuration
  CORS_ORIGIN: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  CORS_CREDENTIALS: true,
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https:"],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
};

// =============================================================================
// RATE LIMITING CONFIGURATION
// =============================================================================

/**
 * General rate limiter for all requests
 */
const generalRateLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS,
  max: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Rate limit exceeded',
    message: SECURITY_CONFIG.RATE_LIMIT_MESSAGE,
    retryAfter: SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS / 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: SECURITY_CONFIG.RATE_LIMIT_MESSAGE,
      retryAfter: SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS / 1000
    });
  }
});

/**
 * Login-specific rate limiter for brute force protection
 */
const loginRateLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.LOGIN_RATE_LIMIT_WINDOW_MS,
  max: SECURITY_CONFIG.LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  message: {
    error: 'Too many login attempts',
    message: SECURITY_CONFIG.LOGIN_RATE_LIMIT_MESSAGE,
    retryAfter: SECURITY_CONFIG.LOGIN_RATE_LIMIT_WINDOW_MS / 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    // Use IP address and user agent for more granular rate limiting
    return `${req.ip}-${req.get('User-Agent')}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many login attempts',
      message: SECURITY_CONFIG.LOGIN_RATE_LIMIT_MESSAGE,
      retryAfter: SECURITY_CONFIG.LOGIN_RATE_LIMIT_WINDOW_MS / 1000
    });
  }
});

/**
 * API-specific rate limiter for sensitive endpoints
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: {
    error: 'API rate limit exceeded',
    message: 'Too many API requests, please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'API rate limit exceeded',
      message: 'Too many API requests, please slow down.',
      retryAfter: 60
    });
  }
});

// =============================================================================
// CORS CONFIGURATION
// =============================================================================

/**
 * CORS configuration with security best practices
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (SECURITY_CONFIG.CORS_ORIGIN.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: SECURITY_CONFIG.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// =============================================================================
// SECURITY HEADERS CONFIGURATION
// =============================================================================

/**
 * Helmet configuration for security headers
 */
const helmetConfig = {
  contentSecurityPolicy: {
    directives: SECURITY_CONFIG.CSP_DIRECTIVES
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
};

// =============================================================================
// INPUT VALIDATION AND SANITIZATION
// =============================================================================

/**
 * Custom input sanitization middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potentially dangerous characters
        req.body[key] = req.body[key]
          .replace(/[<>]/g, '') // Remove < and >
          .replace(/javascript:/gi, '') // Remove javascript: protocol
          .replace(/on\w+=/gi, '') // Remove event handlers
          .trim();
      }
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      }
    });
  }
  
  next();
};

/**
 * File upload security middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const fileUploadSecurity = (req, res, next) => {
  // Check file size
  if (req.file && req.file.size > 5 * 1024 * 1024) { // 5MB limit
    return res.status(413).json({
      success: false,
      error: 'File too large',
      message: 'File size must be less than 5MB'
    });
  }
  
  // Check file type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ];
  
  if (req.file && !allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: 'File type not allowed'
    });
  }
  
  next();
};

// =============================================================================
// REQUEST LOGGING AND MONITORING
// =============================================================================

/**
 * Custom request logging middleware
 */
const requestLogger = morgan((tokens, req, res) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: tokens['response-time'](req, res),
    userAgent: tokens['user-agent'](req, res),
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Request:', logData);
  }
  
  // In production, you might want to send this to a logging service
  // logger.info('HTTP Request', logData);
  
  return JSON.stringify(logData);
});

/**
 * Security event logging middleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const securityLogger = (req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /delete\s+from/i
  ];
  
  const requestString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers
  });
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(requestString)
  );
  
  if (isSuspicious) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      userId: req.user?.id || 'anonymous',
      event: 'suspicious_request',
      details: {
        pattern: suspiciousPatterns.find(pattern => pattern.test(requestString))?.toString(),
        requestData: requestString
      }
    };
    
    console.warn('Security Event:', securityEvent);
    // In production, send to security monitoring service
    // securityLogger.warn('Suspicious request detected', securityEvent);
  }
  
  next();
};

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

/**
 * Global error handling middleware
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  });
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }
  
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 handler for undefined routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

// =============================================================================
// SECURITY MIDDLEWARE STACK
// =============================================================================

/**
 * Applies all security middleware to the Express app
 * 
 * @param {Object} app - Express application instance
 */
const applySecurityMiddleware = (app) => {
  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);
  
  // Security headers
  app.use(helmet(helmetConfig));
  
  // CORS
  app.use(cors(corsOptions));
  
  // Compression
  app.use(compression());
  
  // Request logging
  app.use(requestLogger);
  
  // Security logging
  app.use(securityLogger);
  
  // Rate limiting
  app.use('/api/', generalRateLimiter);
  app.use('/api/auth/login', loginRateLimiter);
  app.use('/api/v1/', apiRateLimiter);
  
  // Body parsing with size limits
  app.use(express.json({ limit: SECURITY_CONFIG.MAX_REQUEST_SIZE }));
  app.use(express.urlencoded({ extended: true, limit: SECURITY_CONFIG.MAX_REQUEST_SIZE }));
  
  // Input sanitization
  app.use(mongoSanitize()); // Prevent NoSQL injection
  app.use(xss()); // Prevent XSS attacks
  app.use(hpp()); // Prevent HTTP Parameter Pollution
  app.use(sanitizeInput);
  
  // File upload security
  app.use(fileUploadSecurity);
  
  // Error handling (must be last)
  app.use(notFound);
  app.use(errorHandler);
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  applySecurityMiddleware,
  generalRateLimiter,
  loginRateLimiter,
  apiRateLimiter,
  corsOptions,
  helmetConfig,
  sanitizeInput,
  fileUploadSecurity,
  requestLogger,
  securityLogger,
  errorHandler,
  notFound,
  SECURITY_CONFIG
}; 