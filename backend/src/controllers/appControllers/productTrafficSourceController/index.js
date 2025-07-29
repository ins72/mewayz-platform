const ProductTrafficSource = require('../../../models/appModels/ProductTrafficSource');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createProductTrafficSource = catchAsync(async (req, res, next) => {
  const productTrafficSource = await ProductTrafficSource.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      productTrafficSource,
    },
  });
});

exports.getAllProductTrafficSources = catchAsync(async (req, res, next) => {
  const { 
    productId, 
    userId, 
    period, 
    isActive, 
    sort = '-createdAt' 
  } = req.query;

  const filter = {};
  if (productId) filter.productId = productId;
  if (userId) filter.userId = userId;
  if (period) filter.period = period;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const productTrafficSources = await ProductTrafficSource.find(filter)
    .populate('productId', 'title image category')
    .populate('userId', 'name email')
    .sort(sort)
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      productTrafficSources,
    },
  });
});

exports.getProductTrafficSource = catchAsync(async (req, res, next) => {
  const productTrafficSource = await ProductTrafficSource.findById(req.params.id)
    .populate('productId', 'title image category')
    .populate('userId', 'name email');

  if (!productTrafficSource) {
    return next(new AppError('No product traffic source found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productTrafficSource,
    },
  });
});

exports.updateProductTrafficSource = catchAsync(async (req, res, next) => {
  const productTrafficSource = await ProductTrafficSource.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!productTrafficSource) {
    return next(new AppError('No product traffic source found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productTrafficSource,
    },
  });
});

exports.deleteProductTrafficSource = catchAsync(async (req, res, next) => {
  const productTrafficSource = await ProductTrafficSource.findByIdAndDelete(req.params.id);

  if (!productTrafficSource) {
    return next(new AppError('No product traffic source found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getProductTrafficSourcesByProduct = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { period = 'weekly' } = req.query;

  const filter = { productId, isActive: true };
  if (period) filter.period = period;

  const trafficSources = await ProductTrafficSource.find(filter)
    .populate('productId', 'title image category')
    .sort('-value')
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      trafficSources,
    },
  });
});

exports.getProductTrafficSourceStats = catchAsync(async (req, res, next) => {
  const { productId, period = '30d' } = req.query;

  let startDate = new Date();
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  const filter = { date: { $gte: startDate }, isActive: true };
  if (productId) filter.productId = productId;

  const stats = await ProductTrafficSource.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$title',
        totalValue: { $sum: '$value' },
        count: { $sum: 1 },
        avgPercentage: { $avg: '$percentage' },
      },
    },
    { $sort: { totalValue: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
}); 