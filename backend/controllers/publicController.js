const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Lead = require('../models/Lead');
const Content = require('../models/Content');
const Testimonial = require('../models/Testimonial');
const Milestone = require('../models/Milestone');

// @desc    Get public statistics
// @route   GET /api/v1/public/stats
// @access  Public
exports.getPublicStats = asyncHandler(async (req, res, next) => {
    const [
        activeUsers,
        totalRevenue,
        totalCustomers,
        totalProducts,
        totalOrders,
        totalLeads,
        countriesServed,
        avgOrderValue
    ] = await Promise.all([
        User.countDocuments({ status: 'active' }),
        Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Customer.countDocuments(),
        Product.countDocuments(),
        Order.countDocuments(),
        Lead.countDocuments(),
        Customer.distinct('address.country'),
        Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
        ])
    ]);

    // Calculate additional metrics
    const conversionRate = totalLeads > 0 ? ((totalCustomers / totalLeads) * 100).toFixed(1) : 0;
    const avgOrderValueResult = avgOrderValue[0]?.avg || 0;

    res.status(200).json({
        success: true,
        data: {
            activeUsers,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalCustomers,
            totalProducts,
            totalOrders,
            totalLeads,
            countriesServed: countriesServed.length,
            avgOrderValue: avgOrderValueResult,
            conversionRate: parseFloat(conversionRate),
            uptime: '99.9%',
            support: '24/7'
        }
    });
});

// @desc    Get public content by key
// @route   GET /api/v1/public/content/:key
// @access  Public
exports.getPublicContent = asyncHandler(async (req, res, next) => {
    const { key } = req.params;
    const { userType, location } = req.query;

    const content = await Content.getByKey(key);

    if (!content) {
        return next(new ErrorResponse(`Content not found with key: ${key}`, 404));
    }

    // Personalize content based on user type and location
    let personalizedContent = content.content;
    
    if (userType && content.content.data.personalization) {
        const personalization = content.content.data.personalization[userType];
        if (personalization) {
            personalizedContent = {
                ...content.content,
                title: personalization.title || content.content.title,
                description: personalization.description || content.content.description
            };
        }
    }

    res.status(200).json({
        success: true,
        data: {
            ...content.toObject(),
            content: personalizedContent
        }
    });
});

// @desc    Get public testimonials
// @route   GET /api/v1/public/testimonials
// @access  Public
exports.getPublicTestimonials = asyncHandler(async (req, res, next) => {
    const { 
        limit = 10, 
        category, 
        rating, 
        industry, 
        companySize,
        search 
    } = req.query;

    let testimonials;

    if (search) {
        testimonials = await Testimonial.search(search, parseInt(limit));
    } else if (rating) {
        testimonials = await Testimonial.getByRating(parseInt(rating), parseInt(limit));
    } else if (category) {
        testimonials = await Testimonial.getByCategory(category, parseInt(limit));
    } else {
        testimonials = await Testimonial.getPublic(parseInt(limit), category);
    }

    // Filter by additional criteria if provided
    if (industry || companySize) {
        testimonials = testimonials.filter(testimonial => {
            let matches = true;
            if (industry && testimonial.metadata.industry !== industry) {
                matches = false;
            }
            if (companySize && testimonial.metadata.companySize !== companySize) {
                matches = false;
            }
            return matches;
        });
    }

    res.status(200).json({
        success: true,
        count: testimonials.length,
        data: testimonials
    });
});

// @desc    Submit new testimonial
// @route   POST /api/v1/public/testimonials
// @access  Public
exports.submitTestimonial = asyncHandler(async (req, res, next) => {
    const { customerId, content, rating, category, metadata } = req.body;

    const testimonial = await Testimonial.create({
        customerId,
        content,
        rating,
        category,
        metadata,
        createdBy: req.user?.id || null
    });

    res.status(201).json({
        success: true,
        data: testimonial
    });
});

// @desc    Get company milestones
// @route   GET /api/v1/public/milestones
// @access  Public
exports.getPublicMilestones = asyncHandler(async (req, res, next) => {
    const { 
        limit = 20, 
        type, 
        category, 
        year,
        featured = false 
    } = req.query;

    let milestones;

    if (featured === 'true') {
        milestones = await Milestone.getFeatured(parseInt(limit));
    } else if (year) {
        milestones = await Milestone.getByYear(parseInt(year), parseInt(limit));
    } else if (type) {
        milestones = await Milestone.getByType(type, parseInt(limit));
    } else if (category) {
        milestones = await Milestone.getByCategory(category, parseInt(limit));
    } else {
        milestones = await Milestone.getPublic(parseInt(limit), type);
    }

    res.status(200).json({
        success: true,
        count: milestones.length,
        data: milestones
    });
});

// @desc    Get company statistics
// @route   GET /api/v1/public/company/stats
// @access  Public
exports.getCompanyStats = asyncHandler(async (req, res, next) => {
    const [
        totalUsers,
        totalCustomers,
        totalRevenue,
        countriesServed,
        teamMembers,
        activeProducts
    ] = await Promise.all([
        User.countDocuments(),
        Customer.countDocuments(),
        Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Customer.distinct('address.country'),
        User.countDocuments({ role: { $in: ['admin', 'moderator'] } }),
        Product.countDocuments({ 'inventory.stock': { $gt: 0 } })
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalCustomers,
            totalRevenue: totalRevenue[0]?.total || 0,
            countriesServed: countriesServed.length,
            teamMembers,
            activeProducts
        }
    });
});

// @desc    Get company team
// @route   GET /api/v1/public/company/team
// @access  Public
exports.getCompanyTeam = asyncHandler(async (req, res, next) => {
    const team = await User.find({
        role: { $in: ['admin', 'moderator'] },
        status: 'active'
    })
    .select('name email profile role')
    .sort({ role: 1, name: 1 });

    res.status(200).json({
        success: true,
        count: team.length,
        data: team
    });
});

// @desc    Get public analytics
// @route   GET /api/v1/public/analytics/live
// @access  Public
exports.getLiveAnalytics = asyncHandler(async (req, res, next) => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
        newUsers24h,
        newUsers7d,
        newUsers30d,
        newOrders24h,
        newOrders7d,
        newOrders30d,
        revenue24h,
        revenue7d,
        revenue30d,
        activeUsersNow
    ] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: last24Hours } }),
        User.countDocuments({ createdAt: { $gte: last7Days } }),
        User.countDocuments({ createdAt: { $gte: last30Days } }),
        Order.countDocuments({ createdAt: { $gte: last24Hours } }),
        Order.countDocuments({ createdAt: { $gte: last7Days } }),
        Order.countDocuments({ createdAt: { $gte: last30Days } }),
        Order.aggregate([
            { $match: { createdAt: { $gte: last24Hours }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: last7Days }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: last30Days }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        User.countDocuments({ 
            lastLoginAt: { $gte: new Date(now.getTime() - 15 * 60 * 1000) } // Last 15 minutes
        })
    ]);

    res.status(200).json({
        success: true,
        data: {
            users: {
                new24h: newUsers24h,
                new7d: newUsers7d,
                new30d: newUsers30d,
                activeNow: activeUsersNow
            },
            orders: {
                new24h: newOrders24h,
                new7d: newOrders7d,
                new30d: newOrders30d
            },
            revenue: {
                last24h: revenue24h[0]?.total || 0,
                last7d: revenue7d[0]?.total || 0,
                last30d: revenue30d[0]?.total || 0
            },
            system: {
                uptime: '99.9%',
                responseTime: '45ms',
                lastUpdated: now.toISOString()
            }
        }
    });
});

// @desc    Get system status
// @route   GET /api/v1/public/status
// @access  Public
exports.getSystemStatus = asyncHandler(async (req, res, next) => {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const [
        recentOrders,
        recentUsers,
        recentErrors
    ] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: lastHour } }),
        User.countDocuments({ createdAt: { $gte: lastHour } }),
        // This would come from your error logging system
        Promise.resolve(0)
    ]);

    const systemStatus = {
        status: 'operational',
        uptime: '99.9%',
        lastIncident: null,
        services: {
            api: 'operational',
            database: 'operational',
            fileStorage: 'operational',
            email: 'operational'
        },
        metrics: {
            ordersLastHour: recentOrders,
            usersLastHour: recentUsers,
            errorsLastHour: recentErrors
        },
        lastUpdated: now.toISOString()
    };

    res.status(200).json({
        success: true,
        data: systemStatus
    });
});

// @desc    Search public content
// @route   GET /api/v1/public/search
// @access  Public
exports.searchPublicContent = asyncHandler(async (req, res, next) => {
    const { q, type, limit = 10 } = req.query;

    if (!q) {
        return next(new ErrorResponse('Search query is required', 400));
    }

    const results = {
        content: [],
        testimonials: [],
        milestones: []
    };

    // Search content
    if (!type || type === 'content') {
        results.content = await Content.search(q, parseInt(limit));
    }

    // Search testimonials
    if (!type || type === 'testimonials') {
        results.testimonials = await Testimonial.search(q, parseInt(limit));
    }

    // Search milestones
    if (!type || type === 'milestones') {
        results.milestones = await Milestone.search(q, parseInt(limit));
    }

    const totalResults = results.content.length + results.testimonials.length + results.milestones.length;

    res.status(200).json({
        success: true,
        query: q,
        totalResults,
        data: results
    });
}); 