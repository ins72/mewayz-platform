const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc    Get general analytics
// @route   GET /api/v1/analytics
// @access  Private
exports.getAnalytics = asyncHandler(async (req, res, next) => {
    const { startDate, endDate, type } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // SECURITY FIX: Add user-based data filtering
    const userId = req.user._id;
    const userRole = req.user.role;
    const organizationId = req.user.organizationId || null;

    // Admin users can see all data, regular users only see their own
    const filter = userRole === 'admin' ? {} : { userId };
    if (organizationId) {
        filter.organizationId = organizationId;
    }

    let analytics = {};

    switch (type) {
        case 'sales':
            analytics = await getSalesAnalytics(start, end, filter);
            break;
        case 'customers':
            analytics = await getCustomerAnalytics(start, end, filter);
            break;
        case 'products':
            analytics = await getProductAnalytics(start, end, filter);
            break;
        case 'orders':
            analytics = await getOrderAnalytics(start, end, filter);
            break;
        case 'leads':
            analytics = await getLeadAnalytics(start, end, filter);
            break;
        default:
            analytics = await getDashboardStats(start, end, filter);
    }

    res.status(200).json({
        success: true,
        data: analytics
    });
});

// @desc    Get dashboard statistics
// @route   GET /api/v1/analytics/dashboard
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // SECURITY FIX: Add user-based data filtering
    const userId = req.user._id;
    const userRole = req.user.role;
    const organizationId = req.user.organizationId || null;

    // Admin users can see all data, regular users only see their own
    const filter = userRole === 'admin' ? {} : { userId };
    if (organizationId) {
        filter.organizationId = organizationId;
    }

    const stats = await getDashboardStats(start, end, filter);

    res.status(200).json({
        success: true,
        data: stats
    });
});

// @desc    Get sales analytics
// @route   GET /api/v1/analytics/sales
// @access  Private
exports.getSalesAnalytics = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // SECURITY FIX: Add user-based data filtering
    const userId = req.user._id;
    const userRole = req.user.role;
    const organizationId = req.user.organizationId || null;

    const filter = userRole === 'admin' ? {} : { userId };
    if (organizationId) {
        filter.organizationId = organizationId;
    }

    const analytics = await getSalesAnalytics(start, end, filter);

    res.status(200).json({
        success: true,
        data: analytics
    });
});

// @desc    Get customer analytics
// @route   GET /api/v1/analytics/customers
// @access  Private
exports.getCustomerAnalytics = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // SECURITY FIX: Add user-based data filtering
    const userId = req.user._id;
    const userRole = req.user.role;
    const organizationId = req.user.organizationId || null;

    const filter = userRole === 'admin' ? {} : { userId };
    if (organizationId) {
        filter.organizationId = organizationId;
    }

    const analytics = await getCustomerAnalytics(start, end, filter);

    res.status(200).json({
        success: true,
        data: analytics
    });
});

// @desc    Get product analytics
// @route   GET /api/v1/analytics/products
// @access  Private
exports.getProductAnalytics = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // SECURITY FIX: Add user-based data filtering
    const userId = req.user._id;
    const userRole = req.user.role;
    const organizationId = req.user.organizationId || null;

    const filter = userRole === 'admin' ? {} : { userId };
    if (organizationId) {
        filter.organizationId = organizationId;
    }

    const analytics = await getProductAnalytics(start, end, filter);

    res.status(200).json({
        success: true,
        data: analytics
    });
});

// @desc    Get order analytics
// @route   GET /api/v1/analytics/orders
// @access  Private
exports.getOrderAnalytics = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await getOrderAnalytics(start, end);

    res.status(200).json({
        success: true,
        data: analytics
    });
});

// @desc    Get lead analytics
// @route   GET /api/v1/analytics/leads
// @access  Private
exports.getLeadAnalytics = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await getLeadAnalytics(start, end);

    res.status(200).json({
        success: true,
        data: analytics
    });
});

// @desc    Get real-time metrics
// @route   GET /api/v1/analytics/real-time-metrics
// @access  Private
exports.getRealTimeMetrics = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const userRole = req.user.role;
    const organizationId = req.user.organizationId || null;

    // Admin users can see all data, regular users only see their own
    const filter = userRole === 'admin' ? {} : { userId };
    if (organizationId) {
        filter.organizationId = organizationId;
    }

    // Get real-time metrics for the last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
        recentOrders,
        recentCustomers,
        recentRevenue,
        activeUsers
    ] = await Promise.all([
        Order.countDocuments({ ...filter, createdAt: { $gte: last24Hours } }),
        Customer.countDocuments({ ...filter, createdAt: { $gte: last24Hours } }),
        Order.aggregate([
            { $match: { ...filter, createdAt: { $gte: last24Hours }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        // Approximate active users (users with recent orders/activities)
        User.countDocuments(organizationId ? { organizationId, lastActiveAt: { $gte: last24Hours } } : { lastActiveAt: { $gte: last24Hours } })
    ]);

    res.status(200).json({
        success: true,
        data: {
            last24Hours: {
                orders: recentOrders,
                customers: recentCustomers,
                revenue: recentRevenue[0]?.total || 0,
                activeUsers
            },
            timestamp: new Date().toISOString()
        }
    });
});

// @desc    Get user activities feed
// @route   GET /api/v1/analytics/user-activities
// @access  Private
exports.getUserActivities = asyncHandler(async (req, res, next) => {
    const { limit = 10, page = 1 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;
    const organizationId = req.user.organizationId || null;

    // Admin users can see all activities, regular users only see their own
    const filter = userRole === 'admin' ? {} : { userId };
    if (organizationId) {
        filter.organizationId = organizationId;
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // Get recent activities from multiple sources
    const [orders, customers, leads] = await Promise.all([
        Order.find(filter)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .populate('customer', 'name email')
            .lean(),
        Customer.find(filter)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .lean(),
        Lead.find(filter)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .lean()
    ]);

    // Combine and format activities
    const activities = [];

    orders.forEach(order => {
        activities.push({
            id: order._id,
            type: 'order',
            title: 'New order received',
            description: `Order #${order._id.toString().slice(-6)} - $${order.totalAmount?.toLocaleString() || '0'}${order.customer ? ` from ${order.customer.name}` : ''}`,
            timestamp: order.createdAt,
            icon: 'shopping-cart',
            metadata: {
                orderId: order._id,
                amount: order.totalAmount,
                status: order.status
            }
        });
    });

    customers.forEach(customer => {
        activities.push({
            id: customer._id,
            type: 'customer',
            title: 'New customer registered',
            description: `${customer.name} (${customer.email})`,
            timestamp: customer.createdAt,
            icon: 'user-plus',
            metadata: {
                customerId: customer._id,
                email: customer.email
            }
        });
    });

    leads.forEach(lead => {
        activities.push({
            id: lead._id,
            type: 'lead',
            title: 'New lead generated',
            description: `${lead.name} - ${lead.source || 'Unknown source'}`,
            timestamp: lead.createdAt,
            icon: 'target',
            metadata: {
                leadId: lead._id,
                source: lead.source,
                status: lead.status
            }
        });
    });

    // Sort by timestamp and apply pagination
    const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(skip, skip + limitNum);

    const total = activities.length;

    res.status(200).json({
        success: true,
        data: {
            activities: sortedActivities,
            pagination: {
                current: pageNum,
                total: Math.ceil(total / limitNum),
                limit: limitNum,
                totalItems: total
            }
        }
    });
});

// @desc    Export analytics data
// @route   GET /api/v1/analytics/export
// @access  Private
exports.exportAnalytics = asyncHandler(async (req, res, next) => {
    const { type, format = 'json', startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    let data;
    switch (type) {
        case 'sales':
            data = await getSalesAnalytics(start, end);
            break;
        case 'customers':
            data = await getCustomerAnalytics(start, end);
            break;
        case 'products':
            data = await getProductAnalytics(start, end);
            break;
        case 'orders':
            data = await getOrderAnalytics(start, end);
            break;
        case 'leads':
            data = await getLeadAnalytics(start, end);
            break;
        default:
            data = await getDashboardStats(start, end);
    }

    if (format === 'csv') {
        // Convert to CSV format
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-${type}-${Date.now()}.csv`);
        return res.send(csv);
    }

    res.status(200).json({
        success: true,
        data
    });
});

// Helper functions
async function getDashboardStats(start, end, filter = {}) {
    // Apply date filter to all queries
    const dateFilter = { createdAt: { $gte: start, $lte: end } };
    const combinedFilter = { ...dateFilter, ...filter };
    
    // For revenue calculation, ensure we only count completed orders
    const revenueFilter = { ...combinedFilter, status: 'completed' };
    
    const [
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        totalLeads,
        recentOrders,
        topProducts,
        customerGrowth,
        // Add conversion rate calculation
        totalVisitors
    ] = await Promise.all([
        Order.countDocuments(combinedFilter),
        Order.aggregate([
            { $match: revenueFilter },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Customer.countDocuments(combinedFilter),
        Product.countDocuments(filter.userId ? { userId: filter.userId } : {}),
        Lead.countDocuments(combinedFilter),
        Order.find(combinedFilter)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name email'),
        Order.aggregate([
            { $match: combinedFilter },
            { $unwind: '$items' },
            { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }
        ]),
        Customer.aggregate([
            { $match: combinedFilter },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        // Calculate total visitors for conversion rate (using leads + customers as proxy)
        Promise.all([
            Lead.countDocuments(combinedFilter),
            Customer.countDocuments(combinedFilter)
        ]).then(([leads, customers]) => leads + customers)
    ]);

    // Calculate conversion rate
    const conversionRate = totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(1) : 0;
    
    // Calculate growth percentages (compared to previous period)
    const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const previousEnd = start;
    const previousFilter = { createdAt: { $gte: previousStart, $lte: previousEnd }, ...filter };
    
    const [
        previousOrders,
        previousRevenue,
        previousCustomers
    ] = await Promise.all([
        Order.countDocuments(previousFilter),
        Order.aggregate([
            { $match: { ...previousFilter, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        Customer.countDocuments(previousFilter)
    ]);

    const previousRevenueAmount = previousRevenue[0]?.total || 0;
    
    // Calculate growth percentages
    const revenueGrowth = previousRevenueAmount > 0 ? 
        (((totalRevenue[0]?.total || 0) - previousRevenueAmount) / previousRevenueAmount * 100).toFixed(1) : 0;
    const ordersGrowth = previousOrders > 0 ? 
        ((totalOrders - previousOrders) / previousOrders * 100).toFixed(1) : 0;
    const customersGrowth = previousCustomers > 0 ? 
        ((totalCustomers - previousCustomers) / previousCustomers * 100).toFixed(1) : 0;

    return {
        overview: {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalCustomers,
            totalProducts,
            totalLeads,
            conversionRate: parseFloat(conversionRate),
            // Add growth metrics
            revenueGrowth: parseFloat(revenueGrowth),
            ordersGrowth: parseFloat(ordersGrowth),
            customersGrowth: parseFloat(customersGrowth)
        },
        recentOrders,
        topProducts,
        customerGrowth
    };
}

async function getSalesAnalytics(start, end) {
    const [
        dailySales,
        monthlySales,
        salesByStatus,
        salesByProduct
    ] = await Promise.all([
        Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    totalSales: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    totalSales: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$status',
                    totalSales: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    totalQuantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }
        ])
    ]);

    return {
        dailySales,
        monthlySales,
        salesByStatus,
        salesByProduct
    };
}

async function getCustomerAnalytics(start, end) {
    const [
        customerGrowth,
        customerBySource,
        customerByLocation,
        topCustomers
    ] = await Promise.all([
        Customer.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Customer.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 }
                }
            }
        ]),
        Customer.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$country',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$customer',
                    totalSpent: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
            { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } }
        ])
    ]);

    return {
        customerGrowth,
        customerBySource,
        customerByLocation,
        topCustomers
    };
}

async function getProductAnalytics(start, end) {
    const [
        productPerformance,
        lowStockProducts,
        productCategories
    ] = await Promise.all([
        Product.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'items.product',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    totalSold: {
                        $sum: {
                            $map: {
                                input: '$orders',
                                as: 'order',
                                in: {
                                    $sum: {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: '$$order.items',
                                                    as: 'item',
                                                    cond: { $eq: ['$$item.product', '$_id'] }
                                                }
                                            },
                                            as: 'item',
                                            in: '$$item.quantity'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]),
        Product.find({ stockQuantity: { $lte: 10 } }).limit(10),
        Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ])
    ]);

    return {
        productPerformance,
        lowStockProducts,
        productCategories
    };
}

async function getOrderAnalytics(start, end) {
    const [
        orderStatus,
        orderTimeline,
        averageOrderValue
    ] = await Promise.all([
        Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$totalAmount' }
                }
            }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    totalValue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: null,
                    avgOrderValue: { $avg: '$totalAmount' },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$totalAmount' }
                }
            }
        ])
    ]);

    return {
        orderStatus,
        orderTimeline,
        averageOrderValue: averageOrderValue[0] || {}
    };
}

async function getLeadAnalytics(start, end) {
    const [
        leadStatus,
        leadSource,
        leadConversion
    ] = await Promise.all([
        Lead.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]),
        Lead.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]),
        Lead.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    totalLeads: { $sum: 1 },
                    qualifiedLeads: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $addFields: {
                    conversionRate: {
                        $multiply: [
                            { $divide: ['$qualifiedLeads', '$totalLeads'] },
                            100
                        ]
                    }
                }
            },
            { $sort: { _id: 1 } }
        ])
    ]);

    return {
        leadStatus,
        leadSource,
        leadConversion
    };
}

function convertToCSV(data) {
    // Simple CSV conversion - in a real app, you'd use a proper CSV library
    const flatten = (obj, prefix = '') => {
        return Object.keys(obj).reduce((acc, k) => {
            const pre = prefix.length ? prefix + '.' : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
                Object.assign(acc, flatten(obj[k], pre + k));
            } else {
                acc[pre + k] = obj[k];
            }
            return acc;
        }, {});
    };

    if (Array.isArray(data)) {
        if (data.length === 0) return '';
        const headers = Object.keys(flatten(data[0]));
        const csv = [headers.join(',')];
        
        data.forEach(item => {
            const flat = flatten(item);
            const row = headers.map(header => {
                const value = flat[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csv.push(row.join(','));
        });
        
        return csv.join('\n');
    }
    
    return JSON.stringify(data);
} 