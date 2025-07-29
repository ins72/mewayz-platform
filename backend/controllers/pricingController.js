const Pricing = require('../models/Pricing');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all pricing plans
// @route   GET /api/v1/pricing
// @access  Public
exports.getPricingPlans = asyncHandler(async (req, res, next) => {
    const { currency = 'USD', popular } = req.query;

    let query = { isActive: true };

    // Filter by currency
    if (currency) {
        query.currency = currency;
    }

    // Filter popular plans
    if (popular === 'true') {
        query.isPopular = true;
    }

    const plans = await Pricing.find(query)
        .sort({ sortOrder: 1, 'price.monthly': 1 })
        .populate('createdBy', 'name email');

    res.status(200).json({
        success: true,
        count: plans.length,
        data: plans
    });
});

// @desc    Get single pricing plan
// @route   GET /api/v1/pricing/:id
// @access  Public
exports.getPricingPlan = asyncHandler(async (req, res, next) => {
    const plan = await Pricing.findById(req.params.id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');

    if (!plan) {
        return next(new ErrorResponse(`Pricing plan not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: plan
    });
});

// @desc    Create new pricing plan
// @route   POST /api/v1/pricing
// @access  Private
exports.createPricingPlan = asyncHandler(async (req, res, next) => {
    req.body.createdBy = req.user.id;

    const plan = await Pricing.create(req.body);

    res.status(201).json({
        success: true,
        data: plan
    });
});

// @desc    Update pricing plan
// @route   PUT /api/v1/pricing/:id
// @access  Private
exports.updatePricingPlan = asyncHandler(async (req, res, next) => {
    let plan = await Pricing.findById(req.params.id);

    if (!plan) {
        return next(new ErrorResponse(`Pricing plan not found with id of ${req.params.id}`, 404));
    }

    req.body.updatedBy = req.user.id;

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
// @access  Private
exports.deletePricingPlan = asyncHandler(async (req, res, next) => {
    const plan = await Pricing.findById(req.params.id);

    if (!plan) {
        return next(new ErrorResponse(`Pricing plan not found with id of ${req.params.id}`, 404));
    }

    await plan.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get popular pricing plans
// @route   GET /api/v1/pricing/popular
// @access  Public
exports.getPopularPlans = asyncHandler(async (req, res, next) => {
    const { currency = 'USD' } = req.query;

    const plans = await Pricing.find({
        isActive: true,
        isPopular: true,
        currency
    })
    .sort({ sortOrder: 1 })
    .populate('createdBy', 'name email');

    res.status(200).json({
        success: true,
        count: plans.length,
        data: plans
    });
});

// @desc    Compare pricing plans
// @route   POST /api/v1/pricing/compare
// @access  Public
exports.comparePlans = asyncHandler(async (req, res, next) => {
    const { planIds } = req.body;

    if (!planIds || !Array.isArray(planIds) || planIds.length < 2) {
        return next(new ErrorResponse('Please provide at least 2 plan IDs to compare', 400));
    }

    const plans = await Pricing.find({
        _id: { $in: planIds },
        isActive: true
    })
    .sort({ 'price.monthly': 1 })
    .populate('createdBy', 'name email');

    if (plans.length < 2) {
        return next(new ErrorResponse('At least 2 valid plans are required for comparison', 400));
    }

    // Get all unique features across plans
    const allFeatures = new Set();
    plans.forEach(plan => {
        plan.features.forEach(feature => {
            allFeatures.add(feature.name);
        });
    });

    const comparison = {
        plans,
        features: Array.from(allFeatures),
        summary: {
            cheapest: plans[0],
            mostExpensive: plans[plans.length - 1],
            bestValue: plans.reduce((best, current) => 
                (current.features.length / current.price.monthly) > (best.features.length / best.price.monthly) ? current : best
            )
        }
    };

    res.status(200).json({
        success: true,
        data: comparison
    });
});

// @desc    Calculate pricing for custom plan
// @route   POST /api/v1/pricing/calculate
// @access  Public
exports.calculateCustomPlan = asyncHandler(async (req, res, next) => {
    const { features, users, billingCycle = 'monthly' } = req.body;

    if (!features || !Array.isArray(features)) {
        return next(new ErrorResponse('Features array is required', 400));
    }

    // Base pricing logic (this would be more complex in a real application)
    const basePrice = 29;
    const pricePerUser = 5;
    const pricePerFeature = 10;

    const totalPrice = basePrice + (users * pricePerUser) + (features.length * pricePerFeature);
    const yearlyPrice = totalPrice * 12 * 0.8; // 20% discount for yearly

    const calculation = {
        basePrice,
        pricePerUser,
        pricePerFeature,
        totalPrice: billingCycle === 'yearly' ? yearlyPrice : totalPrice,
        billingCycle,
        features: features.length,
        users,
        savings: billingCycle === 'yearly' ? (totalPrice * 12) - yearlyPrice : 0,
        savingsPercentage: billingCycle === 'yearly' ? 20 : 0
    };

    res.status(200).json({
        success: true,
        data: calculation
    });
});

// @desc    Get pricing analytics
// @route   GET /api/v1/pricing/analytics
// @access  Private
exports.getPricingAnalytics = asyncHandler(async (req, res, next) => {
    const analytics = await Pricing.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: null,
                totalPlans: { $sum: 1 },
                avgMonthlyPrice: { $avg: '$price.monthly' },
                avgYearlyPrice: { $avg: '$price.yearly' },
                minPrice: { $min: '$price.monthly' },
                maxPrice: { $max: '$price.monthly' },
                popularPlans: { $sum: { $cond: ['$isPopular', 1, 0] } }
            }
        }
    ]);

    const currencyStats = await Pricing.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$currency',
                count: { $sum: 1 },
                avgPrice: { $avg: '$price.monthly' }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            overview: analytics[0] || {},
            currencyStats
        }
    });
}); 