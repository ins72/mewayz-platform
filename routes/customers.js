const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const auth = require('../middleware/auth');

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private
router.route('/')
  .get(auth.protect, asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = { userId: req.user.id };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const customers = await Customer.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum)
      .populate('orders')
      .lean();

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: customers.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      },
      data: customers
    });
  }))
  .post(auth.protect, asyncHandler(async (req, res) => {
    // Add user ID to request body
    req.body.userId = req.user.id;

    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      data: customer
    });
  }));

// @desc    Get single customer
// @route   GET /api/v1/customers/:id
// @access  Private
router.route('/:id')
  .get(auth.protect, asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('orders');

    if (!customer) {
      return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  }))
  .put(auth.protect, asyncHandler(async (req, res) => {
    let customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!customer) {
      return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: customer
    });
  }))
  .delete(auth.protect, asyncHandler(async (req, res) => {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!customer) {
      return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
    }

    await customer.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  }));

// @desc    Get customer statistics
// @route   GET /api/v1/customers/stats
// @access  Private
router.get('/stats', auth.protect, asyncHandler(async (req, res) => {
  const totalCustomers = await Customer.countDocuments({ userId: req.user.id });
  const activeCustomers = await Customer.countDocuments({ 
    userId: req.user.id, 
    status: 'active' 
  });
  const newCustomersThisMonth = await Customer.countDocuments({
    userId: req.user.id,
    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
  });

  res.status(200).json({
    success: true,
    data: {
      total: totalCustomers,
      active: activeCustomers,
      newThisMonth: newCustomersThisMonth,
      conversionRate: totalCustomers > 0 ? ((activeCustomers / totalCustomers) * 100).toFixed(2) : 0
    }
  });
}));

module.exports = router; 