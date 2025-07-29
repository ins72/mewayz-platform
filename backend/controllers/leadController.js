const Lead = require('../models/Lead');
const asyncHandler = require('express-async-handler');

// @desc    Get all leads
// @route   GET /api/v1/leads
// @access  Private
const getLeads = asyncHandler(async (req, res, next) => {
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
    query = Lead.find(JSON.parse(queryStr));

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
    const total = await Lead.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const leads = await query;

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
        count: leads.length,
        pagination,
        data: leads
    });
});

// @desc    Get single lead
// @route   GET /api/v1/leads/:id
// @access  Private
const getLead = asyncHandler(async (req, res, next) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
        return res.status(404).json({
            success: false,
            error: 'Lead not found'
        });
    }

    res.status(200).json({
        success: true,
        data: lead
    });
});

// @desc    Create new lead
// @route   POST /api/v1/leads
// @access  Private
const createLead = asyncHandler(async (req, res, next) => {
    const lead = await Lead.create(req.body);

    res.status(201).json({
        success: true,
        data: lead
    });
});

// @desc    Update lead
// @route   PUT /api/v1/leads/:id
// @access  Private
const updateLead = asyncHandler(async (req, res, next) => {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
        return res.status(404).json({
            success: false,
            error: 'Lead not found'
        });
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: lead
    });
});

// @desc    Delete lead
// @route   DELETE /api/v1/leads/:id
// @access  Private
const deleteLead = asyncHandler(async (req, res, next) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
        return res.status(404).json({
            success: false,
            error: 'Lead not found'
        });
    }

    await lead.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get lead statistics
// @route   GET /api/v1/leads/stats
// @access  Private
const getLeadStats = asyncHandler(async (req, res, next) => {
    const stats = await Lead.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalValue: { $sum: '$estimatedValue' }
            }
        }
    ]);

    const totalLeads = await Lead.countDocuments();
    const activeLeads = await Lead.countDocuments({ status: 'active' });
    const newLeadsThisMonth = await Lead.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const conversionRate = await Lead.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            stats,
            totalLeads,
            activeLeads,
            newLeadsThisMonth,
            conversionRate: conversionRate[0] ? (conversionRate[0].converted / conversionRate[0].total * 100).toFixed(2) : 0
        }
    });
});

module.exports = {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    getLeadStats
}; 