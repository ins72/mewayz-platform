const PricingPlan = require('../../../models/appModels/PricingPlan');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createPricingPlan = catchAsync(async (req, res, next) => {
  const pricingPlan = await PricingPlan.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      pricingPlan,
    },
  });
});

exports.getAllPricingPlans = catchAsync(async (req, res, next) => {
  const { isActive, sort = 'order' } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const pricingPlans = await PricingPlan.find(filter)
    .sort(sort)
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      pricingPlans,
    },
  });
});

exports.getPricingPlan = catchAsync(async (req, res, next) => {
  const pricingPlan = await PricingPlan.findById(req.params.id);

  if (!pricingPlan) {
    return next(new AppError('No pricing plan found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      pricingPlan,
    },
  });
});

exports.updatePricingPlan = catchAsync(async (req, res, next) => {
  const pricingPlan = await PricingPlan.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!pricingPlan) {
    return next(new AppError('No pricing plan found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      pricingPlan,
    },
  });
});

exports.deletePricingPlan = catchAsync(async (req, res, next) => {
  const pricingPlan = await PricingPlan.findByIdAndDelete(req.params.id);

  if (!pricingPlan) {
    return next(new AppError('No pricing plan found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getActivePricingPlans = catchAsync(async (req, res, next) => {
  const pricingPlans = await PricingPlan.find({ isActive: true })
    .sort('order')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      pricingPlans,
    },
  });
});

exports.getPopularPlan = catchAsync(async (req, res, next) => {
  const popularPlan = await PricingPlan.findOne({ isPopular: true, isActive: true });

  res.status(200).json({
    status: 'success',
    data: {
      popularPlan,
    },
  });
}); 