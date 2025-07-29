const asyncHandler = require('express-async-handler');
const Pricing = require('../models/Pricing');

// @desc    Get all pricing plans
// @route   GET /api/v1/pricing
// @access  Public
const getPricingPlans = asyncHandler(async (req, res) => {
  const plans = await Pricing.getActivePlans();
  
  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans
  });
});

// @desc    Get single pricing plan
// @route   GET /api/v1/pricing/:id
// @access  Public
const getPricingPlan = asyncHandler(async (req, res) => {
  const plan = await Pricing.findById(req.params.id);
  
  if (!plan) {
    res.status(404);
    throw new Error('Pricing plan not found');
  }
  
  res.status(200).json({
    success: true,
    data: plan
  });
});

// @desc    Create new pricing plan
// @route   POST /api/v1/pricing
// @access  Private (Admin only)
const createPricingPlan = asyncHandler(async (req, res) => {
  const plan = await Pricing.create(req.body);
  
  res.status(201).json({
    success: true,
    data: plan
  });
});

// @desc    Update pricing plan
// @route   PUT /api/v1/pricing/:id
// @access  Private (Admin only)
const updatePricingPlan = asyncHandler(async (req, res) => {
  let plan = await Pricing.findById(req.params.id);
  
  if (!plan) {
    res.status(404);
    throw new Error('Pricing plan not found');
  }
  
  plan = await Pricing.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: plan
  });
});

// @desc    Delete pricing plan
// @route   DELETE /api/v1/pricing/:id
// @access  Private (Admin only)
const deletePricingPlan = asyncHandler(async (req, res) => {
  const plan = await Pricing.findById(req.params.id);
  
  if (!plan) {
    res.status(404);
    throw new Error('Pricing plan not found');
  }
  
  await plan.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get recommended plan
// @route   GET /api/v1/pricing/recommended
// @access  Public
const getRecommendedPlan = asyncHandler(async (req, res) => {
  const plan = await Pricing.findOne({ isRecommended: true, isActive: true });
  
  if (!plan) {
    res.status(404);
    throw new Error('No recommended plan found');
  }
  
  res.status(200).json({
    success: true,
    data: plan
  });
});

// @desc    Get plan by title
// @route   GET /api/v1/pricing/title/:title
// @access  Public
const getPlanByTitle = asyncHandler(async (req, res) => {
  const plan = await Pricing.findOne({ 
    title: req.params.title, 
    isActive: true 
  });
  
  if (!plan) {
    res.status(404);
    throw new Error(`Pricing plan '${req.params.title}' not found`);
  }
  
  res.status(200).json({
    success: true,
    data: plan
  });
});

// @desc    Compare pricing plans
// @route   GET /api/v1/pricing/compare
// @access  Public
const comparePricingPlans = asyncHandler(async (req, res) => {
  const { plans } = req.query;
  
  if (!plans) {
    res.status(400);
    throw new Error('Please specify plans to compare');
  }
  
  const planTitles = plans.split(',');
  const pricingPlans = await Pricing.find({
    title: { $in: planTitles },
    isActive: true
  }).sort('sortOrder');
  
  res.status(200).json({
    success: true,
    count: pricingPlans.length,
    data: pricingPlans
  });
});

module.exports = {
  getPricingPlans,
  getPricingPlan,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  getRecommendedPlan,
  getPlanByTitle,
  comparePricingPlans
}; 