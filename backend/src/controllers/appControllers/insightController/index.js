const Insight = require('../../../models/appModels/Insight');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.getAllInsights = catchAsync(async (req, res, next) => {
  const { type, category, period, userId } = req.query;
  
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (period) filter.period = period;
  if (userId) filter.userId = userId;

  const insights = await Insight.find(filter)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: insights.length,
    data: {
      insights,
    },
  });
});

exports.getAffiliateInsights = catchAsync(async (req, res, next) => {
  const insights = await Insight.find({ 
    category: 'affiliate',
    userId: req.user.id 
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: insights.length,
    data: {
      insights,
    },
  });
});

exports.getProductInsights = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  
  const insights = await Insight.find({ 
    category: 'product',
    productId 
  }).sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: insights.length,
    data: {
      insights,
    },
  });
});

exports.createInsight = catchAsync(async (req, res, next) => {
  const insightData = {
    ...req.body,
    userId: req.user.id,
  };

  const newInsight = await Insight.create(insightData);

  res.status(201).json({
    status: 'success',
    data: {
      insight: newInsight,
    },
  });
});

exports.updateInsight = catchAsync(async (req, res, next) => {
  const insight = await Insight.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!insight) {
    return next(new AppError('No insight found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      insight,
    },
  });
});

exports.deleteInsight = catchAsync(async (req, res, next) => {
  const insight = await Insight.findByIdAndDelete(req.params.id);

  if (!insight) {
    return next(new AppError('No insight found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getDashboardInsights = catchAsync(async (req, res, next) => {
  const { period = 'monthly' } = req.query;
  
  const insights = await Insight.find({
    userId: req.user.id,
    period,
    isActive: true,
  }).sort({ order: 1 });

  res.status(200).json({
    status: 'success',
    results: insights.length,
    data: {
      insights,
    },
  });
}); 