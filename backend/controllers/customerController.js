const Customer = require('../models/Customer');
const asyncHandler = require('express-async-handler');

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res, next) => {
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
    query = Customer.find(JSON.parse(queryStr));

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
    const total = await Customer.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const customers = await query;

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
        count: customers.length,
        pagination,
        data: customers
    });
});

// @desc    Get single customer
// @route   GET /api/v1/customers/:id
// @access  Private
const getCustomer = asyncHandler(async (req, res, next) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        return res.status(404).json({
            success: false,
            error: 'Customer not found'
        });
    }

    res.status(200).json({
        success: true,
        data: customer
    });
});

// @desc    Create new customer
// @route   POST /api/v1/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res, next) => {
    const customer = await Customer.create(req.body);

    res.status(201).json({
        success: true,
        data: customer
    });
});

// @desc    Update customer
// @route   PUT /api/v1/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res, next) => {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
        return res.status(404).json({
            success: false,
            error: 'Customer not found'
        });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: customer
    });
});

// @desc    Delete customer
// @route   DELETE /api/v1/customers/:id
// @access  Private
const deleteCustomer = asyncHandler(async (req, res, next) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        return res.status(404).json({
            success: false,
            error: 'Customer not found'
        });
    }

    await customer.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get customer statistics
// @route   GET /api/v1/customers/stats
// @access  Private
const getCustomerStats = asyncHandler(async (req, res, next) => {
    const stats = await Customer.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalValue: { $sum: '$totalSpent' }
            }
        }
    ]);

    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'active' });
    const newCustomersThisMonth = await Customer.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    res.status(200).json({
        success: true,
        data: {
            stats,
            totalCustomers,
            activeCustomers,
            newCustomersThisMonth
        }
    });
});

module.exports = {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats
}; 