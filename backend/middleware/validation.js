const Joi = require('joi');
const { errorResponse } = require('../utils/errorResponse');

// Standard validation schemas following enterprise security standards
const validationSchemas = {
    // User Management Schemas
    userRegistration: Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .required()
            .messages({
                'string.pattern.base': 'Name must only contain letters and spaces',
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name cannot exceed 50 characters'
            }),
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: true } })
            .max(255)
            .lowercase()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address'
            }),
        password: Joi.string()
            .min(8)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                'string.min': 'Password must be at least 8 characters long'
            }),
        role: Joi.string()
            .valid('user', 'admin', 'moderator')
            .default('user'),
        organization: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Organization ID must be a valid MongoDB ObjectId'
            })
    }),

    userUpdate: Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .optional(),
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: true } })
            .max(255)
            .lowercase()
            .optional(),
        role: Joi.string()
            .valid('user', 'admin', 'moderator')
            .optional(),
        isActive: Joi.boolean().optional()
    }),

    passwordChange: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string()
            .min(8)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .required()
            .messages({
                'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('newPassword'))
            .required()
            .messages({
                'any.only': 'Password confirmation must match new password'
            })
    }),

    // Product Management Schemas
    productCreate: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.min': 'Product name must be at least 2 characters long',
                'string.max': 'Product name cannot exceed 100 characters'
            }),
        description: Joi.string()
            .max(2000)
            .optional(),
        price: Joi.number()
            .positive()
            .precision(2)
            .max(999999.99)
            .required()
            .messages({
                'number.positive': 'Price must be a positive number',
                'number.precision': 'Price cannot have more than 2 decimal places',
                'number.max': 'Price cannot exceed $999,999.99'
            }),
        category: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'Category ID must be a valid MongoDB ObjectId'
            }),
        inventory: Joi.object({
            quantity: Joi.number().integer().min(0).required(),
            lowStockThreshold: Joi.number().integer().min(1).optional(),
            sku: Joi.string().max(50).optional()
        }).optional(),
        images: Joi.array()
            .items(Joi.string().uri())
            .max(10)
            .optional(),
        tags: Joi.array()
            .items(Joi.string().max(30))
            .max(20)
            .optional(),
        isActive: Joi.boolean().default(true)
    }),

    // Customer Management Schemas
    customerCreate: Joi.object({
        firstName: Joi.string()
            .min(1)
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .required(),
        lastName: Joi.string()
            .min(1)
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .required(),
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: true } })
            .max(255)
            .lowercase()
            .required(),
        phone: Joi.string()
            .pattern(/^\+?[1-9]\d{1,14}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Phone number must be in international format'
            }),
        address: Joi.object({
            street: Joi.string().max(100).optional(),
            city: Joi.string().max(50).optional(),
            state: Joi.string().max(50).optional(),
            zipCode: Joi.string().max(20).optional(),
            country: Joi.string().length(2).uppercase().optional()
        }).optional(),
        dateOfBirth: Joi.date()
            .max('now')
            .optional(),
        company: Joi.string().max(100).optional(),
        notes: Joi.string().max(1000).optional()
    }),

    // Order Management Schemas
    orderCreate: Joi.object({
        customerId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required(),
        items: Joi.array()
            .items(Joi.object({
                productId: Joi.string()
                    .pattern(/^[0-9a-fA-F]{24}$/)
                    .required(),
                quantity: Joi.number().integer().min(1).required(),
                price: Joi.number().positive().precision(2).required()
            }))
            .min(1)
            .required(),
        shippingAddress: Joi.object({
            street: Joi.string().max(100).required(),
            city: Joi.string().max(50).required(),
            state: Joi.string().max(50).required(),
            zipCode: Joi.string().max(20).required(),
            country: Joi.string().length(2).uppercase().required()
        }).required(),
        paymentMethod: Joi.string()
            .valid('credit_card', 'paypal', 'bank_transfer', 'crypto')
            .required(),
        notes: Joi.string().max(500).optional()
    }),

    // Analytics Query Schemas
    analyticsQuery: Joi.object({
        startDate: Joi.date()
            .max('now')
            .optional(),
        endDate: Joi.date()
            .min(Joi.ref('startDate'))
            .max('now')
            .optional(),
        type: Joi.string()
            .valid('sales', 'customers', 'products', 'orders', 'leads', 'revenue', 'traffic')
            .optional(),
        granularity: Joi.string()
            .valid('hourly', 'daily', 'weekly', 'monthly')
            .optional(),
        filters: Joi.object({
            category: Joi.string().optional(),
            region: Joi.string().optional(),
            customerSegment: Joi.string().optional()
        }).optional()
    }),

    // Organization Management Schemas
    organizationCreate: Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .required(),
        domain: Joi.string()
            .domain()
            .optional(),
        settings: Joi.object({
            timezone: Joi.string().optional(),
            currency: Joi.string().length(3).uppercase().optional(),
            language: Joi.string().length(2).lowercase().optional()
        }).optional(),
        subscription: Joi.object({
            plan: Joi.string()
                .valid('free', 'pro', 'enterprise')
                .required(),
            billing: Joi.object({
                email: Joi.string().email().required(),
                address: Joi.object({
                    street: Joi.string().required(),
                    city: Joi.string().required(),
                    state: Joi.string().required(),
                    zipCode: Joi.string().required(),
                    country: Joi.string().length(2).uppercase().required()
                }).required()
            }).optional()
        }).optional()
    }),

    // Content Management Schemas
    blogPostCreate: Joi.object({
        title: Joi.string()
            .min(5)
            .max(200)
            .required(),
        content: Joi.string()
            .min(50)
            .required(),
        excerpt: Joi.string()
            .max(500)
            .optional(),
        featuredImage: Joi.string().uri().optional(),
        tags: Joi.array()
            .items(Joi.string().max(30))
            .max(10)
            .optional(),
        category: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional(),
        status: Joi.string()
            .valid('draft', 'published', 'scheduled', 'archived')
            .default('draft'),
        publishDate: Joi.date()
            .min('now')
            .optional(),
        seo: Joi.object({
            metaTitle: Joi.string().max(60).optional(),
            metaDescription: Joi.string().max(160).optional(),
            focusKeyword: Joi.string().max(50).optional()
        }).optional()
    }),

    // File Upload Schema
    fileUpload: Joi.object({
        filename: Joi.string()
            .pattern(/^[a-zA-Z0-9\-_\.]+$/)
            .max(255)
            .required(),
        mimeType: Joi.string()
            .valid(
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf', 'text/plain', 'text/csv',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            .required(),
        size: Joi.number()
            .integer()
            .max(50 * 1024 * 1024) // 50MB limit
            .required()
    }),

    // Search Query Schema
    searchQuery: Joi.object({
        q: Joi.string()
            .min(1)
            .max(200)
            .pattern(/^[a-zA-Z0-9\s\-_\.@]+$/)
            .required()
            .messages({
                'string.pattern.base': 'Search query contains invalid characters'
            }),
        page: Joi.number().integer().min(1).max(1000).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20),
        sortBy: Joi.string()
            .valid('relevance', 'date', 'name', 'price', 'rating')
            .default('relevance'),
        filters: Joi.object({
            category: Joi.string().optional(),
            priceMin: Joi.number().positive().optional(),
            priceMax: Joi.number().positive().min(Joi.ref('priceMin')).optional(),
            rating: Joi.number().min(1).max(5).optional()
        }).optional()
    })
};

// Main validation middleware factory
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        // Determine data source
        let data;
        switch (source) {
            case 'query':
                data = req.query;
                break;
            case 'params':
                data = req.params;
                break;
            case 'headers':
                data = req.headers;
                break;
            default:
                data = req.body;
        }

        // Validate against schema
        const { error, value } = schema.validate(data, {
            abortEarly: false, // Return all validation errors
            stripUnknown: true, // Remove unknown fields
            convert: true // Convert string numbers to numbers, etc.
        });

        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));

            return res.status(400).json(
                errorResponse(
                    400,
                    'Validation Error',
                    'Request data validation failed',
                    { errors: validationErrors }
                )
            );
        }

        // Replace original data with validated/sanitized data
        switch (source) {
            case 'query':
                req.query = value;
                break;
            case 'params':
                req.params = value;
                break;
            case 'headers':
                req.headers = value;
                break;
            default:
                req.body = value;
        }

        next();
    };
};

// MongoDB ObjectId validation
const validateObjectId = (field = 'id') => {
    return validate(Joi.object({
        [field]: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': `${field} must be a valid MongoDB ObjectId`
            })
    }), 'params');
};

// Pagination validation
const validatePagination = validate(Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
}), 'query');

// Rate limiting validation for security
const validateRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const identifier = req.ip + (req.user?.id || 'anonymous');
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old entries
        if (requests.has(identifier)) {
            const userRequests = requests.get(identifier).filter(time => time > windowStart);
            requests.set(identifier, userRequests);
        } else {
            requests.set(identifier, []);
        }
        
        const userRequests = requests.get(identifier);
        
        if (userRequests.length >= maxRequests) {
            return res.status(429).json(
                errorResponse(
                    429,
                    'Rate Limit Exceeded',
                    `Too many requests. Maximum ${maxRequests} requests per ${windowMs / 1000} seconds allowed.`,
                    {
                        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
                    }
                )
            );
        }
        
        userRequests.push(now);
        next();
    };
};

// SQL injection protection (additional layer)
const sanitizeSQL = (req, res, next) => {
    const sqlInjectionPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
        /(\'|\"|\;|\-\-|\/*|\*/)/g,
        /(\bxp_cmdshell\b|\bsp_\w+\b)/gi
    ];

    const checkForSQLInjection = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                for (const pattern of sqlInjectionPatterns) {
                    if (pattern.test(obj[key])) {
                        return true;
                    }
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (checkForSQLInjection(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    };

    if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query) || checkForSQLInjection(req.params)) {
        return res.status(400).json(
            errorResponse(
                400,
                'Security Violation',
                'Request contains potentially malicious content',
                { blocked: 'SQL injection attempt detected' }
            )
        );
    }

    next();
};

// XSS protection
const sanitizeXSS = (req, res, next) => {
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi,
        /onmouseover\s*=/gi
    ];

    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        
        let sanitized = str;
        xssPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        return sanitized
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    };

    const sanitizeObject = (obj) => {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = sanitizeString(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObject(obj[key]);
            }
        }
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);

    next();
};

module.exports = {
    validate,
    validateObjectId,
    validatePagination,
    validateRateLimit,
    sanitizeSQL,
    sanitizeXSS,
    schemas: validationSchemas
}; 