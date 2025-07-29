const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments();

    let query = User.find();

    // Search functionality
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query = query.find({
            $or: [
                { name: searchRegex },
                { email: searchRegex },
                { 'profile.company': searchRegex }
            ]
        });
    }

    // Filter by role
    if (req.query.role) {
        query = query.find({ role: req.query.role });
    }

    // Filter by plan
    if (req.query.plan) {
        query = query.find({ plan: req.query.plan });
    }

    // Filter by status
    if (req.query.status) {
        query = query.find({ status: req.query.status });
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',');
        const sortOrder = {};
        sortBy.forEach(item => {
            if (item.startsWith('-')) {
                sortOrder[item.substring(1)] = -1;
            } else {
                sortOrder[item] = 1;
            }
        });
        query = query.sort(sortOrder);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    query = query.skip(startIndex).limit(limit);

    // Execute query
    const users = await query.select('-password');

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: users.length,
        pagination,
        data: users
    });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private
const getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Check if user is requesting their own data or is admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to access this user data'
        });
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Create user (Admin only)
// @route   POST /api/v1/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: user.plan,
            status: user.status
        }
    });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Check if user is updating their own data or is admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Not authorized to update this user'
        });
    }

    // Prevent non-admin users from updating sensitive fields
    if (req.user.role !== 'admin') {
        delete req.body.role;
        delete req.body.plan;
        delete req.body.status;
        delete req.body.analytics;
        delete req.body.security;
        delete req.body.verification;
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).select('-password');

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === req.params.id) {
        return res.status(400).json({
            success: false,
            error: 'Cannot delete your own account'
        });
    }

    await user.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get user statistics (Admin only)
// @route   GET /api/v1/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res, next) => {
    const stats = await User.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                },
                premiumUsers: {
                    $sum: { $cond: [{ $in: ['$plan', ['Pro', 'Enterprise']] }, 1, 0] }
                },
                enterpriseUsers: {
                    $sum: { $cond: [{ $eq: ['$plan', 'Enterprise'] }, 1, 0] }
                }
            }
        }
    ]);

    const planStats = await User.aggregate([
        {
            $group: {
                _id: '$plan',
                count: { $sum: 1 }
            }
        }
    ]);

    const roleStats = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    const statusStats = await User.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const recentUsers = await User.find()
        .sort('-createdAt')
        .limit(5)
        .select('name email plan status createdAt');

    res.status(200).json({
        success: true,
        data: {
            overview: stats[0] || {
                totalUsers: 0,
                activeUsers: 0,
                premiumUsers: 0,
                enterpriseUsers: 0
            },
            planStats,
            roleStats,
            statusStats,
            recentUsers
        }
    });
});

// @desc    Get user analytics (Admin only)
// @route   GET /api/v1/users/analytics
// @access  Private/Admin
const getUserAnalytics = asyncHandler(async (req, res, next) => {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
        case '7d':
            dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
            break;
        case '30d':
            dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
            break;
        case '90d':
            dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
            break;
        case '1y':
            dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
            break;
    }

    const userGrowth = await User.aggregate([
        {
            $match: {
                createdAt: dateFilter
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: { $dayOfMonth: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
    ]);

    const topUsers = await User.find()
        .sort({ 'analytics.totalRevenue': -1 })
        .limit(10)
        .select('name email analytics.totalRevenue analytics.productsCreated analytics.coursesCreated');

    const loginActivity = await User.aggregate([
        {
            $unwind: '$security.loginHistory'
        },
        {
            $match: {
                'security.loginHistory.timestamp': dateFilter
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$security.loginHistory.timestamp' },
                    month: { $month: '$security.loginHistory.timestamp' },
                    day: { $dayOfMonth: '$security.loginHistory.timestamp' }
                },
                logins: { $sum: 1 },
                successfulLogins: {
                    $sum: { $cond: ['$security.loginHistory.success', 1, 0] }
                }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            userGrowth,
            topUsers,
            loginActivity
        }
    });
});

// @desc    Bulk update users (Admin only)
// @route   PUT /api/v1/users/bulk
// @access  Private/Admin
const bulkUpdateUsers = asyncHandler(async (req, res, next) => {
    const { userIds, updates } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'User IDs array is required'
        });
    }

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Updates object is required'
        });
    }

    const result = await User.updateMany(
        { _id: { $in: userIds } },
        { $set: updates },
        { runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: {
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        }
    });
});

// @desc    Bulk delete users (Admin only)
// @route   DELETE /api/v1/users/bulk
// @access  Private/Admin
const bulkDeleteUsers = asyncHandler(async (req, res, next) => {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'User IDs array is required'
        });
    }

    // Prevent admin from deleting themselves
    if (userIds.includes(req.user.id)) {
        return res.status(400).json({
            success: false,
            error: 'Cannot delete your own account'
        });
    }

    const result = await User.deleteMany({ _id: { $in: userIds } });

    res.status(200).json({
        success: true,
        data: {
            deletedCount: result.deletedCount
        }
    });
});

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserStats,
    getUserAnalytics,
    bulkUpdateUsers,
    bulkDeleteUsers
}; 