const Order = require('../models/Order');
const asyncHandler = require('express-async-handler');

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private
const getOrders = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Order.find(JSON.parse(queryStr)).populate('customer').populate('products.product');

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Order.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const orders = await query;

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
        count: orders.length,
        pagination,
        data: orders
    });
});

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('customer')
        .populate('products.product');

    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.create(req.body);

    res.status(201).json({
        success: true,
        data: order
    });
});

// @desc    Update order
// @route   PUT /api/v1/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res, next) => {
    let order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }

    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Delete order
// @route   DELETE /api/v1/orders/:id
// @access  Private
const deleteOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Order not found'
        });
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get order statistics
// @route   GET /api/v1/orders/stats
// @access  Private
const getOrderStats = asyncHandler(async (req, res, next) => {
    const stats = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$totalAmount' }
            }
        }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const ordersThisMonth = await Order.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const revenueThisMonth = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
            }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            stats,
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            ordersThisMonth,
            revenueThisMonth: revenueThisMonth[0]?.total || 0
        }
    });
});

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderStats
}; 