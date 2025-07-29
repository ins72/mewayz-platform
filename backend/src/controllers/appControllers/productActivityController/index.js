const ProductActivity = require('../../../models/appModels/ProductActivity');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

exports.createProductActivity = catchAsync(async (req, res, next) => {
  const productActivity = await ProductActivity.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      productActivity,
    },
  });
});

exports.getAllProductActivities = catchAsync(async (req, res, next) => {
  const { userId, startDate, endDate, isActive, sort = '-createdAt' } = req.query;

  const filter = {};
  if (userId) filter.userId = userId;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (startDate && endDate) {
    filter.startDate = { $gte: new Date(startDate) };
    filter.endDate = { $lte: new Date(endDate) };
  }

  const productActivities = await ProductActivity.find(filter)
    .populate('userId', 'name email')
    .sort(sort)
    .exec();

  res.status(200).json({
    status: 'success',
    data: {
      productActivities,
    },
  });
});

exports.getProductActivity = catchAsync(async (req, res, next) => {
  const productActivity = await ProductActivity.findById(req.params.id)
    .populate('userId', 'name email');

  if (!productActivity) {
    return next(new AppError('No product activity found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productActivity,
    },
  });
});

exports.updateProductActivity = catchAsync(async (req, res, next) => {
  const productActivity = await ProductActivity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!productActivity) {
    return next(new AppError('No product activity found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      productActivity,
    },
  });
});

exports.deleteProductActivity = catchAsync(async (req, res, next) => {
  const productActivity = await ProductActivity.findByIdAndDelete(req.params.id);

  if (!productActivity) {
    return next(new AppError('No product activity found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getProductActivityStats = catchAsync(async (req, res, next) => {
  const { userId, period = '7d' } = req.query;

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
      startDate.setDate(startDate.getDate() - 7);
  }

  const filter = { startDate: { $gte: startDate }, isActive: true };
  if (userId) filter.userId = userId;

  const stats = await ProductActivity.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: { $toInt: '$products.counter' } },
        totalViews: { $sum: { $toInt: '$views.counter' } },
        totalLikes: { $sum: { $toInt: '$likes.counter' } },
        totalComments: { $sum: { $toInt: '$comments.counter' } },
        avgProductsPercentage: { $avg: '$products.percentage' },
        avgViewsPercentage: { $avg: '$views.percentage' },
        avgLikesPercentage: { $avg: '$likes.percentage' },
        avgCommentsPercentage: { $avg: '$comments.percentage' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalProducts: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        avgProductsPercentage: 0,
        avgViewsPercentage: 0,
        avgLikesPercentage: 0,
        avgCommentsPercentage: 0,
      },
    },
  });
}); 