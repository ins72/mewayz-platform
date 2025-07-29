const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        // Set token from cookie
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role ${req.user.role} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};

// Check if user is active
exports.requireActive = asyncHandler(async (req, res, next) => {
    if (req.user.status !== 'active') {
        return res.status(403).json({
            success: false,
            error: 'Account is not active. Please contact support.'
        });
    }
    next();
});

// Check if user has premium plan
exports.requirePremium = asyncHandler(async (req, res, next) => {
    if (!['Pro', 'Enterprise'].includes(req.user.plan)) {
        return res.status(403).json({
            success: false,
            error: 'Premium plan required to access this feature'
        });
    }
    next();
});

// Check if user has enterprise plan
exports.requireEnterprise = asyncHandler(async (req, res, next) => {
    if (req.user.plan !== 'Enterprise') {
        return res.status(403).json({
            success: false,
            error: 'Enterprise plan required to access this feature'
        });
    }
    next();
});

// Optional authentication (doesn't fail if no token)
exports.optionalAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        } catch (err) {
            // Token is invalid, but we don't fail the request
            req.user = null;
        }
    }

    next();
}); 