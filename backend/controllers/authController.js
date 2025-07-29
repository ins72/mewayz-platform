const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    plan: user.plan,
                    status: user.status,
                    profile: user.profile,
                    preferences: user.preferences
                }
            }
        });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, plan = 'Free' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            error: 'User with this email already exists'
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        plan,
        status: 'active' // Auto-activate for now
    });

    // Update login analytics
    user.analytics.lastLogin = new Date();
    user.analytics.loginCount = 1;
    await user.save();

    sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Please provide email and password'
        });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // Check if user is active
    if (user.status !== 'active') {
        return res.status(401).json({
            success: false,
            error: 'Account is not active. Please contact support.'
        });
    }

    // Check if password matches
    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
        // Log failed login attempt
        user.security.loginHistory.push({
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            success: false
        });
        await user.save();

        return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

    // Update login analytics
    user.analytics.lastLogin = new Date();
    user.analytics.loginCount += 1;
    user.security.loginHistory.push({
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
    });
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
                status: user.status,
                profile: user.profile,
                preferences: user.preferences,
                analytics: user.analytics
            }
        }
    });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        'profile.bio': req.body.bio,
        'profile.company': req.body.company,
        'profile.website': req.body.website,
        'profile.location': req.body.location
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key] === undefined) {
            delete fieldsToUpdate[key];
        }
    });

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
                status: user.status,
                profile: user.profile,
                preferences: user.preferences
            }
        }
    });
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
        return res.status(401).json({
            success: false,
            error: 'Password is incorrect'
        });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'There is no user with that email'
        });
    }

    // Get reset token
    const resetToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        // Here you would send the email
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Password reset token',
        //     message
        // });

        res.status(200).json({
            success: true,
            data: 'Email sent'
        });
    } catch (err) {
        user.verification.emailVerificationToken = undefined;
        user.verification.emailVerificationExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return res.status(500).json({
            success: false,
            error: 'Email could not be sent'
        });
    }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        'verification.emailVerificationToken': resetPasswordToken,
        'verification.emailVerificationExpires': { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            error: 'Invalid token'
        });
    }

    // Set new password
    user.password = req.body.password;
    user.verification.emailVerificationToken = undefined;
    user.verification.emailVerificationExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/v1/auth/verifyemail/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
    const verifyEmailToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        'verification.emailVerificationToken': verifyEmailToken,
        'verification.emailVerificationExpires': { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            error: 'Invalid token'
        });
    }

    user.verification.emailVerified = true;
    user.verification.emailVerificationToken = undefined;
    user.verification.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        data: 'Email verified successfully'
    });
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resendverification
// @access  Private
const resendVerification = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (user.verification.emailVerified) {
        return res.status(400).json({
            success: false,
            error: 'Email is already verified'
        });
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification url
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verifyemail/${verificationToken}`;

    const message = `Please verify your email by clicking on the following link: \n\n ${verificationUrl}`;

    try {
        // Here you would send the email
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Email verification',
        //     message
        // });

        res.status(200).json({
            success: true,
            data: 'Verification email sent'
        });
    } catch (err) {
        user.verification.emailVerificationToken = undefined;
        user.verification.emailVerificationExpires = undefined;

        await user.save({ validateBeforeSave: false });

        return res.status(500).json({
            success: false,
            error: 'Email could not be sent'
        });
    }
});

module.exports = {
    register,
    login,
    logout,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
}; 